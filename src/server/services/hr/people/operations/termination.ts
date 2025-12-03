import {
    buildTelemetryMetadata,
    invalidateTerminationCaches,
} from '../helpers/people-orchestration.helpers';
import type { OrchestrationAuthorization, TerminateEmployeeInput } from '../people-orchestration.types';
import type { PeopleOrchestrationRuntime } from '../people-orchestration.deps';

export async function terminateEmployeeOperation(
    runtime: PeopleOrchestrationRuntime,
    parsed: TerminateEmployeeInput,
): Promise<void> {
    const { authorization } = parsed as { authorization: OrchestrationAuthorization };
    await runtime.ensureOrgAccess(authorization);

    const metadata = buildTelemetryMetadata('terminate', authorization, {
        terminationDate: parsed.termination.date.toISOString(),
        hasContract: Boolean(parsed.contractId),
    });

    await runtime.execute(authorization, 'hr.people.orchestration.terminate', metadata, async () => {
        const profileResult = await runtime.deps.peopleService.getEmployeeProfile({
            authorization,
            payload: { profileId: parsed.profileId },
        });
        const employeeNumber = profileResult.profile?.employeeNumber;
        if (!employeeNumber) {
            throw new Error('Employee number is required to terminate employment cleanly.');
        }

        await runtime.deps.peopleService.updateEmployeeProfile({
            authorization,
            payload: {
                profileId: parsed.profileId,
                profileUpdates: {
                    employmentStatus: 'TERMINATED',
                    endDate: parsed.termination.date,
                },
            },
        });

        if (parsed.contractId) {
            await runtime.deps.peopleService.updateEmploymentContract({
                authorization,
                payload: {
                    contractId: parsed.contractId,
                    contractUpdates: {
                        terminationReason: parsed.termination.reason,
                        endDate: parsed.termination.date,
                    },
                },
            });
        }

        if (parsed.cancelPendingLeave) {
            const requests = await runtime.deps.leaveService.listLeaveRequests({
                authorization,
                employeeId: employeeNumber,
                filters: { status: 'submitted' },
            });

            await Promise.all(
                requests.requests.map((request) =>
                    runtime.deps.leaveService.cancelLeaveRequest({
                        authorization,
                        requestId: request.id,
                        cancelledBy: authorization.userId,
                        reason: parsed.termination.reason,
                    }),
                ),
            );
        }

        const absences = await runtime.deps.absenceService.listAbsences({
            authorization,
            filters: { userId: profileResult.profile?.userId, includeClosed: false },
        });

        const activeAbsenceIds = absences.absences
            .filter((absence) => absence.status !== 'CANCELLED' && absence.status !== 'CLOSED')
            .map((absence) => absence.id);

        if (activeAbsenceIds.length > 0) {
            await Promise.all(
                activeAbsenceIds.map((absenceId) =>
                    runtime.deps.absenceService.cancelAbsence({
                        authorization,
                        absenceId,
                        payload: { reason: parsed.termination.reason },
                    }),
                ),
            );
        }

        await invalidateTerminationCaches(authorization);
    });
}
