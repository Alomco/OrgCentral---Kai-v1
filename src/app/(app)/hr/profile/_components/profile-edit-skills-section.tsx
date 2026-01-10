import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

export function ProfileEditSkillsSection({
    ids,
    state,
    inputToneClass,
    sectionClass,
    describedBy,
}: ProfileEditSectionProps) {
    return (
        <section className={sectionClass} aria-labelledby={`${ids.skillsId}-section`}>
            <div className="space-y-1" id={`${ids.skillsId}-section`}>
                <h3 className="text-base font-semibold text-foreground">Skills and certifications</h3>
                <p className="text-sm text-muted-foreground">List your current skills and credentials for development planning.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor={ids.skillsId} className="text-sm font-medium text-foreground">Skills</Label>
                    <Textarea
                        id={ids.skillsId}
                        name="skills"
                        rows={4}
                        defaultValue={state.values.skills}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.skills)}
                        aria-describedby={describedBy(
                            state.fieldErrors?.skills && `${ids.skillsId}-error`,
                            ids.skillsHelpId,
                        )}
                    />
                    <FieldError id={`${ids.skillsId}-error`} message={state.fieldErrors?.skills} />
                    <p id={ids.skillsHelpId} className="text-xs text-muted-foreground">
                        Separate skills with commas or new lines.
                    </p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor={ids.certificationsId} className="text-sm font-medium text-foreground">Certifications</Label>
                    <Textarea
                        id={ids.certificationsId}
                        name="certifications"
                        rows={4}
                        defaultValue={state.values.certifications}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.certifications)}
                        aria-describedby={describedBy(
                            state.fieldErrors?.certifications && `${ids.certificationsId}-error`,
                            ids.certificationsHelpId,
                        )}
                    />
                    <FieldError id={`${ids.certificationsId}-error`} message={state.fieldErrors?.certifications} />
                    <p id={ids.certificationsHelpId} className="text-xs text-muted-foreground">
                        One per line: Name | Issuer | Date obtained | Expiry (optional).
                    </p>
                </div>
            </div>
        </section>
    );
}
