import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { AbstractHrService } from '@/server/services/hr/abstract-hr-service';
import { assertNonEmpty } from '@/server/use-cases/shared/validators';
import { assertPolicyAcknowledgmentActor, assertPrivilegedOrgPolicyActor } from '@/server/security/authorization/hr-policies';
import type { HRPolicy, PolicyAcknowledgment } from '@/server/types/hr-ops-types';
import type { AcknowledgePolicyDTO, AcknowledgePolicyInput, CreatePolicyInput, GetPolicyAcknowledgmentInput, GetPolicyInput, HrPolicyServiceDependencies, ListPoliciesInput, ListPolicyAcknowledgmentsInput, UpdatePolicyInput } from './hr-policy-service.types';
import { assertValidDate, assertValidPolicyDateRange, validateCreatePolicy, validateUpdatePolicy } from './hr-policy-service.validators';
import { emitPolicyAcknowledgedNotification, emitPolicyUpdateNotifications } from './hr-policy-service.notifications';
import { acknowledgeHrPolicy } from '../../../use-cases/hr/policies/acknowledge-hr-policy';
import { createHrPolicy } from '../../../use-cases/hr/policies/create-hr-policy';
import { getHrPolicy } from '../../../use-cases/hr/policies/get-hr-policy';
import { getPolicyAcknowledgment } from '../../../use-cases/hr/policies/get-policy-acknowledgment';
import { listHrPolicies } from '../../../use-cases/hr/policies/list-hr-policies';
import { listPolicyAcknowledgments } from '../../../use-cases/hr/policies/list-policy-acknowledgments';
import { updateHrPolicy } from '../../../use-cases/hr/policies/update-hr-policy';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';
export class HrPolicyService extends AbstractHrService {
    constructor(private readonly dependencies: HrPolicyServiceDependencies) {
        super();
    }

    async createPolicy(input: CreatePolicyInput): Promise<HRPolicy> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.CREATE,
            resourceType: HR_RESOURCE.HR_POLICY,
            resourceAttributes: { title: input.policy.title, category: input.policy.category },
        });
        assertPrivilegedOrgPolicyActor(authorization);

        validateCreatePolicy(input.policy);

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.policies.policy.create',
                title: input.policy.title,
                category: input.policy.category,
            },
        });

        return this.executeInServiceContext(context, 'hr.policies.policy.create', async () => {
            const policy = await createHrPolicy(
                { policyRepository: this.dependencies.policyRepository },
                { authorization, policy: input.policy },
            );

            await emitPolicyUpdateNotifications({
                authorization,
                policy,
                event: 'created',
                employeeProfileRepository: this.dependencies.employeeProfileRepository,
                excludeUserId: authorization.userId,
            });

            return policy;
        });
    }

    async updatePolicy(input: UpdatePolicyInput): Promise<HRPolicy> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.UPDATE,
            resourceType: HR_RESOURCE.HR_POLICY,
            resourceAttributes: { policyId: input.policyId },
        });
        assertPrivilegedOrgPolicyActor(authorization);

        assertNonEmpty(input.policyId, 'policyId');
        validateUpdatePolicy(input.updates);

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.policies.policy.update',
                policyId: input.policyId,
            },
        });

        return this.executeInServiceContext(context, 'hr.policies.policy.update', async () => {
            if (input.updates.effectiveDate && input.updates.expiryDate) {
                assertValidPolicyDateRange(input.updates.effectiveDate, input.updates.expiryDate);
            }

            const policy = await updateHrPolicy(
                { policyRepository: this.dependencies.policyRepository },
                { authorization, policyId: input.policyId, updates: input.updates },
            );

            await emitPolicyUpdateNotifications({
                authorization,
                policy,
                event: 'updated',
                employeeProfileRepository: this.dependencies.employeeProfileRepository,
                excludeUserId: authorization.userId,
            });

            return policy;
        });
    }

    async listPolicies(input: ListPoliciesInput): Promise<HRPolicy[]> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_POLICY,
            resourceAttributes: { filters: input.filters },
        });

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.policies.policy.list',
                status: input.filters?.status,
                category: input.filters?.category,
            },
        });

        return this.executeInServiceContext(context, 'hr.policies.policy.list', () =>
            listHrPolicies(
                { policyRepository: this.dependencies.policyRepository },
                { authorization, filters: input.filters },
            ),
        );
    }

    async getPolicy(input: GetPolicyInput): Promise<HRPolicy | null> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_POLICY,
            resourceAttributes: { policyId: input.policyId },
        });

        assertNonEmpty(input.policyId, 'policyId');

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.policies.policy.get',
                policyId: input.policyId,
            },
        });

        return this.executeInServiceContext(context, 'hr.policies.policy.get', () =>
            getHrPolicy(
                { policyRepository: this.dependencies.policyRepository },
                { authorization, policyId: input.policyId },
            ),
        );
    }

    async acknowledgePolicy(input: AcknowledgePolicyInput): Promise<PolicyAcknowledgment> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.ACKNOWLEDGE,
            resourceType: HR_RESOURCE.HR_POLICY,
            resourceAttributes: { policyId: input.policyId, userId: input.userId, version: input.version },
        });

        assertPolicyAcknowledgmentActor(authorization, input.userId);

        assertNonEmpty(input.userId, 'userId');
        assertNonEmpty(input.policyId, 'policyId');
        assertNonEmpty(input.version, 'version');

        const acknowledgedAt = input.acknowledgedAt ?? new Date();
        assertValidDate(acknowledgedAt, 'acknowledgedAt');

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.policies.policy.acknowledge',
                policyId: input.policyId,
                userId: input.userId,
                version: input.version,
            },
        });

        return this.executeInServiceContext(context, 'hr.policies.policy.acknowledge', async () => {
            const acknowledgment: AcknowledgePolicyDTO = {
                orgId: authorization.orgId,
                userId: input.userId,
                policyId: input.policyId,
                version: input.version,
                acknowledgedAt,
                ipAddress: input.ipAddress ?? null,
                metadata: input.metadata,
            };

            const result = await acknowledgeHrPolicy(
                {
                    policyRepository: this.dependencies.policyRepository,
                    acknowledgmentRepository: this.dependencies.acknowledgmentRepository,
                },
                { authorization, acknowledgment },
            );

            await emitPolicyAcknowledgedNotification({
                authorization,
                policy: result.policy,
                userId: input.userId,
                acknowledgedAt,
            });

            return result.acknowledgment;
        });
    }

    /**
     * Returns the acknowledgment for the policy's current version.
     * If the policy is not found, returns null.
     */
    async getPolicyAcknowledgment(
        input: GetPolicyAcknowledgmentInput,
    ): Promise<PolicyAcknowledgment | null> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_POLICY,
            resourceAttributes: { policyId: input.policyId, userId: input.userId },
        });

        assertPolicyAcknowledgmentActor(authorization, input.userId);

        assertNonEmpty(input.userId, 'userId');
        assertNonEmpty(input.policyId, 'policyId');

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.policies.policy.acknowledgment.get',
                policyId: input.policyId,
                userId: input.userId,
            },
        });

        return this.executeInServiceContext(context, 'hr.policies.policy.acknowledgment.get', () =>
            getPolicyAcknowledgment(
                {
                    policyRepository: this.dependencies.policyRepository,
                    acknowledgmentRepository: this.dependencies.acknowledgmentRepository,
                },
                { authorization, policyId: input.policyId, userId: input.userId },
            ),
        );
    }

    async listPolicyAcknowledgments(input: ListPolicyAcknowledgmentsInput): Promise<PolicyAcknowledgment[]> {
        const authorization = this.coerceAuthorization(input.authorization);
        await this.ensureOrgAccess(authorization, {
            action: HR_ACTION.READ,
            resourceType: HR_RESOURCE.HR_POLICY,
            resourceAttributes: { policyId: input.policyId, version: input.version },
        });

        assertPrivilegedOrgPolicyActor(authorization);

        assertNonEmpty(input.policyId, 'policyId');

        const context = this.buildContext(authorization, {
            metadata: {
                auditSource: 'service:hr.policies.policy.acknowledgments.list',
                policyId: input.policyId,
                version: input.version,
            },
        });

        return this.executeInServiceContext(context, 'hr.policies.policy.acknowledgments.list', () =>
            listPolicyAcknowledgments(
                {
                    policyRepository: this.dependencies.policyRepository,
                    acknowledgmentRepository: this.dependencies.acknowledgmentRepository,
                },
                { authorization, policyId: input.policyId, version: input.version },
            ),
        );
    }

    private coerceAuthorization(value: unknown): RepositoryAuthorizationContext {
        return value as RepositoryAuthorizationContext;
    }
}
