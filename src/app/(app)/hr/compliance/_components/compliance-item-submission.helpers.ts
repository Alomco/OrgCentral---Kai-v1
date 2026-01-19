import type { ComplianceSubDocumentType } from '@/server/types/compliance-types';
import type { PrismaJsonValue } from '@/server/types/prisma';

export type YesNoValue = 'YES' | 'NO';

interface ComplianceSubmissionMetadata {
    acknowledgement?: {
        accepted: boolean;
        at?: string;
    };
    yesNo?: {
        value: YesNoValue;
        prompt?: string;
    };
}

function isRecord(
    value: PrismaJsonValue | null | undefined,
): value is Record<string, PrismaJsonValue> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function normalizeMetadata(
    value: PrismaJsonValue | null | undefined,
): Record<string, PrismaJsonValue> {
    return isRecord(value) ? value : {};
}

export function parseSubmissionMetadata(
    value: PrismaJsonValue | null | undefined,
): ComplianceSubmissionMetadata {
    if (!isRecord(value)) {
        return {};
    }

    const acknowledgementRaw = value.acknowledgement;
    const yesNoRaw = value.yesNo;

    const acknowledgement =
        isRecord(acknowledgementRaw) && typeof acknowledgementRaw.accepted === 'boolean'
            ? {
                accepted: acknowledgementRaw.accepted,
                at: typeof acknowledgementRaw.at === 'string' ? acknowledgementRaw.at : undefined,
            }
            : undefined;

    const yesNoValue: YesNoValue | null =
        isRecord(yesNoRaw) && yesNoRaw.value === 'YES'
            ? 'YES'
            : isRecord(yesNoRaw) && yesNoRaw.value === 'NO'
                ? 'NO'
                : null;
    const yesNoPrompt =
        isRecord(yesNoRaw) && typeof yesNoRaw.prompt === 'string'
            ? yesNoRaw.prompt
            : undefined;
    const yesNo =
        yesNoValue
            ? {
                value: yesNoValue,
                prompt: yesNoPrompt,
            }
            : undefined;

    return { acknowledgement, yesNo };
}

export function toDateInputValue(value: Date | null | undefined): string {
    if (!value) {
        return '';
    }
    const resolved = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(resolved.getTime())) {
        return '';
    }
    return resolved.toISOString().slice(0, 10);
}

export function buildMetadataPayload(
    base: Record<string, PrismaJsonValue>,
    type: ComplianceSubDocumentType | null,
    acknowledgementAccepted: boolean,
    yesNoValue: YesNoValue | null,
    yesNoPrompt?: string,
): Record<string, PrismaJsonValue> | undefined {
    const payload: Record<string, PrismaJsonValue> = { ...base };
    const now = new Date().toISOString();

    if (type === 'ACKNOWLEDGEMENT') {
        payload.acknowledgement = {
            accepted: acknowledgementAccepted,
            at: acknowledgementAccepted ? now : undefined,
        } satisfies ComplianceSubmissionMetadata['acknowledgement'];
    }

    if (type === 'YES_NO' && yesNoValue) {
        payload.yesNo = {
            value: yesNoValue,
            prompt: yesNoPrompt ?? undefined,
        } satisfies ComplianceSubmissionMetadata['yesNo'];
    }

    return Object.keys(payload).length > 0 ? payload : undefined;
}
