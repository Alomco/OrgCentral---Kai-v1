import { randomUUID } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';

import { MembershipStatus } from '@prisma/client';
import { createAuth } from '@/server/lib/auth';
import { prisma } from '@/server/lib/prisma';
import { appendSetCookieHeaders } from '@/server/api-adapters/http/set-cookie-headers';

const DEFAULT_NEXT_PATH = '/dashboard';
const LOGIN_PATH = '/login';
const NOT_INVITED_PATH = '/not-invited';

function resolveSafeNextPath(request: NextRequest): string {
    const candidate = request.nextUrl.searchParams.get('next') ?? DEFAULT_NEXT_PATH;
    if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('://')) {
        return DEFAULT_NEXT_PATH;
    }
    return candidate;
}

function resolveOptionalOrgSlug(request: NextRequest): string | null {
    const candidate = request.nextUrl.searchParams.get('org');
    if (typeof candidate !== 'string') {
        return null;
    }
    const trimmed = candidate.trim();
    return trimmed.length > 0 ? trimmed : null;
}

async function resolveOrganizationId(userId: string, orgSlug: string | null): Promise<string | null> {
    if (orgSlug) {
        const membership = await prisma.membership.findFirst({
            where: { userId, status: MembershipStatus.ACTIVE, org: { slug: orgSlug } },
            select: { orgId: true },
        });
        return membership?.orgId ?? null;
    }

    const membership = await prisma.membership.findFirst({
        where: { userId, status: MembershipStatus.ACTIVE },
        select: { orgId: true, activatedAt: true, invitedAt: true },
        orderBy: [
            { activatedAt: 'desc' },
            { invitedAt: 'desc' },
        ],
    });

    return membership?.orgId ?? null;
}

async function handlePostLogin(request: NextRequest): Promise<NextResponse> {
    const auth = createAuth(request.nextUrl.origin);
    const session = await auth.api.getSession({ headers: request.headers });
    const nextPath = resolveSafeNextPath(request);

    if (!session?.session) {
        return buildLoginRedirect(request, nextPath);
    }

    const desiredOrgSlug = resolveOptionalOrgSlug(request);
    const currentActiveOrgId = session.session.activeOrganizationId;

    let desiredOrgId: string | null = null;

    if (desiredOrgSlug) {
        desiredOrgId = await resolveOrganizationId(session.user.id, desiredOrgSlug);
    }

    desiredOrgId ??= currentActiveOrgId ?? await resolveOrganizationId(session.user.id, null);

    if (!desiredOrgId) {
        return buildNotInvitedRedirect(request, nextPath);
    }

    if (currentActiveOrgId === desiredOrgId) {
        return NextResponse.redirect(new URL(nextPath, request.nextUrl.origin));
    }

    await ensureAuthOrganizationBridge(desiredOrgId, session.user.id);

    const { headers: setActiveHeaders } = await auth.api.setActiveOrganization({
        headers: request.headers,
        body: { organizationId: desiredOrgId },
        returnHeaders: true,
    });

    const response = NextResponse.redirect(new URL(nextPath, request.nextUrl.origin));
    appendSetCookieHeaders(setActiveHeaders, response.headers);
    return response;
}

function buildLoginRedirect(request: NextRequest, nextPath: string): NextResponse {
    const url = new URL(`${LOGIN_PATH}?next=${encodeURIComponent(nextPath)}`, request.nextUrl.origin);
    return NextResponse.redirect(url);
}

function buildNotInvitedRedirect(request: NextRequest, nextPath: string): NextResponse {
    const url = new URL(`${NOT_INVITED_PATH}?next=${encodeURIComponent(nextPath)}`, request.nextUrl.origin);
    return NextResponse.redirect(url);
}

async function ensureAuthOrganizationBridge(orgId: string, userId: string): Promise<void> {
    const organization = await prisma.organization.findUnique({
        where: { id: orgId },
        select: { id: true, name: true, slug: true },
    });

    if (!organization) {
        return;
    }

    await prisma.authOrganization.upsert({
        where: { id: organization.id },
        update: { name: organization.name, slug: organization.slug },
        create: {
            id: organization.id,
            name: organization.name,
            slug: organization.slug,
            metadata: JSON.stringify({ seedSource: 'post-login' }),
        },
    });

    const membership = await prisma.membership.findUnique({
        where: { orgId_userId: { orgId, userId } },
        select: { role: { select: { name: true } } },
    });

    const roleName = membership?.role?.name ?? 'member';

    const authMember = await prisma.authOrgMember.findFirst({
        where: { organizationId: organization.id, userId },
        select: { id: true },
    });

    if (authMember) {
        await prisma.authOrgMember.update({
            where: { id: authMember.id },
            data: { role: roleName },
        });
    } else {
        await prisma.authOrgMember.create({
            data: {
                id: randomUUID(),
                organizationId: organization.id,
                userId,
                role: roleName,
            },
        });
    }
}

export async function GET(request: NextRequest): Promise<Response> {
    return handlePostLogin(request);
}

export async function POST(request: NextRequest): Promise<Response> {
    return handlePostLogin(request);
}
