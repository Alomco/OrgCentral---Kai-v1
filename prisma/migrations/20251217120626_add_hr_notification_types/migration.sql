/*
  Warnings:

  - You are about to drop the column `goalsMet` on the `performance_reviews` table. All the data in the column will be lost.
  - You are about to drop the column `reviewPeriod` on the `performance_reviews` table. All the data in the column will be lost.
  - Added the required column `periodEndDate` to the `performance_reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `periodStartDate` to the `performance_reviews` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "hr"."PerformanceGoalStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "hr"."HRNotificationType" ADD VALUE 'time-entry';
ALTER TYPE "hr"."HRNotificationType" ADD VALUE 'training-assigned';
ALTER TYPE "hr"."HRNotificationType" ADD VALUE 'training-due';
ALTER TYPE "hr"."HRNotificationType" ADD VALUE 'training-completed';
ALTER TYPE "hr"."HRNotificationType" ADD VALUE 'training-overdue';

-- DropIndex
DROP INDEX "hr"."performance_reviews_reviewPeriod_idx";

-- AlterTable
ALTER TABLE "hr"."performance_reviews" DROP COLUMN "goalsMet",
DROP COLUMN "reviewPeriod",
ADD COLUMN     "areasForImprovement" TEXT,
ADD COLUMN     "periodEndDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "periodStartDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "strengths" TEXT;

-- CreateTable
CREATE TABLE "hr"."performance_goals" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "reviewId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "status" "hr"."PerformanceGoalStatus" NOT NULL DEFAULT 'PENDING',
    "rating" INTEGER,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "performance_goals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "performance_goals_orgId_status_targetDate_idx" ON "hr"."performance_goals"("orgId", "status", "targetDate");

-- CreateIndex
CREATE INDEX "performance_goals_reviewId_idx" ON "hr"."performance_goals"("reviewId");

-- CreateIndex
CREATE INDEX "performance_reviews_periodStartDate_idx" ON "hr"."performance_reviews"("periodStartDate");

-- CreateIndex
CREATE INDEX "performance_reviews_periodEndDate_idx" ON "hr"."performance_reviews"("periodEndDate");

-- AddForeignKey
ALTER TABLE "hr"."performance_goals" ADD CONSTRAINT "performance_goals_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "hr"."performance_reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
