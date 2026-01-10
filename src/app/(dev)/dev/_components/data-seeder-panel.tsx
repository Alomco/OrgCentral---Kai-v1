'use client';

import { useState, useTransition, useEffect } from 'react';
import Link from 'next/link';
import { Database, ArrowRight, ShieldCheck, Key, Users, Calendar, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';
// Updated imports based on new file structure
import {
    getSeededDataStats,
    getAbacPolicyStatus,
} from '../_actions/seed-fake-data';
import {
    getPermissionResourceStatus,
} from '../_actions/seed-permission-resources';

interface SeedStats {
    employees: number;
    absences: number;
    timeEntries: number;
    leavePolicies: number;
}

interface AbacStatus { hasAbacPolicies: boolean; policyCount: number }
interface PermissionStatus { hasPermissionResources: boolean; resourceCount: number }

const EMPTY_STATS: SeedStats = { employees: 0, absences: 0, timeEntries: 0, leavePolicies: 0 };

function normalizeSeedStats(raw: unknown): SeedStats {
    if (!raw || typeof raw !== 'object') { return EMPTY_STATS; }
    const candidate = raw as Partial<SeedStats> & Record<string, unknown>;
    return {
        employees: typeof candidate.employees === 'number' ? candidate.employees : 0,
        absences: typeof candidate.absences === 'number' ? candidate.absences : 0,
        timeEntries: typeof candidate.timeEntries === 'number' ? candidate.timeEntries : 0,
        leavePolicies: typeof candidate.leavePolicies === 'number' ? candidate.leavePolicies : 0,
    };
}

function normalizeAbacStatus(raw: unknown): AbacStatus {
    if (!raw || typeof raw !== 'object') { return { hasAbacPolicies: false, policyCount: 0 }; }
    const candidate = raw as Partial<AbacStatus> & Record<string, unknown>;
    return {
        hasAbacPolicies: candidate.hasAbacPolicies === true,
        policyCount: typeof candidate.policyCount === 'number' ? candidate.policyCount : 0,
    };
}

function normalizePermissionStatus(raw: unknown): PermissionStatus {
    if (!raw || typeof raw !== 'object') { return { hasPermissionResources: false, resourceCount: 0 }; }
    const candidate = raw as Partial<PermissionStatus> & Record<string, unknown>;
    return {
        hasPermissionResources: candidate.hasPermissionResources === true,
        resourceCount: typeof candidate.resourceCount === 'number' ? candidate.resourceCount : 0,
    };
}

export function DataSeederPanel() {
    // Basic stats for summary
    const [stats, setStats] = useState<SeedStats>(EMPTY_STATS);
    const [abacStatus, setAbacStatus] = useState<AbacStatus>({ hasAbacPolicies: false, policyCount: 0 });
    const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>({ hasPermissionResources: false, resourceCount: 0 });
    const [, startTransition] = useTransition();

    useEffect(() => {
        startTransition(async () => {
            try {
                const [dataStats, abac, permissions] = await Promise.all([
                    getSeededDataStats(),
                    getAbacPolicyStatus(),
                    getPermissionResourceStatus(),
                ]);
                setStats(normalizeSeedStats(dataStats));
                setAbacStatus(normalizeAbacStatus(abac));
                setPermissionStatus(normalizePermissionStatus(permissions));
            } catch {
                setStats(EMPTY_STATS);
                setAbacStatus({ hasAbacPolicies: false, policyCount: 0 });
                setPermissionStatus({ hasPermissionResources: false, resourceCount: 0 });
            }
        });
    }, []);

    return (
        <article className="rounded-xl p-5" data-ui-surface="container">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-primary to-accent text-white shadow-lg shadow-primary/25">
                        <Database className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold tracking-tight">Data Seeder</h2>
                        <p className="text-sm text-muted-foreground/80">
                            Manage mock data for development.
                        </p>
                    </div>
                </div>
                <Link
                    href="/dev/data"
                    className="group flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    Open Seeder
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
            </div>

            {/* Compact Stats Row */}
            <div className="mt-5 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs">
                    <Users className="h-3.5 w-3.5 text-primary/60" />
                    <span className="font-medium">{stats.employees}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-primary/60" />
                    <span className="font-medium">{stats.absences}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1 text-xs">
                    <CalendarRange className="h-3.5 w-3.5 text-primary/60" />
                    <span className="font-medium">{stats.leavePolicies}</span>
                </div>
                <div className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs',
                    abacStatus.hasAbacPolicies ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted/50 text-muted-foreground'
                )}>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span className="font-medium">{abacStatus.policyCount}</span>
                </div>
                <div className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs',
                    permissionStatus.hasPermissionResources ? 'bg-indigo-500/10 text-indigo-600' : 'bg-muted/50 text-muted-foreground'
                )}>
                    <Key className="h-3.5 w-3.5" />
                    <span className="font-medium">{permissionStatus.resourceCount}</span>
                </div>
            </div>

            <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground">
                <p>Use the <strong>Data Seeder</strong> page for comprehensive controls including Absence, Time Tracking, and Performance Reviews.</p>
            </div>
        </article>
    );
}
