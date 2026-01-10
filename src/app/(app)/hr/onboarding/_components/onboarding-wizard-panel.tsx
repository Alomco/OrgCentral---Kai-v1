'use client';

import { useRouter } from 'next/navigation';

import { OnboardingWizard, type OnboardingWizardValues } from '../wizard';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';
import type { Department } from '../wizard/job-step';
import type { ManagerOption } from '../wizard/wizard.types';
import { submitOnboardingWizardAction, checkEmailExistsAction } from '../actions';

export interface OnboardingWizardPanelProps {
    departments?: Department[];
    checklistTemplates?: ChecklistTemplate[];
    managers?: ManagerOption[];
    canManageTemplates?: boolean;
}

export function OnboardingWizardPanel({
    departments = [],
    checklistTemplates = [],
    managers = [],
    canManageTemplates = false,
}: OnboardingWizardPanelProps) {
    const router = useRouter();

    const handleSubmit = async (values: OnboardingWizardValues) => {
        return submitOnboardingWizardAction(values);
    };

    const handleEmailCheck = async (email: string) => {
        return checkEmailExistsAction(email);
    };

    const handleCancel = () => {
        router.push('/hr/onboarding');
    };

    return (
        <OnboardingWizard
            departments={departments}
            checklistTemplates={checklistTemplates}
            managers={managers}
            canManageTemplates={canManageTemplates}
            onEmailCheck={handleEmailCheck}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
        />
    );
}
