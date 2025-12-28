import { z } from 'zod';

import { ValidationError } from '@/server/errors';
import { readJson } from '@/server/api-adapters/http/request-utils';
import { getSessionContext } from '@/server/use-cases/auth/sessions/get-session';
import { getBillingService } from '@/server/services/billing/billing-service.provider';
import type { OrganizationSubscriptionData } from '@/server/types/billing-types';

const checkoutRequestSchema = z.object({}).strict();
const portalRequestSchema = z.object({}).strict();
const ORG_ID_REQUIRED_MESSAGE = 'Organization id is required.';
const BILLING_RESOURCE_TYPE = 'org.billing';

export interface BillingRedirectResult {
  success: true;
  url: string;
}

export interface BillingSubscriptionResult {
  success: true;
  subscription: OrganizationSubscriptionData | null;
}

export async function createBillingCheckoutController(
  request: Request,
  orgId: string,
): Promise<BillingRedirectResult> {
  const normalizedOrgId = orgId.trim();
  if (!normalizedOrgId) {
    throw new ValidationError(ORG_ID_REQUIRED_MESSAGE);
  }

  const body = await readJson(request);
  checkoutRequestSchema.parse(body);

  const { authorization, session } = await getSessionContext(
    {},
    {
      headers: request.headers,
      orgId: normalizedOrgId,
      requiredPermissions: { organization: ['update'] },
      auditSource: 'api:org:billing:checkout',
      action: 'org.billing.checkout',
      resourceType: BILLING_RESOURCE_TYPE,
      resourceAttributes: { orgId: normalizedOrgId },
    },
  );

  const billingService = getBillingService();
  const result = await billingService.createCheckoutSession({
    authorization,
    customerEmail: session.user.email,
  });

  return { success: true, url: result.url };
}

export async function createBillingPortalController(
  request: Request,
  orgId: string,
): Promise<BillingRedirectResult> {
  const normalizedOrgId = orgId.trim();
  if (!normalizedOrgId) {
    throw new ValidationError(ORG_ID_REQUIRED_MESSAGE);
  }

  const body = await readJson(request);
  portalRequestSchema.parse(body);

  const { authorization } = await getSessionContext(
    {},
    {
      headers: request.headers,
      orgId: normalizedOrgId,
      requiredPermissions: { organization: ['update'] },
      auditSource: 'api:org:billing:portal',
      action: 'org.billing.portal',
      resourceType: BILLING_RESOURCE_TYPE,
      resourceAttributes: { orgId: normalizedOrgId },
    },
  );

  const billingService = getBillingService();
  const result = await billingService.createPortalSession({ authorization });

  return { success: true, url: result.url };
}

export async function getBillingSubscriptionController(
  request: Request,
  orgId: string,
): Promise<BillingSubscriptionResult> {
  const normalizedOrgId = orgId.trim();
  if (!normalizedOrgId) {
    throw new ValidationError(ORG_ID_REQUIRED_MESSAGE);
  }

  const { authorization } = await getSessionContext(
    {},
    {
      headers: request.headers,
      orgId: normalizedOrgId,
      requiredPermissions: { organization: ['read'] },
      auditSource: 'api:org:billing:subscription',
      action: 'org.billing.read',
      resourceType: BILLING_RESOURCE_TYPE,
      resourceAttributes: { orgId: normalizedOrgId },
    },
  );

  const billingService = getBillingService();
  const subscription = await billingService.getSubscription({ authorization });

  return { success: true, subscription };
}
