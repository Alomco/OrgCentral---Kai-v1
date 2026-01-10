-- CreateEnum
CREATE TYPE "hr"."PaymentMethodType" AS ENUM ('CARD', 'BACS_DEBIT', 'SEPA_DEBIT');

-- CreateEnum
CREATE TYPE "hr"."InvoiceStatus" AS ENUM ('DRAFT', 'OPEN', 'PAID', 'VOID', 'UNCOLLECTIBLE');

-- CreateTable
CREATE TABLE "hr"."payment_methods" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "stripePaymentMethodId" TEXT NOT NULL,
    "type" "hr"."PaymentMethodType" NOT NULL,
    "last4" TEXT NOT NULL,
    "brand" TEXT,
    "bankName" TEXT,
    "expiryMonth" INTEGER,
    "expiryYear" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hr"."billing_invoices" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "stripeInvoiceId" TEXT NOT NULL,
    "status" "hr"."InvoiceStatus" NOT NULL,
    "amountDue" INTEGER NOT NULL,
    "amountPaid" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'gbp',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "userCount" INTEGER NOT NULL,
    "invoiceUrl" TEXT,
    "invoicePdf" TEXT,
    "paidAt" TIMESTAMP(3),
    "metadata" JSONB,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_stripePaymentMethodId_key" ON "hr"."payment_methods"("stripePaymentMethodId");

-- CreateIndex
CREATE INDEX "payment_methods_orgId_idx" ON "hr"."payment_methods"("orgId");

-- CreateIndex
CREATE INDEX "payment_methods_orgId_isDefault_idx" ON "hr"."payment_methods"("orgId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "billing_invoices_stripeInvoiceId_key" ON "hr"."billing_invoices"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "billing_invoices_orgId_periodStart_idx" ON "hr"."billing_invoices"("orgId", "periodStart");

-- CreateIndex
CREATE INDEX "billing_invoices_orgId_status_idx" ON "hr"."billing_invoices"("orgId", "status");

-- AddForeignKey
ALTER TABLE "hr"."payment_methods" ADD CONSTRAINT "payment_methods_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hr"."billing_invoices" ADD CONSTRAINT "billing_invoices_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
