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

export function ProfileEditEmergencySection({
    ids,
    state,
    inputToneClass,
    sectionClass,
    describedBy,
}: ProfileEditSectionProps) {
    return (
        <section className={sectionClass} aria-labelledby={`${ids.emergencyNameId}-section`}>
            <div className="space-y-1" id={`${ids.emergencyNameId}-section`}>
                <h3 className="text-base font-semibold text-foreground">Emergency contact</h3>
                <p className="text-sm text-muted-foreground">Share a contact we can reach quickly in emergencies.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.emergencyNameId} className="text-sm font-medium text-foreground">Name</Label>
                    <Input
                        id={ids.emergencyNameId}
                        name="emergencyContactName"
                        defaultValue={state.values.emergencyContactName}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.emergencyContactName)}
                        aria-describedby={describedBy(state.fieldErrors?.emergencyContactName && `${ids.emergencyNameId}-error`)}
                    />
                    <FieldError id={`${ids.emergencyNameId}-error`} message={state.fieldErrors?.emergencyContactName} />
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.emergencyRelationshipId} className="text-sm font-medium text-foreground">Relationship</Label>
                    <Input
                        id={ids.emergencyRelationshipId}
                        name="emergencyContactRelationship"
                        defaultValue={state.values.emergencyContactRelationship}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.emergencyContactRelationship)}
                        aria-describedby={describedBy(
                            state.fieldErrors?.emergencyContactRelationship && `${ids.emergencyRelationshipId}-error`,
                        )}
                    />
                    <FieldError id={`${ids.emergencyRelationshipId}-error`} message={state.fieldErrors?.emergencyContactRelationship} />
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.emergencyPhoneId} className="text-sm font-medium text-foreground">Phone</Label>
                    <Input
                        id={ids.emergencyPhoneId}
                        name="emergencyContactPhone"
                        defaultValue={state.values.emergencyContactPhone}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.emergencyContactPhone)}
                        aria-describedby={describedBy(
                            state.fieldErrors?.emergencyContactPhone && `${ids.emergencyPhoneId}-error`,
                            ids.emergencyPhoneHelpId,
                        )}
                    />
                    <FieldError id={`${ids.emergencyPhoneId}-error`} message={state.fieldErrors?.emergencyContactPhone} />
                    <p id={ids.emergencyPhoneHelpId} className="text-xs text-muted-foreground">Add a reachable number with country code.</p>
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.emergencyEmailId} className="text-sm font-medium text-foreground">Email</Label>
                    <Input
                        id={ids.emergencyEmailId}
                        name="emergencyContactEmail"
                        type="email"
                        defaultValue={state.values.emergencyContactEmail}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.emergencyContactEmail)}
                        aria-describedby={describedBy(
                            state.fieldErrors?.emergencyContactEmail && `${ids.emergencyEmailId}-error`,
                            ids.emergencyEmailHelpId,
                        )}
                    />
                    <FieldError id={`${ids.emergencyEmailId}-error`} message={state.fieldErrors?.emergencyContactEmail} />
                    <p id={ids.emergencyEmailHelpId} className="text-xs text-muted-foreground">Use an email they check regularly (example: name@example.com).</p>
                </div>
            </div>
        </section>
    );
}
