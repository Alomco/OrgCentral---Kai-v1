'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { ZodError } from 'zod';
import type { StepperStep } from '@/components/ui/stepper';
import { useStepper } from '@/components/ui/stepper';
import { toFieldErrors } from '../../_components/form-errors';
import { buildWizardSteps, type WizardStepId } from './onboarding-wizard-steps';
import { validateWizardStep, type OnboardingWizardValues } from './wizard.schema';
import { buildInitialWizardState, mergeWizardValues, type OnboardingWizardState } from './wizard.state';
import type { InviteRoleOption, WizardSubmitResult } from './wizard.types';
import type { LeaveType } from './assignments-step';

export interface UseOnboardingWizardParams {
    initialValues?: Partial<OnboardingWizardValues>;
    roleOptions: InviteRoleOption[];
    defaultRole?: string;
    canManageOnboarding: boolean;
    leaveTypes?: LeaveType[];
    onSubmit: (values: OnboardingWizardValues) => Promise<WizardSubmitResult>;
}

export interface UseOnboardingWizardResult {
    state: OnboardingWizardState;
    steps: StepperStep[];
    stepper: ReturnType<typeof useStepper>;
    currentStepId: WizardStepId;
    isSubmitting: boolean;
    isSuccess: boolean;
    handleValuesChange: (updates: Partial<OnboardingWizardValues>) => void;
    handleNext: () => void;
    handlePrevious: () => void;
    handleGoToStep: (stepIndex: number) => void;
    handleSubmit: () => void;
}

export function useOnboardingWizard({
    initialValues,
    roleOptions,
    defaultRole,
    canManageOnboarding,
    leaveTypes,
    onSubmit,
}: UseOnboardingWizardParams): UseOnboardingWizardResult {
    const initialRole = (
        initialValues?.role && initialValues.role.length > 0
            ? initialValues.role
            : undefined
    ) ?? (
            defaultRole && defaultRole.length > 0
                ? defaultRole
                : undefined
        ) ?? roleOptions.find((role) => role.name.length > 0)?.name ?? 'member';
    const desiredOnboarding = initialValues?.useOnboarding ?? initialRole === 'member';
    const initialUseOnboarding = canManageOnboarding && desiredOnboarding;
    const [state, setState] = useState<OnboardingWizardState>(() =>
        buildInitialWizardState({
            ...initialValues,
            role: initialRole,
            useOnboarding: initialUseOnboarding,
        }),
    );
    const [isPending, startTransition] = useTransition();
    const previousRole = useRef(state.values.role);

    const leaveTypeCodeSet = useMemo(() => {
        return new Set(
            (leaveTypes ?? [])
                .map((leaveType) => leaveType.code.trim())
                .filter((code) => code.length > 0),
        );
    }, [leaveTypes]);

    const steps = useMemo(
        () => buildWizardSteps(state.values.useOnboarding),
        [state.values.useOnboarding],
    );
    const stepper = useStepper({ totalSteps: steps.length });
    const currentStepId = (steps[stepper.currentStep]?.id ?? 'review') as WizardStepId;

    useEffect(() => {
        if (stepper.currentStep >= steps.length) {
            stepper.goToStep(Math.max(steps.length - 1, 0));
        }
    }, [steps.length, stepper]);

    const handleValuesChange = useCallback((updates: Partial<OnboardingWizardValues>) => {
        setState((previous) => {
            const merged = mergeWizardValues(previous.values, updates);
            const shouldUseOnboarding = canManageOnboarding && merged.role === 'member';
            let nextValues: OnboardingWizardValues = {
                ...merged,
                useOnboarding: shouldUseOnboarding,
            };

            if (!shouldUseOnboarding) {
                nextValues = {
                    ...nextValues,
                    firstName: '',
                    lastName: '',
                    employeeNumber: '',
                    jobTitle: undefined,
                    departmentId: undefined,
                    employmentType: undefined,
                    startDate: undefined,
                    annualSalary: undefined,
                    hourlyRate: undefined,
                    managerEmployeeNumber: undefined,
                    eligibleLeaveTypes: [],
                    onboardingTemplateId: undefined,
                    includeTemplate: false,
                };
            }

            return {
                ...previous,
                values: nextValues,
                fieldErrors: undefined,
                message: undefined,
            };
        });
    }, [canManageOnboarding]);

    useEffect(() => {
        if (previousRole.current !== state.values.role) {
            previousRole.current = state.values.role;
            stepper.goToStep(0);
        }
    }, [state.values.role, stepper]);

    const handleStepValidation = useCallback((): boolean => {
        const result = validateWizardStep(currentStepId, state.values);
        if (!result.success) {
            setState((previous) => ({
                ...previous,
                status: 'error',
                fieldErrors: toFieldErrors(result.error as ZodError<OnboardingWizardValues>),
                message: 'Please correct the highlighted errors.',
            }));
            return false;
        }

        if (state.values.useOnboarding && (currentStepId === 'assignments' || currentStepId === 'review')) {
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
    }, [currentStepId, leaveTypeCodeSet, state.values]);

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

    return {
        state,
        steps,
        stepper,
        currentStepId,
        isSubmitting,
        isSuccess,
        handleValuesChange,
        handleNext,
        handlePrevious,
        handleGoToStep,
        handleSubmit,
    };
}
