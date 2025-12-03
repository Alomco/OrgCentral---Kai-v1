import type { Prisma } from '@prisma/client';

export type OnboardingInvitationStatus = 'pending' | 'accepted' | 'expired' | 'declined' | 'revoked';

export interface OnboardingInvitationCreateInput {
  orgId: string;
  organizationName: string;
  targetEmail: string;
  invitedByUserId?: string | null;
  onboardingData: Prisma.JsonValue;
  expiresAt?: Date | null;
  metadata?: Prisma.JsonValue;
  securityContext?: Prisma.JsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface OnboardingInvitation {
  token: string;
  orgId: string;
  organizationName: string;
  targetEmail: string;
  status: OnboardingInvitationStatus;
  invitedByUserId?: string | null;
  onboardingData: Prisma.JsonValue;
  metadata?: Prisma.JsonValue;
  securityContext?: Prisma.JsonValue;
  ipAddress?: string | null;
  userAgent?: string | null;
  expiresAt?: Date | null;
  acceptedAt?: Date | null;
  acceptedByUserId?: string | null;
  revokedAt?: Date | null;
  revokedByUserId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOnboardingInvitationRepository {
  createInvitation(payload: OnboardingInvitationCreateInput): Promise<OnboardingInvitation>;
  getActiveInvitationByEmail(orgId: string, email: string): Promise<OnboardingInvitation | null>;
  markAccepted(orgId: string, token: string, acceptedByUserId: string): Promise<void>;
  revokeInvitation(orgId: string, token: string, revokedByUserId: string, reason?: string): Promise<void>;
}
