import { AlertTriangle, CheckCircle, Clock, MinusCircle } from 'lucide-react';
import type { ComplianceItemStatus } from '@/server/types/compliance-types';

export function getStatusDetails(status: ComplianceItemStatus): {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: typeof CheckCircle;
} {
    switch (status) {
        case 'COMPLETE':
            return { label: 'Complete', variant: 'default', icon: CheckCircle };
        case 'PENDING':
            return { label: 'Pending', variant: 'secondary', icon: Clock };
        case 'PENDING_REVIEW':
            return { label: 'Pending review', variant: 'secondary', icon: Clock };
        case 'MISSING':
            return { label: 'Missing', variant: 'destructive', icon: AlertTriangle };
        case 'EXPIRED':
            return { label: 'Expired', variant: 'destructive', icon: AlertTriangle };
        case 'NOT_APPLICABLE':
            return { label: 'Not applicable', variant: 'outline', icon: MinusCircle };
    }
}

export function formatDate(date: Date | string | null | undefined): string {
    if (!date) {
        return '—';
    }
    const resolvedDate = date instanceof Date ? date : new Date(date);
    if (Number.isNaN(resolvedDate.getTime())) {
        return '—';
    }
    return resolvedDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

