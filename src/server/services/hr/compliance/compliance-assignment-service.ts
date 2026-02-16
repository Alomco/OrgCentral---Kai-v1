import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IComplianceItemRepository } from '@/server/repositories/contracts/hr/compliance/compliance-item-repository-contract';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

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
        const userIds = [...new Set(input.userIds)];
        const templateItemIds = [...new Set(input.templateItemIds)];

        await this.ensureOrgAccess(input.authorization, {
            action: HR_ACTION.ASSIGN,
            resourceType: HR_RESOURCE.HR_COMPLIANCE,
            resourceAttributes: {
                templateId: input.templateId,
                userIds,
                itemCount: templateItemIds.length,
            },
        });

        const context = this.buildContext(input.authorization, {
            metadata: {
                auditSource: 'service:hr:compliance.assign-pack',
                templateId: input.templateId,
                userCount: userIds.length,
                itemCount: templateItemIds.length,
            },
        });

        return this.executeInServiceContext(context, 'hr.compliance.assign-pack', async () => {
            await Promise.all(
                userIds.map((userId) =>
                    this.dependencies.complianceItemRepository.assignItems({
                        orgId: input.authorization.orgId,
                        userId,
                        templateId: input.templateId,
                        templateItemIds,
                        assignedBy: input.authorization.userId,
                    }),
                ),
            );
        });
    }
}
