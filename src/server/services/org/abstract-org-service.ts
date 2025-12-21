import {
    RepositoryAuthorizer,
    type RepositoryAuthorizationContext,
    type TenantScopedRecord,
} from '@/server/repositories/security';
import { assertOrgAccessWithAbac, type OrgAccessInput } from '@/server/security/guards';
import { AbstractBaseService, type ServiceExecutionContext } from '@/server/services/abstract-base-service';

export abstract class AbstractOrgService extends AbstractBaseService {
    protected buildContext(
        authorization: RepositoryAuthorizationContext,
        options?: Omit<ServiceExecutionContext, 'authorization'>,
    ): ServiceExecutionContext {
        return {
            authorization,
            correlationId: options?.correlationId,
            metadata: options?.metadata,
        };
    }

    protected async ensureOrgAccess(
        authorization: RepositoryAuthorizationContext,
        guard?: Pick<
            OrgAccessInput,
            | 'requiredPermissions'
            | 'requiredAnyPermissions'
            | 'expectedClassification'
            | 'expectedResidency'
            | 'action'
            | 'resourceType'
            | 'resourceAttributes'
        >,
    ): Promise<void> {
        await assertOrgAccessWithAbac({
            orgId: authorization.orgId,
            userId: authorization.userId,
            auditSource: authorization.auditSource,
            correlationId: authorization.correlationId,
            requiredPermissions: guard?.requiredPermissions,
            requiredAnyPermissions: guard?.requiredAnyPermissions,
            expectedClassification: guard?.expectedClassification,
            expectedResidency: guard?.expectedResidency,
            action: guard?.action,
            resourceType: guard?.resourceType,
            resourceAttributes: guard?.resourceAttributes,
        });
    }

    protected ensureEntityAccess<TEntity extends TenantScopedRecord>(
        context: RepositoryAuthorizationContext,
        record: TEntity | null | undefined,
    ): TEntity {
        return RepositoryAuthorizer.default().assertTenantRecord(record, context);
    }

    protected ensureEntitiesAccess<TEntity extends TenantScopedRecord>(
        context: RepositoryAuthorizationContext,
        records: TEntity[],
    ): TEntity[] {
        return records.map((record) => this.ensureEntityAccess(context, record));
    }
}
