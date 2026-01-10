import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getHrSettingsForUi } from '@/server/use-cases/hr/settings/get-hr-settings.cached';

import { deriveHrIntegrationsFormDefaults } from '../integrations-schema';
import { HrIntegrationsForm } from './hr-integrations-form';

export async function HrIntegrationsPanel(props: { authorization: RepositoryAuthorizationContext }) {
    const { settings } = await getHrSettingsForUi({
        authorization: props.authorization,
        orgId: props.authorization.orgId,
    });

    const defaults = deriveHrIntegrationsFormDefaults(settings);

    return <HrIntegrationsForm defaults={defaults} />;
}
