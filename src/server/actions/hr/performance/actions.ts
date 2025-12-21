'use server';

import { headers as nextHeaders } from 'next/headers';

import {
    addPerformanceGoalController as addPerformanceGoalControllerUntyped,
    deletePerformanceGoalController as deletePerformanceGoalControllerUntyped,
    deletePerformanceReviewByIdController as deletePerformanceReviewByIdControllerUntyped,
    getPerformanceReviewController as getPerformanceReviewControllerUntyped,
    listPerformanceReviewsByEmployeeController as listPerformanceReviewsByEmployeeControllerUntyped,
    recordPerformanceReviewController as recordPerformanceReviewControllerUntyped,
    updatePerformanceGoalController as updatePerformanceGoalControllerUntyped,
    updatePerformanceReviewController as updatePerformanceReviewControllerUntyped,
} from '@/server/api-adapters/hr/performance';
import type { PerformanceGoal, PerformanceReview } from '@/server/domain/hr/performance/types';

interface PerformanceControllerInput {
    headers: Headers | HeadersInit;
    input: unknown;
    auditSource: string;
}

interface GetPerformanceReviewActionResult {
    success: true;
    review: PerformanceReview | null;
}

interface ListPerformanceReviewsActionResult {
    success: true;
    reviews: PerformanceReview[];
}

interface CreatePerformanceReviewActionResult {
    success: true;
    review: PerformanceReview;
}

interface UpdatePerformanceReviewActionResult {
    success: true;
    review: PerformanceReview;
}

interface AddPerformanceGoalActionResult {
    success: true;
    goal: PerformanceGoal;
}

interface UpdatePerformanceGoalActionResult {
    success: true;
    goal: PerformanceGoal;
}

interface DeletePerformanceReviewActionResult {
    success: true;
}

interface DeletePerformanceGoalActionResult {
    success: true;
}

const getPerformanceReviewController = getPerformanceReviewControllerUntyped as unknown as (
    input: PerformanceControllerInput,
) => Promise<GetPerformanceReviewActionResult>;

const listPerformanceReviewsByEmployeeController = listPerformanceReviewsByEmployeeControllerUntyped as unknown as (
    input: PerformanceControllerInput,
) => Promise<ListPerformanceReviewsActionResult>;

const recordPerformanceReviewController = recordPerformanceReviewControllerUntyped as unknown as (
    input: PerformanceControllerInput,
) => Promise<CreatePerformanceReviewActionResult>;

const updatePerformanceReviewController = updatePerformanceReviewControllerUntyped as unknown as (
    input: PerformanceControllerInput,
) => Promise<UpdatePerformanceReviewActionResult>;

const addPerformanceGoalController = addPerformanceGoalControllerUntyped as unknown as (
    input: PerformanceControllerInput,
) => Promise<AddPerformanceGoalActionResult>;

const updatePerformanceGoalController = updatePerformanceGoalControllerUntyped as unknown as (
    input: PerformanceControllerInput,
) => Promise<UpdatePerformanceGoalActionResult>;

const deletePerformanceReviewByIdController = deletePerformanceReviewByIdControllerUntyped as unknown as (
    input: PerformanceControllerInput,
) => Promise<DeletePerformanceReviewActionResult>;

const deletePerformanceGoalController = deletePerformanceGoalControllerUntyped as unknown as (
    input: PerformanceControllerInput,
) => Promise<DeletePerformanceGoalActionResult>;

const ACTION_AUDIT_PREFIX = 'action:hr:performance:';

export async function getPerformanceReviewAction(input: unknown) {
    const headerStore = await nextHeaders();

    return getPerformanceReviewController({
        headers: headerStore,
        input,
        auditSource: `${ACTION_AUDIT_PREFIX}get-review`,
    });
}

export async function listPerformanceReviewsByEmployeeAction(input: unknown) {
    const headerStore = await nextHeaders();

    return listPerformanceReviewsByEmployeeController({
        headers: headerStore,
        input,
        auditSource: `${ACTION_AUDIT_PREFIX}list-reviews`,
    });
}

export async function createPerformanceReviewAction(input: unknown) {
    const headerStore = await nextHeaders();

    return recordPerformanceReviewController({
        headers: headerStore,
        input,
        auditSource: `${ACTION_AUDIT_PREFIX}create-review`,
    });
}

export async function updatePerformanceReviewAction(input: unknown) {
    const headerStore = await nextHeaders();

    return updatePerformanceReviewController({
        headers: headerStore,
        input,
        auditSource: `${ACTION_AUDIT_PREFIX}update-review`,
    });
}

export async function addPerformanceGoalAction(input: unknown) {
    const headerStore = await nextHeaders();

    return addPerformanceGoalController({
        headers: headerStore,
        input,
        auditSource: `${ACTION_AUDIT_PREFIX}add-goal`,
    });
}

export async function updatePerformanceGoalAction(input: unknown) {
    const headerStore = await nextHeaders();

    return updatePerformanceGoalController({
        headers: headerStore,
        input,
        auditSource: `${ACTION_AUDIT_PREFIX}update-goal`,
    });
}

export async function deletePerformanceReviewAction(input: unknown) {
    const headerStore = await nextHeaders();

    return deletePerformanceReviewByIdController({
        headers: headerStore,
        input,
        auditSource: `${ACTION_AUDIT_PREFIX}delete-review`,
    });
}

export async function deletePerformanceGoalAction(input: unknown) {
    const headerStore = await nextHeaders();

    return deletePerformanceGoalController({
        headers: headerStore,
        input,
        auditSource: `${ACTION_AUDIT_PREFIX}delete-goal`,
    });
}
