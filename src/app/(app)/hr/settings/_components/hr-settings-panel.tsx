import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getHrSettingsForUi } from '@/server/use-cases/hr/settings/get-hr-settings.cached';

import { deriveHrSettingsFormDefaults } from '../schema';
import { HrSettingsForm } from './hr-settings-form';
import { updateHrSettingsAction } from '../actions';

export async function HrSettingsPanel(props: { authorization: RepositoryAuthorizationContext }) {
    const { settings } = await getHrSettingsForUi({
        authorization: props.authorization,
        orgId: props.authorization.orgId,
    });

    const defaults = deriveHrSettingsFormDefaults(settings);

    return <HrSettingsForm action={updateHrSettingsAction} defaults={defaults} />;
}
