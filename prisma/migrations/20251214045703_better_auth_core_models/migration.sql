-- CreateEnum
CREATE TYPE "org"."NotificationTopic" AS ENUM ('leave-approval', 'leave-rejection', 'document-expiry', 'policy-update', 'performance-review', 'system-announcement', 'compliance-reminder', 'broadcast', 'other');

-- CreateEnum
CREATE TYPE "org"."NotificationUrgency" AS ENUM ('low', 'medium', 'high', 'urgent');

-- CreateTable
CREATE TABLE "auth"."verification" (
    "id" UUID NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."user" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "email" CITEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "username" CITEXT,
    "displayUsername" TEXT,
    "twoFactorEnabled" BOOLEAN DEFAULT false,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."session" (
    "id" UUID NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" UUID NOT NULL,
    "activeOrganizationId" UUID,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."account" (
    "id" UUID NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."organization" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" CITEXT NOT NULL,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" TEXT,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."member" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."invitation" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "email" CITEXT NOT NULL,
    "role" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "inviterId" UUID NOT NULL,

    CONSTRAINT "invitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."twoFactor" (
    "id" UUID NOT NULL,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "userId" UUID NOT NULL,

    CONSTRAINT "twoFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."oauthApplication" (
    "id" UUID NOT NULL,
    "name" TEXT,
    "icon" TEXT,
    "metadata" TEXT,
    "clientId" CITEXT,
    "clientSecret" TEXT,
    "redirectURLs" TEXT,
    "type" TEXT,
    "disabled" BOOLEAN DEFAULT false,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "oauthApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."oauthAccessToken" (
    "id" UUID NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "clientId" CITEXT,
    "userId" UUID,
    "scopes" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "oauthAccessToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."oauthConsent" (
    "id" UUID NOT NULL,
    "clientId" CITEXT,
    "userId" UUID,
    "scopes" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "consentGiven" BOOLEAN,

    CONSTRAINT "oauthConsent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org"."notification_messages" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "topic" "org"."NotificationTopic" NOT NULL DEFAULT 'other',
    "priority" "org"."NotificationUrgency" NOT NULL DEFAULT 'medium',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "actionUrl" TEXT,
    "actionLabel" TEXT,
    "scheduledFor" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "retentionPolicyId" TEXT NOT NULL,
    "dataClassification" "hr"."DataClassificationLevel" NOT NULL DEFAULT 'OFFICIAL',
    "residencyTag" "hr"."DataResidencyZone" NOT NULL DEFAULT 'UK_ONLY',
    "schemaVersion" INTEGER NOT NULL DEFAULT 1,
    "correlationId" TEXT,
    "createdByUserId" UUID,
    "auditSource" TEXT NOT NULL DEFAULT 'notification-service',
    "metadata" JSONB,
    "auditTrail" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "auth"."verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "auth"."user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "auth"."user"("username");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "auth"."session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "auth"."session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "auth"."account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "auth"."organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "oauthApplication_clientId_key" ON "auth"."oauthApplication"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "oauthAccessToken_accessToken_key" ON "auth"."oauthAccessToken"("accessToken");

-- CreateIndex
CREATE UNIQUE INDEX "oauthAccessToken_refreshToken_key" ON "auth"."oauthAccessToken"("refreshToken");

-- CreateIndex
CREATE INDEX "notification_messages_orgId_userId_isRead_idx" ON "org"."notification_messages"("orgId", "userId", "isRead");

-- CreateIndex
CREATE INDEX "notification_messages_orgId_retentionPolicyId_idx" ON "org"."notification_messages"("orgId", "retentionPolicyId");

-- CreateIndex
CREATE INDEX "notification_messages_orgId_dataClassification_residencyTag_idx" ON "org"."notification_messages"("orgId", "dataClassification", "residencyTag");

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
ALTER TABLE "auth"."oauthAccessToken" ADD CONSTRAINT "oauthAccessToken_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "auth"."oauthApplication"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."oauthAccessToken" ADD CONSTRAINT "oauthAccessToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."oauthConsent" ADD CONSTRAINT "oauthConsent_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "auth"."oauthApplication"("clientId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."oauthConsent" ADD CONSTRAINT "oauthConsent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."notification_messages" ADD CONSTRAINT "notification_messages_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "hr"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org"."notification_messages" ADD CONSTRAINT "notification_messages_orgId_userId_fkey" FOREIGN KEY ("orgId", "userId") REFERENCES "hr"."memberships"("orgId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;
