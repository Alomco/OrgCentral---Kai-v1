import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { a11yLogger } from './logger';
import type {
    PrioritizedIssueEntry,
    PrioritizedIssues,
    PrioritizationSummary,
    ScanResult,
} from './types';

export function prioritizeIssues(results: ScanResult[]): PrioritizationSummary {
    const prioritized: PrioritizedIssues = {
        critical: [],
        serious: [],
        moderate: [],
        minor: [],
    };

    const colorContrastIssues: PrioritizedIssueEntry[] = [];
    const imageAltIssues: PrioritizedIssueEntry[] = [];
    const otherIssues = new Map<string, PrioritizedIssueEntry[]>();

    for (const result of results) {
        for (const violation of result.violations) {
            const entry = { url: result.url, issue: violation };
            prioritized[violation.impact].push(entry);

            if (violation.id.includes('color-contrast')) {
                colorContrastIssues.push(entry);
            } else if (violation.id === 'image-alt') {
                imageAltIssues.push(entry);
            } else {
                if (!otherIssues.has(violation.id)) {
                    otherIssues.set(violation.id, []);
                }
                otherIssues.get(violation.id)?.push(entry);
            }
        }
    }

    return {
        prioritized,
        colorContrastIssues,
        imageAltIssues,
        otherIssues,
    };
}

export function logSummary(results: ScanResult[], summary: PrioritizationSummary): void {
    const totalViolations = results.reduce((sum, result) => sum + result.violations.length, 0);
    const totalElements = results.reduce(
        (sum, result) => sum + result.violations.reduce((accumulator, issue) => accumulator + issue.nodes.length, 0),
        0,
    );

    a11yLogger.info('a11y.scan.summary', {
        routesScanned: results.length,
        totalViolations,
        totalElements,
        severity: {
            critical: summary.prioritized.critical.length,
            serious: summary.prioritized.serious.length,
            moderate: summary.prioritized.moderate.length,
            minor: summary.prioritized.minor.length,
        },
        categories: {
            colorContrast: summary.colorContrastIssues.length,
            imageAlt: summary.imageAltIssues.length,
            other: summary.otherIssues.size,
        },
    });
}

export function logPriorityIssues(summary: PrioritizationSummary): void {
    if (summary.prioritized.critical.length > 0) {
        a11yLogger.warn('a11y.scan.priority.critical', {
            count: summary.prioritized.critical.length,
            sample: summary.prioritized.critical.slice(0, 3).map((entry) => ({
                url: entry.url,
                id: entry.issue.id,
                help: entry.issue.help,
                elements: entry.issue.nodes.length,
            })),
        });
    }

    if (summary.colorContrastIssues.length > 0) {
        a11yLogger.warn('a11y.scan.priority.color-contrast', {
            count: summary.colorContrastIssues.length,
            sample: summary.colorContrastIssues.slice(0, 3).map((entry) => ({
                url: entry.url,
                id: entry.issue.id,
                elements: entry.issue.nodes.length,
            })),
        });
    }

    if (summary.imageAltIssues.length > 0) {
        a11yLogger.warn('a11y.scan.priority.image-alt', {
            count: summary.imageAltIssues.length,
            sample: summary.imageAltIssues.slice(0, 3).map((entry) => ({
                url: entry.url,
                id: entry.issue.id,
                elements: entry.issue.nodes.length,
            })),
        });
    }
}

export function saveReport(results: ScanResult[], summary: PrioritizationSummary): string {
    const reportPath = join(process.cwd(), 'var', 'a11y-scan-results.json');

    try {
        mkdirSync(join(process.cwd(), 'var'), { recursive: true });
    } catch (error) {
        a11yLogger.warn('a11y.scan.report-dir-create-failed', { error });
    }

    writeFileSync(
        reportPath,
        JSON.stringify(
            {
                scanDate: new Date().toISOString(),
                summary: {
                    critical: summary.prioritized.critical.length,
                    serious: summary.prioritized.serious.length,
                    moderate: summary.prioritized.moderate.length,
                    minor: summary.prioritized.minor.length,
                    colorContrast: summary.colorContrastIssues.length,
                    imageAlt: summary.imageAltIssues.length,
                },
                results,
                prioritized: summary.prioritized,
                colorContrastIssues: summary.colorContrastIssues,
                imageAltIssues: summary.imageAltIssues,
            },
            null,
            2,
        ),
    );

    a11yLogger.info('a11y.scan.report-saved', { reportPath });
    return reportPath;
}
