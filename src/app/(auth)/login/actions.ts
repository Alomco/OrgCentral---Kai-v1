import { headers as nextHeaders } from 'next/headers';

import type { LoginActionInput, LoginActionResult } from '@/features/auth/login/login-contracts';
import { executeLogin } from '@/server/api-adapters/auth/login-controller';

export async function loginAction(input: LoginActionInput): Promise<LoginActionResult> {
    'use server';
    const headerStore = await nextHeaders();
    return executeLogin(input, { headers: headerStore });
}
