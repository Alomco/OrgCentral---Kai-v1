import { Trash2, UserCircle } from 'lucide-react';

import {
    clearSeededData,
    seedCurrentUserProfile,
    seedStarterData,
} from '../../_actions/seed-fake-data';
import { RocketIcon } from './data-seeder-cards';

interface DataSeederPrimaryActionsProps {
    userId: string;
    isPending: boolean;
    runAction: (action: () => Promise<{ success: boolean; message: string }>) => void;
}

export function DataSeederPrimaryActions({ userId, isPending, runAction }: DataSeederPrimaryActionsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-card p-6 shadow-sm" data-ui-surface="card">
                <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <RocketIcon className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold">Starter Pack</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Essential policies, departments, and absence types.</p>
                    <button
                        onClick={() => runAction(seedStarterData)}
                        disabled={isPending}
                        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 disabled:opacity-50"
                    >
                        Seed Starter Data
                    </button>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm" data-ui-surface="card">
                <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-500">
                            <UserCircle className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold">My Data</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Enrich your own profile with history.</p>
                    <button
                        onClick={() => runAction(() => seedCurrentUserProfile(userId))}
                        disabled={isPending}
                        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80 disabled:opacity-50"
                    >
                        Enrich My Profile
                    </button>
                </div>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm border-destructive/20" data-ui-surface="card">
                <div className="flex h-full flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-destructive/10 p-2 text-destructive">
                            <Trash2 className="h-5 w-5" />
                        </div>
                        <h3 className="font-semibold text-destructive">Danger Zone</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">Wipe all seeded data from the database.</p>
                    <button
                        onClick={() => runAction(clearSeededData)}
                        disabled={isPending}
                        className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow transition-colors hover:bg-destructive/90 disabled:opacity-50"
                    >
                        Clear All Data
                    </button>
                </div>
            </div>
        </div>
    );
}
