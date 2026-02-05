'use client';

import { Separator } from '@/components/ui/separator';
import { User, Briefcase } from 'lucide-react';

import type { OnboardingWizardValues } from './wizard.schema';
import { ReviewField, ReviewSection } from './review-section';
import {
    EMPLOYMENT_TYPE_LABELS,
    PAY_SCHEDULE_LABELS,
    SALARY_BASIS_LABELS,
    formatCurrency,
    formatDate,
} from './review-utils';
export { ReviewAssignmentsSection, type ReviewAssignmentsSectionProps } from './review-assignments-section';

export interface ReviewIdentitySectionProps {
    values: OnboardingWizardValues;
    onEditStep?: (stepIndex: number) => void;
    stepIndex?: number;
    showEmployeeFields?: boolean;
}

export function ReviewIdentitySection({
    values,
    onEditStep,
    stepIndex,
    showEmployeeFields = false,
}: ReviewIdentitySectionProps) {
    return (
        <ReviewSection
            title="Access & Identity"
            icon={<User className="h-4 w-4 text-muted-foreground" />}
            stepIndex={stepIndex}
            onEdit={onEditStep}
        >
            <div className="space-y-0.5">
                <ReviewField label="Role" value={values.role} />
                <Separator />
                <ReviewField label="Email" value={values.email} />
                <Separator />
                <ReviewField label="Display name" value={values.displayName} />
                {showEmployeeFields ? (
                    <>
                        <Separator />
                        <ReviewField label="First name" value={values.firstName} />
                        <Separator />
                        <ReviewField label="Last name" value={values.lastName} />
                        <Separator />
                        <ReviewField label="Employee number" value={values.employeeNumber} />
                    </>
                ) : null}
            </div>
        </ReviewSection>
    );
}

export interface ReviewJobSectionProps {
    values: OnboardingWizardValues;
    onEditStep?: (stepIndex: number) => void;
    stepIndex?: number;
}

export function ReviewJobSection({ values, onEditStep, stepIndex }: ReviewJobSectionProps) {
    return (
        <ReviewSection
            title="Job & Compensation"
            icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
            stepIndex={stepIndex}
            onEdit={onEditStep}
        >
            <div className="space-y-0.5">
                <ReviewField label="Job title" value={values.jobTitle} />
                <Separator />
                <ReviewField
                    label="Employment type"
                    value={values.employmentType ? EMPLOYMENT_TYPE_LABELS[values.employmentType] : undefined}
                />
                <Separator />
                <ReviewField label="Start date" value={formatDate(values.startDate)} />
                <Separator />
                <ReviewField label="Manager" value={values.managerEmployeeNumber} />
                <Separator />
                <ReviewField label="Mentor" value={values.mentorEmployeeNumber} />
                <Separator />
                <ReviewField
                    label="Pay basis"
                    value={values.salaryBasis ? SALARY_BASIS_LABELS[values.salaryBasis] : undefined}
                />
                <Separator />
                <ReviewField
                    label="Annual salary"
                    value={values.annualSalary ? formatCurrency(values.annualSalary, values.currency) : undefined}
                />
                <Separator />
                <ReviewField
                    label="Hourly rate"
                    value={values.hourlyRate ? formatCurrency(values.hourlyRate, values.currency) : undefined}
                />
                <Separator />
                <ReviewField
                    label="Pay schedule"
                    value={values.paySchedule ? PAY_SCHEDULE_LABELS[values.paySchedule] : undefined}
                />
            </div>
        </ReviewSection>
    );
}

