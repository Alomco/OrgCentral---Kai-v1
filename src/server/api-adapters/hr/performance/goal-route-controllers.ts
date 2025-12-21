import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';

import { deletePerformanceGoalController } from './delete-performance-goal';
import { updatePerformanceGoalController } from './update-performance-goal';

const GOAL_ID_REQUIRED_MESSAGE = 'Performance goal id is required.';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function updatePerformanceGoalRouteController(request: Request, goalId: string) {
    if (!goalId) {
        throw new ValidationError(GOAL_ID_REQUIRED_MESSAGE);
    }

    const body: unknown = await readJson(request);

    return updatePerformanceGoalController({
        headers: request.headers,
        input: {
            ...(isRecord(body) ? body : {}),
            goalId,
        },
        auditSource: 'api:hr:performance:goal:update',
    });
}

export async function deletePerformanceGoalRouteController(request: Request, goalId: string) {
    if (!goalId) {
        throw new ValidationError(GOAL_ID_REQUIRED_MESSAGE);
    }

    return deletePerformanceGoalController({
        headers: request.headers,
        input: { goalId },
        auditSource: 'api:hr:performance:goal:delete',
    });
}
