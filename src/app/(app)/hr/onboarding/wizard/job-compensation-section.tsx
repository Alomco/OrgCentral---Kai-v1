'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FieldError } from '../../_components/field-error';
import type { OnboardingWizardValues } from './wizard.schema';
import type { FieldErrors } from '../../_components/form-errors';
import { CURRENCIES, PAY_SCHEDULES } from './job-step-options';
import { SALARY_BASIS_VALUES } from '@/server/types/hr/people';

export interface JobCompensationSectionProps {
    values: OnboardingWizardValues;
    fieldErrors?: FieldErrors<OnboardingWizardValues>;
    onValuesChange: (updates: Partial<OnboardingWizardValues>) => void;
    disabled?: boolean;
}

export function JobCompensationSection({
    values,
    fieldErrors,
    onValuesChange,
    disabled = false,
}: JobCompensationSectionProps) {
    const salaryError = fieldErrors?.annualSalary;
    const hourlyRateError = fieldErrors?.hourlyRate;
    const currencyError = fieldErrors?.currency;
    const salaryBasisError = fieldErrors?.salaryBasis;
    const payScheduleError = fieldErrors?.paySchedule;

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Compensation</h4>
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                    <Label htmlFor="wizard-salaryBasis">Pay basis</Label>
                    <Select
                        value={values.salaryBasis ?? ''}
                        onValueChange={(value) => onValuesChange({
                            salaryBasis: value === ''
                                ? undefined
                                : (value as OnboardingWizardValues['salaryBasis']),
                        })}
                        disabled={disabled}
                    >
                        <SelectTrigger
                            id="wizard-salaryBasis"
                            aria-invalid={Boolean(salaryBasisError)}
                            aria-describedby={salaryBasisError ? 'wizard-salaryBasis-error' : undefined}
                        >
                            <SelectValue placeholder="Select basis" />
                        </SelectTrigger>
                        <SelectContent>
                            {SALARY_BASIS_VALUES.map((basis) => (
                                <SelectItem key={basis} value={basis}>
                                    {basis === 'ANNUAL' ? 'Annual' : 'Hourly'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError id="wizard-salaryBasis-error" message={salaryBasisError} />
                </div>

                {values.salaryBasis === 'HOURLY' ? (
                    <div className="space-y-2">
                        <Label htmlFor="wizard-hourlyRate">Hourly rate</Label>
                        <Input
                            id="wizard-hourlyRate"
                            type="number"
                            min={0}
                            step={1}
                            value={values.hourlyRate ?? ''}
                            onChange={(event) =>
                                onValuesChange({
                                    hourlyRate: event.target.value ? Number(event.target.value) : undefined,
                                })}
                            aria-invalid={Boolean(hourlyRateError)}
                            aria-describedby={hourlyRateError ? 'wizard-hourlyRate-error' : undefined}
                            disabled={disabled}
                            placeholder="25"
                        />
                        <FieldError id="wizard-hourlyRate-error" message={hourlyRateError} />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor="wizard-annualSalary">Annual salary</Label>
                        <Input
                            id="wizard-annualSalary"
                            type="number"
                            min={0}
                            step={1000}
                            value={values.annualSalary ?? ''}
                            onChange={(event) =>
                                onValuesChange({
                                    annualSalary: event.target.value ? Number(event.target.value) : undefined,
                                })}
                            aria-invalid={Boolean(salaryError)}
                            aria-describedby={salaryError ? 'wizard-annualSalary-error' : undefined}
                            disabled={disabled}
                            placeholder="45000"
                        />
                        <FieldError id="wizard-annualSalary-error" message={salaryError} />
                    </div>
                )}

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
                        onValueChange={(value) => onValuesChange({
                            paySchedule: value as OnboardingWizardValues['paySchedule'],
                        })}
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
    );
}
