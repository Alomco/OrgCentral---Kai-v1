import { setTimeout as delay } from 'node:timers/promises';
import { URL } from 'node:url';
import type {
    AbsenceAttachmentDownloader,
    AttachmentDownloadRequest,
    AttachmentDownloadResult,
} from '@/server/types/absence-ai';

interface HttpAttachmentDownloaderOptions {
    baseUrl?: string;
    timeoutMs?: number;
    retryCount?: number;
}

export class HttpAttachmentDownloader implements AbsenceAttachmentDownloader {
    private readonly baseUrl?: string;
    private readonly timeoutMs: number;
    private readonly retryCount: number;

    constructor(options: HttpAttachmentDownloaderOptions = {}) {
        this.baseUrl = options.baseUrl ?? process.env.ABSENCE_ATTACHMENT_BASE_URL;
        this.timeoutMs = options.timeoutMs ?? Number(process.env.ATTACHMENT_DOWNLOAD_TIMEOUT_MS ?? 15_000);
        this.retryCount = options.retryCount ?? 2;
    }

    async download(request: AttachmentDownloadRequest): Promise<AttachmentDownloadResult> {
        const targetUrl = this.resolveUrl(request.attachment.storageKey);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
        try {
            return await this.fetchWithRetry(targetUrl, request, controller);
        } finally {
            clearTimeout(timeout);
        }
    }

    private async fetchWithRetry(
        url: string,
        request: AttachmentDownloadRequest,
        controller: AbortController,
    ): Promise<AttachmentDownloadResult> {
        let attempt = 0;
        let lastError: unknown;
        while (attempt <= this.retryCount) {
            try {
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) {
                    throw new Error(
                        `Failed to download attachment (${String(response.status)}): ${response.statusText}`,
                    );
                }
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                return {
                    buffer,
                    contentType: response.headers.get('content-type') ?? request.attachment.contentType,
                    fileName: request.attachment.fileName,
                };
            } catch (error) {
                lastError = error;
                attempt += 1;
                if (attempt > this.retryCount) {
                    break;
                }
                await delay(100 * attempt);
            }
        }
        throw new Error(`Unable to download attachment '${request.attachment.fileName}': ${String(lastError)}`);
    }

    private resolveUrl(storageKey: string): string {
        try {
            const explicit = new URL(storageKey);
            return explicit.toString();
        } catch {
            if (!this.baseUrl) {
                throw new Error(
                    'ABSENCE_ATTACHMENT_BASE_URL is not configured and storage key is not an absolute URL.',
                );
            }
            const normalizedKey = storageKey.startsWith('/') ? storageKey.slice(1) : storageKey;
            const base = this.baseUrl.endsWith('/') ? this.baseUrl : `${this.baseUrl}/`;
            return new URL(normalizedKey, base).toString();
        }
    }
}
