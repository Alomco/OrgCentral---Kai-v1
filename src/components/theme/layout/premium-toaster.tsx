/**
 * 🔔 Premium Toast Notifications
 * 
 * Enhanced Sonner toaster with glassmorphism and theme colors.
 * Client Component.
 * 
 * @module components/theme/layout/premium-toaster
 */

'use client';

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'sonner';

// ============================================================================
// Types
// ============================================================================

export interface PremiumToasterProps extends Omit<SonnerProps, 'theme' | 'style'> {
    /** Position of toasts */
    position?: SonnerProps['position'];
}

// ============================================================================
// Component
// ============================================================================

/**
 * Premium toast notifications with glassmorphism effect.
 */
export function PremiumToaster({ position = 'bottom-right', ...props }: PremiumToasterProps) {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            theme={theme as SonnerProps['theme']}
            position={position}
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4 text-green-500" />,
                info: <InfoIcon className="size-4 text-blue-500" />,
                warning: <TriangleAlertIcon className="size-4 text-yellow-500" />,
                error: <OctagonXIcon className="size-4 text-destructive" />,
                loading: <Loader2Icon className="size-4 animate-spin text-primary" />,
            }}
            toastOptions={{
                classNames: {
                    toast: [
                        'group toast',
                        'bg-card/95 backdrop-blur-lg',
                        'border border-border/50',
                        'shadow-xl shadow-primary/5',
                        'text-foreground',
                    ].join(' '),
                    title: 'font-semibold',
                    description: 'text-muted-foreground text-sm',
                    actionButton: [
                        'bg-primary text-primary-foreground',
                        'hover:bg-primary/90',
                        'font-medium',
                    ].join(' '),
                    cancelButton: [
                        'bg-muted text-muted-foreground',
                        'hover:bg-muted/80',
                    ].join(' '),
                    success: 'border-green-500/30 shadow-green-500/10',
                    error: 'border-destructive/30 shadow-destructive/10',
                    warning: 'border-yellow-500/30 shadow-yellow-500/10',
                    info: 'border-blue-500/30 shadow-blue-500/10',
                },
            }}
            style={{
                '--normal-bg': 'hsl(var(--card) / 0.95)',
                '--normal-text': 'hsl(var(--foreground))',
                '--normal-border': 'hsl(var(--border))',
                '--border-radius': 'var(--radius)',
            } as React.CSSProperties}
            {...props}
        />
    );
}

// ============================================================================
// Toast Helpers
// ============================================================================

export { toast } from 'sonner';
