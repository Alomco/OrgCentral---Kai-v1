import { describe, expect, it } from 'vitest';
import { defaultNotificationTemplateResolver } from '@/server/services/notifications/templates/notification-template-registry';
import type { NotificationDispatchPayload } from '@/server/types/notification-dispatch';

describe('defaultNotificationTemplateResolver', () => {
    it('renders compliance reminder template', () => {
        const payload: NotificationDispatchPayload = {
            templateKey: 'hr.compliance.reminder',
            channel: 'EMAIL',
            recipient: { email: 'user@example.com' },
            data: {
                title: 'Compliance task due soon',
                message: 'Please upload the required policy document.',
                referenceDate: '2025-01-01T00:00:00.000Z',
                items: [
                    { categoryKey: 'policy', status: 'pending', dueDate: '2025-01-02T00:00:00.000Z' },
                ],
            },
        };

        const rendered = defaultNotificationTemplateResolver(payload);
        expect(rendered.subject).toBe('Compliance task due soon');
        expect(rendered.isHtml).toBe(true);
        expect(rendered.content).toContain('Please upload the required policy document.');
        expect(rendered.content).toContain('policy');
    });

    it('falls back to default template when key is unknown', () => {
        const payload: NotificationDispatchPayload = {
            templateKey: 'custom.template',
            channel: 'EMAIL',
            recipient: { email: 'user@example.com' },
            data: { foo: 'bar' },
        };

        const rendered = defaultNotificationTemplateResolver(payload);
        expect(rendered.subject).toBe('Notification: custom.template');
        expect(rendered.content).toContain('&quot;foo&quot;: &quot;bar&quot;');
    });
});
