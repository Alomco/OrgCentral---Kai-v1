import type { Buffer } from 'node:buffer';
import type { AbsenceAttachment, AbsenceTypeConfig, UnplannedAbsence } from '@/server/types/hr-ops-types';
import type { AbsenceAiValidationPayload } from '@/server/types/hr-absence-schemas';

export interface AttachmentDownloadRequest {
    attachment: AbsenceAttachment;
    orgId: string;
}

export interface AttachmentDownloadResult {
    buffer: Buffer;
    contentType: string;
    fileName: string;
}

export interface AbsenceAttachmentDownloader {
    download(request: AttachmentDownloadRequest): Promise<AttachmentDownloadResult>;
}

export interface AbsenceDocumentAnalysisInput {
    absence: UnplannedAbsence;
    absenceType: AbsenceTypeConfig;
    attachment: AbsenceAttachment;
    document: AttachmentDownloadResult;
}

export interface AbsenceDocumentAiValidatorResult extends AbsenceAiValidationPayload {
    model?: string;
}

export interface AbsenceDocumentAiValidator {
    analyze(input: AbsenceDocumentAnalysisInput): Promise<AbsenceDocumentAiValidatorResult>;
}
