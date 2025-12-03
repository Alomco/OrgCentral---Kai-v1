import type {
    AbsenceDocumentAiValidator,
    AbsenceDocumentAiValidatorResult,
    AbsenceDocumentAnalysisInput,
} from '@/server/types/absence-ai';

interface GeminiValidatorOptions {
    apiKey?: string;
    model?: string;
    apiBaseUrl?: string;
    temperature?: number;
    maxOutputTokens?: number;
}

interface GeminiGenerateContentResponse {
    model?: string;
    modelVersion?: string;
    candidates?: {
        content?: {
            parts?: {
                text?: string;
            }[];
        };
    }[];
}

interface GeminiStructuredJson {
    status?: string;
    summary?: unknown;
    issues?: unknown;
    confidence?: unknown;
    metadata?: unknown;
    datesMatch?: unknown;
    reasonConsistent?: unknown;
    isCurrent?: unknown;
}

export class GeminiAbsenceDocumentValidator implements AbsenceDocumentAiValidator {
    private readonly apiKey?: string;
    private readonly model: string;
    private readonly apiBaseUrl: string;
    private readonly temperature: number;
    private readonly maxOutputTokens: number;

    constructor(options: GeminiValidatorOptions = {}) {
        this.apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
        this.model = options.model ?? process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
        this.apiBaseUrl = options.apiBaseUrl ?? process.env.GEMINI_API_BASE_URL ?? 'https://generativelanguage.googleapis.com/v1beta';
        this.temperature = options.temperature ?? 0.2;
        this.maxOutputTokens = options.maxOutputTokens ?? 512;
    }

    async analyze(input: AbsenceDocumentAnalysisInput): Promise<AbsenceDocumentAiValidatorResult> {
        const apiKey = this.apiKey;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not configured.');
        }

        const prompt = buildPrompt(input);
        const response = await this.invokeGemini({
            apiKey,
            prompt,
            document: input.document,
            mimeType: input.attachment.contentType,
        });
        return normalizeGeminiResponse(response);
    }

    private async invokeGemini(params: {
        apiKey: string;
        prompt: string;
        document: AbsenceDocumentAnalysisInput['document'];
        mimeType: string;
    }): Promise<GeminiGenerateContentResponse> {
        const { apiKey, prompt, document, mimeType } = params;
        const url = `${this.apiBaseUrl.replace(/\/$/, '')}/models/${this.model}:generateContent?key=${apiKey}`;
        const payload = {
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: prompt },
                        { inlineData: { data: document.buffer.toString('base64'), mimeType } },
                    ],
                },
            ],
            generationConfig: {
                temperature: this.temperature,
                maxOutputTokens: this.maxOutputTokens,
            },
        } satisfies Record<string, unknown>;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Gemini API error (${String(response.status)}): ${text}`);
        }

        const json = (await response.json()) as GeminiGenerateContentResponse;
        return json;
    }
}

function buildPrompt(input: AbsenceDocumentAnalysisInput): string {
    const startDate = input.absence.startDate.toISOString().split('T')[0];
    const absenceEndDate = input.absence.endDate as Date | null | undefined;
    const endDate = absenceEndDate ? absenceEndDate.toISOString().split('T')[0] : 'N/A';
    const reason = input.absence.reason ?? 'No reason provided';
    return [
        'You are an HR compliance assistant.',
        'You receive a medical or absence supporting document (embedded below).',
        'Compare it against the absence record and respond with a strict JSON object.',
        'JSON shape: {',
        '  "summary": string,',
        '  "issues": string[],',
        '  "confidence": number (0-1),',
        '  "datesMatch": boolean,',
        '  "reasonConsistent": boolean,',
        '  "isCurrent": boolean,',
        ' }',
        'Guidance:',
        '- datesMatch: true only if document dates align with start/end dates.',
        '- reasonConsistent: true only if described reason fits the absence type.',
        '- isCurrent: true only if document refers to this specific event.',
        '- issues should be empty when everything aligns.',
        '- Summary must be a concise sentence (<= 200 characters).',
        `Absence Type: ${input.absenceType.label}`,
        `Reported Reason: ${reason}`,
        `Start Date: ${startDate}`,
        `End Date: ${endDate}`,
        'Return only JSON. Do not wrap in code fences.',
    ].join('\n');
}

function normalizeGeminiResponse(response: GeminiGenerateContentResponse): AbsenceDocumentAiValidatorResult {
    const text = extractResponseText(response);
    const parsed = parseJsonSafely(text);
    if (!parsed) {
        return {
            status: 'ERROR',
            summary: 'Gemini response could not be parsed.',
            issues: ['AI output was not valid JSON.'],
            confidence: undefined,
            metadata: undefined,
            model: response.model ?? response.modelVersion,
        };
    }
    const datesMatch = Boolean(parsed.datesMatch);
    const reasonConsistent = Boolean(parsed.reasonConsistent);
    const isCurrent = Boolean(parsed.isCurrent);

    const derivedStatus = datesMatch && reasonConsistent && isCurrent ? 'VERIFIED' : 'MISMATCH';
    const summary = typeof parsed.summary === 'string' ? parsed.summary : 'AI validation completed.';
    const issues = Array.isArray(parsed.issues)
        ? parsed.issues.filter((issue: unknown): issue is string => typeof issue === 'string')
        : buildIssues(datesMatch, reasonConsistent, isCurrent);
    const confidence = typeof parsed.confidence === 'number' ? clamp(parsed.confidence, 0, 1) : undefined;
    const metadata = isPlainRecord(parsed.metadata) ? parsed.metadata : undefined;

    return {
        status: parsed.status && isValidStatus(parsed.status) ? parsed.status : derivedStatus,
        summary,
        issues,
        confidence,
        metadata,
        model: response.model ?? response.modelVersion,
    };
}

function extractResponseText(response: GeminiGenerateContentResponse): string {
    const primary = response.candidates?.[0]?.content?.parts ?? [];
    const combined = primary.map((part) => part.text ?? '').join('\n');
    return combined.trim();
}

function parseJsonSafely(text: string): GeminiStructuredJson | null {
    if (!text) {
        return null;
    }
    const sanitized = text.replace(/```json|```/gi, '').trim();
    try {
        const parsed: unknown = JSON.parse(sanitized);
        if (!parsed || typeof parsed !== 'object') {
            return null;
        }
        return parsed as GeminiStructuredJson;
    } catch {
        return null;
    }
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function buildIssues(datesMatch: boolean, reasonConsistent: boolean, isCurrent: boolean): string[] {
    const issues: string[] = [];
    if (!datesMatch) {
        issues.push('Document dates do not align with the reported absence.');
    }
    if (!reasonConsistent) {
        issues.push('Document reason does not appear to match the reported absence type.');
    }
    if (!isCurrent) {
        issues.push('Document may refer to a different or previous event.');
    }
    return issues;
}

function clamp(value: number, min: number, max: number): number {
    if (Number.isNaN(value)) {
        return min;
    }
    return Math.min(Math.max(value, min), max);
}

function isValidStatus(value: unknown): value is 'PENDING' | 'VERIFIED' | 'MISMATCH' | 'ERROR' {
    return value === 'PENDING' || value === 'VERIFIED' || value === 'MISMATCH' || value === 'ERROR';
}
