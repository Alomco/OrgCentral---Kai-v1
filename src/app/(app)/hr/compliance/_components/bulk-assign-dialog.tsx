'use client';

import { useState } from 'react';
import { Users, Plus, Check, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { BulkAssignDialogProps } from './bulk-assign-dialog.types';

export function BulkAssignDialog({
    templates,
    employees,
    onAssign,
}: BulkAssignDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const filteredEmployees = employees.filter(
        (emp) =>
            emp.name.toLowerCase().includes(search.toLowerCase()) ||
            emp.department.toLowerCase().includes(search.toLowerCase()),
    );

    const handleToggleEmployee = (id: string) => {
        setSelectedEmployees((previous) => {
            const next = new Set(previous);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedEmployees.size === filteredEmployees.length) {
            setSelectedEmployees(new Set());
        } else {
            setSelectedEmployees(new Set(filteredEmployees.map((employee) => employee.id)));
        }
    };

    const handleSubmit = async () => {
        if (!selectedTemplate || selectedEmployees.size === 0) {
            return;
        }

        const template = templates.find((entry) => entry.id === selectedTemplate);
        if (!template) {
            return;
        }

        const templateItemIds = template.items.map((item) => item.id).filter((id) => id.length > 0);
        if (templateItemIds.length === 0) {
            return;
        }

        setIsSubmitting(true);
        setErrorMessage('');
        try {
            if (onAssign) {
                await onAssign(selectedTemplate, templateItemIds, Array.from(selectedEmployees));
            } else {
                const response = await fetch('/api/hr/compliance/assign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        templateId: selectedTemplate,
                        templateItemIds,
                        userIds: Array.from(selectedEmployees),
                    }),
                });
                if (!response.ok) {
                    const payload = (await response.json()) as { error?: string } | null;
                    throw new Error(payload?.error ?? 'Unable to assign compliance items.');
                }
            }
            setOpen(false);
            setSelectedTemplate('');
            setSelectedEmployees(new Set());
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Unable to assign compliance items.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedTemplateObject = templates.find((t) => t.id === selectedTemplate);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Bulk Assign
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Bulk Assign Compliance Template
                    </DialogTitle>
                    <DialogDescription>
                        Select a template and employees to assign compliance items in bulk.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {errorMessage ? (
                        <p className="text-sm text-destructive" role="alert">
                            {errorMessage}
                        </p>
                    ) : null}
                    {/* Template Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="bulk-template-select">Template</Label>
                        <select
                            id="bulk-template-select"
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedTemplate}
                            aria-label="Select compliance template"
                            onChange={(event) => setSelectedTemplate(event.target.value)}
                        >
                            <option value="">Select a template...</option>
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {template.name} ({template.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Employee Selection */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label>Employees ({selectedEmployees.size} selected)</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleSelectAll}
                                type="button"
                            >
                                {selectedEmployees.size === filteredEmployees.length
                                    ? 'Deselect All'
                                    : 'Select All'}
                            </Button>
                        </div>
                        <Input
                            placeholder="Search employees..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                        <ScrollArea className="h-[200px] rounded-md border p-2">
                            {filteredEmployees.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredEmployees.map((employee) => (
                                        <label
                                            key={employee.id}
                                            className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted cursor-pointer"
                                        >
                                            <Checkbox
                                                checked={selectedEmployees.has(employee.id)}
                                                onCheckedChange={() =>
                                                    handleToggleEmployee(employee.id)
                                                }
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {employee.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {employee.department}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                    No employees found
                                </p>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Summary */}
                    {selectedTemplateObject && selectedEmployees.size > 0 ? (
                        <div className="rounded-lg bg-muted p-3">
                            <p className="text-sm">
                                Assign <Badge variant="secondary">{selectedTemplateObject.name}</Badge>{' '}
                                to{' '}
                                <Badge variant="secondary">
                                    {selectedEmployees.size} employee(s)
                                </Badge>
                                {' '}• {selectedTemplateObject.items.length} item(s)
                            </p>
                        </div>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            !selectedTemplate || selectedEmployees.size === 0 || isSubmitting
                        }
                    >
                        <Check className="h-4 w-4 mr-2" />
                        {isSubmitting ? 'Assigning...' : 'Assign'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
