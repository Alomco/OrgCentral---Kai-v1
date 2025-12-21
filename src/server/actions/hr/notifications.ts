'use server';

import { toActionState, type ActionState } from '@/server/actions/action-state';
import { authAction } from '@/server/actions/auth-action';
import { emitHrNotification } from '@/server/use-cases/hr/notifications/notification-emitter';
import { HR_NOTIFICATION_PRIORITY_VALUES, HR_NOTIFICATION_TYPE_VALUES } from '@/server/types/hr/notifications';

const AUDIT_PREFIX = 'action:hr:notifications:emit';
const RESOURCE_TYPE = 'hr.notifications';

export interface EmitNotificationInput {
    userId: string;
    title: string;
    message: string;
    type?: (typeof HR_NOTIFICATION_TYPE_VALUES)[number];
    priority?: (typeof HR_NOTIFICATION_PRIORITY_VALUES)[number];
    actionUrl?: string | null;
    metadata?: Record<string, unknown>;
}

export async function emitHrNotificationAction(
    input: unknown,
): Promise<ActionState<{ success: true }>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { organization: ['update'] },
                auditSource: AUDIT_PREFIX,
                action: 'create',
                resourceType: RESOURCE_TYPE,
                resourceAttributes: {
                    targetUserId: isRecord(input) ? input.userId : undefined,
                    type: isRecord(input) ? input.type : undefined,
                },
            },
            async ({ authorization }) => {
                const shaped = parseInput(input);

                await emitHrNotification(
                    {},
                    {
                        authorization,
                        notification: {
                            userId: shaped.userId,
                            title: shaped.title,
                            message: shaped.message,
                            type: shaped.type ?? 'system-announcement',
                            priority: shaped.priority ?? 'medium',
                            actionUrl: shaped.actionUrl ?? undefined,
                            metadata: shaped.metadata,
                        },
                    },
                );

                return { success: true };
            },
        ),
    );
}

function parseInput(input: unknown): EmitNotificationInput {
    if (!isRecord(input)) {
        throw new Error('Invalid notification payload');
    }

    if (typeof input.userId !== 'string' || input.userId.length === 0) {
        throw new Error('userId is required');
    }
    if (typeof input.title !== 'string' || input.title.length === 0) {
        throw new Error('title is required');
    }
    if (typeof input.message !== 'string' || input.message.length === 0) {
        throw new Error('message is required');
    }

    const type = typeof input.type === 'string' ? input.type : undefined;
    const priority = typeof input.priority === 'string' ? input.priority : undefined;

    if (type && !HR_NOTIFICATION_TYPE_VALUES.includes(type as (typeof HR_NOTIFICATION_TYPE_VALUES)[number])) {
        throw new Error('Invalid notification type');
    }
    if (priority && !HR_NOTIFICATION_PRIORITY_VALUES.includes(priority as (typeof HR_NOTIFICATION_PRIORITY_VALUES)[number])) {
        throw new Error('Invalid notification priority');
    }

    return {
        userId: input.userId,
        title: input.title,
        message: input.message,
        type: type as (typeof HR_NOTIFICATION_TYPE_VALUES)[number] | undefined,
        priority: priority as (typeof HR_NOTIFICATION_PRIORITY_VALUES)[number] | undefined,
        actionUrl: typeof input.actionUrl === 'string' ? input.actionUrl : null,
        metadata: isRecord(input.metadata) ? input.metadata : undefined,
    };
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
