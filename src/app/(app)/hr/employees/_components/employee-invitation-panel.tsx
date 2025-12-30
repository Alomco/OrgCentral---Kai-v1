'use client';

import { useState } from 'react';
import { Mail, UserPlus, Send, Copy, Check, X, Loader2 } from 'lucide-react';

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
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InvitationFormData {
    email: string;
    firstName: string;
    lastName: string;
    department: string;
    role: string;
}

interface PendingInvite {
    id: string;
    email: string;
    name: string;
    status: 'pending' | 'accepted' | 'expired';
    sentAt: Date;
    expiresAt: Date;
}

interface EmployeeInvitationPanelProps {
    departments?: string[];
    roles?: string[];
    pendingInvites?: PendingInvite[];
    onSendInvite?: (data: InvitationFormData) => Promise<void>;
    onResendInvite?: (id: string) => Promise<void>;
    onCancelInvite?: (id: string) => Promise<void>;
}

const DEFAULT_ROLES = ['Employee', 'Manager', 'HR Admin'];

export function EmployeeInvitationPanel({
    departments = [],
    roles = DEFAULT_ROLES,
    pendingInvites = [],
    onSendInvite,
    onResendInvite,
    onCancelInvite,
}: EmployeeInvitationPanelProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copied, setCopied] = useState(false);
    const [formData, setFormData] = useState<InvitationFormData>({
        email: '',
        firstName: '',
        lastName: '',
        department: '',
        role: 'Employee',
    });

    const handleSubmit = async () => {
        if (!formData.email || !formData.firstName || !onSendInvite) {return;}

        setIsSubmitting(true);
        try {
            await onSendInvite(formData);
            setDialogOpen(false);
            setFormData({
                email: '',
                firstName: '',
                lastName: '',
                department: '',
                role: 'Employee',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyLink = () => {
        // Placeholder - would copy actual invite link
        navigator.clipboard.writeText(`${window.location.origin}/invite/sample-token`);
        setCopied(true);
        setTimeout(() => { setCopied(false); }, 2000);
    };

    const activeInvites = pendingInvites.filter((index) => index.status === 'pending');
    const expiredInvites = pendingInvites.filter((index) => index.status === 'expired');

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-base flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Employee Invitations
                    </CardTitle>
                    <CardDescription>
                        Invite new employees to join your organization
                    </CardDescription>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
                                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); }}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="firstName">First Name *</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        value={formData.firstName}
                                        onChange={(e) => { setFormData({ ...formData, firstName: e.target.value }); }}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        value={formData.lastName}
                                        onChange={(e) => { setFormData({ ...formData, lastName: e.target.value }); }}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="department">Department</Label>
                                <Select
                                    value={formData.department}
                                    onValueChange={(value) => { setFormData({ ...formData, department: value }); }}
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
                                    onValueChange={(value) => { setFormData({ ...formData, role: value }); }}
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
                            <Button variant="outline" onClick={handleCopyLink}>
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
                                onClick={handleSubmit}
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
            </CardHeader>

            <CardContent>
                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="pending">
                            Pending
                            {activeInvites.length > 0 ? (
                                <Badge variant="secondary" className="ml-2">
                                    {activeInvites.length}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                        <TabsTrigger value="expired">
                            Expired
                            {expiredInvites.length > 0 ? (
                                <Badge variant="outline" className="ml-2">
                                    {expiredInvites.length}
                                </Badge>
                            ) : null}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="mt-4">
                        {activeInvites.length > 0 ? (
                            <div className="space-y-2">
                                {activeInvites.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">{invite.name}</p>
                                            <p className="text-xs text-muted-foreground">{invite.email}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => { onResendInvite?.(invite.id); }}
                                            >
                                                <Send className="h-3 w-3 mr-1" />
                                                Resend
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => { onCancelInvite?.(invite.id); }}
                                            >
                                                <X className="h-3 w-3 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <Mail className="h-8 w-8 text-muted-foreground/50 mb-2" />
                                <p className="text-sm font-medium">No Pending Invitations</p>
                                <p className="text-xs text-muted-foreground">
                                    Click &quot;Invite Employee&quot; to send a new invitation
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="expired" className="mt-4">
                        {expiredInvites.length > 0 ? (
                            <div className="space-y-2">
                                {expiredInvites.map((invite) => (
                                    <div
                                        key={invite.id}
                                        className="flex items-center justify-between rounded-lg border p-3 opacity-60"
                                    >
                                        <div>
                                            <p className="text-sm font-medium">{invite.name}</p>
                                            <p className="text-xs text-muted-foreground">{invite.email}</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => { onResendInvite?.(invite.id); }}
                                        >
                                            <Send className="h-3 w-3 mr-1" />
                                            Resend
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-6 text-center">
                                <Check className="h-8 w-8 text-emerald-500 mb-2" />
                                <p className="text-sm font-medium">All Clear</p>
                                <p className="text-xs text-muted-foreground">
                                    No expired invitations
                                </p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    );
}
