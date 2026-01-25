import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { getAbsences } from '@/server/use-cases/hr/absences/get-absences';
import { PrismaUnplannedAbsenceRepository } from '@/server/repositories/prisma/hr/absences/prisma-unplanned-absence-repository';

export interface AbsenceManagerPanels {
    pendingRequests: {
        id: string;
        employeeName: string;
        type: string;
        startDate: Date;
        endDate: Date;
        hours: number;
        reason?: string;
        submittedAt: Date;
    }[];
    teamAbsences: {
        id: string;
        employeeId: string;
        employeeName: string;
        type: string;
        startDate: Date;
        endDate: Date;
        status: 'approved' | 'pending';
    }[];
    teamSize: number;
}

export async function buildAbsenceManagerPanels(
    authorization: RepositoryAuthorizationContext,
    absenceTypes: { id: string; label: string }[],
): Promise<AbsenceManagerPanels> {
    const peopleService = getPeopleService();
    const profilesResult = await peopleService.listEmployeeProfiles({
        authorization,
        payload: {},
    }).catch(() => ({ profiles: [] }));

    const directReports = profilesResult.profiles.filter(
        (profile) => profile.managerUserId === authorization.userId,
    );
    const teamUserIds = new Set(directReports.map((profile) => profile.userId));
    const profileByUserId = new Map(
        directReports.map((profile) => [profile.userId, profile]),
    );
    const absenceTypeById = new Map(
        absenceTypes.map((type) => [type.id, type.label]),
    );

    const absenceRepository = new PrismaUnplannedAbsenceRepository();
    const today = new Date();
    const windowEnd = new Date(today.getTime() + 1000 * 60 * 60 * 24 * 30);

    const absencesResult = await getAbsences(
        { absenceRepository },
        {
            authorization,
            filters: {
                from: today,
                to: windowEnd,
            },
        },
    ).catch(() => ({ absences: [] }));

    const pendingRequests = absencesResult.absences
        .filter((absence) => absence.status === 'REPORTED' && teamUserIds.has(absence.userId))
        .map((absence) => {
            const profile = profileByUserId.get(absence.userId);
            const name = resolveProfileName(profile);
            return {
                id: absence.id,
                employeeName: name,
                type: absenceTypeById.get(absence.typeId) ?? absence.typeId,
                startDate: absence.startDate,
                endDate: absence.endDate,
                hours: typeof absence.hours === 'number' ? absence.hours : Number(absence.hours),
                reason: absence.reason ?? undefined,
                submittedAt: absence.createdAt,
            };
        });

    const teamAbsences: AbsenceManagerPanels['teamAbsences'] = absencesResult.absences
        .filter((absence) => teamUserIds.has(absence.userId))
        .filter((absence) => absence.status === 'APPROVED' || absence.status === 'REPORTED')
        .map((absence) => {
            const profile = profileByUserId.get(absence.userId);
            const name = resolveProfileName(profile);
            return {
                id: absence.id,
                employeeId: profile?.id ?? absence.userId,
                employeeName: name,
                type: absenceTypeById.get(absence.typeId) ?? absence.typeId,
                startDate: absence.startDate,
                endDate: absence.endDate,
                status: absence.status === 'APPROVED' ? 'approved' : 'pending',
            };
        });

    return {
        pendingRequests,
        teamAbsences,
        teamSize: directReports.length,
    };
}

function resolveProfileName(
    profile?: { displayName?: string | null; firstName?: string | null; lastName?: string | null },
): string {
    if (!profile) {
        return 'Employee';
    }
    const displayName = profile.displayName?.trim();
    if (displayName) {
        return displayName;
    }
    const combined = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    return combined.length > 0 ? combined : 'Employee';
}
