import type { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import { AdminBootstrapComplete } from '@/components/auth/AdminBootstrapComplete';

export const metadata: Metadata = {
    title: 'Completing admin bootstrap - OrgCentral',
    description: 'Finalizing admin bootstrap provisioning.',
};

export default function AdminSignupCompletePage() {
    return (
        <AuthLayout
            title="Completing setup"
            subtitle="Provisioning your platform access and organization context."
        >
            <AdminBootstrapComplete />
        </AuthLayout>
    );
}

