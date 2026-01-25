'use client';

import { useRouter } from 'next/navigation';

import { OnboardingWizard, type OnboardingWizardValues } from '../wizard';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';
import type { Department } from '../wizard/job-step';
import type { InviteRoleOption, ManagerOption } from '../wizard/wizard.types';
import type { LeaveType } from '../wizard/assignments-step';
import { submitOnboardingWizardAction, checkEmailExistsAction } from '../actions';

export interface OnboardingWizardPanelProps {
    roleOptions: InviteRoleOption[];
    defaultRole?: string;
    canManageOnboarding?: boolean;
    cancelPath?: string;
    departments?: Department[];
    checklistTemplates?: ChecklistTemplate[];
    managers?: ManagerOption[];
    leaveTypes?: LeaveType[];
    canManageTemplates?: boolean;
    enableEmailCheck?: boolean;
}

export function OnboardingWizardPanel({
    roleOptions,
    defaultRole,
    canManageOnboarding = false,
    cancelPath,
    departments = [],
    checklistTemplates = [],
    managers = [],
    leaveTypes = [],
    canManageTemplates = false,
    enableEmailCheck = false,
}: OnboardingWizardPanelProps) {
    const router = useRouter();

    const handleSubmit = async (values: OnboardingWizardValues) => {
        return submitOnboardingWizardAction(values);
    };

    const handleEmailCheck = enableEmailCheck
        ? async (email: string) => checkEmailExistsAction(email)
        : undefined;

    const handleCancel = cancelPath
        ? () => {
            router.push(cancelPath);
        }
        : undefined;

    return (
        <OnboardingWizard
            roleOptions={roleOptions}
            defaultRole={defaultRole}
            departments={departments}
            checklistTemplates={checklistTemplates}
            managers={managers}
            leaveTypes={leaveTypes}
            canManageTemplates={canManageTemplates}
            canManageOnboarding={canManageOnboarding}
            onEmailCheck={handleEmailCheck}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        />
    );
}
