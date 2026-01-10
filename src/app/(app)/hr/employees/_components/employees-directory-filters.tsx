'use client';

import { useCallback, useEffect, useRef, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import type { EmployeeDirectoryQuery } from './employee-directory-helpers';
import { EmployeesDirectoryFiltersForm } from './employees-directory-filters-form';

export interface EmployeesDirectoryFiltersProps {
    query: EmployeeDirectoryQuery;
}

export function EmployeesDirectoryFilters({ query }: EmployeesDirectoryFiltersProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const formReference = useRef<HTMLFormElement | null>(null);
    const debounceTimerReference = useRef<number | null>(null);

    const navigateWithForm = useCallback((form: HTMLFormElement) => {
        const formData = new FormData(form);
        formData.set('page', '1');

        const searchParams = new URLSearchParams();
        for (const [key, value] of formData.entries()) {
            if (typeof value !== 'string') {
                continue;
            }
            const trimmed = value.trim();
            if (trimmed.length === 0) {
                continue;
            }
            searchParams.set(key, trimmed);
        }

        const href = searchParams.size > 0
            ? `/hr/employees?${searchParams.toString()}`
            : '/hr/employees';

        startTransition(() => {
            router.push(href);
        });
    }, [router]);

    const handleSubmit = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        navigateWithForm(event.currentTarget);
    }, [navigateWithForm]);

    const handleReset = useCallback((event: React.MouseEvent) => {
        event.preventDefault();
        startTransition(() => {
            router.push('/hr/employees');
        });
    }, [router]);

    const scheduleDebouncedApply = useCallback(() => {
        if (!formReference.current) {
            return;
        }

        if (debounceTimerReference.current !== null) {
            window.clearTimeout(debounceTimerReference.current);
        }

        debounceTimerReference.current = window.setTimeout(() => {
            if (!formReference.current) {
                return;
            }
            navigateWithForm(formReference.current);
        }, 350);
    }, [navigateWithForm]);

    useEffect(() => {
        return () => {
            if (debounceTimerReference.current !== null) {
                window.clearTimeout(debounceTimerReference.current);
            }
        };
    }, []);

    return (
        <EmployeesDirectoryFiltersForm
            query={query}
            isPending={isPending}
            formReference={formReference}
            onSubmit={handleSubmit}
            onReset={handleReset}
            onChange={scheduleDebouncedApply}
        />
    );
}
