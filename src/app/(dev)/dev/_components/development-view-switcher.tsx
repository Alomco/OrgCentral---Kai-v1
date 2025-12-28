/**
 * ⚡ Dev View Switcher (React 19 <Activity>)
 * 
 * Allows instant toggling between "Overview" and "Live Console" modes
 * without unmounting the console, preserving scroll/data state.
 * 
 * @module app/(dev)/dev/_components/dev-view-switcher
 */

'use client';

import { Activity, useState, type ReactNode } from 'react';
import { Terminal, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DevelopmentViewSwitcherProps {
    children: ReactNode;
}

export function DevelopmentViewSwitcher({ children }: DevelopmentViewSwitcherProps) {
    const [mode, setMode] = useState<'overview' | 'console'>('overview');

    return (
        <div className="flex flex-col h-full gap-4">
            {/* 🕹️ Mode Toggles (Floating) */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex gap-2 p-1 rounded-xl bg-background/50 backdrop-blur-md border border-border shadow-lg">
                <Button
                    variant={mode === 'overview' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('overview')}
                    className="gap-2"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Overview
                </Button>
                <Button
                    variant={mode === 'console' ? 'destructive' : 'ghost'}
                    size="sm"
                    onClick={() => setMode('console')}
                    className="gap-2"
                >
                    <Terminal className="h-4 w-4" />
                    Live Console
                </Button>
            </div>

            {/* 🖥️ Views */}
            <div className="flex-1 relative">
                {/* View 1: Main Content (Activity: hidden when not active) */}
                <Activity mode={mode === 'overview' ? 'visible' : 'hidden'}>
                    <div className="h-full w-full animate-in fade-in duration-300">
                        {children}
                    </div>
                </Activity>

                {/* View 2: Live Console (Always kept alive in background) */}
                <Activity mode={mode === 'console' ? 'visible' : 'hidden'}>
                    <div className="absolute inset-0 h-[80vh] w-full rounded-xl border border-border bg-black/90 p-4 font-mono text-xs text-green-400 overflow-hidden shadow-2xl">
                        <div className="mb-2 flex items-center gap-2 border-b border-white/10 pb-2 text-white/50">
                            <Terminal className="h-4 w-4" />
                            <span>dev-consoled — 80x24</span>
                        </div>
                        <div className="space-y-1">
                            <p>{'>'} systemctl status orgcentral-worker</p>
                            <p className="text-white">● orgcentral-worker.service - OrgCentral Background Worker</p>
                            <p className="pl-4">Loaded: loaded (/etc/systemd/system/orgcentral.service; enabled)</p>
                            <p className="pl-4">Active: <span className="text-green-400 font-bold">active (running)</span> since Thu 2025-12-26 14:00:00 UTC</p>
                            <p className="opacity-50 mt-4">{'>'} tail -f /var/log/app.log</p>
                            <div className="opacity-80">
                                <p>[INF] [Auth] User session established (id: user_123)</p>
                                <p>[DBG] [Theme] Applied preset: cyberpunk-purple</p>
                                <p>[INF] [Activity] Mode switched to: {mode}</p>
                                <p className="animate-pulse">_</p>
                            </div>
                        </div>
                    </div>
                </Activity>
            </div>
        </div>
    );
}
