import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import { assertPrivilegedOrgPolicyActor } from '@/server/security/authorization/hr-policies';
import type { LeavePolicy } from '@/server/types/leave-types';
import type {
    CreateLeavePolicyServiceInput,
    DeleteLeavePolicyServiceInput,
    LeavePolicyServiceDependencies,
    ListLeavePoliciesServiceInput,
    UpdateLeavePolicyServiceInput,
} from './leave-policy-service.types';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

import {
    createLeavePolicy as createLeavePolicyUseCase,
} from '@/server/use-cases/hr/leave-policies/create-leave-policy';
import {
    updateLeavePolicy as updateLeavePolicyUseCase,
} from '@/server/use-cases/hr/leave-policies/update-leave-policy';
import {
    listLeavePolicies as listLeavePoliciesUseCase,
} from '@/server/use-cases/hr/leave-policies/list-leave-policies';
import {
    deleteLeavePolicy as deleteLeavePolicyUseCase,
} from '@/server/use-cases/hr/leave-policies/delete-leave-policy';

export class LeavePolicyService extends AbstractHrService {
    constructor(private readonly dependencies: LeavePolicyServiceDependencies) {
        super();
    }

    async createLeavePolicy(input: CreateLeavePolicyServiceInput): Promise<LeavePolicy> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.CREATE,
            resourceType: HR_RESOURCE.HR_LEAVE_POLICY,
            resourceAttributes: { name: input.payload.name, type: input.payload.type },
        });
        assertPrivilegedOrgPolicyActor(authorization);

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.leave-policies.create',
                orgId: input.payload.orgId,
                name: input.payload.name,
                type: input.payload.type,
            },
        });

        return this.executeInServiceContext(context, 'hr.leave-policies.create', async () => {
            const result = await createLeavePolicyUseCase(
                { leavePolicyRepository: this.dependencies.leavePolicyRepository },
                { authorization, payload: input.payload },
            );

            return result.policy;
        });
    }

    async updateLeavePolicy(input: UpdateLeavePolicyServiceInput): Promise<LeavePolicy> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_LEAVE_POLICY,
            resourceAttributes: { policyId: input.policyId },
        });
        assertPrivilegedOrgPolicyActor(authorization);

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.leave-policies.update',
                orgId: input.orgId,
                policyId: input.policyId,
            },
        });

        return this.executeInServiceContext(context, 'hr.leave-policies.update', async () => {
            const result = await updateLeavePolicyUseCase(
                {
                    leavePolicyRepository: this.dependencies.leavePolicyRepository,
                    organizationRepository: this.dependencies.organizationRepository,
                },
                {
                    authorization,
                    orgId: input.orgId,
                    policyId: input.policyId,
                    patch: input.patch,
                },
            );

            return result.policy;
        });
    }

    async listLeavePolicies(input: ListLeavePoliciesServiceInput): Promise<LeavePolicy[]> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_LEAVE_POLICY,
            resourceAttributes: { orgId: input.payload.orgId },
        });
        assertPrivilegedOrgPolicyActor(authorization);

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.leave-policies.list',
                orgId: input.payload.orgId,
            },
        });

        return this.executeInServiceContext(context, 'hr.leave-policies.list', async () => {
            const result = await listLeavePoliciesUseCase(
                { leavePolicyRepository: this.dependencies.leavePolicyRepository },
                { authorization, payload: input.payload },
            );

            return result.policies;
        });
    }

    async deleteLeavePolicy(input: DeleteLeavePolicyServiceInput): Promise<{ success: true }> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.DELETE,
            resourceType: HR_RESOURCE.HR_LEAVE_POLICY,
            resourceAttributes: { policyId: input.payload.policyId },
        });
        assertPrivilegedOrgPolicyActor(authorization);

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.leave-policies.delete',
                orgId: input.payload.orgId,
                policyId: input.payload.policyId,
            },
        });

        return this.executeInServiceContext(context, 'hr.leave-policies.delete', async () => {
            return deleteLeavePolicyUseCase(
                {
                    leavePolicyRepository: this.dependencies.leavePolicyRepository,
                    leaveBalanceRepository: this.dependencies.leaveBalanceRepository,
                    leaveRequestRepository: this.dependencies.leaveRequestRepository,
                },
                { authorization, payload: input.payload },
            );
        });
    }

    private coerceAuthorization(value: unknown): RepositoryAuthorizationContext {
        return value as RepositoryAuthorizationContext;
    }
}
