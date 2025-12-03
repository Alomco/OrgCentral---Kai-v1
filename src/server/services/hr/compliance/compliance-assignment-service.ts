import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IComplianceItemRepository } from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';

export interface AssignComplianceInput {
    authorization: RepositoryAuthorizationContext;
    userIds: string[];
    templateId: string;
    templateItemIds: string[];
}

export interface ComplianceAssignmentServiceDependencies {
    complianceItemRepository: IComplianceItemRepository;
}

export class ComplianceAssignmentService extends AbstractHrService {
    constructor(private readonly dependencies: ComplianceAssignmentServiceDependencies) {
        super();
    }

    async assignCompliancePack(input: AssignComplianceInput): Promise<void> {
        await this.ensureOrgAccess(input.authorization);

        const context = this.buildContext(input.authorization, {
            metadata: {
                auditSource: 'service:hr:compliance.assign-pack',
                templateId: input.templateId,
                userCount: input.userIds.length,
                itemCount: input.templateItemIds.length,
            },
        });

        return this.executeInServiceContext(context, 'hr.compliance.assign-pack', async () => {
            await Promise.all(
                input.userIds.map((userId) =>
                    this.dependencies.complianceItemRepository.assignItems({
                        orgId: input.authorization.orgId,
                        userId,
                        templateId: input.templateId,
                        templateItemIds: input.templateItemIds,
                        assignedBy: input.authorization.userId,
                    }),
                ),
            );
        });
    }
}
