import type { PerformanceGoal, PerformanceReview } from '@/server/domain/hr/performance/types';
import type { PerformanceRepository } from '@/server/repositories/contracts/hr/performance/performance-repository.contract';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { ServiceExecutionContext } from '@/server/services/abstract-base-service';
import { HR_ACTION, HR_RESOURCE, type HrAction, type HrResourceType } from '@/server/security/authorization/hr-resource-registry';
import {
  addPerformanceGoal,
  deletePerformanceGoal,
  deletePerformanceReview,
  getPerformanceReview,
  listPerformanceGoalsByReview,
  listPerformanceReviews,
  recordPerformanceReview,
  updatePerformanceGoal,
  updatePerformanceReview,
} from '@/server/use-cases/hr/performance';
import type {
  AddPerformanceGoalInput,
  CreatePerformanceReviewInput,
  DeletePerformanceGoalInput,
  DeletePerformanceReviewInput,
  GetPerformanceReviewInput,
  ListPerformanceGoalsByReviewInput,
  ListPerformanceReviewsByEmployeeInput,
  UpdatePerformanceGoalInput,
  UpdatePerformanceReviewInput,
} from './performance-service.types';

export interface ServiceContext {
  ensureOrgAccess: (authorization: RepositoryAuthorizationContext, params: {
    action: HrAction;
    resourceType: HrResourceType;
    resourceAttributes?: Record<string, unknown>;
  }) => Promise<void>;
  buildContext: (authorization: RepositoryAuthorizationContext, options?: { correlationId?: string; metadata?: Record<string, unknown> }) => ServiceExecutionContext;
  executeInServiceContext: <T>(context: ServiceExecutionContext, action: string, handler: () => Promise<T>) => Promise<T>;
  getRepository: (authorization: RepositoryAuthorizationContext) => PerformanceRepository;
}

export async function handleGetReviewById(service: ServiceContext, input: GetPerformanceReviewInput): Promise<PerformanceReview | null> {
  await service.ensureOrgAccess(input.authorization, {
    action: HR_ACTION.READ,
    resourceType: HR_RESOURCE.HR_PERFORMANCE,
    resourceAttributes: { reviewId: input.id },
  });

  const context = service.buildContext(input.authorization, {
    metadata: { auditSource: 'service:hr.performance.review.get', reviewId: input.id },
  });

  return service.executeInServiceContext(context, 'hr.performance.review.get', async () => {
    const repository = service.getRepository(input.authorization);
    const { review } = await getPerformanceReview({ repository }, { authorization: input.authorization, id: input.id });
    return review;
  });
}

export async function handleGetReviewsByEmployee(service: ServiceContext, input: ListPerformanceReviewsByEmployeeInput): Promise<PerformanceReview[]> {
  await service.ensureOrgAccess(input.authorization, {
    action: HR_ACTION.READ,
    resourceType: HR_RESOURCE.HR_PERFORMANCE,
    resourceAttributes: { employeeId: input.employeeId },
  });

  const context = service.buildContext(input.authorization, {
    metadata: { auditSource: 'service:hr.performance.review.list', employeeId: input.employeeId },
  });

  return service.executeInServiceContext(context, 'hr.performance.review.list', async () => {
    const repository = service.getRepository(input.authorization);
    const { reviews } = await listPerformanceReviews({ repository }, { authorization: input.authorization, employeeId: input.employeeId });
    return reviews;
  });
}

export async function handleGetGoalsByReviewId(service: ServiceContext, input: ListPerformanceGoalsByReviewInput): Promise<PerformanceGoal[]> {
  await service.ensureOrgAccess(input.authorization, {
    action: HR_ACTION.READ,
    resourceType: HR_RESOURCE.HR_PERFORMANCE,
    resourceAttributes: { reviewId: input.reviewId },
  });

  const context = service.buildContext(input.authorization, {
    metadata: { auditSource: 'service:hr.performance.goal.list', reviewId: input.reviewId },
  });

  return service.executeInServiceContext(context, 'hr.performance.goal.list', async () => {
    const repository = service.getRepository(input.authorization);
    const { goals } = await listPerformanceGoalsByReview({ repository }, { authorization: input.authorization, reviewId: input.reviewId });
    return goals;
  });
}

export async function handleCreateReview(service: ServiceContext, input: CreatePerformanceReviewInput): Promise<PerformanceReview> {
  await service.ensureOrgAccess(input.authorization, {
    action: HR_ACTION.CREATE,
    resourceType: HR_RESOURCE.HR_PERFORMANCE,
    resourceAttributes: { employeeId: input.review.employeeId },
  });

  const context = service.buildContext(input.authorization, {
    metadata: { auditSource: 'service:hr.performance.review.create', employeeId: input.review.employeeId },
  });

  return service.executeInServiceContext(context, 'hr.performance.review.create', async () => {
    const repository = service.getRepository(input.authorization);
    const { review } = await recordPerformanceReview({ repository }, { authorization: input.authorization, review: input.review });
    return review;
  });
}

export async function handleUpdateReview(service: ServiceContext, input: UpdatePerformanceReviewInput): Promise<PerformanceReview> {
  await service.ensureOrgAccess(input.authorization, {
    action: HR_ACTION.UPDATE,
    resourceType: HR_RESOURCE.HR_PERFORMANCE,
    resourceAttributes: { reviewId: input.id },
  });

  const context = service.buildContext(input.authorization, {
    metadata: { auditSource: 'service:hr.performance.review.update', reviewId: input.id },
  });

  return service.executeInServiceContext(context, 'hr.performance.review.update', async () => {
    const repository = service.getRepository(input.authorization);
    const { review } = await updatePerformanceReview({ repository }, { authorization: input.authorization, id: input.id, updates: input.updates });
    return review;
  });
}

export async function handleAddGoal(service: ServiceContext, input: AddPerformanceGoalInput): Promise<PerformanceGoal> {
  await service.ensureOrgAccess(input.authorization, {
    action: HR_ACTION.CREATE,
    resourceType: HR_RESOURCE.HR_PERFORMANCE,
    resourceAttributes: { reviewId: input.reviewId },
  });

  const context = service.buildContext(input.authorization, {
    metadata: { auditSource: 'service:hr.performance.goal.create', reviewId: input.reviewId },
  });

  return service.executeInServiceContext(context, 'hr.performance.goal.create', async () => {
    const repository = service.getRepository(input.authorization);
    const { goal } = await addPerformanceGoal({ repository }, { authorization: input.authorization, reviewId: input.reviewId, goal: input.goal });
    return goal;
  });
}

export async function handleUpdateGoal(service: ServiceContext, input: UpdatePerformanceGoalInput): Promise<PerformanceGoal> {
  await service.ensureOrgAccess(input.authorization, {
    action: HR_ACTION.UPDATE,
    resourceType: HR_RESOURCE.HR_PERFORMANCE,
    resourceAttributes: { goalId: input.goalId },
  });

  const context = service.buildContext(input.authorization, {
    metadata: { auditSource: 'service:hr.performance.goal.update', goalId: input.goalId },
  });

  return service.executeInServiceContext(context, 'hr.performance.goal.update', async () => {
    const repository = service.getRepository(input.authorization);
    const { goal } = await updatePerformanceGoal({ repository }, { authorization: input.authorization, goalId: input.goalId, updates: input.updates });
    return goal;
  });
}

export async function handleDeleteReview(service: ServiceContext, input: DeletePerformanceReviewInput): Promise<{ success: true }> {
  await service.ensureOrgAccess(input.authorization, {
    action: HR_ACTION.DELETE,
    resourceType: HR_RESOURCE.HR_PERFORMANCE,
    resourceAttributes: { reviewId: input.id },
  });

  const context = service.buildContext(input.authorization, {
    metadata: { auditSource: 'service:hr.performance.review.delete', reviewId: input.id },
  });

  await service.executeInServiceContext(context, 'hr.performance.review.delete', async () => {
    const repository = service.getRepository(input.authorization);
    await deletePerformanceReview({ repository }, { authorization: input.authorization, id: input.id });
  });

  return { success: true };
}

export async function handleDeleteGoal(service: ServiceContext, input: DeletePerformanceGoalInput): Promise<{ success: true }> {
  await service.ensureOrgAccess(input.authorization, {
    action: HR_ACTION.DELETE,
    resourceType: HR_RESOURCE.HR_PERFORMANCE,
    resourceAttributes: { goalId: input.goalId },
  });

  const context = service.buildContext(input.authorization, {
    metadata: { auditSource: 'service:hr.performance.goal.delete', goalId: input.goalId },
  });

  await service.executeInServiceContext(context, 'hr.performance.goal.delete', async () => {
    const repository = service.getRepository(input.authorization);
    await deletePerformanceGoal({ repository }, { authorization: input.authorization, goalId: input.goalId });
  });

  return { success: true };
}
