import { appLogger } from '@/server/logging/structured-logger';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { isClassificationCompliant } from '@/server/repositories/security/tenant-guard.utils';
import {
  loadPlatformSettingJson,
  savePlatformSettingJson,
  type PlatformJsonStoreDependencies,
} from '@/server/repositories/prisma/platform/settings/platform-settings-json-store';
import type { BillingPlan, BillingPlanAssignment } from '@/server/types/platform/billing-plan';
import {
  billingPlanSchema,
  billingPlanAssignmentRecordSchema,
} from '@/server/validators/platform/admin/billing-plan-validators';
import { prisma as defaultPrisma } from '@/server/lib/prisma';

const BILLING_PLANS_KEY = 'platform-billing-plans';
const BILLING_ASSIGNMENTS_KEY = 'platform-billing-plan-assignments';

export interface TenantBillingPlanResolution {
  assignment: BillingPlanAssignment;
  plan: BillingPlan;
}

export async function resolveTenantBillingPlan(
  authorization: RepositoryAuthorizationContext,
  options?: { asOf?: Date; prisma?: PlatformJsonStoreDependencies['prisma'] },
): Promise<TenantBillingPlanResolution | null> {
  const prisma = options?.prisma ?? defaultPrisma;
  const asOf = options?.asOf ?? new Date();
  const plans = await loadPlatformSettingJson({ prisma }, BILLING_PLANS_KEY, billingPlanSchema.array(), []);
  const assignments = await loadPlatformSettingJson(
    { prisma },
    BILLING_ASSIGNMENTS_KEY,
    billingPlanAssignmentRecordSchema.array(),
    [],
  );

  const activationResult = activateAssignmentsForTenant(assignments, authorization, asOf);
  if (activationResult.changed) {
    await savePlatformSettingJson({ prisma }, BILLING_ASSIGNMENTS_KEY, activationResult.assignments);
    appLogger.info('billing.assignment.activated', {
      orgId: authorization.orgId,
      activatedAssignments: activationResult.activatedAssignmentIds,
      retiredAssignments: activationResult.retiredAssignmentIds,
      asOf: asOf.toISOString(),
    });
  }

  const activeAssignment = findActiveAssignmentForTenant(
    activationResult.assignments,
    authorization,
    asOf,
  );
  if (!activeAssignment) {
    return null;
  }

  const plan = plans.find((candidate) => candidate.id === activeAssignment.planId);
  if (plan?.status !== 'ACTIVE' || !isEffectiveForDate(plan.effectiveFrom, plan.effectiveTo, asOf)) {
    return null;
  }

  if (!hasTenantReadAccess(authorization, activeAssignment) || !hasTenantReadAccess(authorization, plan)) {
    return null;
  }

  return { assignment: activeAssignment, plan };
}

function activateAssignmentsForTenant(
  assignments: BillingPlanAssignment[],
  authorization: RepositoryAuthorizationContext,
  asOf: Date,
): {
  assignments: BillingPlanAssignment[];
  changed: boolean;
  activatedAssignmentIds: string[];
  retiredAssignmentIds: string[];
} {
  const tenantAssignments = assignments.filter((assignment) => {
    if (assignment.tenantId !== authorization.orgId) {
      return false;
    }
    if (!hasTenantReadAccess(authorization, assignment)) {
      return false;
    }
    return parseIsoDate(assignment.effectiveFrom)?.getTime() !== undefined;
  });

  const dueAssignments = tenantAssignments.filter((assignment) =>
    isEffectiveStartReached(assignment.effectiveFrom, asOf),
  );
  if (dueAssignments.length === 0) {
    return { assignments, changed: false, activatedAssignmentIds: [], retiredAssignmentIds: [] };
  }

  const nextActive = [...dueAssignments].sort((left, right) => {
    const leftTime = parseIsoDate(left.effectiveFrom)?.getTime() ?? 0;
    const rightTime = parseIsoDate(right.effectiveFrom)?.getTime() ?? 0;
    if (leftTime !== rightTime) {
      return rightTime - leftTime;
    }
    const leftUpdated = parseIsoDate(left.updatedAt)?.getTime() ?? 0;
    const rightUpdated = parseIsoDate(right.updatedAt)?.getTime() ?? 0;
    return rightUpdated - leftUpdated;
  })[0];

  let changed = false;
  const activatedAssignmentIds: string[] = [];
  const retiredAssignmentIds: string[] = [];
  const nowIso = asOf.toISOString();

  const nextAssignments = assignments.map((assignment) => {
    if (assignment.tenantId !== authorization.orgId || !isEffectiveStartReached(assignment.effectiveFrom, asOf)) {
      return assignment;
    }

    const shouldBeActive = assignment.id === nextActive.id;
    const nextStatus: BillingPlanAssignment['status'] = shouldBeActive ? 'ACTIVE' : 'RETIRED';
    const nextEffectiveTo = shouldBeActive ? assignment.effectiveTo ?? null : assignment.effectiveTo ?? nowIso;

    if (assignment.status === nextStatus && assignment.effectiveTo === nextEffectiveTo) {
      return assignment;
    }

    changed = true;
    if (shouldBeActive) {
      activatedAssignmentIds.push(assignment.id);
    } else {
      retiredAssignmentIds.push(assignment.id);
    }

    return {
      ...assignment,
      status: nextStatus,
      effectiveTo: nextEffectiveTo,
      updatedAt: nowIso,
    };
  });

  return { assignments: nextAssignments, changed, activatedAssignmentIds, retiredAssignmentIds };
}

function findActiveAssignmentForTenant(
  assignments: BillingPlanAssignment[],
  authorization: RepositoryAuthorizationContext,
  asOf: Date,
): BillingPlanAssignment | null {
  const activeAssignments = assignments.filter((assignment) => {
    if (assignment.tenantId !== authorization.orgId || assignment.status !== 'ACTIVE') {
      return false;
    }
    if (!hasTenantReadAccess(authorization, assignment)) {
      return false;
    }
    return isEffectiveForDate(assignment.effectiveFrom, assignment.effectiveTo, asOf);
  });

  if (activeAssignments.length === 0) {
    return null;
  }

  return activeAssignments.sort((left, right) => {
    const leftTime = parseIsoDate(left.effectiveFrom)?.getTime() ?? 0;
    const rightTime = parseIsoDate(right.effectiveFrom)?.getTime() ?? 0;
    return rightTime - leftTime;
  })[0];
}

function hasTenantReadAccess(
  authorization: RepositoryAuthorizationContext,
  record: Pick<BillingPlanAssignment | BillingPlan, 'dataResidency' | 'dataClassification'>,
): boolean {
  if (record.dataResidency !== authorization.dataResidency) {
    return false;
  }
  return isClassificationCompliant(authorization.dataClassification, record.dataClassification);
}

function isEffectiveStartReached(effectiveFrom: string, asOf: Date): boolean {
  const start = parseIsoDate(effectiveFrom);
  return Boolean(start && start.getTime() <= asOf.getTime());
}

function isEffectiveForDate(effectiveFrom: string, effectiveTo: string | null | undefined, asOf: Date): boolean {
  const start = parseIsoDate(effectiveFrom);
  if (!start || start.getTime() > asOf.getTime()) {
    return false;
  }

  if (!effectiveTo) {
    return true;
  }

  const end = parseIsoDate(effectiveTo);
  if (!end) {
    return true;
  }

  return end.getTime() > asOf.getTime();
}

function parseIsoDate(value: string): Date | null {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}
