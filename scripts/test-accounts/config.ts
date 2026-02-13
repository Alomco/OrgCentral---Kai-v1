import path from 'node:path';
import type { SeedRuntimeConfig } from './types';

const DEFAULT_PASSWORD = 'TestPass!234567';
const DEFAULT_EMAIL_DOMAIN = 'agents.orgcentral.test';
const DEFAULT_OUTPUT_DIR = path.resolve('.codex/test-accounts');
const DEFAULT_SEED_SOURCE = 'scripts/seed-test-accounts';

function toBooleanFlag(value: string | undefined, fallback: boolean): boolean {
    if (!value) {
        return fallback;
    }
    const normalized = value.trim().toLowerCase();
    return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

function assertDatabaseUrl(): void {
    const value = process.env.DATABASE_URL;
    if (!value || value.trim().length === 0) {
        throw new Error('DATABASE_URL is required for test account seeding.');
    }
}

export interface ResolveConfigOptions {
    requireDatabaseUrl?: boolean;
}

export function resolveSeedRuntimeConfig(options?: ResolveConfigOptions): SeedRuntimeConfig {
    if (options?.requireDatabaseUrl) {
        assertDatabaseUrl();
    }

    const outputDirectory = process.env.TEST_ACCOUNTS_OUTPUT_DIR?.trim() ?? DEFAULT_OUTPUT_DIR;
    const password = process.env.TEST_ACCOUNTS_PASSWORD?.trim() ?? DEFAULT_PASSWORD;
    const emailDomain = process.env.TEST_ACCOUNTS_EMAIL_DOMAIN?.trim() ?? DEFAULT_EMAIL_DOMAIN;
    const forcePasswordReset = toBooleanFlag(process.env.TEST_ACCOUNTS_FORCE_PASSWORD_RESET, true);
    const seedSource = process.env.TEST_ACCOUNTS_SEED_SOURCE?.trim() ?? DEFAULT_SEED_SOURCE;

    return {
        seedSource,
        password,
        emailDomain,
        forcePasswordReset,
        outputDir: outputDirectory,
        localCatalogPath: path.join(outputDirectory, 'catalog.local.json'),
        localGuidePath: path.join(outputDirectory, 'README.local.md'),
    };
}

export function resolvePersonaEmail(localPart: string, config: SeedRuntimeConfig): string {
    return `${localPart}@${config.emailDomain}`.toLowerCase();
}
