'use client';

import { useActionState, useEffect, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';

import type { ChecklistTemplate } from '@/server/types/onboarding-types';

import { FieldError } from '../../_components/field-error';
import { inviteEmployeeAction } from '../actions';
import type { OnboardingInviteFormState } from '../form-state';
import { useInviteEmployeeToast } from './invite-employee-toast';
import { generateNextEmployeeId } from '../actions/generate-employee-id';
import { InviteEmployeeFeedback } from './invite-employee-feedback';

export interface InviteEmployeeFormProps {
    initialState: OnboardingInviteFormState;
    templates: ChecklistTemplate[];
    canManageTemplates: boolean;
}

export function InviteEmployeeForm({ initialState, templates, canManageTemplates }: InviteEmployeeFormProps) {
    const [state, action, pending] = useActionState(inviteEmployeeAction, initialState);

    const emailError = state.fieldErrors?.email;
    const displayNameError = state.fieldErrors?.displayName;
    const employeeNumberError = state.fieldErrors?.employeeNumber;
    const jobTitleError = state.fieldErrors?.jobTitle;
    const onboardingTemplateError = state.fieldErrors?.onboardingTemplateId;

    const feedbackReference = useRef<HTMLDivElement | null>(null);
    const formReference = useRef<HTMLFormElement | null>(null);
    const employeeNumberInputReference = useRef<HTMLInputElement | null>(null);
    const previousStatus = useRef(state.status);
    const [isGeneratingEmployeeNumber, startGenerateEmployeeNumber] = useTransition();
    const [employeeNumberGenerationError, setEmployeeNumberGenerationError] = useState<string | null>(null);

    useEffect(() => {
        const priorStatus = previousStatus.current;
        if (!pending && state.status !== 'idle' && priorStatus !== state.status) {
            feedbackReference.current?.focus();
        }
        previousStatus.current = state.status;
    }, [pending, state.status]);

    useEffect(() => {
        formReference.current?.setAttribute('aria-busy', pending ? 'true' : 'false');
    }, [pending]);

    useInviteEmployeeToast(state, pending);

    function handleGenerateEmployeeNumber() {
        startGenerateEmployeeNumber(() => {
            setEmployeeNumberGenerationError(null);
            void generateNextEmployeeId()
                .then((result) => {
                    if (employeeNumberInputReference.current) {
                        employeeNumberInputReference.current.value = result.employeeNumber;
                    }
                })
                .catch((error: unknown) => {
                    setEmployeeNumberGenerationError(error instanceof Error
                        ? error.message
                        : 'Unable to generate employee number.');
                });
        });
    }

    const [includeTemplate, setIncludeTemplate] = useState<boolean>(() => (
        initialState.values.includeTemplate ?? Boolean(initialState.values.onboardingTemplateId)
    ));

    const templateOptions = templates;

    const formBody = (
        <fieldset disabled={pending} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        defaultValue={state.values.email}
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={emailError ? 'email-error' : undefined}
                        required
                    />
                    <FieldError id="email-error" message={emailError} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="displayName">Display name</Label>
                    <Input
                        id="displayName"
                        name="displayName"
                        autoComplete="name"
                        defaultValue={state.values.displayName}
                        aria-invalid={Boolean(displayNameError)}
                        aria-describedby={displayNameError ? 'displayName-error' : undefined}
                        required
                    />
                    <FieldError id="displayName-error" message={displayNameError} />
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="employeeNumber">Employee number</Label>
                    <Input
                        ref={employeeNumberInputReference}
                        id="employeeNumber"
                        name="employeeNumber"
                        autoComplete="off"
                        defaultValue={state.values.employeeNumber}
                        aria-invalid={Boolean(employeeNumberError)}
                        aria-describedby={employeeNumberError ? 'employeeNumber-error' : undefined}
                        required
                    />
                    <FieldError id="employeeNumber-error" message={employeeNumberError} />
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleGenerateEmployeeNumber}
                            disabled={pending || isGeneratingEmployeeNumber}
                        >
                            {isGeneratingEmployeeNumber ? <Spinner className="mr-2" /> : null}
                            Generate
                        </Button>
                        <p className="text-xs text-muted-foreground">Use auto-generate to avoid duplicate IDs.</p>
                    </div>
                    {employeeNumberGenerationError ? (
                        <p className="text-xs text-destructive">{employeeNumberGenerationError}</p>
                    ) : null}
                </div>
                <div className="space-y-1.5">
                    <Label htmlFor="jobTitle">Job title (optional)</Label>
                    <Input
                        id="jobTitle"
                        name="jobTitle"
                        autoComplete="organization-title"
                        defaultValue={state.values.jobTitle ?? ''}
                        aria-invalid={Boolean(jobTitleError)}
                        aria-describedby={jobTitleError ? 'jobTitle-error' : undefined}
                    />
                    <FieldError id="jobTitle-error" message={jobTitleError} />
                </div>
            </div>

            <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5">
                        <div className="text-sm font-medium">Attach checklist template</div>
                        <div id="includeTemplate-help" className="text-xs text-muted-foreground">
                            {canManageTemplates
                                ? 'Optionally select a checklist template for the invite.'
                                : 'You do not have permission to manage templates.'}
                        </div>
                    </div>
                    <input type="hidden" name="includeTemplate" value={String(includeTemplate)} />
                    <Switch
                        checked={includeTemplate}
                        onCheckedChange={setIncludeTemplate}
                        aria-label="Attach checklist template"
                        aria-describedby="includeTemplate-help"
                        disabled={pending}
                    />
                </div>

                {includeTemplate ? (
                    <div className="space-y-1.5">
                        <Label htmlFor="onboardingTemplateId">Template</Label>
                        <Select
                            name="onboardingTemplateId"
                            defaultValue={state.values.onboardingTemplateId ?? undefined}
                            disabled={pending || !canManageTemplates || templateOptions.length === 0}
                        >
                            <SelectTrigger
                                id="onboardingTemplateId"
                                aria-invalid={Boolean(onboardingTemplateError)}
                                aria-describedby={onboardingTemplateError ? 'onboardingTemplateId-error' : undefined}
                            >
                                <SelectValue
                                    placeholder={
                                        templateOptions.length === 0
                                            ? 'No templates available'
                                            : 'Select a template'
                                    }
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {templateOptions.map((template) => (
                                    <SelectItem key={template.id} value={template.id}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FieldError id="onboardingTemplateId-error" message={onboardingTemplateError} />
                    </div>
                ) : null}
            </div>

            <div className="flex items-center gap-3">
                <Button type="submit" disabled={pending}>
                    {pending ? <Spinner className="mr-2" /> : null}
                    {pending ? 'Creating...' : 'Create invite'}
                </Button>
                <div className="text-xs text-muted-foreground">Invitation creation is never cached.</div>
            </div>
        </fieldset>
    );

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invite employee</CardTitle>
                <CardDescription>
                    Creates an onboarding invitation token. Share it with the employee to accept the invite.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <InviteEmployeeFeedback state={state} feedbackReference={feedbackReference} />

                <form ref={formReference} action={action} className="space-y-4">
                    {formBody}
                </form>
            </CardContent>
        </Card>
    );
}
