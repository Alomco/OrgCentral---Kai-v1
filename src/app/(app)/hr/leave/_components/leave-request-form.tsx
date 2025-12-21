'use client';

import { useActionState, useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { submitLeaveRequestAction } from '../actions';
import type { LeaveRequestFormState } from '../form-state';

export interface LeaveRequestFormProps {
    initialState: LeaveRequestFormState;
}

export function LeaveRequestForm({ initialState }: LeaveRequestFormProps) {
    const [state, action, pending] = useActionState(submitLeaveRequestAction, initialState);

    const initialIsHalfDay = useMemo(() => state.values.isHalfDay ?? false, [state.values.isHalfDay]);
    const [isHalfDay, setIsHalfDay] = useState<boolean>(initialIsHalfDay);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Submit request</CardTitle>
                <CardDescription>Requests are scoped to your current organization.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {state.status !== 'idle' ? (
                    <Alert variant={state.status === 'success' ? 'default' : 'destructive'}>
                        <AlertTitle>{state.status === 'success' ? 'Success' : 'Error'}</AlertTitle>
                        <AlertDescription>{state.message ?? 'Something went wrong.'}</AlertDescription>
                    </Alert>
                ) : null}

                <form action={action} className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="leaveType">Leave type</Label>
                            <Input
                                id="leaveType"
                                name="leaveType"
                                autoComplete="off"
                                defaultValue={state.values.leaveType}
                                placeholder="ANNUAL"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="totalDays">Total days</Label>
                            <Input
                                id="totalDays"
                                name="totalDays"
                                type="number"
                                inputMode="decimal"
                                step="0.5"
                                min="0.5"
                                max="365"
                                defaultValue={state.values.totalDays}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="startDate">Start date</Label>
                            <Input
                                id="startDate"
                                name="startDate"
                                type="date"
                                defaultValue={state.values.startDate}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="endDate">End date</Label>
                            <Input
                                id="endDate"
                                name="endDate"
                                type="date"
                                defaultValue={state.values.endDate ?? ''}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <div className="text-sm font-medium">Half day</div>
                            <div className="text-xs text-muted-foreground">Marks the request as a half-day absence.</div>
                        </div>
                        <input type="hidden" name="isHalfDay" value={String(isHalfDay)} />
                        <Switch checked={isHalfDay} onCheckedChange={setIsHalfDay} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="reason">Reason (optional)</Label>
                        <Textarea
                            id="reason"
                            name="reason"
                            rows={4}
                            defaultValue={state.values.reason ?? ''}
                            placeholder="Add a short note for your manager"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={pending}>
                            {pending ? 'Submitting…' : 'Submit request'}
                        </Button>
                        <div className="text-xs text-muted-foreground">No sensitive data is cached.</div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
