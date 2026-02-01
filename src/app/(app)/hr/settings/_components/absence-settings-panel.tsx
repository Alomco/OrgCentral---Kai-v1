import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getAbsenceSettingsForUi } from '@/server/use-cases/hr/absences/get-absence-settings.cached';

import { deriveAbsenceSettingsDefaults } from '../absence-settings-schema';
import { AbsenceSettingsForm } from './absence-settings-form';

export async function AbsenceSettingsPanel(props: { authorization: RepositoryAuthorizationContext }) {
    const result = await getAbsenceSettingsForUi({ authorization: props.authorization });
    const defaults = deriveAbsenceSettingsDefaults(result.settings);

    return <AbsenceSettingsForm defaults={defaults} />;
}
