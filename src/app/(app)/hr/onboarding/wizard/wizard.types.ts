export interface WizardSubmitResult {
    success: boolean;
    token?: string;
    invitationUrl?: string;
    emailDelivered?: boolean;
    message?: string;
    error?: string;
}

export interface EmailCheckResult {
    exists: boolean;
    reason?: string;
    actionUrl?: string;
    actionLabel?: string;
}

export interface ManagerOption {
    employeeNumber: string;
    displayName: string;
    email?: string | null;
}
