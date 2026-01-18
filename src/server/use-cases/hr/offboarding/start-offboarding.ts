import { EntityNotFoundError } from '@/server/errors';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { IEmployeeProfileRepository } from '@/server/repositories/contracts/hr/people/employee-profile-repository-contract';
import type { IChecklistTemplateRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-template-repository-contract';
import type { IChecklistInstanceRepository } from '@/server/repositories/contracts/hr/onboarding/checklist-instance-repository-contract';
import type { IOffboardingRepository } from '@/server/repositories/contracts/hr/offboarding';
import type { ChecklistTemplateItem, ChecklistItemProgress } from '@/server/types/onboarding-types';
import type { OffboardingRecord } from '@/server/types/hr/offboarding-types';
import { assertOffboardingStarter } from '@/server/security/authorization/hr-guards/offboarding';
import { recordAuditEvent } from '@/server/logging/audit-logger';

export type OffboardingMode = 'DIRECT' | 'CHECKLIST';

export interface StartOffboardingInput {
    authorization: RepositoryAuthorizationContext;
    profileId: string;
    mode: OffboardingMode;
    templateId?: string;
    reason: string;
    metadata?: Record<string, unknown> | null;
}

export interface StartOffboardingDependencies {
    offboardingRepository: IOffboardingRepository;
    employeeProfileRepository: IEmployeeProfileRepository;
    checklistTemplateRepository?: IChecklistTemplateRepository;
    checklistInstanceRepository?: IChecklistInstanceRepository;
}

export interface StartOffboardingResult {
    offboarding: OffboardingRecord;
    checklistInstanceId?: string | null;
}

export async function startOffboarding(
    deps: StartOffboardingDependencies,
    input: StartOffboardingInput,
): Promise<StartOffboardingResult> {
    await assertOffboardingStarter({
        authorization: input.authorization,
        resourceAttributes: {
            orgId: input.authorization.orgId,
            employeeId: input.profileId,
        },
    });

    const profile = await deps.employeeProfileRepository.getEmployeeProfile(
        input.authorization.orgId,
        input.profileId,
    );
    if (!profile) {
        throw new EntityNotFoundError('Employee profile', { profileId: input.profileId, orgId: input.authorization.orgId });
    }

    const existing = await deps.offboardingRepository.getOffboardingByEmployee(
        input.authorization.orgId,
        input.profileId,
    );
    if (existing && existing.status === 'IN_PROGRESS') {
        throw new Error('Offboarding already in progress for this employee.');
    }

    const offboarding = await deps.offboardingRepository.createOffboarding({
        orgId: input.authorization.orgId,
        employeeId: profile.id,
        initiatedByUserId: input.authorization.userId,
        checklistInstanceId: null,
        reason: input.reason,
        metadata: input.metadata ?? null,
        dataResidency: input.authorization.dataResidency,
        dataClassification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        correlationId: input.authorization.correlationId,
        createdBy: input.authorization.userId,
    });

    let checklistInstanceId: string | null = null;

    if (input.mode === 'CHECKLIST') {
        if (!input.templateId) {
            throw new Error('Checklist template is required for checklist-based offboarding.');
        }
        if (!deps.checklistTemplateRepository || !deps.checklistInstanceRepository) {
            throw new Error('Checklist repositories are required for checklist-based offboarding.');
        }

        const template = await deps.checklistTemplateRepository.getTemplate(
            input.authorization.orgId,
            input.templateId,
        );
        if (!template || template.type !== 'offboarding') {
            throw new Error('Offboarding checklist template not found.');
        }

        const items = mapTemplateItemsToProgress(template.items);
        const instance = await deps.checklistInstanceRepository.createInstance({
            orgId: input.authorization.orgId,
            employeeId: profile.employeeNumber,
            templateId: template.id,
            templateName: template.name,
            items,
            metadata: {
                source: 'offboarding',
                issuedAt: new Date().toISOString(),
                ...input.metadata,
            },
        });

        checklistInstanceId = instance.id;
        await deps.offboardingRepository.updateOffboarding(
            input.authorization.orgId,
            offboarding.id,
            {
                checklistInstanceId,
                updatedBy: input.authorization.userId,
            },
        );
    }

    if (input.mode === 'DIRECT') {
        await deps.employeeProfileRepository.updateEmployeeProfile(
            input.authorization.orgId,
            profile.id,
            {
                employmentStatus: 'ARCHIVED',
                archivedAt: new Date(),
            },
        );

        const completed = await deps.offboardingRepository.updateOffboarding(
            input.authorization.orgId,
            offboarding.id,
            {
                status: 'COMPLETED',
                completedAt: new Date(),
                updatedBy: input.authorization.userId,
            },
        );

        await recordAuditEvent({
            orgId: input.authorization.orgId,
            userId: input.authorization.userId,
            eventType: 'HR',
            action: 'hr.offboarding.completed',
            resource: 'hr.offboarding',
            resourceId: completed.id,
            residencyZone: input.authorization.dataResidency,
            classification: input.authorization.dataClassification,
            auditSource: input.authorization.auditSource,
            payload: {
                profileId: profile.id,
                mode: input.mode,
                reason: input.reason,
            },
        });

        return {
            offboarding: completed,
            checklistInstanceId,
        };
    }

    await deps.employeeProfileRepository.updateEmployeeProfile(
        input.authorization.orgId,
        profile.id,
        {
            employmentStatus: 'OFFBOARDING',
        },
    );

    await recordAuditEvent({
        orgId: input.authorization.orgId,
        userId: input.authorization.userId,
        eventType: 'HR',
        action: 'hr.offboarding.started',
        resource: 'hr.offboarding',
        resourceId: offboarding.id,
        residencyZone: input.authorization.dataResidency,
        classification: input.authorization.dataClassification,
        auditSource: input.authorization.auditSource,
        payload: {
            profileId: profile.id,
            mode: input.mode,
            checklistInstanceId,
            reason: input.reason,
        },
    });

    return { offboarding, checklistInstanceId };
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
