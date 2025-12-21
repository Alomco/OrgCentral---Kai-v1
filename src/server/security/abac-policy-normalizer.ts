import { z } from 'zod';
import type { AbacAttribute, AbacCondition, AbacConditionBlock, AbacPolicy, AbacPredicate } from './abac-types';

const attributeSchema: z.ZodType<AbacAttribute> = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])),
]);

const predicateSchema: z.ZodType<AbacPredicate> = z.object({
  op: z.enum(['eq', 'in', 'ne', 'gt', 'lt']),
  value: z.union([attributeSchema, z.array(attributeSchema)]),
});

const conditionValueSchema: z.ZodType<AbacConditionBlock[string]> = z
  .union([attributeSchema, predicateSchema])
  .optional();

const conditionBlockSchema: z.ZodType<AbacConditionBlock> = z.record(z.string(), conditionValueSchema);

const conditionSchema: z.ZodType<AbacCondition | undefined> = z
  .object({
    subject: conditionBlockSchema.optional(),
    resource: conditionBlockSchema.optional(),
  })
  .strict()
  .optional();

const idSchema = z.string().min(1);

export const abacPolicySchema: z.ZodType<AbacPolicy> = z.object({
  id: idSchema,
  description: z.string().optional(),
  effect: z.enum(['allow', 'deny']),
  actions: z.array(z.string().min(1)).nonempty(),
  resources: z.array(z.string().min(1)).nonempty(),
  condition: conditionSchema,
  priority: z.number().optional(),
});

interface NormalizationOptions {
  /**
   * Skip schema validation when input is already trusted/typed.
   */
  assumeValidated?: boolean;
  /**
   * Throw on invalid policies instead of dropping them (used by write paths).
   */
  failOnInvalid?: boolean;
}

/**
 * Zero-trust normalization: drop malformed policies, deduplicate by ID, and sort by priority (desc).
 */
export function normalizeAbacPolicies(policies: unknown[], options: NormalizationOptions = {}): AbacPolicy[] {
  if (!Array.isArray(policies)) {
    return [];
  }

  const parsed: AbacPolicy[] = [];
  for (const policy of policies) {
    try {
      if (options.assumeValidated) {
        parsed.push(policy as AbacPolicy);
        continue;
      }

      if (options.failOnInvalid) {
        parsed.push(abacPolicySchema.parse(policy));
        continue;
      }

      const result = abacPolicySchema.safeParse(policy);
      if (result.success) {
        parsed.push(result.data);
      }
    } catch {
      if (options.failOnInvalid) {
        throw new Error('Invalid ABAC policy payload encountered during normalization.');
      }
      // swallow malformed entries in keeping with zero-trust normalization
    }
  }

  const deduped = new Map<string, AbacPolicy>();
  for (const policy of parsed) {
    deduped.set(policy.id, policy);
  }

  return Array.from(deduped.values()).sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}
