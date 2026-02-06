import type { IBillingPlanRepository } from '@/server/repositories/contracts/platform/admin/billing-plan-repository-contract';
import type { RepositoryAuthorizationContext } from '@/server/types/repository-authorization';
import type { BillingPlan, BillingPlanAssignment } from '@/server/types/platform/billing-plan';
import { BasePrismaRepository } from '@/server/repositories/prisma/base-prisma-repository';
import {
    billingPlanSchema,
    billingPlanAssignmentRecordSchema,
} from '@/server/validators/platform/admin/billing-plan-validators';
import { loadPlatformSettingJson, savePlatformSettingJson } from '@/server/repositories/prisma/platform/settings/platform-settings-json-store';

const BILLING_PLANS_KEY = 'platform-billing-plans';
const BILLING_ASSIGNMENTS_KEY = 'platform-billing-plan-assignments';

export class PrismaBillingPlanRepository extends BasePrismaRepository implements IBillingPlanRepository {
    async listPlans(context: RepositoryAuthorizationContext): Promise<BillingPlan[]> {
        const plans = await this.loadAllPlans();
        return plans.filter((plan) => plan.orgId === context.orgId);
    }

    async getPlan(context: RepositoryAuthorizationContext, planId: string): Promise<BillingPlan | null> {
        const plans = await this.listPlans(context);
        return plans.find((plan) => plan.id === planId) ?? null;
    }

    async createPlan(context: RepositoryAuthorizationContext, plan: BillingPlan): Promise<BillingPlan> {
        const plans = await this.loadAllPlans();
        const next = [...plans, plan];
        await savePlatformSettingJson({ prisma: this.prisma }, BILLING_PLANS_KEY, next);
        return plan;
    }

    async updatePlan(context: RepositoryAuthorizationContext, plan: BillingPlan): Promise<BillingPlan> {
        const plans = await this.loadAllPlans();
        const next = plans.map((item) => (item.id === plan.id && item.orgId === context.orgId ? plan : item));
        await savePlatformSettingJson({ prisma: this.prisma }, BILLING_PLANS_KEY, next);
        return plan;
    }

    async listAssignments(context: RepositoryAuthorizationContext): Promise<BillingPlanAssignment[]> {
        const allAssignments = await this.loadAllAssignments();
        const scoped = allAssignments.filter((assignment) => assignment.orgId === context.orgId);
        const activated = activateDueAssignments(scoped, new Date());
        if (!activated.changed) {
            return scoped;
        }

        const updatedById = new Map(activated.assignments.map((assignment) => [assignment.id, assignment]));
        const mergedAssignments = allAssignments.map((assignment) =>
            updatedById.get(assignment.id) ?? assignment,
        );

        await savePlatformSettingJson({ prisma: this.prisma }, BILLING_ASSIGNMENTS_KEY, mergedAssignments);
        return activated.assignments;
    }

    async createAssignment(
        context: RepositoryAuthorizationContext,
        assignment: BillingPlanAssignment,
    ): Promise<BillingPlanAssignment> {
        const assignments = await this.loadAllAssignments();
        const next = [...assignments, assignment];
        await savePlatformSettingJson({ prisma: this.prisma }, BILLING_ASSIGNMENTS_KEY, next);
        return assignment;
    }

    private async loadAllPlans(): Promise<BillingPlan[]> {
        return loadPlatformSettingJson(
            { prisma: this.prisma },
            BILLING_PLANS_KEY,
            billingPlanSchema.array(),
            [],
        );
    }

    private async loadAllAssignments(): Promise<BillingPlanAssignment[]> {
        return loadPlatformSettingJson(
            { prisma: this.prisma },
            BILLING_ASSIGNMENTS_KEY,
            billingPlanAssignmentRecordSchema.array(),
            [],
        );
    }
}

function activateDueAssignments(
    assignments: BillingPlanAssignment[],
    asOf: Date,
): { assignments: BillingPlanAssignment[]; changed: boolean } {
    const byTenant = assignments.reduce<Map<string, BillingPlanAssignment[]>>((map, assignment) => {
        const current = map.get(assignment.tenantId) ?? [];
        current.push(assignment);
        map.set(assignment.tenantId, current);
        return map;
    }, new Map());

    let changed = false;
    const nowIso = asOf.toISOString();
    const updatedAssignments = assignments.map((assignment) => assignment);
    const assignmentIndexById = new Map(updatedAssignments.map((assignment, index) => [assignment.id, index]));

    for (const tenantAssignments of byTenant.values()) {
        const dueAssignments = tenantAssignments.filter((assignment) =>
            isEffectiveStartReached(assignment.effectiveFrom, asOf),
        );
        if (dueAssignments.length === 0) {
            continue;
        }

        const nextActive = [...dueAssignments].sort((left, right) => {
            const leftTime = parseIsoDate(left.effectiveFrom)?.getTime() ?? 0;
            const rightTime = parseIsoDate(right.effectiveFrom)?.getTime() ?? 0;
            return rightTime - leftTime;
        })[0];

        for (const assignment of dueAssignments) {
            const nextStatus: BillingPlanAssignment['status'] =
                assignment.id === nextActive.id ? 'ACTIVE' : 'RETIRED';
            const nextEffectiveTo = nextStatus === 'RETIRED' ? assignment.effectiveTo ?? nowIso : assignment.effectiveTo ?? null;
            if (assignment.status === nextStatus && assignment.effectiveTo === nextEffectiveTo) {
                continue;
            }

            changed = true;
            const index = assignmentIndexById.get(assignment.id);
            if (index === undefined) {
                continue;
            }

            updatedAssignments[index] = {
                ...assignment,
                status: nextStatus,
                effectiveTo: nextEffectiveTo,
                updatedAt: nowIso,
            };
        }
    }

    return { assignments: updatedAssignments, changed };
}

function isEffectiveStartReached(effectiveFrom: string, asOf: Date): boolean {
    const start = parseIsoDate(effectiveFrom);
    return Boolean(start && start.getTime() <= asOf.getTime());
}

function parseIsoDate(value: string): Date | null {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
}
