export interface NotificationEmailPayload {
    to: string;
    subject: string;
    content: string;
    isHtml: boolean;
    brandName?: string;
    from?: string;
    useTracker?: boolean;
    correlationId?: string;
}

export interface NotificationEmailResult {
    messageId?: string;
    status: 'sent' | 'queued';
    detail?: string;
}

export interface NotificationEmailProvider {
    sendEmail(payload: NotificationEmailPayload): Promise<NotificationEmailResult>;
}
