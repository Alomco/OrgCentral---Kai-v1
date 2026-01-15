import type { NotificationDispatchPayload } from '@/server/types/notification-dispatch';

export interface RenderedNotificationContent {
    subject: string;
    content: string;
    isHtml: boolean;
    brandName?: string;
    from?: string;
    useTracker?: boolean;
}

export type NotificationTemplateResolver = (
    payload: NotificationDispatchPayload,
) => RenderedNotificationContent;

const dateFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long' });

const templateRegistry: Record<string, NotificationTemplateResolver> = {
    'hr.compliance.reminder': renderComplianceReminder,
    'hr.leave.approved': renderLeaveApproved,
};

export const defaultNotificationTemplateResolver: NotificationTemplateResolver = (payload) => {
    const renderer = templateRegistry[payload.templateKey] ?? renderFallbackTemplate;
    return renderer(payload);
};

type UnknownRecord = Record<string, unknown>;

function renderComplianceReminder(payload: NotificationDispatchPayload): RenderedNotificationContent {
    const data = payload.data ?? {};
    const title = safeString(data.title) ?? 'Compliance Reminder';
    const message = safeString(data.message) ?? 'You have compliance tasks that need attention.';
    const items = Array.isArray(data.items)
        ? (data.items as unknown[]).filter((item): item is UnknownRecord => typeof item === 'object' && item !== null)
        : [];

    const rows = items
        .slice(0, 5)
        .map((item) => {
            const category = safeString(item.categoryKey) ?? 'Item';
            const dueDate = formatDate(item.dueDate);
            const status = safeString(item.status) ?? 'pending';
            return `<li><strong>${escapeHtml(category)}</strong> – due ${escapeHtml(dueDate)} (${escapeHtml(status)})</li>`;
        })
        .join('');

    const content = `
        <h1 style="font-size:18px;margin-bottom:8px;">${escapeHtml(title)}</h1>
        <p style="margin-bottom:16px;">${escapeHtml(message)}</p>
        ${rows ? `<ul style="padding-left:18px;margin:0 0 12px 0;">${rows}</ul>` : ''}
        <p style="color:#6b7280;font-size:13px;">Reference date: ${escapeHtml(formatDate(data.referenceDate))}</p>
    `;

    return {
        subject: title,
        content,
        isHtml: true,
    };
}

function renderLeaveApproved(payload: NotificationDispatchPayload): RenderedNotificationContent {
    const data = payload.data ?? {};
    const leaveType = safeString(data.leaveType) ?? 'Leave';
    const totalDays = Number(data.totalDays) || Number(data.totalDays) === 0 ? String(data.totalDays) : undefined;
    const startDate = formatDate(data.startDate);
    const endDate = formatDate(data.endDate);
    const approver = safeString(data.approverId);

    const subject = `${leaveType} request approved`;
    const content = `
        <h1 style="font-size:18px;margin-bottom:8px;">Your leave was approved</h1>
        <p style="margin-bottom:8px;">${escapeHtml(leaveType)} from ${escapeHtml(startDate)} to ${escapeHtml(endDate)} has been approved.</p>
        ${totalDays ? `<p style="margin-bottom:8px;">Duration: ${escapeHtml(totalDays)} day(s).</p>` : ''}
        ${approver ? `<p style="margin-bottom:8px;">Approved by: ${escapeHtml(approver)}</p>` : ''}
    `;

    return {
        subject,
        content,
        isHtml: true,
    };
}

function renderFallbackTemplate(payload: NotificationDispatchPayload): RenderedNotificationContent {
    const subject = `Notification: ${payload.templateKey}`;
    const content = `
        <h1 style="font-size:18px;margin-bottom:8px;">${escapeHtml(subject)}</h1>
        <pre style="background:#f3f4f6;padding:12px;border-radius:8px;white-space:pre-wrap;font-size:13px;">
${escapeHtml(JSON.stringify(payload.data ?? {}, null, 2))}
        </pre>
    `;
    return {
        subject,
        content,
        isHtml: true,
    };
}

function safeString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function formatDate(value: unknown): string {
    if (typeof value === 'string') {
        const parsed = new Date(value);
        if (!Number.isNaN(parsed.getTime())) {
            return dateFormatter.format(parsed);
        }
        return value;
    }
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return dateFormatter.format(value);
    }
    return 'Unknown date';
}

function escapeHtml(value: string): string {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
