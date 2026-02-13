'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { EmployeeLookupOption } from './employee-lookup.types';

interface EmployeeLookupFieldProps {
    id: string;
    label: string;
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    options: EmployeeLookupOption[];
    placeholder: string;
    searchPlaceholder: string;
    emptyText: string;
    helperText?: string;
    error?: string;
    errorId?: string;
    disabled?: boolean;
}

function buildDisplayText(option: EmployeeLookupOption): string {
    if (option.employeeNumber && option.email) {
        return `${option.displayName} - ${option.employeeNumber} - ${option.email}`;
    }
    if (option.employeeNumber) {
        return `${option.displayName} - ${option.employeeNumber}`;
    }
    if (option.email) {
        return `${option.displayName} - ${option.email}`;
    }
    return option.displayName;
}

export function EmployeeLookupField({
    id,
    label,
    name,
    value,
    defaultValue,
    onChange,
    options,
    placeholder,
    searchPlaceholder,
    emptyText,
    helperText,
    error,
    errorId,
    disabled = false,
}: EmployeeLookupFieldProps) {
    const [open, setOpen] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue ?? value ?? '');
    const resolvedValue = onChange ? (value ?? '') : internalValue;

    const optionMap = useMemo(() => {
        const map = new Map<string, EmployeeLookupOption>();
        for (const option of options) {
            map.set(option.id, option);
        }
        return map;
    }, [options]);

    const selected = resolvedValue ? optionMap.get(resolvedValue) : undefined;
    const hasError = Boolean(error);

    function updateValue(nextValue: string) {
        if (onChange) {
            onChange(nextValue);
            return;
        }
        setInternalValue(nextValue);
    }

    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            {name ? <input type="hidden" name={name} value={resolvedValue} /> : null}
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id={id}
                        type="button"
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        aria-invalid={hasError}
                        aria-describedby={hasError ? errorId : undefined}
                        disabled={disabled}
                        className={cn(
                            'h-10 w-full justify-between text-left font-normal',
                            !selected ? 'text-muted-foreground' : undefined,
                        )}
                    >
                        <span className="truncate">
                            {selected ? buildDisplayText(selected) : placeholder}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={searchPlaceholder} />
                        <CommandList>
                            <CommandEmpty>{emptyText}</CommandEmpty>
                            <CommandGroup>
                                {options.map((option) => {
                                    const isSelected = option.id === resolvedValue;
                                    return (
                                        <CommandItem
                                            key={option.id}
                                            value={buildDisplayText(option)}
                                            onSelect={() => {
                                                updateValue(option.id);
                                                setOpen(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    'mr-2 h-4 w-4',
                                                    isSelected ? 'opacity-100' : 'opacity-0',
                                                )}
                                            />
                                            <div className="min-w-0">
                                                <div className="truncate">{option.displayName}</div>
                                                <div className="truncate text-xs text-muted-foreground">
                                                    {option.employeeNumber ?? option.id}
                                                    {option.email ? ` - ${option.email}` : ''}
                                                </div>
                                            </div>
                                        </CommandItem>
                                    );
                                })}
                                {resolvedValue ? (
                                    <CommandItem
                                        value="clear-selection"
                                        onSelect={() => {
                                            updateValue('');
                                            setOpen(false);
                                        }}
                                    >
                                        Clear selection
                                    </CommandItem>
                                ) : null}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {helperText ? (
                <p className="text-xs text-muted-foreground">{helperText}</p>
            ) : null}
            {error ? (
                <p id={errorId} role="alert" className="text-xs text-destructive">
                    {error}
                </p>
            ) : null}
        </div>
    );
}
