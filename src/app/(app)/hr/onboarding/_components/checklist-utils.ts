export function formatChecklistDate(date: Date | string | null | undefined): string {
    if (!date) { return ''; }
    const parsed = typeof date === 'string' ? new Date(date) : date;
    return parsed.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}
