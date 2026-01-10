import type { SelfProfileFormState } from '../form-state';

import { buildProfileEditFormIds } from './profile-edit-form-ids';
import { ProfileEditAddressSection } from './profile-edit-address-section';
import { ProfileEditBasicSection } from './profile-edit-basic-section';
import { ProfileEditContactSection } from './profile-edit-contact-section';
import { ProfileEditEmergencySection } from './profile-edit-emergency-section';
import { ProfileEditFormFooter } from './profile-edit-form-footer';
import { ProfileEditSkillsSection } from './profile-edit-skills-section';

interface ProfileEditFormLayoutProps {
    resolvedFormId: string;
    state: SelfProfileFormState;
    pending: boolean;
    formAction: (formData: FormData) => void;
    onCancel?: () => void;
}

export function ProfileEditFormLayout({
    resolvedFormId,
    state,
    pending,
    formAction,
    onCancel,
}: ProfileEditFormLayoutProps) {
    const describedBy = (...ids: (string | null | undefined | false)[]) => {
        const value = ids.filter(Boolean).join(' ');
        return value || undefined;
    };

    const inputToneClass = '';
    const sectionClass = 'space-y-4 rounded-xl border border-[hsl(var(--border)/0.12)] bg-[hsl(var(--background)/0.97)] px-5 py-5 shadow-none';
    const ids = buildProfileEditFormIds(resolvedFormId);

    return (
        <form id={resolvedFormId} action={formAction} className="flex min-h-0 flex-col gap-6">
            <input type="hidden" name="profileId" value={state.values.profileId} />

            <fieldset disabled={pending} className="space-y-5">
                <ProfileEditBasicSection
                    ids={ids}
                    state={state}
                    inputToneClass={inputToneClass}
                    sectionClass={sectionClass}
                    describedBy={describedBy}
                />
                <ProfileEditContactSection
                    ids={ids}
                    state={state}
                    inputToneClass={inputToneClass}
                    sectionClass={sectionClass}
                    describedBy={describedBy}
                />
                <ProfileEditAddressSection
                    ids={ids}
                    state={state}
                    inputToneClass={inputToneClass}
                    sectionClass={sectionClass}
                    describedBy={describedBy}
                />
                <ProfileEditEmergencySection
                    ids={ids}
                    state={state}
                    inputToneClass={inputToneClass}
                    sectionClass={sectionClass}
                    describedBy={describedBy}
                />
                <ProfileEditSkillsSection
                    ids={ids}
                    state={state}
                    inputToneClass={inputToneClass}
                    sectionClass={sectionClass}
                    describedBy={describedBy}
                />
            </fieldset>

            <ProfileEditFormFooter pending={pending} onCancel={onCancel} />
        </form>
    );
}
