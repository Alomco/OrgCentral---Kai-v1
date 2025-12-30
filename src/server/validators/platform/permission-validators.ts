import { z } from 'zod';

const permissionMetadataSchema = z.record(z.string(), z.any()).optional().nullable();

export const createAppPermissionSchema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().optional(),
    category: z.string().min(1),
    isGlobal: z.boolean().optional(),
    metadata: permissionMetadataSchema.transform(value => value ?? undefined),
});

export const updateAppPermissionSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().optional(),
    category: z.string().min(1).optional(),
    isGlobal: z.boolean().optional(),
    metadata: permissionMetadataSchema.transform(value => value ?? undefined),
});
