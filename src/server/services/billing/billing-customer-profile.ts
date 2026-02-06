import type { OrgSettings } from '@/server/services/org/settings/org-settings-model';

export function resolveBillingCustomerId(settings: OrgSettings): string | null {
  const candidate = settings.billing.billingCustomerId?.trim();
  return candidate && candidate.length > 0 ? candidate : null;
}

export function resolveBillingCustomerEmail(
  settings: OrgSettings,
  fallbackEmail?: string | null,
): string | null {
  const settingsEmail = settings.billing.billingEmail.trim();
  if (settingsEmail.length > 0) {
    return settingsEmail;
  }

  const fallback = fallbackEmail?.trim();
  return fallback && fallback.length > 0 ? fallback : null;
}
