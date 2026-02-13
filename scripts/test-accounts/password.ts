import { hashPassword } from 'better-auth/crypto';

export async function hashCredentialPassword(password: string): Promise<string> {
    return hashPassword(password);
}
