/**
 * Performance Management Use-Cases Module
 *
 * Mirrors the leave/onboarding structure:
 * - explicit dependencies
 * - explicit input/output
 * - repository-only business logic
 */

export {
    getPerformanceReview,
    type GetPerformanceReviewDependencies,
    type GetPerformanceReviewInput,
    type GetPerformanceReviewResult,
} from './get-performance-review';

export {
    listPerformanceReviews,
    type ListPerformanceReviewsDependencies,
    type ListPerformanceReviewsInput,
    type ListPerformanceReviewsResult,
} from './list-performance-reviews';

export {
    listPerformanceGoalsByReview,
    type ListPerformanceGoalsByReviewDependencies,
    type ListPerformanceGoalsByReviewInput,
    type ListPerformanceGoalsByReviewResult,
} from './list-performance-goals-by-review';

export {
    recordPerformanceReview,
    type RecordPerformanceReviewDependencies,
    type RecordPerformanceReviewInput,
    type RecordPerformanceReviewResult,
} from './record-review';

export {
    updatePerformanceReview,
    type UpdatePerformanceReviewDependencies,
    type UpdatePerformanceReviewInput,
    type UpdatePerformanceReviewResult,
} from './update-performance-review';

export {
    addPerformanceGoal,
    type AddPerformanceGoalDependencies,
    type AddPerformanceGoalInput,
    type AddPerformanceGoalResult,
} from './add-performance-goal';

export {
    updatePerformanceGoal,
    type UpdatePerformanceGoalDependencies,
    type UpdatePerformanceGoalInput,
    type UpdatePerformanceGoalResult,
} from './update-performance-goal';

export {
    deletePerformanceReview,
    type DeletePerformanceReviewDependencies,
    type DeletePerformanceReviewInput,
    type DeletePerformanceReviewResult,
} from './delete-performance-review';

export {
    deletePerformanceGoal,
    type DeletePerformanceGoalDependencies,
    type DeletePerformanceGoalInput,
    type DeletePerformanceGoalResult,
} from './delete-performance-goal';
