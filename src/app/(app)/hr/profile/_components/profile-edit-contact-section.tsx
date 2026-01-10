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

export function ProfileEditContactSection({
    ids,
    state,
    inputToneClass,
    sectionClass,
    describedBy,
}: ProfileEditSectionProps) {
    return (
        <section className={sectionClass} aria-labelledby={`${ids.mobileId}-section`}>
            <div className="space-y-1" id={`${ids.mobileId}-section`}>
                <h3 className="text-base font-semibold text-foreground">Contact numbers</h3>
                <p className="text-sm text-muted-foreground">Add numbers with country code for reliable contact.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-3">
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.mobileId} className="text-sm font-medium text-foreground">Mobile</Label>
                    <Input
                        id={ids.mobileId}
                        name="phoneMobile"
                        defaultValue={state.values.phoneMobile}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.phoneMobile)}
                        aria-describedby={describedBy(state.fieldErrors?.phoneMobile && `${ids.mobileId}-error`, ids.mobileHelpId)}
                    />
                    <FieldError id={`${ids.mobileId}-error`} message={state.fieldErrors?.phoneMobile} />
                    <p id={ids.mobileHelpId} className="text-xs text-muted-foreground">Include country code (example: +44 20 7946 1234).</p>
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.workPhoneId} className="text-sm font-medium text-foreground">Work</Label>
                    <Input
                        id={ids.workPhoneId}
                        name="phoneWork"
                        defaultValue={state.values.phoneWork}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.phoneWork)}
                        aria-describedby={describedBy(state.fieldErrors?.phoneWork && `${ids.workPhoneId}-error`, ids.workPhoneHelpId)}
                    />
                    <FieldError id={`${ids.workPhoneId}-error`} message={state.fieldErrors?.phoneWork} />
                    <p id={ids.workPhoneHelpId} className="text-xs text-muted-foreground">Use digits, spaces, or dashes only (example: +1 415-555-0100).</p>
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.homePhoneId} className="text-sm font-medium text-foreground">Home</Label>
                    <Input
                        id={ids.homePhoneId}
                        name="phoneHome"
                        defaultValue={state.values.phoneHome}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.phoneHome)}
                        aria-describedby={describedBy(state.fieldErrors?.phoneHome && `${ids.homePhoneId}-error`, ids.homePhoneHelpId)}
                    />
                    <FieldError id={`${ids.homePhoneId}-error`} message={state.fieldErrors?.phoneHome} />
                    <p id={ids.homePhoneHelpId} className="text-xs text-muted-foreground">Format with country/area code for consistency.</p>
                </div>
            </div>
        </section>
    );
}
