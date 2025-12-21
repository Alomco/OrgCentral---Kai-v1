import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IEmploymentContractRepository } from '@/server/repositories/contracts/hr/people/employment-contract-repository-contract';
import type {
  EmployeeProfileDTO,
  EmploymentContractDTO,
  ProfileMutationPayload,
} from '@/server/types/hr/people';
import type {
  IChecklistInstanceRepository,
} from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type {
  IChecklistTemplateRepository,
} from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { ChecklistItemProgress, ChecklistTemplateItem } from '@/server/types/onboarding-types';
import type {
  EmploymentContractCreateInput,
  OnboardingChecklistConfig,
} from '@/server/types/hr/onboarding-workflows';
import { invalidateContractsAfterMutation, invalidateProfilesAfterMutation } from './shared/cache-helpers';
import { assertEmploymentContractEditor, assertPeopleProfileEditor } from '@/server/security/guards-hr-people';
import { HR_ACTION } from '@/server/security/authorization/hr-resource-registry';

// Use-case: create an employee profile via people repositories with RBAC/ABAC authorization safeguards.

export interface CreateEmployeeProfileInput {
  authorization: RepositoryAuthorizationContext;
  profileData: ProfileMutationPayload['changes'] & { userId: string; employeeNumber: string };
  contractData?: EmploymentContractCreateInput | null;
  onboardingTemplateId?: string | null;
  onboardingChecklist?: OnboardingChecklistConfig | null;
}

export interface CreateEmployeeProfileResult {
  success: true;
  contractCreated?: boolean;
  checklistInstanceId?: string;
}

export interface CreateEmployeeProfileDependencies {
  employeeProfileRepository: IEmployeeProfileRepository;
  employmentContractRepository?: IEmploymentContractRepository;
  checklistTemplateRepository?: IChecklistTemplateRepository;
  checklistInstanceRepository?: IChecklistInstanceRepository;
  transactionRunner?: CreateEmployeeProfileTransactionRunner;
}

export async function createEmployeeProfile(
  dependencies: CreateEmployeeProfileDependencies,
  input: CreateEmployeeProfileInput,
): Promise<CreateEmployeeProfileResult> {
  const orgId = input.authorization.orgId;
  const payload: ProfileCreateRecord = {
    ...input.profileData,
    orgId,
    healthStatus: input.profileData.healthStatus ?? 'UNDEFINED',
    employmentType: input.profileData.employmentType ?? 'FULL_TIME',
    employmentStatus: input.profileData.employmentStatus ?? 'ACTIVE',
    dataResidency: input.authorization.dataResidency,
    dataClassification: input.authorization.dataClassification,
  };
  const contractPayload = buildContractPayload(orgId, input.authorization, input.contractData ?? null);

  await assertPeopleProfileEditor({
    authorization: input.authorization,
    action: HR_ACTION.CREATE,
    resourceAttributes: {
      orgId,
      userId: payload.userId,
      employeeNumber: payload.employeeNumber,
      departmentId: payload.departmentId ?? null,
      jobTitle: payload.jobTitle ?? null,
      employmentType: payload.employmentType,
    },
  });

  if (contractPayload) {
    await assertEmploymentContractEditor({
      authorization: input.authorization,
      action: HR_ACTION.CREATE,
      resourceAttributes: {
        orgId,
        userId: contractPayload.userId,
        employeeId: contractPayload.userId,
        departmentId: contractPayload.departmentId ?? null,
        contractType: contractPayload.contractType,
        jobTitle: contractPayload.jobTitle,
        startDate: contractPayload.startDate,
      },
    });
  }

  const profileAndContractResult = await runProfileAndContractPhase({
    dependencies,
    payload,
    orgId,
    contractPayload,
  });

  let checklistInstanceId: string | undefined;
  const onboardingChecklist = resolveOnboardingChecklistConfig(input);
  if (onboardingChecklist) {
    checklistInstanceId = await instantiateOnboardingChecklist({
      dependencies,
      authorization: input.authorization,
      onboardingChecklist,
      employeeIdentifier: input.profileData.employeeNumber,
    });
  }

  await invalidateProfilesAfterMutation(input.authorization);
  if (profileAndContractResult.contractCreated) {
    await invalidateContractsAfterMutation(input.authorization);
  }

  return {
    success: true,
    contractCreated: profileAndContractResult.contractCreated || undefined,
    checklistInstanceId,
  };
}

type ProfileCreateRecord = Omit<EmployeeProfileDTO, 'id' | 'createdAt' | 'updatedAt'>;
type ContractCreateRecord = Omit<EmploymentContractDTO, 'id' | 'createdAt' | 'updatedAt'>;

export type TransactionalCreateDependencies = Pick<
  CreateEmployeeProfileDependencies,
  'employeeProfileRepository' | 'employmentContractRepository'
>;

export type CreateEmployeeProfileTransactionRunner = <T>(
  handler: (deps: TransactionalCreateDependencies) => Promise<T>,
) => Promise<T>;

async function runProfileAndContractPhase(params: {
  dependencies: CreateEmployeeProfileDependencies;
  payload: ProfileCreateRecord;
  contractPayload: ContractCreateRecord | null;
  orgId: string;
}): Promise<{ contractCreated: boolean }> {
  const { dependencies, payload, contractPayload, orgId } = params;
  const runner =
    dependencies.transactionRunner ??
    (async (handler: (deps: TransactionalCreateDependencies) => Promise<void>) =>
      handler({
        employeeProfileRepository: dependencies.employeeProfileRepository,
        employmentContractRepository: dependencies.employmentContractRepository,
      }));
  const exec = runner;

  let contractCreated = false;
  await exec(async (scopedRepos: TransactionalCreateDependencies) => {
    await scopedRepos.employeeProfileRepository.createEmployeeProfile(orgId, payload);

    if (!contractPayload) {
      return;
    }
    if (!scopedRepos.employmentContractRepository) {
      throw new Error('Employment contract repository is required when contract data is provided.');
    }
    await scopedRepos.employmentContractRepository.createEmploymentContract(orgId, contractPayload);
    contractCreated = true;
  });

  return { contractCreated };
}

function buildContractPayload(
  orgId: string,
  authorization: RepositoryAuthorizationContext,
  contractData: EmploymentContractCreateInput | null,
): ContractCreateRecord | null {
  if (!contractData) {
    return null;
  }
  return {
    ...contractData,
    orgId,
    dataResidency: authorization.dataResidency,
    dataClassification: authorization.dataClassification,
  };
}

async function instantiateOnboardingChecklist(params: {
  dependencies: CreateEmployeeProfileDependencies;
  authorization: RepositoryAuthorizationContext;
  onboardingChecklist: OnboardingChecklistConfig;
  employeeIdentifier: string;
}): Promise<string | undefined> {
  const templateId = normalizeTemplateId(params.onboardingChecklist.templateId);
  if (!templateId) {
    return undefined;
  }

  const { checklistInstanceRepository, checklistTemplateRepository } = params.dependencies;
  if (!checklistInstanceRepository || !checklistTemplateRepository) {
    throw new Error('Checklist repositories must be provided when onboarding template IDs are supplied.');
  }

  const existing = await checklistInstanceRepository.getActiveInstanceForEmployee(
    params.authorization.orgId,
    params.employeeIdentifier,
  );
  if (existing) {
    return existing.id;
  }

  const template = await checklistTemplateRepository.getTemplate(params.authorization.orgId, templateId);
  if (!template) {
    return undefined;
  }

  const items = mapTemplateItemsToProgress(template.items);
  const metadata = buildChecklistMetadata(params.onboardingChecklist.metadata);

  const instance = await checklistInstanceRepository.createInstance({
    orgId: params.authorization.orgId,
    employeeId: params.employeeIdentifier,
    templateId: template.id,
    templateName: template.name,
    items,
    metadata,
  });

  return instance.id;
}

function normalizeTemplateId(value?: string | null): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function mapTemplateItemsToProgress(items: ChecklistTemplateItem[]): ChecklistItemProgress[] {
  return items
    .slice()
    .sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER))
    .map((item) => ({
      task: item.label,
      completed: false,
      completedAt: null,
      notes: item.description ?? null,
    }));
}

function buildChecklistMetadata(metadata?: Record<string, unknown>): Record<string, unknown> {
  return {
    source: 'create-employee-profile',
    issuedAt: new Date().toISOString(),
    ...metadata,
  };
}

function resolveOnboardingChecklistConfig(
  input: CreateEmployeeProfileInput,
): OnboardingChecklistConfig | null {
  if (input.onboardingChecklist) {
    return input.onboardingChecklist;
  }
  const normalizedId = normalizeTemplateId(input.onboardingTemplateId);
  if (!normalizedId) {
    return null;
  }
  return { templateId: normalizedId };
}
