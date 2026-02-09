import type { OnboardingWizardValues } from './wizard.schema';
import type { InviteRoleOption } from './wizard.types';

export function deriveInitialWizardConfig(params: {
    initialValues?: Partial<OnboardingWizardValues>;
    roleOptions: InviteRoleOption[];
    defaultRole?: string;
    canManageOnboarding: boolean;
}): { initialRole: string; initialUseOnboarding: boolean } {
    const initialRole =
        (params.initialValues?.role && params.initialValues.role.length > 0
            ? params.initialValues.role
            : undefined) ??
        (params.defaultRole && params.defaultRole.length > 0 ? params.defaultRole : undefined) ??
        params.roleOptions.find((role) => role.name.length > 0)?.name ??
        'member';
    const desiredOnboarding = params.initialValues?.useOnboarding ?? initialRole === 'member';

    return {
        initialRole,
        initialUseOnboarding: params.canManageOnboarding && desiredOnboarding,
    };
}
