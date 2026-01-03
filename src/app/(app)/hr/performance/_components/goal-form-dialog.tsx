'use client';

import { useState } from 'react';
import { Target, Loader2, Plus } from 'lucide-react';

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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

interface GoalFormDialogProps {
    goal?: GoalData;
    onSubmit?: (data: GoalData) => Promise<void>;
    trigger?: React.ReactNode;
}

export interface GoalData {
    id?: string;
    title: string;
    description: string;
    category: string;
    dueDate: string;
    progress: number;
}

const GOAL_CATEGORIES = [
    { value: 'professional', label: 'Professional Development' },
    { value: 'technical', label: 'Technical Skills' },
    { value: 'leadership', label: 'Leadership' },
    { value: 'project', label: 'Project Delivery' },
    { value: 'personal', label: 'Personal Growth' },
];

export function GoalFormDialog({ goal, onSubmit, trigger }: GoalFormDialogProps) {
    const isEditing = Boolean(goal?.id);
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<GoalData>({
        id: goal?.id,
        title: goal?.title ?? '',
        description: goal?.description ?? '',
        category: goal?.category ?? 'professional',
        dueDate: goal?.dueDate ?? getDefaultDueDate(),
        progress: goal?.progress ?? 0,
    });

    function getDefaultDueDate(): string {
        const date = new Date();
        date.setMonth(date.getMonth() + 3); // Default to 3 months from now
        return date.toISOString().slice(0, 10);
    }

    const handleChange = <K extends keyof GoalData>(field: K, value: GoalData[K]) => {
        setFormData((previous) => ({ ...previous, [field]: value }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!onSubmit) { return; }

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            setOpen(false);
            if (!isEditing) {
                setFormData({
                    title: '',
                    description: '',
                    category: 'professional',
                    dueDate: getDefaultDueDate(),
                    progress: 0,
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid = formData.title.trim() !== '' && formData.dueDate !== '';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        {isEditing ? 'Edit Goal' : 'Add Goal'}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {isEditing ? 'Edit Goal' : 'Create New Goal'}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? 'Update your goal details and track progress'
                            : 'Set a new goal to track your performance'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Goal Title *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(event) => handleChange('title', event.target.value)}
                                placeholder="e.g., Complete AWS Certification"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(event) => handleChange('description', event.target.value)}
                                placeholder="Describe what you want to achieve..."
                                rows={3}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => handleChange('category', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {GOAL_CATEGORIES.map((cat) => (
                                            <SelectItem key={cat.value} value={cat.value}>
                                                {cat.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dueDate">Due Date *</Label>
                                <Input
                                    id="dueDate"
                                    type="date"
                                    value={formData.dueDate}
                                    onChange={(event) => handleChange('dueDate', event.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {isEditing ? (
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <Label>Progress</Label>
                                    <span className="text-sm font-medium">{formData.progress}%</span>
                                </div>
                                <Slider
                                    value={[formData.progress]}
                                    onValueChange={([value]) => handleChange('progress', value)}
                                    max={100}
                                    step={5}
                                    className="py-2"
                                />
                            </div>
                        ) : null}
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!isValid || isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {isEditing ? 'Saving...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Target className="h-4 w-4 mr-2" />
                                    {isEditing ? 'Save Changes' : 'Create Goal'}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
