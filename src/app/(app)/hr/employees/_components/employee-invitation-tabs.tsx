import { Check, Mail, Send, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { PendingInvite } from './employee-invitation-types';

interface EmployeeInvitationTabsProps {
    activeInvites: PendingInvite[];
    expiredInvites: PendingInvite[];
    onResendInvite?: (id: string) => Promise<void>;
    onCancelInvite?: (id: string) => Promise<void>;
}

export function EmployeeInvitationTabs({
    activeInvites,
    expiredInvites,
    onResendInvite,
    onCancelInvite,
}: EmployeeInvitationTabsProps) {
    return (
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
                                        onClick={async () => {
                                            if (onResendInvite) {
                                                await onResendInvite(invite.id);
                                            }
                                        }}
                                    >
                                        <Send className="h-3 w-3 mr-1" />
                                        Resend
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7"
                                        onClick={async () => {
                                            if (onCancelInvite) {
                                                await onCancelInvite(invite.id);
                                            }
                                        }}
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
                                    onClick={async () => {
                                        if (onResendInvite) {
                                            await onResendInvite(invite.id);
                                        }
                                    }}
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
    );
}
