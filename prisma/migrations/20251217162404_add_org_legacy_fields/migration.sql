-- AlterTable
ALTER TABLE "hr"."organizations" ADD COLUMN     "address" TEXT,
ADD COLUMN     "availablePermissions" JSONB,
ADD COLUMN     "leaveYearStartDate" TIMESTAMP(3),
ADD COLUMN     "ownerEmail" CITEXT,
ADD COLUMN     "ownerName" TEXT,
ADD COLUMN     "ownerUid" UUID,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "primaryLeaveType" TEXT,
ADD COLUMN     "subscriptionPlan" TEXT,
ADD COLUMN     "subscriptionStatus" TEXT,
ADD COLUMN     "userCount" INTEGER,
ADD COLUMN     "website" TEXT;
