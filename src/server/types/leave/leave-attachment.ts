export interface LeaveAttachmentPayload {
    fileName: string;
    contentType: string;
    fileSize: number;
    storageKey: string;
    checksum?: string;
}
