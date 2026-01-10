import { Check, Copy, Loader2, Mail, Send } from 'lucide-react';

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

import type { InvitationFormData } from './employee-invitation-types';

interface EmployeeInvitationDialogProps {
    dialogOpen: boolean;
    onDialogOpenChange: (open: boolean) => void;
    formData: InvitationFormData;
    onFormDataChange: (updates: Partial<InvitationFormData>) => void;
    departments: string[];
    roles: string[];
    copied: boolean;
    isSubmitting: boolean;
    onCopyLink: () => Promise<void>;
    onSubmit: () => Promise<void>;
}

export function EmployeeInvitationDialog({
    dialogOpen,
    onDialogOpenChange,
    formData,
    onFormDataChange,
    departments,
    roles,
    copied,
    isSubmitting,
    onCopyLink,
    onSubmit,
}: EmployeeInvitationDialogProps) {
    return (
        <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Mail className="h-4 w-4 mr-2" />
                    Invite Employee
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Invite New Employee</DialogTitle>
                    <DialogDescription>
                        Send an invitation email to a new employee. They can join and complete their profile.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="employee@company.com"
                            value={formData.email}
                            onChange={(event) => { onFormDataChange({ email: event.target.value }); }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="firstName">First Name *</Label>
                            <Input
                                id="firstName"
                                placeholder="John"
                                value={formData.firstName}
                                onChange={(event) => { onFormDataChange({ firstName: event.target.value }); }}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="Doe"
                                value={formData.lastName}
                                onChange={(event) => { onFormDataChange({ lastName: event.target.value }); }}
                            />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="department">Department</Label>
                        <Select
                            value={formData.department}
                            onValueChange={(value) => { onFormDataChange({ department: value }); }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department..." />
                            </SelectTrigger>
                            <SelectContent>
                                {departments.length > 0 ? (
                                    departments.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="general">General</SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="role">Role</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => { onFormDataChange({ role: value }); }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {roles.map((role) => (
                                    <SelectItem key={role} value={role}>
                                        {role}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <DialogFooter className="flex justify-between sm:justify-between">
                    <Button variant="outline" onClick={onCopyLink}>
                        {copied ? (
                            <>
                                <Check className="h-4 w-4 mr-2" />
                                Copied!
                            </>
                        ) : (
                            <>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy Link
                            </>
                        )}
                    </Button>
                    <Button
                        onClick={onSubmit}
                        disabled={!formData.email || !formData.firstName || isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4 mr-2" />
                        )}
                        Send Invite
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
