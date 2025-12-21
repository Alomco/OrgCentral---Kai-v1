/*
  Warnings:

  - The primary key for the `account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `invitation` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `member` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `oauthAccessToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `oauthApplication` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `oauthConsent` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `organization` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `twoFactor` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `verification` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "auth"."account" DROP CONSTRAINT "account_userId_fkey";

-- DropForeignKey
ALTER TABLE "auth"."invitation" DROP CONSTRAINT "invitation_inviterId_fkey";

-- DropForeignKey
ALTER TABLE "auth"."invitation" DROP CONSTRAINT "invitation_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "auth"."member" DROP CONSTRAINT "member_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "auth"."member" DROP CONSTRAINT "member_userId_fkey";

-- DropForeignKey
ALTER TABLE "auth"."oauthAccessToken" DROP CONSTRAINT "oauthAccessToken_userId_fkey";

-- DropForeignKey
ALTER TABLE "auth"."oauthApplication" DROP CONSTRAINT "oauthApplication_userId_fkey";

-- DropForeignKey
ALTER TABLE "auth"."oauthConsent" DROP CONSTRAINT "oauthConsent_userId_fkey";

-- DropForeignKey
ALTER TABLE "auth"."session" DROP CONSTRAINT "session_userId_fkey";

-- DropForeignKey
ALTER TABLE "auth"."twoFactor" DROP CONSTRAINT "twoFactor_userId_fkey";

-- AlterTable
ALTER TABLE "auth"."account" DROP CONSTRAINT "account_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."invitation" DROP CONSTRAINT "invitation_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organizationId" SET DATA TYPE TEXT,
ALTER COLUMN "inviterId" SET DATA TYPE TEXT,
ADD CONSTRAINT "invitation_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."member" DROP CONSTRAINT "member_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "organizationId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "member_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."oauthAccessToken" DROP CONSTRAINT "oauthAccessToken_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "oauthAccessToken_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."oauthApplication" DROP CONSTRAINT "oauthApplication_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "oauthApplication_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."oauthConsent" DROP CONSTRAINT "oauthConsent_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "oauthConsent_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."organization" DROP CONSTRAINT "organization_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "organization_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."session" DROP CONSTRAINT "session_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "activeOrganizationId" SET DATA TYPE TEXT,
ADD CONSTRAINT "session_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."twoFactor" DROP CONSTRAINT "twoFactor_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."user" DROP CONSTRAINT "user_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "user_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "auth"."verification" DROP CONSTRAINT "verification_pkey",
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "verification_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "auth"."session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."member" ADD CONSTRAINT "member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "auth"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."member" ADD CONSTRAINT "member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."invitation" ADD CONSTRAINT "invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "auth"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."invitation" ADD CONSTRAINT "invitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."twoFactor" ADD CONSTRAINT "twoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."oauthApplication" ADD CONSTRAINT "oauthApplication_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."oauthAccessToken" ADD CONSTRAINT "oauthAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."oauthConsent" ADD CONSTRAINT "oauthConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
