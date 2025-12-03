import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { PeopleServiceNotifications } from './people-service.types';
import type { PeoplePlatformAdapters, PeopleEntityAction } from './people-service.adapters';
import type { EmployeeProfile, EmploymentContract } from '@/server/types/hr-types';
import {
  invalidateProfilesAfterMutation,
  invalidateContractsAfterMutation,
  registerProfilesCache,
  registerContractsCache,
} from '@/server/use-cases/hr/people/shared/cache-helpers';
import { invalidateLeaveCacheScopes } from '@/server/use-cases/hr/leave/shared/cache-helpers';
import { invalidateAbsenceScopeCache } from '@/server/use-cases/hr/absences/cache-helpers';
import { invalidateComplianceCachesAfterPeopleMutation } from '@/server/use-cases/hr/compliance/shared/cache-helpers';
import type { Result } from 'neverthrow';
import { appLogger } from '@/server/logging/structured-logger';
import { randomUUID } from 'node:crypto';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export function unwrapOrThrow<T>(result: Result<T, Error>): T {
  if (result.isErr()) {
    throw result.error;
  }
  return result.value;
}

export async function invalidateProfileCaches(
  authorization: RepositoryAuthorizationContext,
  profile?: EmployeeProfile,
): Promise<void> {
  await Promise.all([
    invalidateProfilesAfterMutation(authorization, {
      classification: profile?.dataClassification,
      residency: profile?.dataResidency,
    }),
    invalidateLeaveCacheScopes(authorization, 'requests', 'balances'),
    invalidateAbsenceScopeCache(authorization),
    invalidateComplianceCachesAfterPeopleMutation(authorization),
  ]);
}

export async function invalidateContractCaches(
  authorization: RepositoryAuthorizationContext,
  contract?: EmploymentContract,
): Promise<void> {
  await Promise.all([
    invalidateContractsAfterMutation(authorization, {
      classification: contract?.dataClassification,
      residency: contract?.dataResidency,
    }),
    invalidateLeaveCacheScopes(authorization, 'requests', 'balances'),
    invalidateAbsenceScopeCache(authorization),
    invalidateComplianceCachesAfterPeopleMutation(authorization),
  ]);
}

export function registerProfileReadCaches(
  authorization: RepositoryAuthorizationContext,
  profile?: EmployeeProfile,
): void {
  registerProfilesCache(authorization, {
    classification: profile?.dataClassification,
    residency: profile?.dataResidency,
  });
}

export function registerContractReadCaches(
  authorization: RepositoryAuthorizationContext,
  contract?: EmploymentContract,
): void {
  registerContractsCache(authorization, {
    classification: contract?.dataClassification,
    residency: contract?.dataResidency,
  });
}

export async function emitProfileSideEffects(params: {
  authorization: RepositoryAuthorizationContext;
  profile: EmployeeProfile;
  notifications: PeopleServiceNotifications;
  adapters: PeoplePlatformAdapters;
  action: PeopleEntityAction;
  updatedFields?: string[];
  correlationId?: string;
}): Promise<void> {
  const { authorization, profile, notifications, adapters, action, updatedFields, correlationId } = params;

  if (action === 'created') {
    await notifications.profileCreated(authorization.orgId, profile.id, profile);
  } else if (action === 'updated') {
    await notifications.profileUpdated(authorization.orgId, profile.id, profile, updatedFields ?? []);
  }

  await adapters.workflow
    .handleProfileEvent({ authorization, profile, action, updatedFields })
    .unwrapOr(undefined);
  await adapters.reporting
    .recordProfileEvent({ authorization, profile, action, updatedFields })
    .unwrapOr(undefined);

  await emitComplianceAuditLog({
    authorization,
    entityId: profile.id,
    entityType: 'profile',
    action,
    correlationId,
    residency: profile.dataResidency ?? authorization.dataResidency,
    classification: profile.dataClassification ?? authorization.dataClassification,
  });

  appLogger.info('people.profile.event', {
    action,
    profileId: profile.id,
    orgId: authorization.orgId,
    userId: authorization.userId,
    updatedFields,
    dataResidency: profile.dataResidency ?? authorization.dataResidency,
    dataClassification: profile.dataClassification ?? authorization.dataClassification,
    correlationId,
  });
}

export async function emitContractSideEffects(params: {
  authorization: RepositoryAuthorizationContext;
  contract: EmploymentContract;
  notifications: PeopleServiceNotifications;
  adapters: PeoplePlatformAdapters;
  action: PeopleEntityAction;
  updatedFields?: string[];
  correlationId?: string;
}): Promise<void> {
  const { authorization, contract, notifications, adapters, action, updatedFields, correlationId } = params;

  if (action === 'created') {
    await notifications.contractCreated(authorization.orgId, contract.id, contract);
  } else if (action === 'updated') {
    await notifications.contractUpdated(authorization.orgId, contract.id, contract, updatedFields ?? []);
  }

  await adapters.workflow
    .handleContractEvent({ authorization, contract, action, updatedFields })
    .unwrapOr(undefined);
  await adapters.reporting
    .recordContractEvent({ authorization, contract, action, updatedFields })
    .unwrapOr(undefined);

  await emitComplianceAuditLog({
    authorization,
    entityId: contract.id,
    entityType: 'contract',
    action,
    correlationId,
    residency: contract.dataResidency ?? authorization.dataResidency,
    classification: contract.dataClassification ?? authorization.dataClassification,
  });

  appLogger.info('people.contract.event', {
    action,
    contractId: contract.id,
    orgId: authorization.orgId,
    userId: authorization.userId,
    updatedFields,
    dataResidency: contract.dataResidency ?? authorization.dataResidency,
    dataClassification: contract.dataClassification ?? authorization.dataClassification,
    correlationId,
  });
}

async function emitComplianceAuditLog(params: {
  authorization: RepositoryAuthorizationContext;
  entityId: string;
  entityType: 'profile' | 'contract';
  action: PeopleEntityAction;
  residency?: DataResidencyZone;
  classification?: DataClassificationLevel;
  correlationId?: string;
}): Promise<void> {
  const eventId = randomUUID();
  const dataResidency = params.residency ?? params.authorization.dataResidency;
  const dataClassification = params.classification ?? params.authorization.dataClassification;
  const auditSource = `service:hr:people.${params.entityType}.${params.action}`;

  await recordAuditEvent({
    orgId: params.authorization.orgId,
    userId: params.authorization.userId,
    eventType: 'DATA_CHANGE',
    action: `${params.entityType}.${params.action}`,
    resource: `hr.people.${params.entityType}`,
    resourceId: params.entityId,
    correlationId: params.correlationId,
    residencyZone: dataResidency,
    classification: dataClassification,
    auditSource,
    payload: {
      eventId,
      dataResidency,
      dataClassification,
    },
  });

  appLogger.info('compliance.audit_logs', {
    eventId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    orgId: params.authorization.orgId,
    userId: params.authorization.userId,
    dataResidency,
    dataClassification,
    correlationId: params.correlationId,
    auditSource,
  });
}
