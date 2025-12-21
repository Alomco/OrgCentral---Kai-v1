import { randomUUID } from 'node:crypto';
import type { EmployeeProfile, EmploymentContract } from '@/server/types/hr-types';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import type { HRNotificationCreateDTO } from '@/server/types/hr/notifications';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

/**
 * Domain events for HR people operations
 */
export interface DomainEvent {
  type: string;
  payload: Record<string, unknown>;
  timestamp: Date;
}

export interface ProfileCreatedEvent extends DomainEvent {
  type: 'ProfileCreated';
  payload: {
    orgId: string;
    profileId: string;
    userId: string;
    jobTitle: string;
  };
}

export interface ProfileUpdatedEvent extends DomainEvent {
  type: 'ProfileUpdated';
  payload: {
    orgId: string;
    profileId: string;
    userId: string;
    updatedFields: string[];
  };
}

export interface ProfileDeletedEvent extends DomainEvent {
  type: 'ProfileDeleted';
  payload: {
    orgId: string;
    profileId: string;
    userId: string;
  };
}

export interface ContractCreatedEvent extends DomainEvent {
  type: 'ContractCreated';
  payload: {
    orgId: string;
    contractId: string;
    userId: string;
    contractType: string;
  };
}

export interface ContractUpdatedEvent extends DomainEvent {
  type: 'ContractUpdated';
  payload: {
    orgId: string;
    contractId: string;
    userId: string;
    updatedFields: string[];
  };
}

export interface ContractDeletedEvent extends DomainEvent {
  type: 'ContractDeleted';
  payload: {
    orgId: string;
    contractId: string;
    userId: string;
  };
}

export type PeopleDomainEvent =
  | ProfileCreatedEvent
  | ProfileUpdatedEvent
  | ProfileDeletedEvent
  | ContractCreatedEvent
  | ContractUpdatedEvent
  | ContractDeletedEvent;

export type ProfileCreatedEventHandler = (
  orgId: string,
  profileId: string,
  profile: EmployeeProfile,
) => Promise<void>;

export type ProfileUpdatedEventHandler = (
  orgId: string,
  profileId: string,
  profile: EmployeeProfile,
  updatedFields: string[],
) => Promise<void>;

export type ContractCreatedEventHandler = (
  orgId: string,
  contractId: string,
  contract: EmploymentContract,
) => Promise<void>;

export type ContractUpdatedEventHandler = (
  orgId: string,
  contractId: string,
  contract: EmploymentContract,
  updatedFields: string[],
) => Promise<void>;

/**
 * Emit a domain event
 */
export async function emitDomainEvent(event: PeopleDomainEvent): Promise<void> {
  const notification = buildNotificationFromEvent(event);
  if (!notification) {
    return;
  }

  const authorization = buildSyntheticAuthorization(event.payload.orgId, notification.userId);

  await emitHrNotification(
    {},
    {
      authorization,
      notification: {
        ...notification,
        dataClassification: authorization.dataClassification,
        residencyTag: authorization.dataResidency,
        correlationId: authorization.correlationId,
        createdByUserId: authorization.userId,
      },
    },
  );
}

/**
 * Emit a profile created event
 */
export const emitProfileCreatedEvent: ProfileCreatedEventHandler = async (
  orgId,
  profileId,
  profile,
) => {
  const event: ProfileCreatedEvent = {
    type: 'ProfileCreated',
    payload: {
      orgId,
      profileId,
      userId: profile.userId,
      jobTitle: profile.jobTitle ?? 'N/A',
    },
    timestamp: new Date(),
  };

  await emitDomainEvent(event);
};

/**
 * Emit a profile updated event
 */
export const emitProfileUpdatedEvent: ProfileUpdatedEventHandler = async (
  orgId,
  profileId,
  profile,
  updatedFields,
) => {
  const event: ProfileUpdatedEvent = {
    type: 'ProfileUpdated',
    payload: {
      orgId,
      profileId,
      userId: profile.userId,
      updatedFields,
    },
    timestamp: new Date(),
  };

  await emitDomainEvent(event);
};

/**
 * Emit a contract created event
 */
export const emitContractCreatedEvent: ContractCreatedEventHandler = async (
  orgId,
  contractId,
  contract,
) => {
  const event: ContractCreatedEvent = {
    type: 'ContractCreated',
    payload: {
      orgId,
      contractId,
      userId: contract.userId,
      contractType: contract.contractType,
    },
    timestamp: new Date(),
  };

  await emitDomainEvent(event);
};

/**
 * Emit a contract updated event
 */
export const emitContractUpdatedEvent: ContractUpdatedEventHandler = async (
  orgId,
  contractId,
  contract,
  updatedFields,
) => {
  const event: ContractUpdatedEvent = {
    type: 'ContractUpdated',
    payload: {
      orgId,
      contractId,
      userId: contract.userId,
      updatedFields,
    },
    timestamp: new Date(),
  };

  await emitDomainEvent(event);
};

function buildSyntheticAuthorization(orgId: string, userId: string): RepositoryAuthorizationContext {
  const correlationId = randomUUID();
  return {
    orgId,
    userId,
    roleKey: 'custom',
    permissions: {},
    dataResidency: 'UK_ONLY',
    dataClassification: 'OFFICIAL',
    auditSource: 'people-notifications',
    correlationId,
    tenantScope: {
      orgId,
      dataResidency: 'UK_ONLY',
      dataClassification: 'OFFICIAL',
      auditSource: 'people-notifications',
    },
  };
}

function buildNotificationFromEvent(
  event: PeopleDomainEvent,
): Omit<
  HRNotificationCreateDTO,
  'orgId' | 'dataClassification' | 'residencyTag' | 'createdByUserId' | 'correlationId'
> & { orgId: string } | null {
  switch (event.type) {
    case 'ProfileCreated':
      return {
        orgId: event.payload.orgId,
        userId: event.payload.userId,
        title: 'Profile created',
        message: `Your profile was created${event.payload.jobTitle ? ` as ${event.payload.jobTitle}` : ''}.`,
        type: PEOPLE_NOTIFICATION_TYPE,
        priority: 'medium',
        actionUrl: PEOPLE_ACTION_URL,
        metadata: event.payload,
      };
    case 'ProfileUpdated':
      return {
        orgId: event.payload.orgId,
        userId: event.payload.userId,
        title: 'Profile updated',
        message: `Your profile was updated: ${event.payload.updatedFields.join(', ') || 'details changed'}.`,
        type: PEOPLE_NOTIFICATION_TYPE,
        priority: 'low',
        actionUrl: PEOPLE_ACTION_URL,
        metadata: event.payload,
      };
    case 'ContractCreated':
      return {
        orgId: event.payload.orgId,
        userId: event.payload.userId,
        title: 'Employment contract created',
        message: `Your ${event.payload.contractType.toLowerCase()} contract was created.`,
        type: PEOPLE_NOTIFICATION_TYPE,
        priority: 'medium',
        actionUrl: PEOPLE_ACTION_URL,
        metadata: event.payload,
      };
    case 'ContractUpdated':
      return {
        orgId: event.payload.orgId,
        userId: event.payload.userId,
        title: 'Employment contract updated',
        message: `Your contract was updated: ${event.payload.updatedFields.join(', ') || 'details changed'}.`,
        type: PEOPLE_NOTIFICATION_TYPE,
        priority: 'low',
        actionUrl: PEOPLE_ACTION_URL,
        metadata: event.payload,
      };
    case 'ProfileDeleted':
    case 'ContractDeleted':
    default:
      return null;
  }
}
const PEOPLE_NOTIFICATION_TYPE: HRNotificationCreateDTO['type'] = 'system-announcement';
const PEOPLE_ACTION_URL = '/hr/people';
