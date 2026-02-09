import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import { AdminBootstrapForm } from '@/components/auth/AdminBootstrapForm';
import { isBootstrapEnabled } from '@/server/use-cases/auth/admin-bootstrap.helpers';

export const metadata: Metadata = {
    title: 'Admin bootstrap - OrgCentral',
    description: 'Temporary global admin bootstrap via OAuth.',
};

export default function AdminSignupPage() {
    if (!isBootstrapEnabled()) {
        notFound();
    }

    return (
        <AuthLayout
            title="Admin bootstrap"
            subtitle="Temporary OAuth signup for initial platform setup."
        >
            <AdminBootstrapForm />
        </AuthLayout>
    );
}
