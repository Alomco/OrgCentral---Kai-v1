import type { StepperStep } from '@/components/ui/stepper';

export type WizardStepId = 'identity' | 'job' | 'assignments' | 'review';

const BASE_STEPS: StepperStep[] = [
    { id: 'identity', title: 'Access & Identity' },
    { id: 'review', title: 'Review' },
];

const EMPLOYEE_STEPS: StepperStep[] = [
    { id: 'identity', title: 'Access & Identity' },
    { id: 'job', title: 'Job & Comp' },
    { id: 'assignments', title: 'Assignments' },
    { id: 'review', title: 'Review' },
];

export function buildWizardSteps(includeOnboarding: boolean): StepperStep[] {
    return includeOnboarding ? EMPLOYEE_STEPS : BASE_STEPS;
}
