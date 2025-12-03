import { RepositoryAuthorizer, type RepositoryAuthorizationContext, type TenantScopedRecord } from '@/server/repositories/security';
import { assertOrgAccess } from '@/server/security/guards';
import { AbstractBaseService, type ServiceExecutionContext } from '@/server/services/abstract-base-service';

export abstract class AbstractHrService extends AbstractBaseService {
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

    protected async ensureOrgAccess(authorization: RepositoryAuthorizationContext): Promise<void> {
        await assertOrgAccess({ orgId: authorization.orgId, userId: authorization.userId });
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
