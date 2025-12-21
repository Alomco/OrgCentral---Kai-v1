import { BaseTypedError } from '@/server/errors';

export interface ActionError {
    message: string;
    name?: string;
    code?: string;
    details?: Record<string, unknown>;
}

export type ActionState<TResult> =
    | { success: true; data: TResult }
    | { success: false; error: ActionError };

export async function toActionState<TResult>(
    handler: () => Promise<TResult>,
): Promise<ActionState<TResult>> {
    try {
        const data = await handler();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: serializeActionError(error) };
    }
}

function serializeActionError(error: unknown): ActionError {
    if (error instanceof BaseTypedError) {
        return {
            message: error.message,
            name: error.name,
            code: error.code,
            details: error.details,
        };
    }

    if (error instanceof Error) {
        return {
            message: error.message,
            name: error.name,
        };
    }

    return { message: 'Unknown error' };
}
