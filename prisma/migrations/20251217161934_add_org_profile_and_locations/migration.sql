-- AlterTable
ALTER TABLE "hr"."organizations" ADD COLUMN     "companyType" TEXT,
ADD COLUMN     "contactDetails" JSONB,
ADD COLUMN     "employeeCountRange" TEXT,
ADD COLUMN     "incorporationDate" TIMESTAMP(3),
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "registeredOfficeAddress" TEXT;

-- CreateTable
CREATE TABLE "hr"."locations" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "locations_orgId_idx" ON "hr"."locations"("orgId");

-- AddForeignKey
ALTER TABLE "hr"."locations" ADD CONSTRAINT "locations_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
