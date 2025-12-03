import type { OrgPermissionMap, OrgRoleKey } from '@/server/security/access-control';
import {
    assertOrgAccessWithAbac,
    type OrgAccessContext,
    type OrgAccessInput,
    toTenantScope,
} from '@/server/security/guards';
import { RepositoryAuthorizationError } from './repository-errors';
import type { TenantScope } from '@/server/types/tenant';

type GuardEvaluator = (input: OrgAccessInput) => Promise<OrgAccessContext>;

export interface RepositoryAuthorizationDefaults {
    readonly requiredRoles?: readonly OrgRoleKey[];
    readonly requiredPermissions?: Readonly<OrgPermissionMap>;
    readonly expectedClassification?: OrgAccessInput['expectedClassification'];
    readonly expectedResidency?: OrgAccessInput['expectedResidency'];
    readonly auditSource?: string;
}

export interface RepositoryAuthorizerOptions {
    readonly guard?: GuardEvaluator;
    readonly defaults?: RepositoryAuthorizationDefaults;
}

export interface RepositoryAuthorizationContext extends OrgAccessContext {
    readonly tenantScope: TenantScope;
}

export type RepositoryAuthorizationHandler<TResult> = (
    context: RepositoryAuthorizationContext,
) => Promise<TResult>;

export class RepositoryAuthorizer {
    private static singleton: RepositoryAuthorizer | null = null;
    private readonly guard: GuardEvaluator;
    private readonly defaults: RepositoryAuthorizationDefaults;

    constructor(options?: RepositoryAuthorizerOptions) {
        this.guard = options?.guard ?? assertOrgAccessWithAbac;
        this.defaults = options?.defaults ?? {};
    }

    static default(): RepositoryAuthorizer {
        RepositoryAuthorizer.singleton ??= new RepositoryAuthorizer();
        return RepositoryAuthorizer.singleton;
    }

    async authorize<TResult>(
        input: OrgAccessInput,
        handler: RepositoryAuthorizationHandler<TResult>,
    ): Promise<TResult> {
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

    private mergeWithDefaults(input: OrgAccessInput): OrgAccessInput {
        const mergedRoles = mergeUnique(this.defaults.requiredRoles, input.requiredRoles);
        const mergedPermissions = mergePermissionMaps(
            this.defaults.requiredPermissions,
            input.requiredPermissions,
        );
        return {
            ...this.defaults,
            ...input,
            requiredRoles: mergedRoles.length ? mergedRoles : undefined,
            requiredPermissions: mergedPermissions,
            expectedClassification:
                input.expectedClassification ?? this.defaults.expectedClassification,
            expectedResidency: input.expectedResidency ?? this.defaults.expectedResidency,
            auditSource: input.auditSource ?? this.defaults.auditSource,
        };
    }

    private async evaluateGuard(input: OrgAccessInput): Promise<OrgAccessContext> {
        try {
            return await this.guard(input);
        } catch (error) {
            throw toRepositoryAuthorizationError(error);
        }
    }
}

export function withRepositoryAuthorization<TResult>(
    input: OrgAccessInput,
    handler: RepositoryAuthorizationHandler<TResult>,
    authorizer: RepositoryAuthorizer = RepositoryAuthorizer.default(),
): Promise<TResult> {
    return authorizer.authorize(input, handler);
}

export interface TenantScopedRecord {
    orgId?: string | null;
}

export function hasOrgId(record: TenantScopedRecord): record is Required<TenantScopedRecord> {
    return typeof record.orgId === 'string' && record.orgId.length > 0;
}

function mergeUnique<TValue>(
    base: readonly TValue[] | undefined,
    override: readonly TValue[] | undefined,
): TValue[] {
    const combined = new Set<TValue>([...(base ?? []), ...(override ?? [])]);
    return Array.from(combined);
}

function mergePermissionMaps(
    base: Readonly<OrgPermissionMap> | undefined,
    override: OrgPermissionMap | undefined,
): OrgPermissionMap | undefined {
    if (!base && !override) {
        return undefined;
    }
    const result: OrgPermissionMap = {};
    const resources = new Set<keyof OrgPermissionMap>([
        ...(base ? (Object.keys(base) as (keyof OrgPermissionMap)[]) : []),
        ...(override ? (Object.keys(override) as (keyof OrgPermissionMap)[]) : []),
    ]);
    for (const resource of resources) {
        const baseActions = base?.[resource] ?? [];
        const overrideActions = override?.[resource] ?? [];
        const merged = mergeUnique(baseActions, overrideActions);
        if (merged.length > 0) {
            result[resource] = merged.map((action) => action);
        }
    }
    return Object.keys(result).length ? result : undefined;
}

function toRepositoryAuthorizationError(error: unknown): RepositoryAuthorizationError {
    if (error instanceof RepositoryAuthorizationError) {
        return error;
    }
    const message = error instanceof Error ? error.message : 'Authorization failed.';
    return new RepositoryAuthorizationError(message);
}
