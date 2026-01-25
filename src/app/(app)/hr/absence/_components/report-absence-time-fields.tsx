import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { FieldError } from '../../_components/field-error';
import { roundToTwoDecimals } from '../time-utils';

type DurationType = 'DAYS' | 'HOURS';

type TimeFieldErrors = Partial<Record<'startDate' | 'endDate' | 'startTime' | 'endTime', string>>;

interface ReportAbsenceTimeFieldsProps {
    formId: string;
    durationType: DurationType;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    computedHours: number | null;
    fieldErrors?: TimeFieldErrors;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onStartTimeChange: (value: string) => void;
    onEndTimeChange: (value: string) => void;
}

export function ReportAbsenceTimeFields({
    formId,
    durationType,
    startDate,
    endDate,
    startTime,
    endTime,
    computedHours,
    fieldErrors,
    onStartDateChange,
    onEndDateChange,
    onStartTimeChange,
    onEndTimeChange,
}: ReportAbsenceTimeFieldsProps) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={`${formId}-start`}>Start Date</Label>
                    <Input
                        id={`${formId}-start`}
                        name="startDate"
                        type="date"
                        value={startDate}
                        onChange={(event) => onStartDateChange(event.target.value)}
                    />
                    <FieldError message={fieldErrors?.startDate} />
                </div>

                {durationType === 'HOURS' ? (
                    <input type="hidden" name="endDate" value={startDate} />
                ) : (
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-end`}>End Date</Label>
                        <Input
                            id={`${formId}-end`}
                            name="endDate"
                            type="date"
                            value={endDate}
                            onChange={(event) => onEndDateChange(event.target.value)}
                        />
                        <FieldError message={fieldErrors?.endDate} />
                    </div>
                )}
            </div>

            {durationType === 'HOURS' ? (
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-start-time`}>Start Time</Label>
                        <Input
                            id={`${formId}-start-time`}
                            name="startTime"
                            type="time"
                            value={startTime}
                            onChange={(event) => onStartTimeChange(event.target.value)}
                        />
                        <FieldError message={fieldErrors?.startTime} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-end-time`}>End Time</Label>
                        <Input
                            id={`${formId}-end-time`}
                            name="endTime"
                            type="time"
                            value={endTime}
                            onChange={(event) => onEndTimeChange(event.target.value)}
                        />
                        <FieldError message={fieldErrors?.endTime} />
                    </div>
                    <div className="sm:col-span-2 text-sm text-muted-foreground">
                        {computedHours !== null
                            ? `Estimated duration: ${formatHours(computedHours)}`
                            : 'Enter a valid time range to calculate hours.'}
                    </div>
                    <input type="hidden" name="hours" value={computedHours ?? ''} />
                </div>
            ) : (
                <p className="text-xs text-muted-foreground">
                    Hours will be calculated from the selected dates and HR absence settings.
                </p>
            )}
        </>
    );
}

function formatHours(hours: number): string {
    const rounded = roundToTwoDecimals(hours);
    return String(rounded) + ' hour' + (rounded === 1 ? '' : 's');
}
