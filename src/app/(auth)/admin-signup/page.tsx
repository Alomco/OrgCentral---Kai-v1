import type { Metadata } from 'next';
import AuthLayout from '@/components/auth/AuthLayout';
import { AdminBootstrapForm } from '@/components/auth/AdminBootstrapForm';

export const metadata: Metadata = {
    title: 'Admin bootstrap - OrgCentral',
    description: 'Temporary global admin bootstrap via OAuth.',
};

export default function AdminSignupPage() {
    return (
        <AuthLayout
            title="Admin bootstrap"
            subtitle="Temporary OAuth signup for initial platform setup."
        >
            <AdminBootstrapForm />
        </AuthLayout>
    );
}

