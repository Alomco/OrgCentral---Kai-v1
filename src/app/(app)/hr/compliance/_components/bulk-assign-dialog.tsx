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

interface Employee {
    id: string;
    name: string;
    department: string;
}

interface Template {
    id: string;
    name: string;
    category: string;
}

interface BulkAssignDialogProps {
    templates: Template[];
    employees: Employee[];
    onAssign?: (templateId: string, employeeIds: string[]) => Promise<void>;
}

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
            setSelectedEmployees(new Set(filteredEmployees.map((e) => e.id)));
        }
    };

    const handleSubmit = async () => {
        if (!selectedTemplate || selectedEmployees.size === 0 || !onAssign) { return; }

        setIsSubmitting(true);
        try {
            await onAssign(selectedTemplate, Array.from(selectedEmployees));
            setOpen(false);
            setSelectedTemplate('');
            setSelectedEmployees(new Set());
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
                    {/* Template Selection */}
                    <div className="space-y-2">
                        <Label>Template</Label>
                        <select
                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
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
                            onChange={(e) => setSearch(e.target.value)}
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
