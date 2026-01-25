'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { CardContent } from '@/components/ui/card';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';

import { IdentityStep } from './identity-step';
import { JobStep, type Department } from './job-step';
import { AssignmentsStep, type LeaveType } from './assignments-step';
import { ReviewStep } from './review-step';
import type { OnboardingWizardState } from './wizard.state';
import type { OnboardingWizardValues } from './wizard.schema';
import type { EmailCheckResult, InviteRoleOption, ManagerOption } from './wizard.types';

export interface OnboardingWizardBodyProps {
    state: OnboardingWizardState;
    currentStep: number;
    departments: Department[];
    managers: ManagerOption[];
    leaveTypes: LeaveType[] | undefined;
    checklistTemplates: ChecklistTemplate[];
    canManageTemplates: boolean;
    roleOptions: InviteRoleOption[];
    isSubmitting: boolean;
    onValuesChange: (updates: Partial<OnboardingWizardValues>) => void;
    onEmailCheck?: (email: string) => Promise<EmailCheckResult>;
    onEditStep: (stepIndex: number) => void;
}

export function OnboardingWizardBody({
    state,
    currentStep,
    departments,
    managers,
    leaveTypes,
    checklistTemplates,
    canManageTemplates,
    roleOptions,
    isSubmitting,
    onValuesChange,
    onEmailCheck,
    onEditStep,
}: OnboardingWizardBodyProps) {
    return (
        <CardContent className="min-h-[400px]">
            {state.status === 'error' && state.message && (
                <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{state.message}</AlertDescription>
                </Alert>
            )}

            {currentStep === 0 && (
                <IdentityStep
                    values={state.values}
                    fieldErrors={state.fieldErrors}
                    onValuesChange={onValuesChange}
                    onEmailCheck={onEmailCheck}
                    disabled={isSubmitting}
                    roleOptions={roleOptions}
                />
            )}

            {currentStep === 1 && state.values.useOnboarding && (
                <JobStep
                    values={state.values}
                    fieldErrors={state.fieldErrors}
                    onValuesChange={onValuesChange}
                    departments={departments}
                    managers={managers}
                    disabled={isSubmitting}
                />
            )}

            {currentStep === 2 && state.values.useOnboarding && (
                <AssignmentsStep
                    values={state.values}
                    fieldErrors={state.fieldErrors}
                    onValuesChange={onValuesChange}
                    leaveTypes={leaveTypes}
                    checklistTemplates={checklistTemplates}
                    canManageTemplates={canManageTemplates}
                    disabled={isSubmitting}
                />
            )}

            {currentStep === 3 && (
                <ReviewStep
                    values={state.values}
                    checklistTemplates={checklistTemplates}
                    leaveTypes={leaveTypes}
                    onEditStep={onEditStep}
                    stepIndexById={new Map([
                        ['identity', 0],
                        ['job', 1],
                        ['assignments', 2],
                        ['review', 3],
                    ])}
                />
            )}
        </CardContent>
    );
}
