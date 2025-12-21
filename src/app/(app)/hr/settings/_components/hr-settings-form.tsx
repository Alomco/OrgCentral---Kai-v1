'use client';

import { useActionState, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import type { HrSettingsFormState } from '../form-state';
import { buildInitialHrSettingsFormState } from '../form-state';
import type { HrSettingsFormValues } from '../schema';

export function HrSettingsForm(props: {
    action: (state: HrSettingsFormState, formData: FormData) => Promise<HrSettingsFormState>;
    defaults: HrSettingsFormValues;
}) {
    const [state, formAction, pending] = useActionState(
        props.action,
        buildInitialHrSettingsFormState(props.defaults),
    );

    const enableOvertimeReference = useRef<HTMLInputElement | null>(null);

    return (
        <form action={formAction}>
            <Card>
                <CardHeader>
                    <CardTitle>Working hours</CardTitle>
                    <CardDescription>
                        Standard defaults used for leave, time tracking, and absence calculations.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="standardHoursPerDay">Hours per day</Label>
                            <Input
                                id="standardHoursPerDay"
                                name="standardHoursPerDay"
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={24}
                                step={0.25}
                                key={`hpd-${String(state.values.standardHoursPerDay)}`}
                                defaultValue={state.values.standardHoursPerDay}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="standardDaysPerWeek">Days per week</Label>
                            <Input
                                id="standardDaysPerWeek"
                                name="standardDaysPerWeek"
                                type="number"
                                inputMode="numeric"
                                min={1}
                                max={7}
                                step={1}
                                key={`dpw-${String(state.values.standardDaysPerWeek)}`}
                                defaultValue={state.values.standardDaysPerWeek}
                                required
                            />
                        </div>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="enableOvertime">Enable overtime</Label>
                            <p className="text-xs text-muted-foreground">
                                Allows overtime-related policy settings for eligible roles.
                            </p>
                        </div>

                        <input
                            ref={enableOvertimeReference}
                            type="hidden"
                            name="enableOvertime"
                            value={state.values.enableOvertime ? 'on' : 'off'}
                        />
                        <Switch
                            id="enableOvertime"
                            key={state.values.enableOvertime ? 'overtime-on' : 'overtime-off'}
                            defaultChecked={state.values.enableOvertime}
                            onCheckedChange={(checked) => {
                                if (enableOvertimeReference.current) {
                                    enableOvertimeReference.current.value = checked ? 'on' : 'off';
                                }
                            }}
                            aria-label="Enable overtime"
                            disabled={pending}
                        />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="leaveTypesCsv">Leave types</Label>
                        <Input
                            id="leaveTypesCsv"
                            name="leaveTypesCsv"
                            type="text"
                            placeholder="Annual leave, Sick leave, Compassionate leave"
                            key={`leave-${state.values.leaveTypesCsv}`}
                            defaultValue={state.values.leaveTypesCsv}
                        />
                        <p className="text-xs text-muted-foreground">
                            Comma-separated labels (max 25). This is used as the initial leave catalog.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adminNotes">Admin notes</Label>
                        <Textarea
                            id="adminNotes"
                            name="adminNotes"
                            placeholder="Internal notes for HR admins (not visible to employees)."
                            key={`notes-${state.values.adminNotes}`}
                            defaultValue={state.values.adminNotes}
                        />
                        <p className="text-xs text-muted-foreground">
                            Stored in HR settings metadata.
                        </p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label htmlFor="approvalWorkflowsJson">Approval workflows (advanced)</Label>
                        <Textarea
                            id="approvalWorkflowsJson"
                            name="approvalWorkflowsJson"
                            placeholder={`{\n  "leaveRequests": {\n    "requiresManagerApproval": true\n  }\n}`}
                            key={`awf-${state.values.approvalWorkflowsJson}`}
                            defaultValue={state.values.approvalWorkflowsJson}
                            className="font-mono"
                        />
                        <p className="text-xs text-muted-foreground">
                            JSON object stored in HR settings. Empty value resets to an empty object.
                        </p>
                    </div>
                </CardContent>

                <CardFooter className="border-t justify-between gap-4">
                    <p className="text-xs text-muted-foreground" role="status" aria-live="polite">
                        {state.status === 'success'
                            ? state.message ?? 'Saved'
                            : state.status === 'error'
                                ? state.message ?? 'Unable to save'
                                : 'Changes apply immediately'}
                    </p>

                    <Button type="submit" size="sm" disabled={pending}>
                        {pending ? 'Saving…' : 'Save'}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}
