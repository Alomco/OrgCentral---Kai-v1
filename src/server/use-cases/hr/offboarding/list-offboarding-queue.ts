import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IOffboardingRepository, OffboardingListFilters } from '@/server/repositories/contracts/hr/offboarding';
import type { OffboardingRecord } from '@/server/types/hr/offboarding-types';
import { assertOffboardingLister } from '@/server/security/authorization/hr-guards/offboarding';

export interface ListOffboardingQueueInput {
    authorization: RepositoryAuthorizationContext;
    filters?: OffboardingListFilters;
}

export interface ListOffboardingQueueDependencies {
    offboardingRepository: IOffboardingRepository;
}

export interface ListOffboardingQueueResult {
    records: OffboardingRecord[];
}

export async function listOffboardingQueue(
    deps: ListOffboardingQueueDependencies,
    input: ListOffboardingQueueInput,
): Promise<ListOffboardingQueueResult> {
    await assertOffboardingLister({
        authorization: input.authorization,
        resourceAttributes: {
            orgId: input.authorization.orgId,
        },
    });

    const records = await deps.offboardingRepository.listOffboarding(
        input.authorization.orgId,
        input.filters,
    );

    return { records };
}
