'use client';

import { useEffect, useMemo, useState } from 'react';
import { Save, Tag } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ComplianceCategory } from '@/server/types/compliance-types';

interface ComplianceCategoryManagerProps {
    initialCategories: ComplianceCategory[];
}

interface CategoryFormState {
    key: string;
    label: string;
    sortOrder: string;
}

const emptyForm: CategoryFormState = {
    key: '',
    label: '',
    sortOrder: '100',
};

export function ComplianceCategoryManager({ initialCategories }: ComplianceCategoryManagerProps) {
    const [categories, setCategories] = useState<ComplianceCategory[]>(initialCategories);
    const [formState, setFormState] = useState<CategoryFormState>(emptyForm);
    const [status, setStatus] = useState<'idle' | 'saving' | 'error' | 'success'>('idle');
    const [message, setMessage] = useState('');

    const sortedCategories = useMemo(
        () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
        [categories],
    );

    useEffect(() => {
        if (initialCategories.length === 0) {
            const loadCategories = async () => {
                const response = await fetch('/api/hr/compliance/categories');
                if (!response.ok) {
                    throw new Error('Unable to load categories.');
                }
                const payload = (await response.json()) as { success: boolean; categories?: ComplianceCategory[] };
                setCategories(payload.categories ?? []);
            };

            loadCategories().catch((error: unknown) => {
                setStatus('error');
                setMessage(error instanceof Error ? error.message : 'Unable to load categories.');
            });
        }
    }, [initialCategories.length]);

    const handleEdit = (category: ComplianceCategory) => {
        setFormState({
            key: category.key,
            label: category.label,
            sortOrder: String(category.sortOrder),
        });
    };

    const handleSubmit = async () => {
        if (!formState.key.trim() || !formState.label.trim()) {
            setStatus('error');
            setMessage('Key and label are required.');
            return;
        }

        setStatus('saving');
        setMessage('');

        try {
            const response = await fetch('/api/hr/compliance/categories', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: formState.key.trim(),
                    label: formState.label.trim(),
                    sortOrder: Number(formState.sortOrder),
                }),
            });

            if (!response.ok) {
                const payload = (await response.json()) as { error?: string } | null;
                throw new Error(payload?.error ?? 'Unable to save category.');
            }

            const payload = (await response.json()) as { category?: ComplianceCategory };
            if (payload.category) {
                const savedCategory = payload.category;
                setCategories((previous) => {
                    const filtered = previous.filter((item) => item.key !== savedCategory.key);
                    return [...filtered, savedCategory];
                });
            }

            setStatus('success');
            setMessage('Category saved.');
            setFormState(emptyForm);
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Unable to save category.');
        }
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
                {status === 'error' || status === 'success' ? (
                    <Alert variant={status === 'error' ? 'destructive' : 'default'} role="status">
                        <AlertTitle>{status === 'error' ? 'Unable to save' : 'Saved'}</AlertTitle>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                ) : null}

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                        <Label htmlFor="compliance-category-key">Key</Label>
                        <Input
                            id="compliance-category-key"
                            value={formState.key}
                            onChange={(event) => setFormState((previous) => ({ ...previous, key: event.target.value }))}
                            placeholder="uk_employment"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compliance-category-label">Label</Label>
                        <Input
                            id="compliance-category-label"
                            value={formState.label}
                            onChange={(event) => setFormState((previous) => ({ ...previous, label: event.target.value }))}
                            placeholder="UK Employment"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compliance-category-sort">Sort order</Label>
                        <Input
                            id="compliance-category-sort"
                            type="number"
                            value={formState.sortOrder}
                            onChange={(event) => setFormState((previous) => ({ ...previous, sortOrder: event.target.value }))}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button onClick={handleSubmit} disabled={status === 'saving'}>
                        <Save className="mr-2 h-4 w-4" />
                        {status === 'saving' ? 'Saving...' : 'Save category'}
                    </Button>
                    <Button variant="outline" onClick={() => setFormState(emptyForm)}>
                        Reset
                    </Button>
                </div>

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
