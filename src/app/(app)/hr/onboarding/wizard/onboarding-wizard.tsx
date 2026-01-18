'use client';
import { useCallback, useMemo, useState, useTransition } from 'react';
import { X } from 'lucide-react';
import type { ZodError } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Stepper, useStepper } from '@/components/ui/stepper';
import type { ChecklistTemplate } from '@/server/types/onboarding-types';
import { toFieldErrors } from '../../_components/form-errors';
import { type Department } from './job-step';
import { type LeaveType } from './assignments-step';
import { OnboardingWizardContent } from './onboarding-wizard-content';
import { OnboardingWizardFooter } from './onboarding-wizard-footer';
import { OnboardingWizardSuccess } from './onboarding-wizard-success';
import { WIZARD_STEPS } from './onboarding-wizard-steps';
import { validateWizardStep, type OnboardingWizardValues } from './wizard.schema';
import { buildInitialWizardState, mergeWizardValues, type OnboardingWizardState } from './wizard.state';
import type { ManagerOption, WizardSubmitResult } from './wizard.types';
export interface OnboardingWizardProps {
    /** Initial form values */
    initialValues?: Partial<OnboardingWizardValues>;
    /** Available departments */
    departments?: Department[];
    /** Available managers */
    managers?: ManagerOption[];
    /** Available leave types */
    leaveTypes?: LeaveType[];
    /** Available checklist templates */
    checklistTemplates?: ChecklistTemplate[];
    /** Whether the user can manage templates */
    canManageTemplates?: boolean;
    /** Email existence check function */
    onEmailCheck?: (email: string) => Promise<{ exists: boolean; reason?: string; actionUrl?: string; actionLabel?: string }>;
    /** Submit handler */
    onSubmit: (values: OnboardingWizardValues) => Promise<WizardSubmitResult>;
    /** Cancel handler */
    onCancel?: () => void;
}

export function OnboardingWizard({
    initialValues,
    departments = [],
    managers = [],
    leaveTypes,
    checklistTemplates = [],
    canManageTemplates = false,
    onEmailCheck,
    onSubmit,
    onCancel,
}: OnboardingWizardProps) {
    const [state, setState] = useState<OnboardingWizardState>(() =>
        buildInitialWizardState(initialValues),
    );
    const [isPending, startTransition] = useTransition();

    const leaveTypeCodeSet = useMemo(() => {
        return new Set(
            (leaveTypes ?? [])
                .map((leaveType) => leaveType.code.trim())
                .filter((code) => code.length > 0),
        );
    }, [leaveTypes]);

    const stepper = useStepper({ totalSteps: WIZARD_STEPS.length });

    const handleValuesChange = useCallback((updates: Partial<OnboardingWizardValues>) => {
        setState((previous) => ({
            ...previous,
            values: mergeWizardValues(previous.values, updates),
            fieldErrors: undefined,
            message: undefined,
        }));
    }, []);

    const handleStepValidation = useCallback((): boolean => {
        const result = validateWizardStep(stepper.currentStep, state.values);
        if (!result.success) {
            setState((previous) => ({
                ...previous,
                status: 'error',
                fieldErrors: toFieldErrors(result.error as ZodError<OnboardingWizardValues>),
                message: 'Please correct the highlighted errors.',
            }));
            return false;
        }

        if (stepper.currentStep >= 2) {
            const selectedLeaveTypes = state.values.eligibleLeaveTypes ?? [];
            const invalidSelections = selectedLeaveTypes
                .map((code) => code.trim())
                .filter((code) => code.length > 0 && !leaveTypeCodeSet.has(code));

            if (invalidSelections.length > 0) {
                setState((previous) => ({
                    ...previous,
                    status: 'error',
                    fieldErrors: {
                        ...previous.fieldErrors,
                        eligibleLeaveTypes: 'Selected leave types are no longer available. Please update your selections.',
                    },
                    message: 'Please update the leave type selections.',
                }));
                return false;
            }
        }
        setState((previous) => ({
            ...previous,
            status: 'idle',
            fieldErrors: undefined,
            message: undefined,
        }));
        return true;
    }, [leaveTypeCodeSet, stepper.currentStep, state.values]);

    const handleNext = useCallback(() => {
        if (handleStepValidation()) {
            stepper.nextStep();
        }
    }, [handleStepValidation, stepper]);

    const handlePrevious = useCallback(() => {
        stepper.prevStep();
        setState((previous) => ({
            ...previous,
            status: 'idle',
            fieldErrors: undefined,
            message: undefined,
        }));
    }, [stepper]);

    const handleGoToStep = useCallback(
        (stepIndex: number) => {
            if (stepIndex < stepper.currentStep) {
                stepper.goToStep(stepIndex);
                setState((previous) => ({
                    ...previous,
                    status: 'idle',
                    fieldErrors: undefined,
                    message: undefined,
                }));
            }
        },
        [stepper],
    );

    const handleSubmit = useCallback(() => {
        if (!handleStepValidation()) {
            return;
        }

        setState((previous) => ({ ...previous, status: 'submitting' }));

        startTransition(async () => {
            try {
                const result = await onSubmit(state.values);
                if (result.success) {
                    setState((previous) => ({
                        ...previous,
                        status: 'success',
                        token: result.token,
                        invitationUrl: result.invitationUrl,
                        emailDelivered: result.emailDelivered,
                        message: result.message ?? 'Invitation sent successfully!',
                    }));
                } else {
                    setState((previous) => ({
                        ...previous,
                        status: 'error',
                        message: result.error ?? 'Failed to send invitation.',
                    }));
                }
            } catch (error) {
                setState((previous) => ({
                    ...previous,
                    status: 'error',
                    message: error instanceof Error ? error.message : 'An unexpected error occurred.',
                }));
            }
        });
    }, [handleStepValidation, onSubmit, state.values]);

    const isSubmitting = state.status === 'submitting' || isPending;
    const isSuccess = state.status === 'success';

    // Success state
    if (isSuccess) {
        return (
            <OnboardingWizardSuccess
                email={state.values.email}
                token={state.token}
                invitationUrl={state.invitationUrl}
                emailDelivered={state.emailDelivered}
                message={state.message}
                onCancel={onCancel}
            />
        );
    }

    return (
        <Card>
            <CardHeader className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Onboard New Employee</h2>
                    {onCancel && (
                        <Button variant="ghost" size="icon" onClick={onCancel} aria-label="Cancel">
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                </div>
                <Stepper
                    steps={WIZARD_STEPS}
                    currentStep={stepper.currentStep}
                    onStepClick={handleGoToStep}
                />
            </CardHeader>

            <OnboardingWizardContent
                currentStep={stepper.currentStep}
                state={state}
                departments={departments}
                managers={managers}
                leaveTypes={leaveTypes}
                checklistTemplates={checklistTemplates}
                canManageTemplates={canManageTemplates}
                onValuesChange={handleValuesChange}
                onEmailCheck={onEmailCheck}
                onEditStep={handleGoToStep}
                isSubmitting={isSubmitting}
            />

            <OnboardingWizardFooter
                isSubmitting={isSubmitting}
                isFirstStep={stepper.isFirstStep}
                isLastStep={stepper.isLastStep}
                onPrevious={handlePrevious}
                onNext={handleNext}
                onSubmit={handleSubmit}
            />
        </Card>
    );
}
