'use client';

import { useEffect, useRef, useState } from 'react';
import type { EmailCheckResult } from './wizard.types';

export type EmailCheckStatus = 'idle' | 'checking' | 'valid' | 'invalid';

export interface EmailCheckAction {
    url: string;
    label: string;
}

export interface EmailCheckState {
    status: EmailCheckStatus;
    message: string | null;
    action: EmailCheckAction | null;
}

export function useEmailCheck(
    email: string,
    onEmailCheck?: (email: string) => Promise<EmailCheckResult>,
): EmailCheckState {
    const [status, setStatus] = useState<EmailCheckStatus>('idle');
    const [message, setMessage] = useState<string | null>(null);
    const [action, setAction] = useState<EmailCheckAction | null>(null);
    const previousEmailReference = useRef<string | undefined>(undefined);

    useEffect(() => {
        const abortController = new AbortController();

        const timeoutId = setTimeout(() => {
            if (abortController.signal.aborted) {
                return;
            }

            // Skip if no check function or email too short
            if (!onEmailCheck || !email || email.length < 3) {
                if (previousEmailReference.current !== email) {
                    previousEmailReference.current = email;
                    setStatus('idle');
                    setMessage(null);
                    setAction(null);
                }
                return;
            }

            // Simple email validation before checking
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                previousEmailReference.current = email;
                setStatus('idle');
                setMessage(null);
                setAction(null);
                return;
            }

            previousEmailReference.current = email;
            setStatus('checking');

            onEmailCheck(email)
                .then((result) => {
                    if (abortController.signal.aborted) {
                        return;
                    }
                    if (result.exists) {
                        setStatus('invalid');
                        setMessage(result.reason ?? 'This email is already in use.');
                        if (result.actionUrl && result.actionLabel) {
                            setAction({
                                url: result.actionUrl,
                                label: result.actionLabel,
                            });
                        } else {
                            setAction(null);
                        }
                    } else {
                        setStatus('valid');
                        setMessage(null);
                        setAction(null);
                    }
                })
                .catch(() => {
                    if (abortController.signal.aborted) {
                        return;
                    }
                    setStatus('idle');
                    setMessage(null);
                    setAction(null);
                });
        }, 100); // Small delay ensures all state updates happen asynchronously

        return () => {
            clearTimeout(timeoutId);
            abortController.abort();
        };
    }, [email, onEmailCheck]);

    return { status, message, action };
}
