import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function getStatusDetails(status: string): {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: typeof CheckCircle;
} {
    switch (status) {
        case 'COMPLETED':
            return { label: 'Completed', variant: 'default', icon: CheckCircle };
        case 'PENDING':
            return { label: 'Pending', variant: 'secondary', icon: Clock };
        case 'OVERDUE':
            return { label: 'Overdue', variant: 'destructive', icon: AlertTriangle };
        case 'EXPIRED':
            return { label: 'Expired', variant: 'destructive', icon: AlertTriangle };
        default:
            return { label: status, variant: 'outline', icon: Clock };
    }
}

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) { return '—'; }
    const resolvedDate = date instanceof Date ? date : new Date(date);
    return resolvedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

