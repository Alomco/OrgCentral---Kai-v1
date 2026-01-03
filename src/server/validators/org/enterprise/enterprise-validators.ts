import { z } from 'zod';

export const moduleAccessSchema = z.record(z.string(), z.boolean());
