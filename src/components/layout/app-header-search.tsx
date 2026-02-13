'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SearchCombobox } from '@/components/search/search-combobox';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import type { TopbarSearchResult } from '@/lib/search/topbar-search-contract';
import { topbarSearchQueryOptions } from './topbar-search.api';

interface AppHeaderSearchProps {
    orgId: string;
    enabled: boolean;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

export function AppHeaderSearch({ orgId, enabled }: AppHeaderSearchProps) {
    const router = useRouter();
    const triggerReference = useRef<HTMLButtonElement>(null);
    const inputReference = useRef<HTMLInputElement>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebouncedValue(query, DEBOUNCE_MS).trim();
    const previousOpen = useRef(false);

    const queryOptions = topbarSearchQueryOptions(orgId, debouncedQuery);
    const searchQuery = useQuery({
        ...queryOptions,
        enabled: enabled && open && debouncedQuery.length >= MIN_QUERY_LENGTH,
    });

    const results = searchQuery.data?.results ?? [];
    const errorMessage = searchQuery.isError ? 'Could not load results. Please try again.' : null;

    const selectedCountLabel = useMemo(() => {
        if (results.length === 0) {
            return 'No employee matches yet';
        }
        return `${String(results.length)} employee result${results.length === 1 ? '' : 's'}`;
    }, [results.length]);

    useEffect(() => {
        function handleShortcut(event: KeyboardEvent) {
            if (!enabled) {
                return;
            }
            const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
            if (!isShortcut) {
                return;
            }
            event.preventDefault();
            setOpen(true);
        }

        window.addEventListener('keydown', handleShortcut);
        return () => {
            window.removeEventListener('keydown', handleShortcut);
        };
    }, [enabled]);

    useEffect(() => {
        if (previousOpen.current && !open) {
            triggerReference.current?.focus();
        }
        previousOpen.current = open;
    }, [open]);

    function handleSelect(result: TopbarSearchResult) {
        router.push(result.href);
        setOpen(false);
        setQuery('');
    }

    function handleOpenChange(nextOpen: boolean) {
        if (!enabled) {
            setOpen(false);
            return;
        }
        setOpen(nextOpen);
    }

    return (
        <Popover open={open} onOpenChange={handleOpenChange}>
            <PopoverTrigger asChild>
                <Button
                    ref={triggerReference}
                    variant="ghost"
                    size="icon"
                    disabled={!enabled}
                    className="h-8.5 w-8.5 rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    aria-label={enabled ? 'Open global search' : 'Global search unavailable'}
                    title={enabled ? 'Search employees (Ctrl+K)' : 'Global search unavailable for this role'}
                >
                    <Search className="h-4.5 w-4.5" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[26rem] p-4" align="end" sideOffset={8}>
                <SearchCombobox<TopbarSearchResult>
                    label="Global employee search"
                    placeholder="Search employee name, number, email, department, or title"
                    value={query}
                    open={open}
                    options={results}
                    inputRef={inputReference}
                    minQueryLength={MIN_QUERY_LENGTH}
                    isLoading={searchQuery.isFetching}
                    errorMessage={errorMessage}
                    emptyMessage="No employees matched your query."
                    onOpenChange={setOpen}
                    onValueChange={setQuery}
                    onSelect={handleSelect}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                    {selectedCountLabel}
                </p>
            </PopoverContent>
        </Popover>
    );
}
