'use client';

import { useCallback, useEffect, useState, useTransition, type ReactElement } from 'react';
import {
    Bell,
    Briefcase,
    Calendar,
    CalendarRange,
    Clock,
    CreditCard,
    Database,
    GraduationCap,
    Key,
    ShieldCheck,
    TrendingUp,
    Users,
} from 'lucide-react';

import {
    getAbacPolicyStatus,
    getSeededDataStats,
    seedAbacPolicies,
    seedBillingData,
    seedComplianceData,
    seedFakeAbsences,
    seedFakeEmployees,
    seedFakeNotifications,
    seedFakePerformance,
    seedFakeTimeEntries,
    seedFakeTraining,
    seedIntegrations,
    seedOrgAssets,
    seedSecurityEvents,
    seedCommonLeavePolicies,
} from '../../_actions/seed-fake-data';
import { SeederCard } from './data-seeder-cards';
import { DataSeederPrimaryActions } from './data-seeder-primary-actions';

interface SeedStats {
    employees: number;
    absences: number;
    timeEntries: number;
    training: number;
    reviews: number;
    security: number;
    notifications: number;
    invoices: number;
    policies: number;
    checklistInstances: number;
    leavePolicies: number;
}

interface AbacStatus {
    hasAbacPolicies: boolean;
    policyCount: number;
}

function normalizeAbacStatus(raw: Record<string, unknown> | null | undefined): AbacStatus {
    if (!raw) { return { hasAbacPolicies: false, policyCount: 0 }; }
    const candidate = raw as Partial<AbacStatus> & Record<string, unknown>;
    return {
        hasAbacPolicies: candidate.hasAbacPolicies === true,
        policyCount: typeof candidate.policyCount === 'number' ? candidate.policyCount : 0,
    };
}

const initialStats: SeedStats = {
    employees: 0,
    absences: 0,
    timeEntries: 0,
    training: 0,
    reviews: 0,
    security: 0,
    notifications: 0,
    invoices: 0,
    policies: 0,
    checklistInstances: 0,
    leavePolicies: 0,
};

function normalizeStats(input: Partial<SeedStats> | null | undefined): SeedStats {
    return {
        employees: input?.employees ?? 0,
        absences: input?.absences ?? 0,
        timeEntries: input?.timeEntries ?? 0,
        training: input?.training ?? 0,
        reviews: input?.reviews ?? 0,
        security: input?.security ?? 0,
        notifications: input?.notifications ?? 0,
        invoices: input?.invoices ?? 0,
        policies: input?.policies ?? 0,
        checklistInstances: input?.checklistInstances ?? 0,
        leavePolicies: input?.leavePolicies ?? 0,
    };
}

export function DataSeederView({ userId }: { userId: string }): ReactElement {
    const [stats, setStats] = useState<SeedStats>(initialStats);
    const [abacStatus, setAbacStatus] = useState<AbacStatus>({ hasAbacPolicies: false, policyCount: 0 });
    const [message, setMessage] = useState('');
    const [isPending, startTransition] = useTransition();

    const loadStats = useCallback(() => {
        startTransition(async () => {
            const [dataStats, abac] = await Promise.all([getSeededDataStats(), getAbacPolicyStatus()]);
            setStats(normalizeStats(dataStats));
            setAbacStatus(normalizeAbacStatus(abac));
        });
    }, []);

    useEffect(() => {
        loadStats();
    }, [loadStats]);

    const runAction = useCallback(
        (action: () => Promise<{ success: boolean; message: string }>) => {
            startTransition(async () => {
                const result = await action();
                setMessage(result.message);
                if (result.success) {
                    loadStats();
                }
            });
        },
        [loadStats],
    );

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Data Seeder</h1>
                    <p className="text-muted-foreground">Seed demo data across HR, time, and billing modules.</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">Org assets: {stats.policies}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1">ABAC: {abacStatus.policyCount}</span>
                </div>
            </div>

            <DataSeederPrimaryActions userId={userId} isPending={isPending} runAction={runAction} />

            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Module Seeders</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">Employees: {stats.employees}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">Absences: {stats.absences}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1">Leave policies: {stats.leavePolicies}</span>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <SeederCard icon={Users} title="Employees" count={stats.employees} onSeed={() => runAction(() => seedFakeEmployees(5))} isPending={isPending} />
                <SeederCard icon={Calendar} title="Absences" count={stats.absences} onSeed={() => runAction(() => seedFakeAbsences(10))} isPending={isPending} />
                <SeederCard icon={CalendarRange} title="Leave Policies" count={stats.leavePolicies} onSeed={() => runAction(seedCommonLeavePolicies)} isPending={isPending} />
                <SeederCard icon={Clock} title="Time Entries" count={stats.timeEntries} onSeed={() => runAction(() => seedFakeTimeEntries(20))} isPending={isPending} />
                <SeederCard icon={GraduationCap} title="Training" count={stats.training} onSeed={() => runAction(() => seedFakeTraining(10))} isPending={isPending} />
                <SeederCard icon={TrendingUp} title="Performance" count={stats.reviews} onSeed={() => runAction(() => seedFakePerformance(5))} isPending={isPending} />
                <SeederCard icon={Bell} title="Notifications" count={stats.notifications} onSeed={() => runAction(() => seedFakeNotifications(10))} isPending={isPending} />
                <SeederCard icon={CreditCard} title="Billing" count={stats.invoices} onSeed={() => runAction(seedBillingData)} isPending={isPending} />
                <SeederCard icon={Briefcase} title="Org Assets" count={stats.policies} label="Active Policies" onSeed={() => runAction(seedOrgAssets)} isPending={isPending} />
                <SeederCard icon={ShieldCheck} title="Compliance" count={stats.checklistInstances} label="Checklists" onSeed={() => runAction(seedComplianceData)} isPending={isPending} />
                <SeederCard icon={Database} title="Integrations" count={0} label="Configured" onSeed={() => runAction(seedIntegrations)} isPending={isPending} />
                <SeederCard icon={ShieldCheck} title="Security Events" count={stats.security} onSeed={() => runAction(() => seedSecurityEvents(20))} isPending={isPending} />
                <div className="flex flex-col justify-between rounded-xl border bg-card p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Key className="h-4 w-4 text-emerald-500" />
                            <span className="font-medium">ABAC Policies</span>
                        </div>
                        <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">{abacStatus.policyCount}</span>
                    </div>
                    <button
                        onClick={() => runAction(seedAbacPolicies)}
                        disabled={isPending}
                        className="mt-2 rounded bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-600 transition-colors hover:bg-emerald-500/20"
                    >
                        Seed Policies
                    </button>
                </div>
            </div>

            {message ? (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="flex items-center gap-3 rounded-lg bg-foreground px-4 py-3 text-background shadow-lg">
                        <div className="h-2 w-2 rounded-full bg-green-400" />
                        <p className="text-sm font-medium">{message}</p>
                        <button onClick={() => setMessage('')} className="ml-2 opacity-70 transition hover:opacity-100">
                            ×
                        </button>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

