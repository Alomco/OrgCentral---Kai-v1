import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { a11yLogger } from './logger';

const DEFAULT_PAGE_TIMEOUT_MS = 90000;
const DEFAULT_BOOTSTRAP_TIMEOUT_MS = 420000;
const DEFAULT_POST_LOAD_DELAY_MS = 5000;

export interface ScanSession {
    context: BrowserContext;
}

export interface ScanTimeouts {
    pageTimeoutMs: number;
    bootstrapTimeoutMs: number;
    postLoadDelayMs: number;
}

function readEnvironmentNumber(value: string | undefined, fallback: number): number {
    if (!value) {
        return fallback;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function resolveTimeouts(): ScanTimeouts {
    return {
        pageTimeoutMs: readEnvironmentNumber(process.env.A11Y_PAGE_TIMEOUT_MS, DEFAULT_PAGE_TIMEOUT_MS),
        bootstrapTimeoutMs: readEnvironmentNumber(
            process.env.A11Y_BOOTSTRAP_TIMEOUT_MS,
            DEFAULT_BOOTSTRAP_TIMEOUT_MS,
        ),
        postLoadDelayMs: readEnvironmentNumber(
            process.env.A11Y_POST_LOAD_DELAY_MS,
            DEFAULT_POST_LOAD_DELAY_MS,
        ),
    };
}

export async function launchBrowser(headless = false): Promise<Browser> {
    return chromium.launch({ headless });
}

export async function createPage(browser: Browser): Promise<Page> {
    const context = await browser.newContext();
    return context.newPage();
}

export async function closeBrowser(browser: Browser | null): Promise<void> {
    if (!browser) {
        return;
    }

    try {
        await browser.close();
    } catch (error) {
        a11yLogger.warn('a11y.scan.browser-close-failed', { error });
    }
}

export async function createScanSession(): Promise<ScanSession> {
    const profileDirectory =
        process.env.A11Y_CHROME_PROFILE_DIR ?? join(process.cwd(), 'var', 'a11y-chrome-profile');
    mkdirSync(profileDirectory, { recursive: true });

    const chromeChannel = process.env.A11Y_CHROME_CHANNEL ?? 'chrome';
    const chromeExecutablePath = process.env.A11Y_CHROME_EXECUTABLE_PATH;

    a11yLogger.info('a11y.scan.profile-dir', {
        profileDirectory,
        chromeChannel,
        chromeExecutablePath: chromeExecutablePath ? 'custom' : 'default',
    });

    const context = await chromium.launchPersistentContext(profileDirectory, {
        headless: false,
        channel: chromeChannel,
        executablePath: chromeExecutablePath,
        args: ['--disable-blink-features=AutomationControlled'],
    });

    return { context };
}

export async function closeScanSession(session: ScanSession | null): Promise<void> {
    if (!session) {
        return;
    }

    try {
        await session.context.close();
    } catch (error) {
        a11yLogger.warn('a11y.scan.session-close-failed', { error });
    }
}

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getAuthUrlPattern(baseUrl: string): RegExp {
    const basePattern = escapeRegExp(baseUrl.replace(/\/$/, ''));
    return new RegExp(`${basePattern}/(dashboard|admin/dashboard|hr/dashboard|dev/dashboard|admin-signup/complete)`);
}

async function waitForAuthOnPage(page: Page, pattern: RegExp, timeoutMs: number): Promise<string> {
    await page.waitForURL(pattern, { timeout: timeoutMs });
    return page.url();
}

async function waitForAuthInContext(
    context: BrowserContext,
    pattern: RegExp,
    timeoutMs: number,
): Promise<string> {
    const existing = context.pages();
    for (const page of existing) {
        if (pattern.test(page.url())) {
            return page.url();
        }
    }

    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            context.off('page', handlePage);
            reject(new Error('Timed out waiting for admin bootstrap completion.'));
        }, timeoutMs);

        const handlePage = (page: Page) => {
            const handleUrlChange = () => {
                if (pattern.test(page.url())) {
                    cleanup();
                    resolve(page.url());
                }
            };

            const cleanup = () => {
                clearTimeout(timeout);
                page.off('framenavigated', handleUrlChange);
                context.off('page', handlePage);
            };

            page.on('framenavigated', handleUrlChange);
            handleUrlChange();
        };

        context.on('page', handlePage);
    });
}

async function isAlreadyAuthenticated(context: BrowserContext, baseUrl: string): Promise<boolean> {
    const page = await context.newPage();
    const dashboardUrl = `${baseUrl.replace(/\/$/, '')}/dashboard`;

    try {
        await page.goto(dashboardUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
        const currentUrl = page.url();
        return !currentUrl.includes('/login') && !currentUrl.includes('/admin-signup');
    } finally {
        await page.close();
    }
}

export async function awaitAdminBootstrap(session: ScanSession, baseUrl: string): Promise<void> {
    const page = await session.context.newPage();
    const bootstrapUrl = `${baseUrl.replace(/\/$/, '')}/admin-signup`;

    try {
        const shouldSkipBootstrap = process.env.A11Y_SKIP_BOOTSTRAP === 'true';
        if (shouldSkipBootstrap && await isAlreadyAuthenticated(session.context, baseUrl)) {
            a11yLogger.info('a11y.scan.admin-bootstrap.already-authenticated', { baseUrl });
            return;
        }

        a11yLogger.info('a11y.scan.admin-bootstrap.start', { url: bootstrapUrl });
        const timeouts = resolveTimeouts();
        await page.goto(bootstrapUrl, {
            waitUntil: 'domcontentloaded',
            timeout: timeouts.pageTimeoutMs,
        });
        a11yLogger.info('a11y.scan.admin-bootstrap.await', {
            message: 'Complete OAuth in the opened Chrome window to continue scanning.',
            timeoutMs: timeouts.bootstrapTimeoutMs,
        });

        const pattern = getAuthUrlPattern(baseUrl);
        const timeoutMs = timeouts.bootstrapTimeoutMs;

        const url = await Promise.race([
            waitForAuthOnPage(page, pattern, timeoutMs),
            waitForAuthInContext(session.context, pattern, timeoutMs),
        ]);

        a11yLogger.info('a11y.scan.admin-bootstrap.complete', { url });
    } finally {
        await page.close();
    }
}

export async function checkServerRunning(baseUrl: string): Promise<boolean> {
    let browser: Browser | null = null;

    try {
        browser = await launchBrowser(true);
        const page = await createPage(browser);
        const response = await page.goto(baseUrl, { timeout: 8000, waitUntil: 'domcontentloaded' });
        await page.close();
        return response?.status() === 200 || response?.status() === 304;
    } catch (error) {
        a11yLogger.warn('a11y.scan.server-check-failed', { baseUrl, error });
        return false;
    } finally {
        await closeBrowser(browser);
    }
}
