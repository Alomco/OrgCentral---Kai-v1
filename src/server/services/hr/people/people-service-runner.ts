import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import {
  assertEmploymentContractEditor,
  assertEmploymentContractReader,
  assertPeopleProfileEditor,
  assertPeopleProfileReader,
} from '@/server/security/guards-hr-people';
import { PEOPLE_CACHE_METADATA } from '@/server/use-cases/hr/people/shared/cache-helpers';
import type { PeopleServiceCacheHandlers } from './people-service.types';
import { HR_ACTION, HR_RESOURCE } from '@/server/security/authorization/hr-resource-registry';

type PeopleScope = 'profiles' | 'contracts';
type AccessLevel = 'read' | 'write';

export interface PeopleServiceRuntime {
  buildContext: (
    authorization: RepositoryAuthorizationContext,
    options?: Omit<ServiceExecutionContext, 'authorization'>,
  ) => ServiceExecutionContext;
  executeInServiceContext: <T>(
    context: ServiceExecutionContext,
    operationName: string,
    handler: () => Promise<T>,
  ) => Promise<T>;
  ensureOrgAccess: (
    authorization: RepositoryAuthorizationContext,
    guard?: {
      action?: string;
      resourceType?: string;
      resourceAttributes?: Record<string, unknown>;
    },
  ) => Promise<void>;
}

interface PeopleServiceRunnerDeps {
  cache: Required<Pick<PeopleServiceCacheHandlers, 'registerContracts' | 'registerProfiles'>>;
  runtime: PeopleServiceRuntime;
}

export class PeopleServiceOperationRunner {
  constructor(private readonly deps: PeopleServiceRunnerDeps) {}

  runProfileReadOperation<TResult>(
    operation: string,
    authorization: RepositoryAuthorizationContext,
    guardAttributes: Record<string, unknown>,
    correlationId: string | undefined,
    handler: (authorization: RepositoryAuthorizationContext) => Promise<TResult>,
  ): Promise<TResult> {
    return this.runScopedOperation(
      operation,
      'profiles',
      'read',
      authorization,
      guardAttributes,
      correlationId,
      handler,
    );
  }

  runProfileWriteOperation<TResult>(
    operation: string,
    authorization: RepositoryAuthorizationContext,
    guardAttributes: Record<string, unknown>,
    correlationId: string | undefined,
    handler: (authorization: RepositoryAuthorizationContext) => Promise<TResult>,
  ): Promise<TResult> {
    return this.runScopedOperation(
      operation,
      'profiles',
      'write',
      authorization,
      guardAttributes,
      correlationId,
      handler,
    );
  }

  runContractReadOperation<TResult>(
    operation: string,
    authorization: RepositoryAuthorizationContext,
    guardAttributes: Record<string, unknown>,
    correlationId: string | undefined,
    handler: (authorization: RepositoryAuthorizationContext) => Promise<TResult>,
  ): Promise<TResult> {
    return this.runScopedOperation(
      operation,
      'contracts',
      'read',
      authorization,
      guardAttributes,
      correlationId,
      handler,
    );
  }

  runContractWriteOperation<TResult>(
    operation: string,
    authorization: RepositoryAuthorizationContext,
    guardAttributes: Record<string, unknown>,
    correlationId: string | undefined,
    handler: (authorization: RepositoryAuthorizationContext) => Promise<TResult>,
  ): Promise<TResult> {
    return this.runScopedOperation(
      operation,
      'contracts',
      'write',
      authorization,
      guardAttributes,
      correlationId,
      handler,
    );
  }

  private async runScopedOperation<TResult>(
    operation: string,
    scope: PeopleScope,
    access: AccessLevel,
    authorization: RepositoryAuthorizationContext,
    guardAttributes: Record<string, unknown>,
    correlationId: string | undefined,
    handler: (authorization: RepositoryAuthorizationContext) => Promise<TResult>,
  ): Promise<TResult> {
    const resourceType =
      scope === 'profiles' ? HR_RESOURCE.HR_EMPLOYEE_PROFILE : HR_RESOURCE.HR_EMPLOYMENT_CONTRACT;
    const action = access === 'read' ? HR_ACTION.READ : HR_ACTION.UPDATE;

    await this.deps.runtime.ensureOrgAccess(authorization, {
      action,
      resourceType,
      resourceAttributes: guardAttributes,
    });

    const scopedAuth = access === 'read'
      ? await this.applyGuard(scope, access, authorization, guardAttributes)
      : authorization;
    if (access === 'read') {
      this.registerCache(scope, scopedAuth);
    }

    const cacheMetadata = scope === 'profiles' ? PEOPLE_CACHE_METADATA.profiles : PEOPLE_CACHE_METADATA.contracts;
    const mergedMetadata = this.buildMetadata(
      {
        ...guardAttributes,
        ...cacheMetadata,
        dataResidency: authorization.dataResidency,
        dataClassification: authorization.dataClassification,
        userId: authorization.userId,
      },
      scope,
      operation,
    );
    const context = this.deps.runtime.buildContext(scopedAuth, { metadata: mergedMetadata, correlationId });

    return this.deps.runtime.executeInServiceContext(context, operation, () => handler(scopedAuth));
  }

  private buildMetadata(
    metadata: Record<string, unknown>,
    scope: PeopleScope,
    operation: string,
  ): Record<string, unknown> {
    const entityId =
      metadata.profileId ??
      metadata.contractId ??
      metadata.employeeId ??
      metadata.userId ??
      metadata.targetUserId;
    return {
      auditSource: `service:hr:people:${operation}`,
      'hr.people.scope': scope,
      'hr.people.entityId': entityId,
      'hr.people.entityType': scope === 'profiles' ? 'profile' : 'contract',
      dataResidency: metadata.dataResidency,
      dataClassification: metadata.dataClassification,
      userId: metadata.userId,
      ...metadata,
    };
  }

  private async applyGuard(
    scope: PeopleScope,
    access: AccessLevel,
    authorization: RepositoryAuthorizationContext,
    attributes: Record<string, unknown>,
  ): Promise<RepositoryAuthorizationContext> {
    if (scope === 'profiles') {
      return access === 'read'
        ? assertPeopleProfileReader({ authorization, resourceAttributes: attributes, action: 'read' })
        : assertPeopleProfileEditor({ authorization, resourceAttributes: attributes, action: 'update' });
    }

    return access === 'read'
      ? assertEmploymentContractReader({ authorization, resourceAttributes: attributes, action: 'read' })
      : assertEmploymentContractEditor({ authorization, resourceAttributes: attributes, action: 'update' });
  }

  private registerCache(scope: PeopleScope, authorization: RepositoryAuthorizationContext): void {
    if (scope === 'profiles') {
      this.deps.cache.registerProfiles(authorization);
    } else {
      this.deps.cache.registerContracts(authorization);
    }
  }
}
