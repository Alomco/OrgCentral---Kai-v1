'use client';

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react';
import { Loader2, Search } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface SearchComboboxOption {
    title: string;
    subtitle: string;
    type: string;
    rank: number;
}

interface SearchComboboxProps<TOption extends SearchComboboxOption> {
    label: string;
    placeholder: string;
    value: string;
    onValueChange: (value: string) => void;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    options: readonly TOption[];
    onSelect: (option: TOption) => void;
    isLoading?: boolean;
    errorMessage?: string | null;
    emptyMessage?: string;
    loadingMessage?: string;
    minQueryLength?: number;
    inputRef?: RefObject<HTMLInputElement | null>;
    labelClassName?: string;
}

export function SearchCombobox<TOption extends SearchComboboxOption>({
    label,
    placeholder,
    value,
    onValueChange,
    open,
    onOpenChange,
    options,
    onSelect,
    isLoading = false,
    errorMessage = null,
    emptyMessage = 'No matches found.',
    loadingMessage = 'Searching...',
    minQueryLength = 2,
    inputRef,
    labelClassName,
}: SearchComboboxProps<TOption>) {
    const internalReference = useRef<HTMLInputElement>(null);
    const resolvedInputReference = inputRef ?? internalReference;
    const listboxId = useId();
    const statusId = useId();
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

    const trimmedQuery = value.trim();
    const hasSufficientQuery = trimmedQuery.length >= minQueryLength;
    const canNavigate = open && hasSufficientQuery && !isLoading && !errorMessage && options.length > 0;

    useEffect(() => {
        if (!open) {
            return;
        }
        resolvedInputReference.current?.focus();
    }, [open, resolvedInputReference]);

    const activeIndex = useMemo(() => {
        if (!canNavigate) {
            return -1;
        }
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
            return highlightedIndex;
        }
        return 0;
    }, [canNavigate, highlightedIndex, options.length]);

    const statusMessage = useMemo(() => {
        if (!hasSufficientQuery) {
            return `Type at least ${String(minQueryLength)} characters to search.`;
        }
        if (errorMessage) {
            return errorMessage;
        }
        if (isLoading) {
            return loadingMessage;
        }
        if (options.length === 0) {
            return emptyMessage;
        }
        return `${String(options.length)} result${options.length === 1 ? '' : 's'} available.`;
    }, [emptyMessage, errorMessage, hasSufficientQuery, isLoading, loadingMessage, minQueryLength, options.length]);

    const activeOptionId = activeIndex >= 0 ? `${listboxId}-option-${String(activeIndex)}` : undefined;

    function handleSelect(option: TOption) {
        onSelect(option);
        setHighlightedIndex(-1);
        onOpenChange(false);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Escape') {
            event.preventDefault();
            setHighlightedIndex(-1);
            onOpenChange(false);
            return;
        }

        if (!canNavigate) {
            return;
        }

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            setHighlightedIndex((previousIndex) => {
                if (previousIndex < 0 || previousIndex >= options.length) {
                    return 0;
                }
                return (previousIndex + 1) % options.length;
            });
            return;
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightedIndex((previousIndex) => {
                if (previousIndex < 0 || previousIndex >= options.length) {
                    return options.length - 1;
                }
                return previousIndex <= 0 ? options.length - 1 : previousIndex - 1;
            });
            return;
        }

        if (event.key === 'Enter' && activeIndex >= 0) {
            event.preventDefault();
            handleSelect(options[activeIndex]);
        }
    }

    return (
        <div className="space-y-2">
            <Label className={cn('sr-only', labelClassName)} htmlFor={listboxId}>
                {label}
            </Label>
            <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    id={listboxId}
                    ref={resolvedInputReference}
                    value={value}
                    type="search"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={open}
                    aria-controls={`${listboxId}-listbox`}
                    aria-activedescendant={activeOptionId}
                    aria-describedby={statusId}
                    placeholder={placeholder}
                    className="pl-10"
                    onChange={(event) => onValueChange(event.target.value)}
                    onKeyDown={handleKeyDown}
                />
            </div>

            <p id={statusId} aria-live="polite" className="text-xs text-muted-foreground">
                {statusMessage}
            </p>

            <ul
                id={`${listboxId}-listbox`}
                role="listbox"
                aria-label={label}
                className="max-h-72 overflow-y-auto rounded-md border border-border/60 bg-background/95"
            >
                {!hasSufficientQuery ? (
                    <li className="px-3 py-2 text-sm text-muted-foreground">{`Type at least ${String(minQueryLength)} characters.`}</li>
                ) : null}

                {hasSufficientQuery && isLoading ? (
                    <li className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        {loadingMessage}
                    </li>
                ) : null}

                {hasSufficientQuery && errorMessage ? (
                    <li className="px-3 py-2 text-sm text-destructive">{errorMessage}</li>
                ) : null}

                {hasSufficientQuery && !isLoading && !errorMessage && options.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-muted-foreground">{emptyMessage}</li>
                ) : null}

                {canNavigate
                    ? options.map((option, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <li
                                key={`${option.type}-${option.title}-${String(index)}`}
                                id={`${listboxId}-option-${String(index)}`}
                                role="option"
                                aria-selected={isActive}
                                className={cn(
                                    'cursor-pointer border-b border-border/40 px-3 py-2 text-sm last:border-b-0',
                                    isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/60',
                                )}
                                onMouseEnter={() => setHighlightedIndex(index)}
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => handleSelect(option)}
                            >
                                <p className="font-medium">{option.title}</p>
                                <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                            </li>
                        );
                    })
                    : null}
            </ul>
        </div>
    );
}
