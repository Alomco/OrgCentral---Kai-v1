// src/server/services/seeder/seed-billing.ts
import { faker } from '@faker-js/faker';
import { prisma } from '@/server/lib/prisma';
import { getDefaultOrg, getSeededMetadata, type SeedResult, UNKNOWN_ERROR_MESSAGE } from './utils';

export async function seedBillingDataInternal(): Promise<SeedResult> {
    try {
        const org = await getDefaultOrg();

        // 1. Subscription
        // Check if exists first to avoid unique constraint if we didn't clear
        const existingSub = await prisma.organizationSubscription.findUnique({ where: { orgId: org.id } });
        if (!existingSub) {
            await prisma.organizationSubscription.create({
                data: {
                    orgId: org.id,
                    stripeCustomerId: `cus_${faker.string.alphanumeric(14)}`,
                    stripeSubscriptionId: `sub_${faker.string.alphanumeric(14)}`,
                    stripePriceId: `price_${faker.string.alphanumeric(14)}`,
                    status: 'ACTIVE',
                    seatCount: faker.number.int({ min: 5, max: 100 }),
                    currentPeriodEnd: faker.date.future(),
                    metadata: getSeededMetadata(),
                }
            });
        }

        // 2. Billing Invoices
        let invoices = 0;
        for (let index = 0; index < 5; index++) {
            const date = faker.date.past({ years: 1 });
            await prisma.billingInvoice.create({
                data: {
                    orgId: org.id,
                    stripeInvoiceId: `in_${faker.string.alphanumeric(24)}`,
                    status: 'PAID',
                    amountDue: 2000, // £20.00
                    amountPaid: 2000,
                    periodStart: date,
                    periodEnd: new Date(date.getTime() + 30 * 24 * 60 * 60 * 1000),
                    userCount: faker.number.int({ min: 5, max: 50 }),
                    metadata: getSeededMetadata(),
                }
            });
            invoices++;
        }

        // 3. Payment Method
        const existingPm = await prisma.paymentMethod.findFirst({ where: { orgId: org.id } });
        if (!existingPm) {
            await prisma.paymentMethod.create({
                data: {
                    orgId: org.id,
                    stripePaymentMethodId: `pm_${faker.string.alphanumeric(24)}`,
                    type: 'CARD',
                    last4: faker.string.numeric(4),
                    brand: faker.helpers.arrayElement(['visa', 'mastercard', 'amex']),
                    expiryMonth: faker.number.int({ min: 1, max: 12 }),
                    expiryYear: faker.number.int({ min: 2025, max: 2030 }),
                    isDefault: true,
                    metadata: getSeededMetadata(),
                }
            });
        }

        return { success: true, message: `Seeded Billing: Subscription, ${String(invoices)} Invoices, Payment Method.`, count: 1 };
    } catch (error_) {
        return { success: false, message: error_ instanceof Error ? error_.message : UNKNOWN_ERROR_MESSAGE };
    }
}
