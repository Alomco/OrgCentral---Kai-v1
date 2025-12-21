"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Loader2, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ADMIN_BOOTSTRAP_SECRET_STORAGE_KEY } from './admin-bootstrap.storage';

type BootstrapStatus = 'loading' | 'error' | 'success';

interface BootstrapState {
    status: BootstrapStatus;
    message?: string;
}

function extractErrorMessage(payload: unknown): string | null {
    if (!payload || typeof payload !== 'object') {
        return null;
    }

    const record = payload as Record<string, unknown>;
    const error = record.error;
    if (!error || typeof error !== 'object') {
        return null;
    }

    const message = (error as Record<string, unknown>).message;
    return typeof message === 'string' && message.trim().length > 0 ? message : null;
}

export function AdminBootstrapComplete() {
    const router = useRouter();

    const token = useMemo(() => {
        if (typeof window === 'undefined') {
            return null;
        }
        return window.sessionStorage.getItem(ADMIN_BOOTSTRAP_SECRET_STORAGE_KEY);
    }, []);

    const [state, setState] = useState<BootstrapState>(() => {
        if (!token) {
            return {
                status: 'error',
                message: 'Missing bootstrap secret. Start again and enter the secret before continuing.',
            };
        }

        return { status: 'loading' };
    });

    useEffect(() => {
        if (!token) {
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            try {
                const response = await fetch('/api/auth/admin-bootstrap', {
                    method: 'POST',
                    headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ token }),
                    signal: controller.signal,
                });

                if (!response.ok) {
                    const errorPayload: unknown = await response.json().catch(() => null);
                    const statusCode = String(response.status);
                    const message =
                        extractErrorMessage(errorPayload) ??
                        `Bootstrap failed (${statusCode}).`;
                    setState({ status: 'error', message });
                    return;
                }

                sessionStorage.removeItem(ADMIN_BOOTSTRAP_SECRET_STORAGE_KEY);
                setState({ status: 'success' });
                router.replace('/dashboard');
            } catch (error) {
                if (error instanceof DOMException && error.name === 'AbortError') {
                    return;
                }
                const message = error instanceof Error ? error.message : String(error);
                setState({ status: 'error', message });
            }
        };
        void run().catch(() => {
            setState({ status: 'error', message: 'Unexpected bootstrap error.' });
        });

        return () => controller.abort();
    }, [router, token]);

    if (state.status === 'error') {
        return (
            <div className="space-y-4">
                <Alert variant="destructive">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Bootstrap failed</AlertTitle>
                    <AlertDescription>
                        <p>{state.message ?? 'Something went wrong.'}</p>
                    </AlertDescription>
                </Alert>
                <div className="flex items-center justify-between gap-3">
                    <Button asChild variant="outline" className="rounded-xl">
                        <Link href="/admin-signup">Try again</Link>
                    </Button>
                    <Button asChild className="rounded-xl">
                        <Link href="/login">Go to login</Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <Alert>
                {state.status === 'success' ? (
                    <ShieldCheck className="h-4 w-4" />
                ) : (
                    <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <AlertTitle>
                    {state.status === 'success' ? 'Provisioned' : 'Provisioning admin access'}
                </AlertTitle>
                <AlertDescription>
                    <p>
                        {state.status === 'success'
                            ? 'Redirecting to your dashboard...'
                            : 'Setting up your platform organization and permissions.'}
                    </p>
                </AlertDescription>
            </Alert>
        </div>
    );
}
