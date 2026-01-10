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

export function ProfileEditAddressSection({
    ids,
    state,
    inputToneClass,
    sectionClass,
    describedBy,
}: ProfileEditSectionProps) {
    return (
        <section className={sectionClass} aria-labelledby={`${ids.addressStreetId}-section`}>
            <div className="space-y-1" id={`${ids.addressStreetId}-section`}>
                <h3 className="text-base font-semibold text-foreground">Address</h3>
                <p className="text-sm text-muted-foreground">Provide a mailing address for official correspondence.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2" data-slot="input-group">
                    <Label htmlFor={ids.addressStreetId} className="text-sm font-medium text-foreground">Street address</Label>
                    <Input
                        id={ids.addressStreetId}
                        name="addressStreet"
                        defaultValue={state.values.addressStreet}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.addressStreet)}
                        aria-describedby={describedBy(state.fieldErrors?.addressStreet && `${ids.addressStreetId}-error`)}
                    />
                    <FieldError id={`${ids.addressStreetId}-error`} message={state.fieldErrors?.addressStreet} />
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.addressCityId} className="text-sm font-medium text-foreground">City</Label>
                    <Input
                        id={ids.addressCityId}
                        name="addressCity"
                        defaultValue={state.values.addressCity}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.addressCity)}
                        aria-describedby={describedBy(state.fieldErrors?.addressCity && `${ids.addressCityId}-error`)}
                    />
                    <FieldError id={`${ids.addressCityId}-error`} message={state.fieldErrors?.addressCity} />
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.addressStateId} className="text-sm font-medium text-foreground">State</Label>
                    <Input
                        id={ids.addressStateId}
                        name="addressState"
                        defaultValue={state.values.addressState}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.addressState)}
                        aria-describedby={describedBy(state.fieldErrors?.addressState && `${ids.addressStateId}-error`)}
                    />
                    <FieldError id={`${ids.addressStateId}-error`} message={state.fieldErrors?.addressState} />
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.postalCodeId} className="text-sm font-medium text-foreground">Postal code</Label>
                    <Input
                        id={ids.postalCodeId}
                        name="addressPostalCode"
                        defaultValue={state.values.addressPostalCode}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.addressPostalCode)}
                        aria-describedby={describedBy(state.fieldErrors?.addressPostalCode && `${ids.postalCodeId}-error`)}
                    />
                    <FieldError id={`${ids.postalCodeId}-error`} message={state.fieldErrors?.addressPostalCode} />
                </div>
                <div className="space-y-2" data-slot="input-group">
                    <Label htmlFor={ids.countryId} className="text-sm font-medium text-foreground">Country</Label>
                    <Input
                        id={ids.countryId}
                        name="addressCountry"
                        defaultValue={state.values.addressCountry}
                        className={inputToneClass}
                        aria-invalid={Boolean(state.fieldErrors?.addressCountry)}
                        aria-describedby={describedBy(state.fieldErrors?.addressCountry && `${ids.countryId}-error`)}
                    />
                    <FieldError id={`${ids.countryId}-error`} message={state.fieldErrors?.addressCountry} />
                </div>
            </div>
        </section>
    );
}
