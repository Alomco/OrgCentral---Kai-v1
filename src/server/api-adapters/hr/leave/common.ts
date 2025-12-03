import type { GetSessionDependencies } from '@/server/use-cases/auth/sessions/get-session';
import { PrismaAbsenceSettingsRepository } from '@/server/repositories/prisma/hr/absences';
import type { IAbsenceSettingsRepository } from '@/server/repositories/contracts/hr/absences/absence-settings-repository-contract';
import { defaultLeaveServiceProvider, type LeaveServiceContract } from '@/server/services/hr/leave/leave-service.provider';

export interface ResolvedLeaveControllerDependencies {
    session: GetSessionDependencies;
    service: LeaveServiceContract;
    absenceSettingsRepository: IAbsenceSettingsRepository;
}

export type LeaveControllerDependencies = Partial<ResolvedLeaveControllerDependencies>;

const absenceSettingsRepository = new PrismaAbsenceSettingsRepository();

export const defaultLeaveControllerDependencies: ResolvedLeaveControllerDependencies = {
    session: {},
    service: defaultLeaveServiceProvider.service,
    absenceSettingsRepository,
};

export function resolveLeaveControllerDependencies(
    overrides?: LeaveControllerDependencies,
): ResolvedLeaveControllerDependencies {
    if (!overrides) {
        return defaultLeaveControllerDependencies;
    }

    return {
        session: overrides.session ?? defaultLeaveControllerDependencies.session,
        service: overrides.service ?? defaultLeaveControllerDependencies.service,
        absenceSettingsRepository:
            overrides.absenceSettingsRepository ?? defaultLeaveControllerDependencies.absenceSettingsRepository,
    };
}

export async function readJson<T = unknown>(request: Request): Promise<T | Record<string, never>> {
    try {
        return (await request.json()) as T;
    } catch {
        return {};
    }
}
