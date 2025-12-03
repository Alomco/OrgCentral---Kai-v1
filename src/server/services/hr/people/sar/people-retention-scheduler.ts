import type { AuditEventPayload } from '@/server/logging/audit-logger';
import { recordAuditEvent } from '@/server/logging/audit-logger';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmployeeProfileDTO, EmploymentContractDTO } from '@/server/types/hr/people';
import type { DataClassificationLevel, DataResidencyZone } from '@/server/types/tenant';

export interface RetentionJobDescriptor {
  orgId: string;
  recordId: string;
  userId: string;
  dataResidency?: DataResidencyZone;
  dataClassification?: DataClassificationLevel;
  retentionExpiresAt?: Date | string | null;
  correlationId?: string;
  resource: 'profile' | 'contract';
}

export interface RetentionJobQueue {
  enqueueProfileSoftDelete(job: RetentionJobDescriptor): Promise<void>;
  enqueueContractSoftDelete(job: RetentionJobDescriptor): Promise<void>;
}

export interface PeopleRetentionSchedulerDeps {
  profileRepo: IEmployeeProfileRepository;
  contractRepo: IEmploymentContractRepository;
  queue?: RetentionJobQueue;
  auditLogger?: (event: AuditEventPayload) => Promise<void>;
  now?: () => Date;
}

export interface RetentionScheduleResult {
  profilesScheduled: number;
  contractsScheduled: number;
}

function isExpired(retentionExpiresAt: Date | string | null | undefined, now: Date): boolean {
  if (!retentionExpiresAt) {
    return false;
  }
  const value = retentionExpiresAt instanceof Date ? retentionExpiresAt : new Date(retentionExpiresAt);
  return !Number.isNaN(value.getTime()) && value.getTime() <= now.getTime();
}

async function auditRetention(
  auditLogger: (event: AuditEventPayload) => Promise<void>,
  authorization: RepositoryAuthorizationContext,
  record: EmployeeProfileDTO | EmploymentContractDTO,
  resource: 'hr.people.profile' | 'hr.people.contract',
  correlationId?: string,
): Promise<void> {
  await auditLogger({
    orgId: authorization.orgId,
    userId: authorization.userId,
    eventType: 'DATA_CHANGE',
    action: 'retention.soft_delete',
    resource,
    resourceId: record.id,
    correlationId: correlationId ?? authorization.correlationId,
    residencyZone: record.dataResidency ?? authorization.dataResidency,
    classification: record.dataClassification ?? authorization.dataClassification,
    auditSource: authorization.auditSource,
    payload: {
      retentionExpiresAt: record.retentionExpiresAt ?? null,
      erasureCompletedAt: record.erasureCompletedAt ?? null,
    },
  });
}

export class PeopleRetentionScheduler {
  private readonly deps: Required<Omit<PeopleRetentionSchedulerDeps, 'queue'>> & {
    queue?: RetentionJobQueue;
  };

  constructor(deps: PeopleRetentionSchedulerDeps) {
    this.deps = {
      ...deps,
      auditLogger: deps.auditLogger ?? recordAuditEvent,
      now: deps.now ?? (() => new Date()),
    };
  }

  async sweepExpired(
    authorization: RepositoryAuthorizationContext,
    correlationId?: string,
  ): Promise<RetentionScheduleResult> {
    const now = this.deps.now();
    const profiles = await this.deps.profileRepo.getEmployeeProfilesByOrganization(authorization.orgId);
    const contracts = await this.deps.contractRepo.getEmploymentContractsByOrganization(authorization.orgId);

    let profilesScheduled = 0;
    let contractsScheduled = 0;

    for (const profile of profiles) {
      if (profile.erasureCompletedAt || !isExpired(profile.retentionExpiresAt, now)) {
        continue;
      }
      profilesScheduled += 1;
      await this.softDeleteProfile(profile, authorization, correlationId);
    }

    for (const contract of contracts) {
      if (contract.erasureCompletedAt || !isExpired(contract.retentionExpiresAt, now)) {
        continue;
      }
      contractsScheduled += 1;
      await this.softDeleteContract(contract, authorization, correlationId);
    }

    return { profilesScheduled, contractsScheduled };
  }

  private async softDeleteProfile(
    profile: EmployeeProfileDTO,
    authorization: RepositoryAuthorizationContext,
    correlationId?: string,
  ): Promise<void> {
    const deletionDate = this.deps.now();

    await this.deps.profileRepo.updateEmployeeProfile(authorization.orgId, profile.id, {
      deletedAt: deletionDate,
      correlationId: correlationId ?? authorization.correlationId,
      auditSource: authorization.auditSource,
    });

    if (this.deps.queue) {
      await this.deps.queue.enqueueProfileSoftDelete({
        orgId: authorization.orgId,
        recordId: profile.id,
        userId: profile.userId,
        dataResidency: profile.dataResidency,
        dataClassification: profile.dataClassification,
        retentionExpiresAt: profile.retentionExpiresAt,
        correlationId,
        resource: 'profile',
      });
    }

    await auditRetention(
      this.deps.auditLogger,
      authorization,
      profile,
      'hr.people.profile',
      correlationId,
    );
  }

  private async softDeleteContract(
    contract: EmploymentContractDTO,
    authorization: RepositoryAuthorizationContext,
    correlationId?: string,
  ): Promise<void> {
    const deletionDate = this.deps.now();

    await this.deps.contractRepo.updateEmploymentContract(authorization.orgId, contract.id, {
      deletedAt: deletionDate,
      correlationId: correlationId ?? authorization.correlationId,
      auditSource: authorization.auditSource,
    });

    if (this.deps.queue) {
      await this.deps.queue.enqueueContractSoftDelete({
        orgId: authorization.orgId,
        recordId: contract.id,
        userId: contract.userId,
        dataResidency: contract.dataResidency,
        dataClassification: contract.dataClassification,
        retentionExpiresAt: contract.retentionExpiresAt,
        correlationId,
        resource: 'contract',
      });
    }

    await auditRetention(
      this.deps.auditLogger,
      authorization,
      contract,
      'hr.people.contract',
      correlationId,
    );
  }
}
