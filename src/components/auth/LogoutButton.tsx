'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { type VariantProps } from 'class-variance-authority';

import { Button, type buttonVariants } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export interface LogoutButtonProps extends VariantProps<typeof buttonVariants> {
    label?: string;
    redirectTo?: string;
    className?: string;
}

export function LogoutButton({
    label = 'Sign out',
    redirectTo = '/login',
    variant = 'outline',
    size = 'sm',
    className,
}: LogoutButtonProps) {
    const [isPending, setIsPending] = useState(false);

    const handleSignOut = async () => {
        if (isPending) {
            return;
        }

        setIsPending(true);

        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        window.location.href = redirectTo;
                    },
                    onError: () => {
                        window.location.href = redirectTo;
                    },
                },
            });
        } catch {
            window.location.href = redirectTo;
        } finally {
            setIsPending(false);
        }
    };

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            onClick={handleSignOut}
            disabled={isPending}
            className={cn('gap-2', className)}
            aria-live="polite"
        >
            <LogOut className="h-4 w-4" />
            {label}
        </Button>
    );
}
