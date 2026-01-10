import { Suspense } from 'react';
import { type Metadata } from 'next';
import { auth } from '@/server/lib/auth';
import { headers } from 'next/headers';
import { DataSeederView } from './_components/data-seeder-view';

export const metadata: Metadata = {
    title: 'Data Seeder | Dev Tools',
    description: 'Manage mock data and seed your environment.',
};

export default async function DataSeederPage() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return (
            <Suspense fallback={<div className="p-8">Loading seeder...</div>}>
                <DataSeederView userId="" />
            </Suspense>
        );
    }

    const userId = session.user.id;

    return (
        <Suspense fallback={<div className="p-8">Loading seeder...</div>}>
            <DataSeederView userId={userId} />
        </Suspense>
    );
}
