'use client';
import { useCallback, useState, useTransition } from 'react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { FieldError } from '../../_components/field-error';
import type { OnboardingWizardValues } from './wizard.schema';
import type { FieldErrors } from '../../_components/form-errors';
import type { EmailCheckResult, InviteRoleOption } from './wizard.types';
import { useEmailCheck } from './use-email-check';
import { generateNextEmployeeId } from '../actions/generate-employee-id';

export interface IdentityStepProps {
    values: OnboardingWizardValues;
    fieldErrors?: FieldErrors<OnboardingWizardValues>;
    onValuesChange: (updates: Partial<OnboardingWizardValues>) => void;
    onEmailCheck?: (email: string) => Promise<EmailCheckResult>;
    disabled?: boolean;
    roleOptions: InviteRoleOption[];
}

export function IdentityStep({
    values,
    fieldErrors,
    onValuesChange,
    onEmailCheck,
    disabled = false,
    roleOptions,
}: IdentityStepProps) {
    const { status: emailCheckStatus, message: emailCheckMessage, action: emailCheckAction } =
        useEmailCheck(values.email, onEmailCheck);
    const [isGenerating, startTransition] = useTransition();
    const [generateError, setGenerateError] = useState<string | null>(null);

    const roleError = fieldErrors?.role;
    const emailError = fieldErrors?.email;
    const displayNameError = fieldErrors?.displayName;
    const firstNameError = fieldErrors?.firstName;
    const lastNameError = fieldErrors?.lastName;
    const employeeNumberError = fieldErrors?.employeeNumber;
    const selectedRole = roleOptions.find((option) => option.name === values.role);

    const handleGenerateEmployeeId = useCallback(() => {
        startTransition(() => {
            setGenerateError(null);
            void generateNextEmployeeId()
                .then((result) => {
                    onValuesChange({ employeeNumber: result.employeeNumber });
                })
                .catch((error: unknown) => {
                    const message = error instanceof Error
                        ? error.message
                        : 'Unable to generate an employee number.';
                    setGenerateError(message);
                });
        });
    }, [onValuesChange, startTransition]);

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h3 className="text-lg font-semibold">Invitee Details</h3>
                <p className="text-sm text-muted-foreground">
                    Select the access level and share the invitee&apos;s contact details to send the invitation.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="wizard-role">Role *</Label>
                    <Select
                        value={values.role}
                        onValueChange={(value) => onValuesChange({ role: value })}
                        disabled={disabled || roleOptions.length <= 1}
                    >
                        <SelectTrigger
                            id="wizard-role"
                            aria-invalid={Boolean(roleError)}
                            aria-describedby={roleError ? 'wizard-role-error' : undefined}
                        >
                            <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                            {roleOptions.map((role) => (
                                <SelectItem key={role.name} value={role.name}>
                                    {role.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <FieldError id="wizard-role-error" message={roleError} />
                    {selectedRole?.description ? (
                        <p className="text-xs text-muted-foreground">{selectedRole.description}</p>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wizard-email">Email address *</Label>
                    <div className="relative">
                        <Input
                            id="wizard-email"
                            type="email"
                            autoComplete="email"
                            value={values.email}
                            onChange={(event) => onValuesChange({ email: event.target.value })}
                            aria-invalid={Boolean(emailError) || emailCheckStatus === 'invalid'}
                            aria-describedby={emailError ? 'wizard-email-error' : undefined}
                            disabled={disabled}
                            className="pr-10"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                            {emailCheckStatus === 'checking' && (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            {emailCheckStatus === 'valid' && (
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}
                            {emailCheckStatus === 'invalid' && (
                                <AlertCircle className="h-4 w-4 text-destructive" />
                            )}
                        </div>
                    </div>
                    <FieldError id="wizard-email-error" message={emailError} />
                    {emailCheckStatus === 'invalid' && emailCheckMessage ? (
                        <Alert variant="destructive" className="py-2">
                            <AlertDescription className="text-sm">
                                {emailCheckMessage}
                                {emailCheckAction ? (
                                    <span className="mt-2 block">
                                        <Link
                                            href={emailCheckAction.url}
                                            className="text-sm font-medium text-white underline underline-offset-4"
                                        >
                                            {emailCheckAction.label}
                                        </Link>
                                    </span>
                                ) : null}
                            </AlertDescription>
                        </Alert>
                    ) : null}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="wizard-displayName">Display name *</Label>
                    <Input
                        id="wizard-displayName"
                        type="text"
                        autoComplete="name"
                        value={values.displayName}
                        onChange={(event) => onValuesChange({ displayName: event.target.value })}
                        aria-invalid={Boolean(displayNameError)}
                        aria-describedby={displayNameError ? 'wizard-displayName-error' : undefined}
                        disabled={disabled}
                        placeholder="John Smith"
                    />
                    <FieldError id="wizard-displayName-error" message={displayNameError} />
                </div>

                {values.useOnboarding ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="wizard-firstName">First name *</Label>
                            <Input
                                id="wizard-firstName"
                                type="text"
                                autoComplete="given-name"
                                value={values.firstName}
                                onChange={(event) => onValuesChange({ firstName: event.target.value })}
                                aria-invalid={Boolean(firstNameError)}
                                aria-describedby={firstNameError ? 'wizard-firstName-error' : undefined}
                                disabled={disabled}
                                placeholder="John"
                            />
                            <FieldError id="wizard-firstName-error" message={firstNameError} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="wizard-lastName">Last name *</Label>
                            <Input
                                id="wizard-lastName"
                                type="text"
                                autoComplete="family-name"
                                value={values.lastName}
                                onChange={(event) => onValuesChange({ lastName: event.target.value })}
                                aria-invalid={Boolean(lastNameError)}
                                aria-describedby={lastNameError ? 'wizard-lastName-error' : undefined}
                                disabled={disabled}
                                placeholder="Smith"
                            />
                            <FieldError id="wizard-lastName-error" message={lastNameError} />
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="wizard-employeeNumber">Employee number *</Label>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                                <Input
                                    id="wizard-employeeNumber"
                                    type="text"
                                    autoComplete="off"
                                    value={values.employeeNumber}
                                    onChange={(event) => onValuesChange({ employeeNumber: event.target.value })}
                                    aria-invalid={Boolean(employeeNumberError)}
                                    aria-describedby={employeeNumberError ? 'wizard-employeeNumber-error' : undefined}
                                    disabled={disabled}
                                    placeholder="EMP-001"
                                    className="sm:max-w-xs"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGenerateEmployeeId}
                                    disabled={disabled || isGenerating}
                                    className="w-full sm:w-auto"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : null}
                                    Generate
                                </Button>
                            </div>
                            <FieldError id="wizard-employeeNumber-error" message={employeeNumberError} />
                            {generateError ? (
                                <p className="text-xs text-destructive">{generateError}</p>
                            ) : null}
                            <p className="text-xs text-muted-foreground">
                                A unique identifier for this employee within your organization.
                            </p>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
