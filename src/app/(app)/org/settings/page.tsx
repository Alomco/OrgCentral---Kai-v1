import { Suspense } from 'react';
import { headers } from 'next/headers';

import { InvitePolicyForm } from './_components/invite-policy-form';
import { SecuritySettingsForm } from './_components/security-settings-form';
import { NotificationSettingsForm } from './_components/notification-settings-form';
import { BillingSettingsForm } from './_components/billing-settings-form';
import { BillingOverviewPanel } from './_components/billing-overview-panel';
import { BillingPaymentMethodsPanel } from './_components/billing-payment-methods-panel';
import { BillingHistoryPanel } from './_components/billing-history-panel';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { getOrgSettingsForUi } from './settings-store';
import {
    updateInvitePolicy,
    updateSecuritySettings,
    updateNotificationSettings,
} from './settings-actions';
import { updateBillingSettings } from './billing-settings-actions';

export default async function OrgSettingsPage() {
    const headerStore = await headers();

    const { authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { 'org.settings': ['read'] },
            auditSource: 'ui:org-settings:read',
        },
    );

    return (
        <div className="relative mx-auto w-full max-w-[1200px] space-y-6 overflow-hidden px-4 pb-10 pt-6 sm:px-6">
            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 -z-10 opacity-70"
                style={{
                    backgroundImage:
                        'radial-gradient(620px 420px at 12% 10%, oklch(var(--primary)/0.18), transparent 70%), radial-gradient(520px 380px at 88% 5%, oklch(var(--accent)/0.16), transparent 70%), radial-gradient(680px 520px at 50% 100%, oklch(var(--muted)/0.35), transparent 72%)',
                }}
            />
            <header className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Settings</p>
                        <h1 className="text-2xl font-semibold text-foreground">Organization settings</h1>
                        <p className="text-sm text-muted-foreground">
                            Manage security, notifications, and billing preferences for this organization.
                        </p>
                    </div>
                    <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80">
                            <span className="inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
                            <span>Org ID: {authorization.orgId}</span>
                        </div>
                        <p>Only admins with org settings access can edit these controls.</p>
                    </div>
                </div>
            </header>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-6">
                    <section className="space-y-3">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Access & invites</h2>
                            <p className="text-sm text-muted-foreground">
                                Control how people can join your organization.
                            </p>
                        </div>
                        <Suspense fallback={<SettingsSkeleton />}>
                            <InvitePolicyPanel authorization={authorization} />
                        </Suspense>
                    </section>
                    <section className="space-y-3">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Security</h2>
                            <p className="text-sm text-muted-foreground">
                                Set defaults for MFA and session controls.
                            </p>
                        </div>
                        <Suspense fallback={<SettingsSkeleton />}>
                            <SecuritySettingsPanel authorization={authorization} />
                        </Suspense>
                    </section>
                    <section className="space-y-3">
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
                            <p className="text-sm text-muted-foreground">
                                Configure admin digests and critical alerts.
                            </p>
                        </div>
                        <Suspense fallback={<SettingsSkeleton />}>
                            <NotificationSettingsPanel authorization={authorization} />
                        </Suspense>
                    </section>
                </div>
                <section className="space-y-4">
                    <div>
                        <h2 className="text-lg font-semibold text-foreground">Billing</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage billing contacts and renewal preferences.
                        </p>
                    </div>
                    <Suspense fallback={<SettingsSkeleton />}>
                        <BillingOverviewPanel authorization={authorization} />
                    </Suspense>
                    <Suspense fallback={<SettingsSkeleton />}>
                        <BillingPaymentMethodsPanel authorization={authorization} />
                    </Suspense>
                    <Suspense fallback={<SettingsSkeleton />}>
                        <BillingHistoryPanel authorization={authorization} />
                    </Suspense>
                    <Suspense fallback={<SettingsSkeleton />}>
                        <BillingSettingsPanel authorization={authorization} />
                    </Suspense>
                </section>
            </div>
        </div>
    );
}

async function InvitePolicyPanel({
    authorization,
}: {
    authorization: RepositoryAuthorizationContext;
}) {
    const settings = await getOrgSettingsForUi(authorization);
    return <InvitePolicyForm action={updateInvitePolicy} defaultOpen={settings.invites.open} />;
}

async function SecuritySettingsPanel({
    authorization,
}: {
    authorization: RepositoryAuthorizationContext;
}) {
    const settings = await getOrgSettingsForUi(authorization);
    return <SecuritySettingsForm action={updateSecuritySettings} defaultSettings={settings.security} />;
}

async function NotificationSettingsPanel({
    authorization,
}: {
    authorization: RepositoryAuthorizationContext;
}) {
    const settings = await getOrgSettingsForUi(authorization);
    return <NotificationSettingsForm action={updateNotificationSettings} defaultSettings={settings.notifications} />;
}

async function BillingSettingsPanel({
    authorization,
}: {
    authorization: RepositoryAuthorizationContext;
}) {
    const settings = await getOrgSettingsForUi(authorization);
    return <BillingSettingsForm action={updateBillingSettings} defaultSettings={settings.billing} />;
}

function SettingsSkeleton() {
    return <div className="h-28 w-full animate-pulse rounded-2xl border border-border bg-muted/40" />;
}
