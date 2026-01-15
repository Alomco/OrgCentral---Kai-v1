import Link from 'next/link';

import { ThemeCard } from '@/components/theme/cards/theme-card';
import { ThemeGrid } from '@/components/theme/layout/primitives';
import { GradientAccent } from '@/components/theme/primitives/surfaces';
import { QUICK_ACTIONS } from '../quick-actions';

export function AdminQuickActions() {
    return (
        <ThemeGrid cols={4} gap="md">
            {QUICK_ACTIONS.map((action) => (
                <Link key={action.href} href={action.href} className="h-full">
                    <ThemeCard variant="glass" hover="lift" padding="lg" className="h-full">
                        <div className="flex items-start gap-4">
                            <GradientAccent variant="vibrant" rounded="lg" className="p-3">
                                <action.icon className="h-5 w-5 text-white" />
                            </GradientAccent>
                            <div className="space-y-1">
                                <p className="text-sm font-semibold text-foreground">{action.title}</p>
                                <p className="text-xs text-muted-foreground">{action.description}</p>
                            </div>
                        </div>
                    </ThemeCard>
                </Link>
            ))}
        </ThemeGrid>
    );
}

export function AdminQuickActionsSkeleton() {
    return (
        <ThemeGrid cols={4} gap="md">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={String(index)} className="h-24 rounded-2xl bg-muted/20 animate-pulse" />
            ))}
        </ThemeGrid>
    );
}
