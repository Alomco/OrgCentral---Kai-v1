'use client';

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { FieldError } from '../../_components/field-error';
import type { ManagerOption } from './wizard.types';

const MANAGER_NONE_VALUE = '__none__';

interface ManagerSelectProps {
    value?: string;
    error?: string;
    managers?: ManagerOption[];
    disabled?: boolean;
    onChange: (value?: string) => void;
}

export function ManagerSelect({
    value,
    error,
    managers = [],
    disabled = false,
    onChange,
}: ManagerSelectProps) {
    const managerOptions = managers.filter((manager) => manager.employeeNumber.trim().length > 0);
    const managerValue = value ?? MANAGER_NONE_VALUE;
    const managerPlaceholder = managerOptions.length === 0 ? 'No managers available' : 'Select manager';

    return (
        <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="wizard-managerEmployeeNumber">Manager (employee number)</Label>
            <Select
                value={managerValue}
                onValueChange={(selected) =>
                    onChange(selected === MANAGER_NONE_VALUE ? undefined : selected)}
                disabled={disabled}
            >
                <SelectTrigger
                    id="wizard-managerEmployeeNumber"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'wizard-managerEmployeeNumber-error' : undefined}
                    className="sm:max-w-xs"
                >
                    <SelectValue placeholder={managerPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value={MANAGER_NONE_VALUE}>No manager</SelectItem>
                    {managerOptions.map((manager) => (
                        <SelectItem key={manager.employeeNumber} value={manager.employeeNumber}>
                            <div className="flex flex-col">
                                <span>{manager.displayName}</span>
                                <span className="text-xs text-muted-foreground">
                                    {manager.employeeNumber}{manager.email ? ` | ${manager.email}` : ''}
                                </span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <FieldError id="wizard-managerEmployeeNumber-error" message={error} />
            <p className="text-xs text-muted-foreground">
                Choose the employee&apos;s direct manager from your team.
            </p>
        </div>
    );
}
