import { readFile } from 'node:fs/promises';
import { z } from 'zod';
import type { SeedCatalogFile } from './types';

const membershipModeSchema = z.enum(['INVITED', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'NONE']);
const profileModeSchema = z.enum(['ready', 'pending', 'none']);
const personaStateSchema = z.enum([
    'ready',
    'password_setup_required',
    'profile_setup_required',
    'mfa_setup_required',
    'suspended',
    'no_membership',
]);

const personaCatalogRecordSchema = z.object({
    key: z.string().min(1),
    state: personaStateSchema,
    email: z.email(),
    password: z.string().nullable(),
    displayName: z.string().min(1),
    roleKey: z.enum(['globalAdmin', 'owner', 'orgAdmin', 'hrAdmin', 'manager', 'compliance', 'member']),
    organizationSlug: z.string().nullable(),
    membershipMode: membershipModeSchema,
    profileMode: profileModeSchema,
    twoFactorEnabled: z.boolean(),
    notes: z.string(),
    expectedResult: z.string(),
});

const seedCatalogSchema = z.object({
    generatedAt: z.string().min(1),
    seedSource: z.string().min(1),
    personas: z.array(personaCatalogRecordSchema).min(1),
});

export async function readSeedCatalogFile(pathToCatalog: string): Promise<SeedCatalogFile> {
    const raw = await readFile(pathToCatalog, 'utf8');
    return seedCatalogSchema.parse(JSON.parse(raw));
}
