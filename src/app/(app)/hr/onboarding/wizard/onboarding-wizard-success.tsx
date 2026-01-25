import { Send } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface OnboardingWizardSuccessProps {
    email: string;
    role: string;
    token?: string | null;
    invitationUrl?: string | null;
    emailDelivered?: boolean;
    message?: string | null;
    onCancel?: () => void;
}

export function OnboardingWizardSuccess({
    email,
    role,
    token,
    invitationUrl,
    emailDelivered = true,
    message,
    onCancel,
}: OnboardingWizardSuccessProps) {
    const heading = emailDelivered ? 'Invitation Sent!' : 'Invitation Created';
    const detail = message ?? (emailDelivered
        ? `The invitation has been sent to ${email}.`
        : 'The invitation was created, but the email could not be delivered.');

    return (
        <Card>
            <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                    <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-xl font-semibold">{heading}</h2>
                <p className="text-sm text-muted-foreground">{detail}</p>
                <p className="text-xs text-muted-foreground">Recipient: {email}</p>
            </CardHeader>
            <CardContent className="space-y-4">
                {!emailDelivered && (
                    <Alert variant="destructive">
                        <AlertTitle>Share the invite link</AlertTitle>
                        <AlertDescription>
                            Copy the invitation URL below and send it to the invitee manually.
                        </AlertDescription>
                    </Alert>
                )}
                {invitationUrl && (
                    <div className="rounded-lg border bg-muted/50 p-4">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Invitation link
                        </p>
                        <code className="block break-all text-sm">{invitationUrl}</code>
                    </div>
                )}
                {token && (
                    <div className="rounded-lg border bg-muted/50 p-4">
                        <p className="mb-2 text-xs font-medium text-muted-foreground">
                            Invitation token (for manual sharing)
                        </p>
                        <code className="block break-all text-sm">{token}</code>
                    </div>
                )}
                <Alert>
                    <AlertTitle>Next steps</AlertTitle>
                    <AlertDescription>
                        {emailDelivered
                            ? `The invitee will receive an email with instructions to accept the ${role} invitation.`
                            : `Once the invitee accepts the ${role} invitation, their access will be activated.`}
                    </AlertDescription>
                </Alert>
            </CardContent>
            {onCancel ? (
                <CardFooter className="justify-center">
                    <Button onClick={onCancel} variant="outline">
                        Close
                    </Button>
                </CardFooter>
            ) : null}
        </Card>
    );
}
