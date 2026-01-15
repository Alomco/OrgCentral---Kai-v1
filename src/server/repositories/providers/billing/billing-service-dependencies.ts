import { prisma as defaultPrismaClient } from '@/server/lib/prisma';
import type { BasePrismaRepositoryOptions, PrismaOptions } from '@/server/repositories/prisma/base-prisma-repository';
import { PrismaOrganizationRepository } from '@/server/repositories/prisma/org/organization/prisma-organization-repository';
import { PrismaMembershipRepository } from '@/server/repositories/prisma/org/membership/prisma-membership-repository';
import {
    PrismaBillingInvoiceRepository,
    PrismaOrganizationSubscriptionRepository,
    PrismaPaymentMethodRepository,
} from '@/server/repositories/prisma/org/billing';
import type { IMembershipRepository } from '@/server/repositories/contracts/org/membership/membership-repository-contract';
import type { IOrganizationRepository } from '@/server/repositories/contracts/org/organization/organization-repository-contract';
import type {
    IBillingInvoiceRepository,
    IOrganizationSubscriptionRepository,
    IPaymentMethodRepository,
} from '@/server/repositories/contracts/org/billing';

export interface BillingRepositoryDependencies {
    subscriptionRepository: IOrganizationSubscriptionRepository;
    membershipRepository: IMembershipRepository;
    organizationRepository: IOrganizationRepository;
    paymentMethodRepository: IPaymentMethodRepository;
    billingInvoiceRepository: IBillingInvoiceRepository;
}

export type BillingRepositoryDependencyOverrides = Partial<BillingRepositoryDependencies>;

export interface BillingRepositoryDependencyOptions {
    prismaOptions?: PrismaOptions;
    overrides?: BillingRepositoryDependencyOverrides;
}

export function buildBillingRepositoryDependencies(
    options?: BillingRepositoryDependencyOptions,
): BillingRepositoryDependencies {
    const prismaClient = options?.prismaOptions?.prisma ?? defaultPrismaClient;
    const repoOptions = {
        prisma: prismaClient,
        trace: options?.prismaOptions?.trace,
        onAfterWrite: options?.prismaOptions?.onAfterWrite,
    } satisfies BasePrismaRepositoryOptions;

    return {
        subscriptionRepository:
            options?.overrides?.subscriptionRepository
            ?? new PrismaOrganizationSubscriptionRepository(repoOptions),
        membershipRepository:
            options?.overrides?.membershipRepository ?? new PrismaMembershipRepository(repoOptions),
        organizationRepository:
            options?.overrides?.organizationRepository
            ?? new PrismaOrganizationRepository({ prisma: prismaClient }),
        paymentMethodRepository:
            options?.overrides?.paymentMethodRepository ?? new PrismaPaymentMethodRepository(repoOptions),
        billingInvoiceRepository:
            options?.overrides?.billingInvoiceRepository ?? new PrismaBillingInvoiceRepository(repoOptions),
    };
}
