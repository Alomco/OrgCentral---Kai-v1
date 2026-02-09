import type { Metadata } from 'next';
import { headers as nextHeaders } from 'next/headers';
import { redirect } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TwoFactorSetupForm } from '@/components/auth/TwoFactorSetupForm';
import { auth } from '@/server/lib/auth';

export const metadata: Metadata = {
    title: 'Set up MFA • OrgCentral',
    description: 'Enable multi-factor authentication for your OrgCentral account.',
};

interface TwoFactorSetupPageProps {
    searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TwoFactorSetupPage({ searchParams }: TwoFactorSetupPageProps) {
    const headerStore = await nextHeaders();
    const session = await auth.api.getSession({ headers: headerStore });

    if (!session) {
        redirect('/login?next=/two-factor/setup');
    }

    const isMfaEnabled = Boolean(session.user.twoFactorEnabled);
    const params = searchParams ? await searchParams : {};
    const returnPath = resolveSafeNextPath(params.next);

    return (
        <div className="mx-auto max-w-2xl space-y-6 p-6">
            <Card className="glass-card">
                <CardHeader>
                    <CardTitle>Set up multi-factor authentication</CardTitle>
                    <CardDescription>
                        Add an authenticator app and confirm a 6-digit code to protect your account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <TwoFactorSetupForm isMfaEnabled={isMfaEnabled} returnPath={returnPath} />
                </CardContent>
            </Card>
        </div>
    );
}

function resolveSafeNextPath(candidate: string | string[] | undefined): string | null {
    const value = Array.isArray(candidate) ? candidate[0] : candidate;
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.includes('://')) {
        return null;
    }
    return trimmed;
}
