import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { OnboardingInvitation } from '@/server/repositories/contracts/hr/onboarding/invitation-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getOnboardingInvitationsForUi } from '@/server/use-cases/hr/onboarding/invitations/get-onboarding-invitations.cached';

import { formatHumanDateTime } from '../../_components/format-date';
import { onboardingInvitationStatusBadgeVariant } from '../../_components/hr-badge-variants';
import { OnboardingInvitationActions } from './onboarding-invitation-actions';

export interface OnboardingInvitationsPanelProps {
    authorization: RepositoryAuthorizationContext;
}

function describeExpiry(invite: OnboardingInvitation): string {
    if (!invite.expiresAt) {
        return 'No expiry';
    }

    return formatHumanDateTime(invite.expiresAt);
}

function formatInvitationStatus(status: OnboardingInvitation['status']): string {
    return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

export async function OnboardingInvitationsPanel({ authorization }: OnboardingInvitationsPanelProps) {
    const result = await getOnboardingInvitationsForUi({ authorization, limit: 25 });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Invitations</CardTitle>
                <CardDescription>
                    Manage onboarding invitations. Tokens are not shown here.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {result.invitations.length === 0 ? (
                    <div className="text-sm text-muted-foreground">No invitations found.</div>
                ) : (
                    <div className="overflow-auto rounded-md border">
                        <Table className="min-w-[720px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[260px]">Email</TableHead>
                                    <TableHead className="w-[140px]">Status</TableHead>
                                    <TableHead className="w-[180px]">Created</TableHead>
                                    <TableHead className="w-[180px]">Expires</TableHead>
                                    <TableHead className="text-right w-[320px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.invitations.map((invite) => (
                                    <TableRow key={invite.token}>
                                        <TableCell className="font-medium max-w-[260px]">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="block truncate">{invite.targetEmail}</span>
                                                    </TooltipTrigger>
                                                    <TooltipContent>{invite.targetEmail}</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={onboardingInvitationStatusBadgeVariant(invite.status)}>
                                                {formatInvitationStatus(invite.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            {formatHumanDateTime(invite.createdAt)}
                                        </TableCell>
                                        <TableCell className="whitespace-nowrap">{describeExpiry(invite)}</TableCell>
                                        <TableCell className="text-right align-top">
                                            {invite.status === 'pending' ? (
                                                <OnboardingInvitationActions
                                                    token={invite.token}
                                                    email={invite.targetEmail}
                                                />
                                            ) : (
                                                <span className="text-xs text-muted-foreground">N/A</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
