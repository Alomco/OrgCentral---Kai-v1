import { z } from 'zod';

const jsonSchema = z.record(z.string(), z.any()).optional().nullable();

export const complianceMetadataSchema = jsonSchema;

export const attachmentSchema = z.array(z.string());

export const complianceTemplateItemSchema = z.object({
    id: z.string(),
    name: z.string().min(1),
    type: z.enum(['DOCUMENT', 'COMPLETION_DATE', 'YES_NO', 'ACKNOWLEDGEMENT']),
    isMandatory: z.boolean(),
    guidanceText: z.string().optional(),
    allowedFileTypes: z.array(z.enum(['pdf', 'docx', 'jpg', 'png'])).optional(),
    yesNoPrompt: z.string().optional(),
    acknowledgementText: z.string().optional(),
    reminderDaysBeforeExpiry: z.number().optional(),
    expiryDurationDays: z.number().optional(),
    isInternalOnly: z.boolean().optional(),
    metadata: jsonSchema,
});
