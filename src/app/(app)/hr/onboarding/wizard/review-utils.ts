export const EMPLOYMENT_TYPE_LABELS: Record<string, string> = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
    TEMPORARY: 'Temporary',
    INTERN: 'Intern',
};

export const PAY_SCHEDULE_LABELS: Record<string, string> = {
    MONTHLY: 'Monthly',
    BI_WEEKLY: 'Bi-weekly',
};

export const SALARY_BASIS_LABELS: Record<string, string> = {
    ANNUAL: 'Annual',
    HOURLY: 'Hourly',
};

export const LEAVE_TYPE_LABELS: Partial<Record<string, string>> = {
    ANNUAL: 'Annual Leave',
    SICK: 'Sick Leave',
    MATERNITY: 'Maternity Leave',
    PATERNITY: 'Paternity Leave',
    ADOPTION: 'Adoption Leave',
    UNPAID: 'Unpaid Leave',
    SPECIAL: 'Special Leave',
    EMERGENCY: 'Emergency Leave',
};

export function formatCurrency(amount: number, currency = 'GBP'): string {
    return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(dateString: string | undefined): string {
    if (!dateString) {
        return 'N/A';
    }
    try {
        return new Date(dateString).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return dateString;
    }
}
