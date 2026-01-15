import type { JsonValue } from '@/server/types/json';

type ProtectionLevel = 'mask' | 'encrypt' | 'tokenize';

export function applyPiiProtection(
  value: JsonValue,
  protectionLevel: ProtectionLevel,
  applied: string[],
): JsonValue {
  if (typeof value === 'string') {
    return protectPiiString(value, protectionLevel, applied);
  }

  if (Array.isArray(value)) {
    return value.map(item => applyPiiProtection(item, protectionLevel, applied));
  }

  if (typeof value === 'object' && value !== null) {
    const result: Record<string, JsonValue> = {};
    for (const [key, entry] of Object.entries(value)) {
      result[key] = applyPiiProtection(entry as JsonValue, protectionLevel, applied);
    }
    return result;
  }

  return value;
}

function protectPiiString(
  value: string,
  protectionLevel: ProtectionLevel,
  applied: string[],
): string {
  let protectedValue = value;

  if (/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(protectedValue)) {
    if (protectionLevel === 'mask') {
      protectedValue = protectedValue.replace(
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        '[EMAIL REDACTED]',
      );
    }
    applied.push('email_masking');
  }

  if (/\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(protectedValue)) {
    if (protectionLevel === 'mask') {
      protectedValue = protectedValue.replace(
        /\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
        '[PHONE REDACTED]',
      );
    }
    applied.push('phone_masking');
  }

  if (/\b\d{3}-\d{2}-\d{4}\b/.test(protectedValue)) {
    if (protectionLevel === 'mask') {
      protectedValue = protectedValue.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN REDACTED]');
    }
    applied.push('ssn_masking');
  }

  return protectedValue;
}
