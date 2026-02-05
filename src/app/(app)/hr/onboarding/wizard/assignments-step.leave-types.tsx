import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { FieldError } from '../../_components/field-error';
import type { OnboardingWizardValues } from './wizard.schema';
import type { LeaveTypeOption } from '@/server/types/hr/leave-type-options';

export interface LeaveTypesCardProps {
    values: OnboardingWizardValues;
    leaveTypes: LeaveTypeOption[];
    onValuesChange: (updates: Partial<OnboardingWizardValues>) => void;
    error?: string;
    disabled?: boolean;
}

export function LeaveTypesCard({
    values,
    leaveTypes,
    onValuesChange,
    error,
    disabled = false,
}: LeaveTypesCardProps) {
    const selectedLeaveTypes = values.eligibleLeaveTypes ?? [];
    const allSelected = leaveTypes.length > 0 && selectedLeaveTypes.length === leaveTypes.length;

    const handleLeaveTypeToggle = (code: string, checked: boolean) => {
        const updatedTypes = checked
            ? [...selectedLeaveTypes, code]
            : selectedLeaveTypes.filter((t) => t !== code);
        onValuesChange({ eligibleLeaveTypes: updatedTypes });
    };

    const handleSelectAllLeaveTypes = () => {
        const allCodes = leaveTypes.map((t) => t.code);
        onValuesChange({ eligibleLeaveTypes: allCodes });
    };

    const handleClearAllLeaveTypes = () => {
        onValuesChange({ eligibleLeaveTypes: [] });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Leave Types</CardTitle>
                        <CardDescription>
                            Select the leave types this employee will be eligible for.
                        </CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={handleSelectAllLeaveTypes}
                            disabled={disabled || allSelected || leaveTypes.length === 0}
                            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                            Select all
                        </button>
                        <span className="text-xs text-muted-foreground">|</span>
                        <button
                            type="button"
                            onClick={handleClearAllLeaveTypes}
                            disabled={disabled || selectedLeaveTypes.length === 0}
                            className="text-xs text-primary hover:underline disabled:opacity-50 disabled:no-underline"
                        >
                            Clear
                        </button>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {leaveTypes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No leave types are configured for this organization yet.
                    </p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {leaveTypes.map((leaveType) => {
                            const isChecked = selectedLeaveTypes.includes(leaveType.code);
                            return (
                                <div
                                    key={leaveType.code}
                                    className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                >
                                    <Checkbox
                                        id={`leave-${leaveType.code}`}
                                        checked={isChecked}
                                        onCheckedChange={(checked) =>
                                            handleLeaveTypeToggle(leaveType.code, checked === true)}
                                        disabled={disabled}
                                    />
                                    <div className="grid gap-0.5">
                                        <Label
                                            htmlFor={`leave-${leaveType.code}`}
                                            className="cursor-pointer font-medium"
                                        >
                                            {leaveType.name}
                                        </Label>
                                        {leaveType.description ? (
                                            <p className="text-xs text-muted-foreground">
                                                {leaveType.description}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                <FieldError id="wizard-leaveTypes-error" message={error} />
                {selectedLeaveTypes.length > 0 && (
                    <p className="mt-3 text-xs text-muted-foreground">
                        {selectedLeaveTypes.length} leave type{selectedLeaveTypes.length !== 1 ? 's' : ''} selected
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
