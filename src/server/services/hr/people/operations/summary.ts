import {
    buildTelemetryMetadata,
    registerSummaryCaches,
} from '../helpers/people-orchestration.helpers';
import type {
    GetEmployeeSummaryInput,
    GetEmployeeSummaryResult,
    OrchestrationAuthorization,
} from '../people-orchestration.types';
import type { PeopleOrchestrationRuntime } from '../people-orchestration.deps';

export async function getEmployeeSummaryOperation(
    runtime: PeopleOrchestrationRuntime,
    parsed: GetEmployeeSummaryInput,
): Promise<GetEmployeeSummaryResult> {
    const { authorization } = parsed as { authorization: OrchestrationAuthorization };
    await runtime.ensureOrgAccess(authorization);
    registerSummaryCaches(authorization);

    const metadata = buildTelemetryMetadata('summary', authorization, { year: parsed.year });

    return runtime.execute(authorization, 'hr.people.orchestration.summary', metadata, async () => {
        const profile =
            parsed.profileId
                ? (await runtime.deps.peopleService.getEmployeeProfile({
                    authorization,
                    payload: { profileId: parsed.profileId },
                })).profile
                : parsed.userId
                    ? (await runtime.deps.peopleService.getEmployeeProfileByUser({
                        authorization,
                        payload: { userId: parsed.userId },
                    })).profile
                    : null;

        if (!profile) {
            return {
                profile: null,
                contract: null,
                leaveBalances: [],
                leaveRequestsOpen: [],
                absencesOpen: [],
                complianceStatus: null,
            };
        }

        const targetUserId = profile.userId;
        const contractResult = await runtime.deps.peopleService.getEmploymentContractByEmployee({
            authorization,
            payload: { employeeId: targetUserId },
        });

        const balancesResult = await runtime.deps.leaveService.getLeaveBalance({
            authorization,
            employeeId: profile.employeeNumber,
            year: parsed.year,
        });

        const leaveRequestsResult = await runtime.deps.leaveService.listLeaveRequests({
            authorization,
            employeeId: profile.employeeNumber,
            filters: { status: 'submitted' },
        });

        const absencesResult = await runtime.deps.absenceService.listAbsences({
            authorization,
            filters: { userId: targetUserId, includeClosed: false },
        });

        const complianceStatus = await runtime.deps.complianceStatusService.getStatusForUser(
            authorization,
            targetUserId,
        );

        const openAbsences = absencesResult.absences.filter(
            (absence) => absence.status !== 'CANCELLED' && absence.status !== 'CLOSED',
        );

        return {
            profile,
            contract: contractResult.contract,
            leaveBalances: balancesResult.balances,
            leaveRequestsOpen: leaveRequestsResult.requests,
            absencesOpen: openAbsences,
            complianceStatus,
        };
    });
}
