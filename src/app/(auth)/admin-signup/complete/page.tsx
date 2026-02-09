import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { AdminBootstrapComplete } from '@/components/auth/AdminBootstrapComplete';
import { isBootstrapEnabled } from '@/server/use-cases/auth/admin-bootstrap.helpers';

export const metadata: Metadata = {
    title: 'Completing admin bootstrap - OrgCentral',
    description: 'Finalizing admin bootstrap provisioning.',
};

export default function AdminSignupCompletePage() {
    if (!isBootstrapEnabled()) {
        notFound();
    }

    return (
        <AuthLayout
            title="Completing setup"
            subtitle="Provisioning your platform access and organization context."
        >
            <AdminBootstrapComplete />
        </AuthLayout>
    );
}
