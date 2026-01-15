#!/usr/bin/env tsx
/**
 * Accessibility Scanner (entry point)
 * Usage: pnpm a11y:scan (with dev server on localhost:3000)
 */

import { ROUTES_TO_SCAN } from './a11y-scan/routes';
import { a11yLogger } from './a11y-scan/logger';
import {
    awaitAdminBootstrap,
    checkServerRunning,
    closeScanSession,
    createScanSession,
    scanPageWithSession,
} from './a11y-scan/scanner';
import { logPriorityIssues, logSummary, prioritizeIssues, saveReport } from './a11y-scan/reporter';
import type { ScanResult } from './a11y-scan/types';

const BASE_URL = 'http://localhost:3000';

async function main(): Promise<void> {
    a11yLogger.info('a11y.scan.start', {
        baseUrl: BASE_URL,
        routes: ROUTES_TO_SCAN.length,
    });

    const isRunning = await checkServerRunning(BASE_URL);

    if (!isRunning) {
        a11yLogger.error('a11y.scan.server-not-running', { baseUrl: BASE_URL });
        process.exit(1);
    }

    const session = await createScanSession();
    const results: ScanResult[] = [];

    try {
        await awaitAdminBootstrap(session, BASE_URL);

        for (const url of ROUTES_TO_SCAN) {
            results.push(await scanPageWithSession(session, url));
        }

        const summary = prioritizeIssues(results);
        logSummary(results, summary);
        logPriorityIssues(summary);
        saveReport(results, summary);

        a11yLogger.info('a11y.scan.complete', { routes: results.length });
    } finally {
        await closeScanSession(session);
    }
}

main().catch((error: unknown) => {
    a11yLogger.error('a11y.scan.fatal', { error });
    process.exit(1);
});
