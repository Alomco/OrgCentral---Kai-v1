import { BillingService, type BillingServiceDependencies } from '@/server/services/billing/billing-service';
import { resolveBillingConfig, type BillingConfig } from '@/server/services/billing/billing-config';
import { StripeBillingGateway } from '@/server/services/billing/stripe-billing-gateway';
import type { BillingGateway } from '@/server/services/billing/billing-gateway';
import {
    buildBillingRepositoryDependencies,
    type BillingRepositoryDependencyOptions,
    type BillingRepositoryDependencyOverrides,
} from '@/server/repositories/providers/billing/billing-service-dependencies';

let sharedService: BillingService | null = null;

export interface BillingServiceOverrides extends BillingRepositoryDependencyOverrides {
    billingConfig?: BillingConfig;
    billingGateway?: BillingGateway;
    orgSettingsLoader?: BillingServiceDependencies['orgSettingsLoader'];
}

export interface BillingServiceDependencyOptions
    extends Omit<BillingRepositoryDependencyOptions, 'overrides'> {
    overrides?: BillingServiceOverrides;
}

export function resolveBillingService(
  overrides?: BillingServiceOverrides,
  options?: Omit<BillingServiceDependencyOptions, 'overrides'>,
): BillingService | null {
  try {
    const billingConfig = overrides?.billingConfig ?? resolveBillingConfig();
    if (!billingConfig) {
      throw new Error('Billing is not configured.');
    }
    const dependencies: BillingServiceDependencies = {
      ...buildBillingRepositoryDependencies({
        prismaOptions: options?.prismaOptions,
        overrides,
      }),
      billingConfig,
      billingGateway: overrides?.billingGateway ?? new StripeBillingGateway(billingConfig),
      orgSettingsLoader: overrides?.orgSettingsLoader,
    };

    if (!overrides || Object.keys(overrides).length === 0) {
      sharedService ??= new BillingService(dependencies);
      return sharedService;
    }

    return new BillingService(dependencies);
  } catch {
    // Return null if billing is not configured
    return null;
  }
}

export function getBillingService(
  overrides?: BillingServiceDependencyOptions['overrides'],
  options?: Omit<BillingServiceDependencyOptions, 'overrides'>,
): BillingService {
  const service = resolveBillingService(overrides, options);
  if (!service) {
    throw new Error('Billing is not configured.');
  }
  return service;
}

export type BillingServiceContract = Pick<
  BillingService,
  | 'createCheckoutSession'
  | 'createPortalSession'
  | 'getSubscription'
  | 'syncSeats'
  | 'syncSubscriptionPreferences'
  | 'createSetupIntent'
  | 'listPaymentMethods'
  | 'setDefaultPaymentMethod'
  | 'removePaymentMethod'
  | 'listInvoices'
  | 'getInvoice'
  | 'getUpcomingInvoice'
  | 'handleWebhookEvent'
>;
