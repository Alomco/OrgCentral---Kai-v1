'use client';

import { useActionState, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Calendar } from 'lucide-react';
import { toast } from 'sonner';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

import { reportAbsenceAction } from '../actions';
import type { ReportAbsenceFormState } from '../form-state';
import { FieldError } from '../../_components/field-error';
import { parseTimeToMinutes, roundToTwoDecimals } from '../time-utils';
import { ReportAbsenceTimeFields } from './report-absence-time-fields';

export interface AbsenceTypeOption {
    id: string;
    label: string;
}

type DurationType = 'DAYS' | 'HOURS';

export interface ReportAbsenceFormProps {
    authorization: RepositoryAuthorizationContext;
    initialState: ReportAbsenceFormState;
    absenceTypes: AbsenceTypeOption[];
}

export function ReportAbsenceForm({ authorization, initialState, absenceTypes }: ReportAbsenceFormProps) {
    const formId = useId();
    const formReference = useRef<HTMLFormElement>(null);
    const boundAction = reportAbsenceAction.bind(null, authorization);
    const [state, formAction, isPending] = useActionState(boundAction, initialState);
    const [durationType, setDurationType] = useState<DurationType>(state.values.durationType);
    const [startDate, setStartDate] = useState<string>(state.values.startDate);
    const [endDate, setEndDate] = useState<string>(state.values.endDate ?? '');
    const [startTime, setStartTime] = useState<string>(state.values.startTime ?? '');
    const [endTime, setEndTime] = useState<string>(state.values.endTime ?? '');

    const isSuccess = state.status === 'success';
    const isError = state.status === 'error';
    const hasAbsenceTypes = absenceTypes.length > 0;

    const computedHours = useMemo(() => {
        if (durationType !== 'HOURS') {
            return null;
        }
        const startMinutes = parseTimeToMinutes(startTime);
        const endMinutes = parseTimeToMinutes(endTime);
        if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
            return null;
        }
        return roundToTwoDecimals((endMinutes - startMinutes) / 60);
    }, [durationType, startTime, endTime]);

    // Show toast on successful submission
    useEffect(() => {
        if (isSuccess) {
            toast.success('Absence reported successfully!', {
                description: 'Your absence has been recorded and is pending approval.',
            });
            formReference.current?.reset();
        }
    }, [isSuccess]);


    return (
        <Card className="border-2 border-transparent transition-colors hover:border-primary/10 motion-reduce:transition-none">
            <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Report Absence
                </CardTitle>
                <CardDescription>Report an unplanned absence such as sick leave.</CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    ref={formReference}
                    action={formAction}
                    className="space-y-4"
                    onReset={() => {
                        const today = new Date().toISOString().slice(0, 10);
                        setDurationType('DAYS');
                        setStartDate(today);
                        setEndDate('');
                        setStartTime('');
                        setEndTime('');
                    }}
                >
                    {isSuccess ? (
                        <Alert className="bg-green-50 dark:bg-green-950/30">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-700 dark:text-green-400">
                                {state.message}
                            </AlertDescription>
                        </Alert>
                    ) : null}

                    {isError && state.message && !state.fieldErrors ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor={`${formId}-type`}>Type</Label>
                            <Select
                                name="typeId"
                                defaultValue={state.values.typeId}
                                disabled={!hasAbsenceTypes || isPending}
                            >
                                <SelectTrigger id={`${formId}-type`}>
                                    <SelectValue placeholder={hasAbsenceTypes ? 'Select type' : 'No types configured'} />
                                </SelectTrigger>
                                <SelectContent>
                                    {absenceTypes.map((type) => (
                                        <SelectItem key={type.id} value={type.id}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FieldError message={state.fieldErrors?.typeId} />
                            {!hasAbsenceTypes ? (
                                <p className="text-xs text-muted-foreground">
                                    No absence types are configured. Ask an HR admin to add absence types in HR Settings.
                                </p>
                            ) : null}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor={`${formId}-duration`}>Duration type</Label>
                            <Select
                                name="durationType"
                                value={durationType}
                                onValueChange={(value) => setDurationType(value === 'HOURS' ? 'HOURS' : 'DAYS')}
                                disabled={isPending}
                            >
                                <SelectTrigger id={`${formId}-duration`}>
                                    <SelectValue placeholder="Select duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DAYS">Full days</SelectItem>
                                    <SelectItem value="HOURS">Partial day (hours)</SelectItem>
                                </SelectContent>
                            </Select>
                            <FieldError message={state.fieldErrors?.durationType} />
                        </div>
                    </div>

                    <ReportAbsenceTimeFields
                        formId={formId}
                        durationType={durationType}
                        startDate={startDate}
                        endDate={endDate}
                        startTime={startTime}
                        endTime={endTime}
                        computedHours={computedHours}
                        fieldErrors={state.fieldErrors}
                        onStartDateChange={(value) => {
                            setStartDate(value);
                            if (durationType === 'HOURS') {
                                setEndDate(value);
                            }
                        }}
                        onEndDateChange={setEndDate}
                        onStartTimeChange={setStartTime}
                        onEndTimeChange={setEndTime}
                    />

                    <div className="space-y-2">
                        <Label htmlFor={`${formId}-reason`}>Reason (optional)</Label>
                        <Textarea
                            id={`${formId}-reason`}
                            name="reason"
                            rows={3}
                            placeholder="Brief description of absence..."
                            defaultValue={state.values.reason}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={
                            isPending
                            || !hasAbsenceTypes
                            || (durationType === 'HOURS' && computedHours === null)
                        }
                        className="w-full sm:w-auto"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Reporting...
                            </>
                        ) : (
                            'Report Absence'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
