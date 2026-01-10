// src/server/services/seeder/seed-starter-data.ts
import { LeavePolicyType, LeaveAccrualFrequency } from '@prisma/client';
import { prisma } from '@/server/lib/prisma';
import { seedDefaultAbsenceTypes } from '@/server/use-cases/hr/absences/seed-default-absence-types';
import { PrismaAbsenceTypeConfigRepository } from '@/server/repositories/prisma/hr/absences/prisma-absence-type-config-repository';
import { getDefaultOrg, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

const DEFAULT_ANNUAL_POLICY = 'Annual Leave (Default)';
const DEFAULT_SICK_POLICY = 'Sick Leave';

export async function seedStarterDataInternal(): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();

        // 1. Seed Absence Types
        const absenceRepo = new PrismaAbsenceTypeConfigRepository();
        await seedDefaultAbsenceTypes(
            { typeConfigRepository: absenceRepo },
            { orgId: org.id, dataResidency: 'UK_ONLY', dataClassification: 'OFFICIAL' }
        );

        // 2. Ensure Leave Policies
        await prisma.leavePolicy.upsert({
            where: { orgId_name: { orgId: org.id, name: DEFAULT_ANNUAL_POLICY } },
            update: {},
            create: {
                orgId: org.id,
                name: DEFAULT_ANNUAL_POLICY,
                policyType: LeavePolicyType.ANNUAL,
                accrualFrequency: LeaveAccrualFrequency.YEARLY,
                accrualAmount: 28,
                carryOverLimit: 5,
                requiresApproval: true,
                isDefault: true,
                metadata: getSeededMetadata(),
            },
        });

        await prisma.leavePolicy.upsert({
            where: { orgId_name: { orgId: org.id, name: DEFAULT_SICK_POLICY } },
            update: {},
            create: {
                orgId: org.id,
                name: DEFAULT_SICK_POLICY,
                policyType: LeavePolicyType.SICK,
                accrualFrequency: LeaveAccrualFrequency.NONE,
                requiresApproval: false,
                statutoryCompliance: true,
                metadata: getSeededMetadata(),
            },
        });

        // 3. Departments
        const departments = ['Engineering', 'Product', 'Sales', 'Marketing', 'HR', 'Finance', 'Legal', 'Operations'];
        for (const name of departments) {
            await prisma.department.upsert({
                where: { orgId_name: { orgId: org.id, name } },
                update: {},
                create: { orgId: org.id, name },
            });
        }

        return { success: true, message: 'Starter data (Absence Types, Policies, Depts) seeded successfully.' };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}

export async function seedCommonLeavePoliciesInternal(): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();

        const policyDefinitions: {
            name: string;
            policyType: LeavePolicyType;
            accrualFrequency: LeaveAccrualFrequency;
            accrualAmount?: number;
            carryOverLimit?: number;
            requiresApproval: boolean;
            statutoryCompliance?: boolean;
            isDefault?: boolean;
            maxConsecutiveDays?: number;
            allowNegativeBalance?: boolean;
        }[] = [
                {
                    name: DEFAULT_ANNUAL_POLICY,
                    policyType: LeavePolicyType.ANNUAL,
                    accrualFrequency: LeaveAccrualFrequency.MONTHLY,
                    accrualAmount: 28,
                    carryOverLimit: 5,
                    requiresApproval: true,
                    isDefault: true,
                },
                {
                    name: DEFAULT_SICK_POLICY,
                    policyType: LeavePolicyType.SICK,
                    accrualFrequency: LeaveAccrualFrequency.NONE,
                    accrualAmount: 10,
                    requiresApproval: false,
                    statutoryCompliance: true,
                    allowNegativeBalance: true,
                },
                {
                    name: 'Parental Leave',
                    policyType: LeavePolicyType.SPECIAL,
                    accrualFrequency: LeaveAccrualFrequency.YEARLY,
                    accrualAmount: 52,
                    requiresApproval: true,
                    statutoryCompliance: true,
                    maxConsecutiveDays: 365,
                },
                {
                    name: 'Bereavement Leave',
                    policyType: LeavePolicyType.EMERGENCY,
                    accrualFrequency: LeaveAccrualFrequency.NONE,
                    accrualAmount: 10,
                    requiresApproval: true,
                    statutoryCompliance: true,
                    maxConsecutiveDays: 10,
                },
                {
                    name: 'Unpaid Leave',
                    policyType: LeavePolicyType.UNPAID,
                    accrualFrequency: LeaveAccrualFrequency.NONE,
                    requiresApproval: true,
                    carryOverLimit: 0,
                    maxConsecutiveDays: 30,
                },
            ];

        let created = 0;
        for (const policy of policyDefinitions) {
            await prisma.leavePolicy.upsert({
                where: { orgId_name: { orgId: org.id, name: policy.name } },
                update: {
                    accrualFrequency: policy.accrualFrequency,
                    accrualAmount: policy.accrualAmount,
                    carryOverLimit: policy.carryOverLimit,
                    requiresApproval: policy.requiresApproval,
                    statutoryCompliance: policy.statutoryCompliance ?? false,
                    isDefault: policy.isDefault ?? false,
                    maxConsecutiveDays: policy.maxConsecutiveDays,
                    allowNegativeBalance: policy.allowNegativeBalance ?? false,
                    residencyTag: org.dataResidency,
                    dataClassification: org.dataClassification,
                    metadata: getSeededMetadata({ template: 'common-leave-policies' }),
                },
                create: {
                    orgId: org.id,
                    name: policy.name,
                    policyType: policy.policyType,
                    accrualFrequency: policy.accrualFrequency,
                    accrualAmount: policy.accrualAmount,
                    carryOverLimit: policy.carryOverLimit,
                    requiresApproval: policy.requiresApproval,
                    statutoryCompliance: policy.statutoryCompliance ?? false,
                    isDefault: policy.isDefault ?? false,
                    maxConsecutiveDays: policy.maxConsecutiveDays,
                    allowNegativeBalance: policy.allowNegativeBalance ?? false,
                    residencyTag: org.dataResidency,
                    dataClassification: org.dataClassification,
                    auditSource: 'dev-seeder',
                    metadata: getSeededMetadata({ template: 'common-leave-policies' }),
                },
            });
            created++;
        }

        return { success: true, message: `Seeded ${String(created)} common leave policies.`, count: created };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
