import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';
import type { PerformanceGoal, PerformanceReview } from '@/server/domain/hr/performance/types';

import {
    addPerformanceGoalController,
    deletePerformanceReviewByIdController,
    getPerformanceReviewController,
    listPerformanceGoalsByReviewController,
    listPerformanceReviewsByEmployeeController,
    recordPerformanceReviewController,
    updatePerformanceReviewController,
} from '@/server/api-adapters/hr/performance';

interface PerformanceControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}


interface ListPerformanceReviewsControllerResult {
    success: true;
    reviews: PerformanceReview[];
}

interface RecordPerformanceReviewControllerResult {
    success: true;
    review: PerformanceReview;
}

interface GetPerformanceReviewControllerResult {
    success: true;
    review: PerformanceReview | null;
}

interface UpdatePerformanceReviewControllerResult {
    success: true;
    review: PerformanceReview;
}

interface DeletePerformanceReviewControllerResult {
    success: true;
}

interface ListPerformanceGoalsByReviewControllerResult {
    success: true;
    goals: PerformanceGoal[];
}

interface AddPerformanceGoalControllerResult {
    success: true;
    goal: PerformanceGoal;
}

const REVIEW_ID_REQUIRED_MESSAGE = 'Performance review id is required.';

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function listPerformanceReviewsRouteController(
    request: Request,
): Promise<ListPerformanceReviewsControllerResult> {
    const url = new URL(request.url);
    return (listPerformanceReviewsByEmployeeController as unknown as (
        input: PerformanceControllerInput,
    ) => Promise<ListPerformanceReviewsControllerResult>)({
        headers: request.headers,
        input: { employeeId: url.searchParams.get('employeeId') },
        auditSource: 'api:hr:performance:review:list',
    });
}

export async function createPerformanceReviewRouteController(
    request: Request,
): Promise<RecordPerformanceReviewControllerResult> {
    return (recordPerformanceReviewController as unknown as (
        input: PerformanceControllerInput,
    ) => Promise<RecordPerformanceReviewControllerResult>)({
        headers: request.headers,
        input: await readJson(request),
        auditSource: 'api:hr:performance:review:create',
    });
}

export function getPerformanceReviewRouteController(
    request: Request,
    reviewId: string,
): Promise<GetPerformanceReviewControllerResult> {
    if (!reviewId) {
        throw new ValidationError(REVIEW_ID_REQUIRED_MESSAGE);
    }

    return (getPerformanceReviewController as unknown as (
        input: PerformanceControllerInput,
    ) => Promise<GetPerformanceReviewControllerResult>)({
        headers: request.headers,
        input: { id: reviewId },
        auditSource: 'api:hr:performance:review:get',
    });
}

export async function updatePerformanceReviewRouteController(
    request: Request,
    reviewId: string,
): Promise<UpdatePerformanceReviewControllerResult> {
    if (!reviewId) {
        throw new ValidationError(REVIEW_ID_REQUIRED_MESSAGE);
    }

    const body: unknown = await readJson(request);

    return (updatePerformanceReviewController as unknown as (
        input: PerformanceControllerInput,
    ) => Promise<UpdatePerformanceReviewControllerResult>)({
        headers: request.headers,
        input: {
            ...(isRecord(body) ? body : {}),
            id: reviewId,
        },
        auditSource: 'api:hr:performance:review:update',
    });
}

export function deletePerformanceReviewRouteController(
    request: Request,
    reviewId: string,
): Promise<DeletePerformanceReviewControllerResult> {
    if (!reviewId) {
        throw new ValidationError(REVIEW_ID_REQUIRED_MESSAGE);
    }

    return (deletePerformanceReviewByIdController as unknown as (
        input: PerformanceControllerInput,
    ) => Promise<DeletePerformanceReviewControllerResult>)({
        headers: request.headers,
        input: { id: reviewId },
        auditSource: 'api:hr:performance:review:delete',
    });
}

export function listPerformanceGoalsForReviewRouteController(
    request: Request,
    reviewId: string,
): Promise<ListPerformanceGoalsByReviewControllerResult> {
    if (!reviewId) {
        throw new ValidationError(REVIEW_ID_REQUIRED_MESSAGE);
    }

    return (listPerformanceGoalsByReviewController as unknown as (
        input: PerformanceControllerInput,
    ) => Promise<ListPerformanceGoalsByReviewControllerResult>)({
        headers: request.headers,
        input: { reviewId },
        auditSource: 'api:hr:performance:review:goals:list',
    });
}

export async function addPerformanceGoalForReviewRouteController(
    request: Request,
    reviewId: string,
): Promise<AddPerformanceGoalControllerResult> {
    if (!reviewId) {
        throw new ValidationError(REVIEW_ID_REQUIRED_MESSAGE);
    }

    const body: unknown = await readJson(request);

    return (addPerformanceGoalController as unknown as (
        input: PerformanceControllerInput,
    ) => Promise<AddPerformanceGoalControllerResult>)({
        headers: request.headers,
        input: {
            ...(isRecord(body) ? body : {}),
            reviewId,
        },
        auditSource: 'api:hr:performance:review:goals:create',
    });
}
