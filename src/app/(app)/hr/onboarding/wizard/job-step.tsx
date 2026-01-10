'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FieldError } from '../../_components/field-error';
import type { OnboardingWizardValues } from './wizard.schema';
import type { FieldErrors } from '../../_components/form-errors';
import type { ManagerOption } from './wizard.types';
import { ManagerSelect } from './manager-select';

import { CURRENCIES, EMPLOYMENT_TYPES, PAY_SCHEDULES } from './job-step-options';

export interface Department {
    id: string;
    name: string;
}

export interface JobStepProps {
    values: OnboardingWizardValues;
    fieldErrors?: FieldErrors<OnboardingWizardValues>;
    onValuesChange: (updates: Partial<OnboardingWizardValues>) => void;
    departments?: Department[];
    managers?: ManagerOption[];
    disabled?: boolean;
}

export function JobStep({
    values,
    fieldErrors,
    onValuesChange,
    departments = [],
    managers = [],
    disabled = false,
}: JobStepProps) {
    const jobTitleError = fieldErrors?.jobTitle;
    const departmentError = fieldErrors?.departmentId;
    const employmentTypeError = fieldErrors?.employmentType;
    const startDateError = fieldErrors?.startDate;
    const salaryError = fieldErrors?.annualSalary;
    const currencyError = fieldErrors?.currency;
    const payScheduleError = fieldErrors?.paySchedule;
    const managerError = fieldErrors?.managerEmployeeNumber;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Job &amp; Compensation</h3>
                <p className="text-sm text-muted-foreground">
                    Configure the employee&apos;s role and compensation details. All fields are optional and can be updated later.
                </p>
            </div>

            {/* Job Details */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Job Details</h4>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="wizard-jobTitle">Job title</Label>
                        <Input
                            id="wizard-jobTitle"
                            type="text"
                            value={values.jobTitle ?? ''}
                            onChange={(event) => onValuesChange({ jobTitle: event.target.value || undefined })}
                            aria-invalid={Boolean(jobTitleError)}
                            aria-describedby={jobTitleError ? 'wizard-jobTitle-error' : undefined}
                            disabled={disabled}
                            placeholder="Software Engineer"
                        />
                        <FieldError id="wizard-jobTitle-error" message={jobTitleError} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wizard-departmentId">Department</Label>
                        <Select
                            value={values.departmentId ?? ''}
                            onValueChange={(value) => onValuesChange({ departmentId: value === '' ? undefined : value })}
                            disabled={disabled || departments.length === 0}
                        >
                            <SelectTrigger
                                id="wizard-departmentId"
                                aria-invalid={Boolean(departmentError)}
                                aria-describedby={departmentError ? 'wizard-departmentId-error' : undefined}
                            >
                                <SelectValue placeholder={departments.length === 0 ? 'No departments' : 'Select department'} />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.map((dept) => (
                                    <SelectItem key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError id="wizard-departmentId-error" message={departmentError} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wizard-employmentType">Employment type</Label>
                        <Select
                            value={values.employmentType ?? ''}
                            onValueChange={(value) =>
                                onValuesChange({
                                    employmentType:
                                        value === '' ? undefined : (value as OnboardingWizardValues['employmentType']),
                                })}
                            disabled={disabled}
                        >
                            <SelectTrigger
                                id="wizard-employmentType"
                                aria-invalid={Boolean(employmentTypeError)}
                                aria-describedby={employmentTypeError ? 'wizard-employmentType-error' : undefined}
                            >
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                {EMPLOYMENT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>
                                        {type.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError id="wizard-employmentType-error" message={employmentTypeError} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wizard-startDate">Start date</Label>
                        <Input
                            id="wizard-startDate"
                            type="date"
                            value={values.startDate ?? ''}
                            onChange={(event) => onValuesChange({ startDate: event.target.value || undefined })}
                            aria-invalid={Boolean(startDateError)}
                            aria-describedby={startDateError ? 'wizard-startDate-error' : undefined}
                            disabled={disabled}
                        />
                        <FieldError id="wizard-startDate-error" message={startDateError} />
                    </div>

                    <ManagerSelect
                        value={values.managerEmployeeNumber}
                        error={managerError}
                        managers={managers}
                        disabled={disabled}
                        onChange={(value) => onValuesChange({ managerEmployeeNumber: value })}
                    />
                </div>
            </div>

            {/* Compensation Details */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground">Compensation</h4>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="wizard-annualSalary">Annual salary</Label>
                        <Input
                            id="wizard-annualSalary"
                            type="number"
                            min={0}
                            step={1000}
                            value={values.annualSalary ?? ''}
                            onChange={(event) => onValuesChange({ annualSalary: event.target.value ? Number(event.target.value) : undefined })}
                            aria-invalid={Boolean(salaryError)}
                            aria-describedby={salaryError ? 'wizard-annualSalary-error' : undefined}
                            disabled={disabled}
                            placeholder="45000"
                        />
                        <FieldError id="wizard-annualSalary-error" message={salaryError} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wizard-currency">Currency</Label>
                        <Select
                            value={values.currency ?? 'GBP'}
                            onValueChange={(value) => onValuesChange({ currency: value })}
                            disabled={disabled}
                        >
                            <SelectTrigger
                                id="wizard-currency"
                                aria-invalid={Boolean(currencyError)}
                                aria-describedby={currencyError ? 'wizard-currency-error' : undefined}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {CURRENCIES.map((currency) => (
                                    <SelectItem key={currency.value} value={currency.value}>
                                        {currency.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError id="wizard-currency-error" message={currencyError} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="wizard-paySchedule">Pay schedule</Label>
                        <Select
                            value={values.paySchedule ?? 'MONTHLY'}
                            onValueChange={(value) => onValuesChange({ paySchedule: value as OnboardingWizardValues['paySchedule'] })}
                            disabled={disabled}
                        >
                            <SelectTrigger
                                id="wizard-paySchedule"
                                aria-invalid={Boolean(payScheduleError)}
                                aria-describedby={payScheduleError ? 'wizard-paySchedule-error' : undefined}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAY_SCHEDULES.map((schedule) => (
                                    <SelectItem key={schedule.value} value={schedule.value}>
                                        {schedule.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError id="wizard-paySchedule-error" message={payScheduleError} />
                    </div>
                </div>
            </div>
        </div>
    );
}
