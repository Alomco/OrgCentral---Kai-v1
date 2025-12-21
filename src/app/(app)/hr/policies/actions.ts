import { headers as nextHeaders } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

import { ValidationError } from '@/server/errors';
import { acknowledgeHrPolicyController } from '@/server/api-adapters/hr/policies/acknowledge-hr-policy';

function readRequiredString(formData: FormData, key: string): string {
    const value = formData.get(key);
    if (typeof value !== 'string' || value.trim().length === 0) {
        throw new ValidationError(`${key} is required.`);
    }
    return value;
}

export async function acknowledgePolicyAction(formData: FormData): Promise<void> {
    'use server';
    const headerStore = await nextHeaders();

    const policyId = readRequiredString(formData, 'policyId');
    const version = readRequiredString(formData, 'version');

    await acknowledgeHrPolicyController({
        headers: headerStore,
        input: { policyId, version },
        auditSource: 'ui:hr:policies:acknowledge',
    });

    revalidatePath(`/hr/policies/${policyId}`);
    redirect(`/hr/policies/${policyId}`);
}

