'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import type { LeavePolicy } from '@/server/types/leave-types';
import { authAction } from '@/server/actions/auth-action';
import { toActionState, type ActionState } from '@/server/actions/action-state';
import {
    createLeavePolicy,
    createLeavePolicyInputSchema,
    type CreateLeavePolicyInput,
} from '@/server/use-cases/hr/leave-policies/create-leave-policy';
import {
    listLeavePolicies,
    listLeavePoliciesInputSchema,
} from '@/server/use-cases/hr/leave-policies/list-leave-policies';
import {
    updateLeavePolicy,
    updateLeavePolicyPatchSchema,
} from '@/server/use-cases/hr/leave-policies/update-leave-policy';
import {
    deleteLeavePolicy,
    deleteLeavePolicyInputSchema,
} from '@/server/use-cases/hr/leave-policies/delete-leave-policy';
import {
    PrismaLeaveBalanceRepository,
    PrismaLeavePolicyRepository,
    PrismaLeaveRequestRepository,
} from '@/server/repositories/prisma/hr/leave';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization';

const SETTINGS_PATH = '/hr/settings';
const LEAVE_POLICY_RESOURCE_TYPE = 'hr.leave.policies';
const AUDIT_PREFIX = 'action:hr:leave-policies:';

const leavePolicyRepository = new PrismaLeavePolicyRepository();
const leaveBalanceRepository = new PrismaLeaveBalanceRepository();
const leaveRequestRepository = new PrismaLeaveRequestRepository();
const organizationRepository = new PrismaOrganizationRepository();

export async function listLeavePoliciesAction(): Promise<ActionState<LeavePolicy[]>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { organization: ['update'] },
                auditSource: `${AUDIT_PREFIX}list`,
                action: 'read',
                resourceType: LEAVE_POLICY_RESOURCE_TYPE,
            },
            async ({ authorization }) => {
                const payload = listLeavePoliciesInputSchema.parse({ orgId: authorization.orgId });
                const result = await listLeavePolicies(
                    { leavePolicyRepository },
                    { authorization, payload },
                );
                return result.policies;
            },
        ),
    );
}

export async function createLeavePolicyAction(data: unknown): Promise<ActionState<LeavePolicy>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { organization: ['update'] },
                auditSource: `${AUDIT_PREFIX}create`,
                action: 'create',
                resourceType: LEAVE_POLICY_RESOURCE_TYPE,
            },
            async ({ authorization }) => {
                const shaped: CreateLeavePolicyInput = createLeavePolicyInputSchema.parse({
                    ...(typeof data === 'object' && data !== null ? (data as Record<string, unknown>) : {}),
                    orgId: authorization.orgId,
                });

                const result = await createLeavePolicy(
                    { leavePolicyRepository },
                    { authorization, payload: shaped },
                );

                revalidatePath(SETTINGS_PATH);
                return result.policy;
            },
        ),
    );
}

export async function updateLeavePolicyAction(
    id: string,
    data: unknown,
): Promise<ActionState<LeavePolicy>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { organization: ['update'] },
                auditSource: `${AUDIT_PREFIX}update`,
                action: 'update',
                resourceType: LEAVE_POLICY_RESOURCE_TYPE,
                resourceAttributes: { policyId: id },
            },
            async ({ authorization }) => {
                const policyId = z.uuid().parse(id);
                const patch = updateLeavePolicyPatchSchema.parse(data);

                const result = await updateLeavePolicy(
                    { leavePolicyRepository, organizationRepository },
                    {
                        authorization,
                        orgId: authorization.orgId,
                        policyId,
                        patch,
                    },
                );

                revalidatePath(SETTINGS_PATH);
                return result.policy;
            },
        ),
    );
}

export async function deleteLeavePolicyAction(id: string): Promise<ActionState<null>> {
    return toActionState(() =>
        authAction(
            {
                requiredPermissions: { organization: ['update'] },
                auditSource: `${AUDIT_PREFIX}delete`,
                action: 'delete',
                resourceType: LEAVE_POLICY_RESOURCE_TYPE,
                resourceAttributes: { policyId: id },
            },
            async ({ authorization }) => {
                const payload = deleteLeavePolicyInputSchema.parse({
                    orgId: authorization.orgId,
                    policyId: id,
                });

                await deleteLeavePolicy(
                    { leavePolicyRepository, leaveBalanceRepository, leaveRequestRepository },
                    { authorization, payload },
                );

                revalidatePath(SETTINGS_PATH);
                return null;
            },
        ),
    );
}
