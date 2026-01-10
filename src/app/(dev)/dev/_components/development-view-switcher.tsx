/**
 * ⚡ Dev View Switcher (React 19 <Activity>)
 * 
 * Allows instant toggling between "Overview" and "Live Console" modes
 * without unmounting the console, preserving scroll/data state.
 * 
 * @module app/(dev)/dev/_components/dev-view-switcher
 */

'use client';

import { Activity, useMemo, useState, type ReactNode } from 'react';
import { Terminal, LayoutDashboard } from 'lucide-react';
import { useRegisterDevelopmentAction } from '@/components/dev/toolbar';

interface DevelopmentViewSwitcherProps {
    children: ReactNode;
}

export function DevelopmentViewSwitcher({ children }: DevelopmentViewSwitcherProps) {
    const [mode, setMode] = useState<'overview' | 'console'>('overview');

    const action = useMemo(() => {
        const isConsole = mode === 'console';
        return {
            id: 'dev-view-switch',
            label: isConsole ? 'Overview' : 'Console',
            icon: isConsole ? <LayoutDashboard className="h-4 w-4" /> : <Terminal className="h-4 w-4" />,
            onClick: () => setMode(previous => previous === 'overview' ? 'console' : 'overview'),
            isActive: isConsole,
            order: 0
        };
    }, [mode]);

    useRegisterDevelopmentAction(action);

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Views */}
            <div className="flex-1 relative">
                {/* View 1: Main Content */}
                <Activity mode={mode === 'overview' ? 'visible' : 'hidden'}>
                    <div className="h-full w-full animate-in fade-in duration-300">
                        {children}
                    </div>
                </Activity>

                {/* View 2: Live Console - terminal aesthetic */}
                <Activity mode={mode === 'console' ? 'visible' : 'hidden'}>
                    <div
                        className="absolute inset-0 h-[80vh] w-full rounded-xl bg-background/98 p-5 font-mono text-xs overflow-hidden"
                        data-ui-surface="container"
                    >
                        <div className="mb-3 flex items-center gap-2 pb-2 text-muted-foreground/60">
                            <Terminal className="h-4 w-4" />
                            <span>dev-console — 80×24</span>
                            <div className="ml-auto flex gap-1.5">
                                <span className="h-3 w-3 rounded-full bg-destructive/60" />
                                <span className="h-3 w-3 rounded-full bg-amber-500/60" />
                                <span className="h-3 w-3 rounded-full bg-emerald-500/60" />
                            </div>
                        </div>
                        <div className="space-y-1 text-primary/80">
                            <p className="text-muted-foreground">{'$'} systemctl status orgcentral-worker</p>
                            <p className="text-foreground/80">● orgcentral-worker.service - OrgCentral Background Worker</p>
                            <p className="pl-4 text-muted-foreground/70">Loaded: loaded (/etc/systemd/system/orgcentral.service; enabled)</p>
                            <p className="pl-4">
                                Active: <span className="text-emerald-500 font-semibold">active (running)</span>
                                <span className="text-muted-foreground/60"> since Thu 2025-12-26 14:00:00 UTC</span>
                            </p>
                            <p className="text-muted-foreground/50 mt-4">{'$'} tail -f /var/log/app.log</p>
                            <div className="mt-2 space-y-0.5 text-muted-foreground/80">
                                <p><span className="text-sky-500">[INF]</span> [Auth] User session established (id: user_123)</p>
                                <p><span className="text-amber-500">[DBG]</span> [Theme] Applied preset: cyberpunk-purple</p>
                                <p><span className="text-sky-500">[INF]</span> [Activity] Mode switched to: {mode}</p>
                                <p className="text-primary animate-pulse">▌</p>
                            </div>
                        </div>
                    </div>
                </Activity>
            </div>
        </div>
    );
}
