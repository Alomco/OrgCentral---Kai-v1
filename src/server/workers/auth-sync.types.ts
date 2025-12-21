import type { BetterAuthSessionPayload, BetterAuthUserPayload } from '@/server/lib/auth-sync';

export const AUTH_SYNC_JOB_NAMES = {
    SYNC_USER: 'sync-user',
    SYNC_SESSION: 'sync-session',
} as const;

export type AuthSyncJobName = (typeof AUTH_SYNC_JOB_NAMES)[keyof typeof AUTH_SYNC_JOB_NAMES];
export type AuthSyncUserJobData = BetterAuthUserPayload;
export type AuthSyncSessionJobData = BetterAuthSessionPayload;
