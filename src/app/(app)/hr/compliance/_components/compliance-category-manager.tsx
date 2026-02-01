'use client';

import { useActionState, useEffect, useMemo, useRef } from 'react';
import { Save, Tag } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ComplianceCategory } from '@/server/types/compliance-types';
import { COMPLIANCE_STANDARDS } from '@/server/types/hr/compliance-standards';
import {
    complianceCategoryKeys,
    listComplianceCategoriesQuery,
} from '../compliance-categories.api';
import { saveComplianceCategoryAction } from '../actions/compliance-categories';
import type { ComplianceCategoryActionState } from '../actions/compliance-categories.types';

interface ComplianceCategoryManagerProps {
    initialCategories: ComplianceCategory[];
}

const DEFAULT_SORT_ORDER = '100';

function readRegulatoryReferences(category: ComplianceCategory): string[] {
    const metadata = category.metadata;
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
        return [];
    }
    const value = (metadata as Record<string, unknown>).regulatoryRefs;
    if (!Array.isArray(value)) {
        return [];
    }
    return value.filter((entry) => typeof entry === 'string');
}

export function ComplianceCategoryManager({ initialCategories }: ComplianceCategoryManagerProps) {
    const formReference = useRef<HTMLFormElement | null>(null);
    const queryClient = useQueryClient();
    const [state, formAction, pending] = useActionState<ComplianceCategoryActionState, FormData>(
        saveComplianceCategoryAction,
        { status: 'idle' },
    );

    const { data, isError, error } = useQuery({
        ...listComplianceCategoriesQuery(),
        initialData: { categories: initialCategories },
    });

    const categories = data.categories;

    const sortedCategories = useMemo(
        () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
        [categories],
    );

    const loadMessage = isError ? (error instanceof Error ? error.message : 'Unable to load categories.') : null;
    const actionMessage = state.status === 'error'
        ? state.message
        : state.status === 'success'
            ? state.message
            : null;

    const statusMessage = loadMessage ?? actionMessage;
    const alertTone = state.status === 'error' || isError ? 'destructive' : 'default';
    const alertTitle = isError
        ? 'Unable to load'
        : state.status === 'error'
            ? 'Unable to save'
            : 'Saved';

    useEffect(() => {
        if (state.status === 'success') {
            formReference.current?.reset();
            void queryClient.invalidateQueries({ queryKey: complianceCategoryKeys.list() }).catch(() => null);
        }
    }, [queryClient, state.status]);

    const handleEdit = (category: ComplianceCategory) => {
        const form = formReference.current;
        if (!form) {
            return;
        }
        const keyInput = form.elements.namedItem('category-key') as HTMLInputElement | null;
        const labelInput = form.elements.namedItem('category-label') as HTMLInputElement | null;
        const sortInput = form.elements.namedItem('category-sort-order') as HTMLInputElement | null;
        const regulatoryReferences = new Set(readRegulatoryReferences(category));
        if (keyInput) {
            keyInput.value = category.key;
        }
        if (labelInput) {
            labelInput.value = category.label;
        }
        if (sortInput) {
            sortInput.value = String(category.sortOrder);
        }
        const checkboxes = Array.from(
            form.querySelectorAll<HTMLInputElement>('input[name="category-regulatory-ref"]'),
        );
        checkboxes.forEach((checkbox) => {
            checkbox.checked = regulatoryReferences.has(checkbox.value);
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Category manager
                </CardTitle>
                <CardDescription>Standardize category keys for compliance templates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {statusMessage ? (
                    <Alert variant={alertTone} role="status">
                        <AlertTitle>{alertTitle}</AlertTitle>
                        <AlertDescription>{statusMessage}</AlertDescription>
                    </Alert>
                ) : null}

                <form ref={formReference} action={formAction} className="space-y-4" aria-busy={pending}>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                            <Label htmlFor="compliance-category-key">Key</Label>
                            <Input
                                id="compliance-category-key"
                                name="category-key"
                                defaultValue=""
                                placeholder="uk_employment"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="compliance-category-label">Label</Label>
                            <Input
                                id="compliance-category-label"
                                name="category-label"
                                defaultValue=""
                                placeholder="UK Employment"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="compliance-category-sort">Sort order</Label>
                            <Input
                                id="compliance-category-sort"
                                name="category-sort-order"
                                type="number"
                                defaultValue={DEFAULT_SORT_ORDER}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Regulatory mappings</Label>
                        <div className="grid gap-2 sm:grid-cols-2">
                            {COMPLIANCE_STANDARDS.map((standard) => (
                                <label
                                    key={standard.key}
                                    className="flex items-start gap-2 rounded-md border px-3 py-2 text-xs"
                                >
                                    <input
                                        type="checkbox"
                                        name="category-regulatory-ref"
                                        value={standard.key}
                                        className="mt-0.5"
                                    />
                                    <span>
                                        <span className="font-medium">{standard.label}</span>
                                        <span className="block text-muted-foreground">
                                            {standard.description}
                                        </span>
                                    </span>
                                </label>
                            ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Link categories to regulatory standards for reporting and audits.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button type="submit" disabled={pending}>
                            <Save className="mr-2 h-4 w-4" />
                            {pending ? 'Saving...' : 'Save category'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => formReference.current?.reset()}>
                            Reset
                        </Button>
                    </div>
                </form>

                {sortedCategories.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No categories configured yet.</p>
                ) : (
                    <div className="flex flex-wrap gap-2">
                        {sortedCategories.map((category) => (
                            <button
                                type="button"
                                key={category.id}
                                onClick={() => handleEdit(category)}
                                className="rounded-full border px-3 py-1 text-xs transition hover:bg-muted"
                            >
                                <span className="font-medium">{category.label}</span>
                                <Badge variant="outline" className="ml-2 text-[10px]">
                                    {category.key}
                                </Badge>
                            </button>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
