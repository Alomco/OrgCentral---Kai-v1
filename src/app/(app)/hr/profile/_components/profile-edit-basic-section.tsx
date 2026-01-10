import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldError } from '@/app/(app)/hr/_components/field-error';

import type { SelfProfileFormState } from '../form-state';
import type { ProfileEditFormIds } from './profile-edit-form-ids';

interface ProfileEditSectionProps {
    ids: ProfileEditFormIds;
    state: SelfProfileFormState;
    inputToneClass: string;
    sectionClass: string;
    describedBy: (...ids: (string | null | undefined | false)[]) => string | undefined;
}

export function ProfileEditBasicSection({
    ids,
    state,
    inputToneClass,
    sectionClass,
    describedBy,
}: ProfileEditSectionProps) {
    return (
        <section className={sectionClass} aria-labelledby={`${ids.displayNameId}-section`}>
            <div className="space-y-1" id={`${ids.displayNameId}-section`}>
                <h3 className="text-base font-semibold text-foreground">Basic information</h3>
                <p className="text-sm text-muted-foreground">Keep your name and email up to date for HR records.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.displayNameId} className="text-sm font-medium text-foreground">Display name</Label>
                    <Input
                        id={ids.displayNameId}
                        name="displayName"
                        defaultValue={state.values.displayName}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.displayName)}
                        aria-describedby={describedBy(state.fieldErrors?.displayName && `${ids.displayNameId}-error`)}
                    />
                    <FieldError id={`${ids.displayNameId}-error`} message={state.fieldErrors?.displayName} />
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.personalEmailId} className="text-sm font-medium text-foreground">Personal email</Label>
                    <Input
                        id={ids.personalEmailId}
                        name="personalEmail"
                        type="email"
                        defaultValue={state.values.personalEmail}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.personalEmail)}
                        aria-describedby={describedBy(
                            state.fieldErrors?.personalEmail && `${ids.personalEmailId}-error`,
                            ids.personalEmailHelpId,
                        )}
                    />
                    <FieldError id={`${ids.personalEmailId}-error`} message={state.fieldErrors?.personalEmail} />
                    <p id={ids.personalEmailHelpId} className="text-xs text-muted-foreground">
                        Use a valid email format (example: name@company.com).
                    </p>
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.firstNameId} className="text-sm font-medium text-foreground">First name</Label>
                    <Input
                        id={ids.firstNameId}
                        name="firstName"
                        defaultValue={state.values.firstName}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.firstName)}
                        aria-describedby={describedBy(state.fieldErrors?.firstName && `${ids.firstNameId}-error`)}
                    />
                    <FieldError id={`${ids.firstNameId}-error`} message={state.fieldErrors?.firstName} />
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.lastNameId} className="text-sm font-medium text-foreground">Last name</Label>
                    <Input
                        id={ids.lastNameId}
                        name="lastName"
                        defaultValue={state.values.lastName}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.lastName)}
                        aria-describedby={describedBy(state.fieldErrors?.lastName && `${ids.lastNameId}-error`)}
                    />
                    <FieldError id={`${ids.lastNameId}-error`} message={state.fieldErrors?.lastName} />
                </div>
            </div>
        </section>
    );
}
