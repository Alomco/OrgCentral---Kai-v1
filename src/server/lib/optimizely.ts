import type { Client } from '@optimizely/optimizely-sdk';
import optimizelySDK from '@optimizely/optimizely-sdk';

let clientPromise: Promise<Client | null> | null = null;

async function initClient(): Promise<Client | null> {
    const sdkKey = process.env.OPTIMIZELY_SDK_KEY;
    if (!sdkKey) {
        return null;
    }

    try {
        const client = optimizelySDK.createInstance({ sdkKey });
        if (!client) {
            return null;
        }
        const ready = await client.onReady({ timeout: 2000 });
        if (!ready.success) {
            return null;
        }
        return client;
    } catch {
        return null;
    }
}

export async function getOptimizelyClient(): Promise<Client | null> {
    clientPromise ??= initClient();
    return clientPromise;
}

export interface FeatureDecision {
    enabled: boolean;
    source: 'optimizely' | 'fallback';
}

export async function getFeatureFlagDecision(flagKey: string, userId: string): Promise<FeatureDecision> {
    const client = await getOptimizelyClient();
    if (!client) {
        return { enabled: true, source: 'fallback' };
    }

    const enabled = client.isFeatureEnabled(flagKey, userId, { audience: 'leave-service' });
    client.track('feature_exposure', userId, { flagKey, enabled });
    return { enabled, source: 'optimizely' };
}
