'use client';

import { useState } from 'react';
import { UserPlus, Loader2 } from 'lucide-react';

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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface AddEmployeeDialogProps {
    onSubmit?: (data: AddEmployeeData) => Promise<void>;
    trigger?: React.ReactNode;
}

export interface AddEmployeeData {
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string;
    department: string;
    employmentType: string;
    startDate: string;
}

const EMPLOYMENT_TYPES = [
    { value: 'FULL_TIME', label: 'Full Time' },
    { value: 'PART_TIME', label: 'Part Time' },
    { value: 'CONTRACTOR', label: 'Contractor' },
    { value: 'INTERN', label: 'Intern' },
];

export function AddEmployeeDialog({ onSubmit, trigger }: AddEmployeeDialogProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<AddEmployeeData>({
        firstName: '',
        lastName: '',
        email: '',
        jobTitle: '',
        department: '',
        employmentType: 'FULL_TIME',
        startDate: new Date().toISOString().slice(0, 10),
    });

    const handleChange = (field: keyof AddEmployeeData, value: string) => {
        setFormData((previous) => ({ ...previous, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!onSubmit) {return;}

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            setOpen(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                jobTitle: '',
                department: '',
                employmentType: 'FULL_TIME',
                startDate: new Date().toISOString().slice(0, 10),
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isValid =
        formData.firstName.trim() !== '' &&
        formData.lastName.trim() !== '' &&
        formData.email.trim() !== '' &&
        formData.startDate !== '';

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ?? (
                    <Button>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Employee
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Employee</DialogTitle>
                    <DialogDescription>
                        Enter the details for the new employee. They will receive an
                        invitation email.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={(e) => handleChange('firstName', e.target.value)}
                                    placeholder="John"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={(e) => handleChange('lastName', e.target.value)}
                                    placeholder="Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                placeholder="john.doe@company.com"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">Job Title</Label>
                                <Input
                                    id="jobTitle"
                                    value={formData.jobTitle}
                                    onChange={(e) => handleChange('jobTitle', e.target.value)}
                                    placeholder="Software Engineer"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="department">Department</Label>
                                <Input
                                    id="department"
                                    value={formData.department}
                                    onChange={(e) => handleChange('department', e.target.value)}
                                    placeholder="Engineering"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="employmentType">Employment Type</Label>
                                <Select
                                    value={formData.employmentType}
                                    onValueChange={(value) =>
                                        handleChange('employmentType', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {EMPLOYMENT_TYPES.map((type) => (
                                            <SelectItem key={type.value} value={type.value}>
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date *</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={(e) => handleChange('startDate', e.target.value)}
                                    required
                                />
                            </div>
                        </div>
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
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="h-4 w-4 mr-2" />
                                    Add Employee
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
