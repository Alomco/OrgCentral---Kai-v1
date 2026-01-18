import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IOffboardingRepository } from '@/server/repositories/contracts/hr/offboarding';
import type { OffboardingRecord } from '@/server/types/hr/offboarding-types';
import { assertOffboardingReader } from '@/server/security/authorization/hr-guards/offboarding';

export interface GetOffboardingByEmployeeInput {
    authorization: RepositoryAuthorizationContext;
    employeeId: string;
}

export interface GetOffboardingByEmployeeDependencies {
    offboardingRepository: IOffboardingRepository;
}

export interface GetOffboardingByEmployeeResult {
    offboarding: OffboardingRecord | null;
}

export async function getOffboardingByEmployee(
    deps: GetOffboardingByEmployeeDependencies,
    input: GetOffboardingByEmployeeInput,
): Promise<GetOffboardingByEmployeeResult> {
    await assertOffboardingReader({
        authorization: input.authorization,
        resourceAttributes: {
            orgId: input.authorization.orgId,
            employeeId: input.employeeId,
        },
    });

    const offboarding = await deps.offboardingRepository.getOffboardingByEmployee(
        input.authorization.orgId,
        input.employeeId,
    );

    return { offboarding };
}
