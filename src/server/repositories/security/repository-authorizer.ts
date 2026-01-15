import {
    assertOrgAccessWithAbac,
    type OrgAccessContext,
    type OrgAccessInput,
    toTenantScope,
} from '@/server/security/guards';
import { authorizeOrgAccessRbacOnly } from '@/server/security/authorization/engine';
import type {
    GuardEvaluator,
    RepositoryAuthorizationContext,
    RepositoryAuthorizationDefaults,
    RepositoryAuthorizationHandler,
    RepositoryAuthorizerOptions,
    TenantScopedRecord,
} from '@/server/types/repository-authorization';
import { hasOrgId } from '@/server/types/repository-authorization';
import { mergePermissionMaps, toRepositoryAuthorizationError } from './repository-authorization.helpers';
import { RepositoryAuthorizationError } from './repository-errors';

export class RepositoryAuthorizer {
    private readonly guard: GuardEvaluator;
    private readonly defaults: RepositoryAuthorizationDefaults;

    constructor(options?: RepositoryAuthorizerOptions) {
        this.guard = options?.guard ?? assertOrgAccessWithAbac;
        this.defaults = options?.defaults ?? {};
    }

    static default(): RepositoryAuthorizer {
        return getRepositoryAuthorizer();
    }

    async authorize<TResult>(input: OrgAccessInput, handler: RepositoryAuthorizationHandler<TResult>): Promise<TResult> {
        const mergedInput = this.mergeWithDefaults(input);
        const context = await this.evaluateGuard(mergedInput);
        const tenantScope = toTenantScope(context);
        return handler({ ...context, tenantScope });
    }

    assertTenantRecord<TRecord extends TenantScopedRecord>(
        record: TRecord | null | undefined,
        context: RepositoryAuthorizationContext,
    ): TRecord {
        if (!record) {
            throw new RepositoryAuthorizationError('Record not found.');
        }
        if (!hasOrgId(record) || record.orgId !== context.orgId) {
            throw new RepositoryAuthorizationError('Cross-tenant access detected.');
        }
        return record;
    }

    enforcePermission(context: RepositoryAuthorizationContext, resource: string, action: string): void {
        const input: OrgAccessInput = {
            orgId: context.orgId,
            userId: context.userId,
            requiredPermissions: { [resource]: [action] },
            auditSource: context.auditSource,
            expectedClassification: context.dataClassification,
            expectedResidency: context.dataResidency,
        };

        authorizeOrgAccessRbacOnly(input, context);
    }

    private mergeWithDefaults(input: OrgAccessInput): OrgAccessInput {
        const mergedPermissions = mergePermissionMaps(this.defaults.requiredPermissions, input.requiredPermissions);
        return {
            ...this.defaults,
            ...input,
            requiredPermissions: mergedPermissions,
            expectedClassification: input.expectedClassification ?? this.defaults.expectedClassification,
            expectedResidency: input.expectedResidency ?? this.defaults.expectedResidency,
            auditSource: input.auditSource ?? this.defaults.auditSource,
        } satisfies OrgAccessInput;
    }

    private async evaluateGuard(input: OrgAccessInput): Promise<OrgAccessContext> {
        try {
            return await this.guard(input);
        } catch (error) {
            throw toRepositoryAuthorizationError(error);
        }
    }
}

let sharedAuthorizer: RepositoryAuthorizer | null = null;

export function getRepositoryAuthorizer(options?: RepositoryAuthorizerOptions): RepositoryAuthorizer {
    if (!sharedAuthorizer || options) {
        const authorizer = new RepositoryAuthorizer(options);
        if (!options) {
            sharedAuthorizer = authorizer;
        }
        return authorizer;
    }
    return sharedAuthorizer;
}

export function withRepositoryAuthorization<TResult>(
    input: OrgAccessInput,
    handler: RepositoryAuthorizationHandler<TResult>,
    authorizer: RepositoryAuthorizer = getRepositoryAuthorizer(),
): Promise<TResult> {
    return authorizer.authorize(input, handler);
}

export function enforcePermission(
    context: RepositoryAuthorizationContext,
    resource: string,
    action: string,
): void {
    getRepositoryAuthorizer().enforcePermission(context, resource, action);
}
