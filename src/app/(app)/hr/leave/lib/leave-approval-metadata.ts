export interface LeaveApprovalMetadata {
    slaDays?: number;
    fallbackName?: string;
    notes?: string;
}

export function parseLeaveApprovalMetadata(metadata: unknown): LeaveApprovalMetadata {
    if (!metadata || typeof metadata !== 'object') {return {};}
    const record = metadata as Record<string, unknown>;
    const candidate = (() => {
        if (record.leaveApproval && typeof record.leaveApproval === 'object') {
            return record.leaveApproval as Record<string, unknown>;
        }
        if (record.approvals && typeof record.approvals === 'object') {
            const approvals = record.approvals as Record<string, unknown>;
            if (approvals.leave && typeof approvals.leave === 'object') {
                return approvals.leave as Record<string, unknown>;
            }
        }
        return null;
    })();

    if (!candidate) {return {};}

    const sla = Number.isFinite((candidate as { slaDays?: unknown }).slaDays)
        ? Number((candidate as { slaDays?: unknown }).slaDays)
        : undefined;
    const fallbackName = typeof (candidate as { fallbackName?: unknown }).fallbackName === 'string'
        ? (candidate as { fallbackName?: string }).fallbackName
        : undefined;
    const notes = typeof (candidate as { notes?: unknown }).notes === 'string'
        ? (candidate as { notes?: string }).notes
        : undefined;

    return { slaDays: sla, fallbackName, notes };
}
