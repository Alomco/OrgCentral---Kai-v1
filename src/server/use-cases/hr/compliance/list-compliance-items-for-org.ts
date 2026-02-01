import type { ComplianceLogItem } from '@/server/types/compliance-types';
import type { IComplianceItemRepository } from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { registerComplianceItemsCache } from './shared/cache-helpers';

export interface ListComplianceItemsForOrgInput {
    authorization: RepositoryAuthorizationContext;
    take?: number;
}

export interface ListComplianceItemsForOrgDependencies {
    complianceItemRepository: IComplianceItemRepository;
}

export interface ListComplianceItemsForOrgResult {
    items: ComplianceLogItem[];
}

export async function listComplianceItemsForOrg(
    deps: ListComplianceItemsForOrgDependencies,
    input: ListComplianceItemsForOrgInput,
): Promise<ListComplianceItemsForOrgResult> {
    registerComplianceItemsCache(input.authorization);

    const items = await deps.complianceItemRepository.listItemsForOrg(
        input.authorization.orgId,
        input.take,
    );

    return { items };
}
