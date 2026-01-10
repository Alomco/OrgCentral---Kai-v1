'use server';

import { revalidatePath } from 'next/cache';
import { seedStarterDataInternal, seedCommonLeavePoliciesInternal } from '@/server/services/seeder/seed-starter-data';
import { seedFakeEmployeesInternal } from '@/server/services/seeder/seed-employees';
import { seedFakeAbsencesInternal } from '@/server/services/seeder/seed-absences';
import { seedFakeTimeEntriesInternal } from '@/server/services/seeder/seed-time-entries';
import { seedFakeTrainingInternal } from '@/server/services/seeder/seed-training';
import { seedFakePerformanceInternal } from '@/server/services/seeder/seed-performance';
import { seedSecurityEventsInternal } from '@/server/services/seeder/seed-security';
import { seedCurrentUserProfileInternal } from '@/server/services/seeder/seed-profile';
import { seedFakeNotificationsInternal } from '@/server/services/seeder/seed-notifications';
import { seedBillingDataInternal } from '@/server/services/seeder/seed-billing';
import { seedOrgAssetsInternal } from '@/server/services/seeder/seed-org-assets';
import { seedComplianceDataInternal } from '@/server/services/seeder/seed-compliance';
import { seedIntegrationsInternal } from '@/server/services/seeder/seed-integrations';
import { clearSeededDataInternal } from '@/server/services/seeder/seed-cleanup';
import { seedAbacPoliciesInternal, getAbacPolicyStatusInternal } from '@/server/services/seeder/seed-abac';
import { getSeededDataStatsInternal } from '@/server/services/seeder/seed-stats';

// Paths to revalidate
const PATHS_TO_REVALIDATE = [
    '/dev',
    '/hr',
    '/admin',
    '/dashboard',
];

function revalidateAll() {
    PATHS_TO_REVALIDATE.forEach(p => revalidatePath(p));
}

// wrappers to add revalidation
async function withRevalidation<T>(function_: () => Promise<T>): Promise<T> {
    const result = await function_();
    revalidateAll();
    return result;
}

export async function seedStarterData() {
    return withRevalidation(seedStarterDataInternal);
}

export async function seedCommonLeavePolicies() {
    return withRevalidation(seedCommonLeavePoliciesInternal);
}

export async function seedFakeEmployees(count = 5) {
    return withRevalidation(() => seedFakeEmployeesInternal(count));
}

export async function seedFakeAbsences(count = 10) {
    return withRevalidation(() => seedFakeAbsencesInternal(count));
}

export async function seedFakeTimeEntries(count = 20) {
    return withRevalidation(() => seedFakeTimeEntriesInternal(count));
}

export async function seedFakeTraining(count = 10) {
    return withRevalidation(() => seedFakeTrainingInternal(count));
}

export async function seedFakePerformance(count = 5) {
    return withRevalidation(() => seedFakePerformanceInternal(count));
}

export async function seedSecurityEvents(count = 20) {
    return withRevalidation(() => seedSecurityEventsInternal(count));
}

export async function seedCurrentUserProfile(userId: string) {
    return withRevalidation(() => seedCurrentUserProfileInternal(userId));
}

export async function seedFakeNotifications(count = 10) {
    return withRevalidation(() => seedFakeNotificationsInternal(count));
}

export async function seedBillingData() {
    return withRevalidation(seedBillingDataInternal);
}

export async function seedOrgAssets() {
    return withRevalidation(seedOrgAssetsInternal);
}

export async function seedComplianceData() {
    return withRevalidation(seedComplianceDataInternal);
}

export async function seedIntegrations() {
    return withRevalidation(seedIntegrationsInternal);
}

export async function clearSeededData() {
    return withRevalidation(clearSeededDataInternal);
}

export async function seedAbacPolicies() {
    return withRevalidation(seedAbacPoliciesInternal);
}

export async function getSeededDataStats() {
    // Stats is a read operation, usually usually doesn't need revalidation of other paths, 
    // but the original didn't invalidate.
    return getSeededDataStatsInternal();
}

export async function getAbacPolicyStatus() {
    return getAbacPolicyStatusInternal();
}
