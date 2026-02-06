import type { Metadata } from 'next';
import { Suspense } from 'react';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { TrendingUp } from 'lucide-react';

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
    HR_ACTION,
    HR_ANY_PERMISSION_PROFILE,
    HR_PERMISSION_PROFILE,
    HR_RESOURCE_TYPE,
} from '@/server/security/authorization';
import { getHrSessionContextOrRedirect, getOptionalHrAuthorization } from '@/server/ui/auth/hr-session';
import { getPerformanceReviewsForUi } from '@/server/use-cases/hr/performance/get-performance-reviews.cached';
import { listPerformanceGoalsByReviewForUi } from '@/server/use-cases/hr/performance/list-performance-goals-by-review.cached';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';

import { HrPageHeader } from '../_components/hr-page-header';
import { HrCardSkeleton } from '../_components/hr-card-skeleton';
import { PerformanceReviewsPanel } from './_components/performance-reviews-panel';
import { PerformanceStatsCard } from './_components/performance-stats-card';
import { TeamPerformanceGrid, type TeamMemberPerformance } from './_components/team-performance-grid';

export const metadata: Metadata = {
    title: 'Performance',
    description: 'Track your performance reviews and career goals.',
};

type PerformanceReview = Awaited<ReturnType<typeof getPerformanceReviewsForUi>>['reviews'][number];

function isCompletedWithRating(
    review: PerformanceReview,
): review is PerformanceReview & { overallRating: number } {
    return (
        review.status === 'completed' &&
        review.overallRating !== null &&
        review.overallRating !== undefined
    );
}

function computeStats(reviews: Awaited<ReturnType<typeof getPerformanceReviewsForUi>>['reviews']) {
    const total = reviews.length;
    const pending = reviews.filter((r) => r.status !== 'completed' && r.status !== 'cancelled').length;

    const completedReviews = reviews.filter(isCompletedWithRating);
    const avgRating = completedReviews.length > 0
        ? completedReviews.reduce((sum, r) => sum + r.overallRating, 0) / completedReviews.length
        : null;

    const futureReviews = reviews
        .filter((r) => r.status !== 'completed' && r.status !== 'cancelled')
        .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
    const firstFutureReview = futureReviews.at(0);
    const nextReview = firstFutureReview ? new Date(firstFutureReview.scheduledDate) : null;

    return { total, pending, avgRating, nextReview };
}

export default async function HrPerformancePage() {
    const headerStore = await nextHeaders();
    const { authorization } = await getHrSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: HR_PERMISSION_PROFILE.PERFORMANCE_LIST,
            auditSource: 'ui:hr:performance',
            action: HR_ACTION.LIST,
            resourceType: HR_RESOURCE_TYPE.PERFORMANCE_REVIEW,
        },
    );

    // Check for manager permissions
    const managerAuthorization = await getOptionalHrAuthorization(
        {},
        {
            headers: headerStore,
            requiredAnyPermissions: HR_ANY_PERMISSION_PROFILE.PERFORMANCE_MANAGEMENT,
            auditSource: 'ui:hr:performance:manager',
            action: HR_ACTION.LIST,
            resourceType: HR_RESOURCE_TYPE.PERFORMANCE_REVIEW,
            resourceAttributes: { view: 'team' },
        },
    );

    const isManager = managerAuthorization !== null;

    const reviewsResult = await getPerformanceReviewsForUi({
        authorization,
        userId: authorization.userId,
    });

    const stats = computeStats(reviewsResult.reviews);
    const teamMembers = managerAuthorization
        ? await buildTeamPerformance(managerAuthorization)
        : [];

    return (
        <div className="space-y-6">
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/hr">HR</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Performance</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            <HrPageHeader
                title="Performance"
                description="Track your performance reviews and career goals."
                icon={<TrendingUp className="h-5 w-5" />}
            />

            <PerformanceStatsCard
                totalReviews={stats.total}
                pendingReviews={stats.pending}
                averageRating={stats.avgRating}
                nextReviewDate={stats.nextReview}
            />

            <Suspense fallback={<HrCardSkeleton variant="table" />}>
                <PerformanceReviewsPanel
                    authorization={authorization}
                    userId={authorization.userId}
                />
            </Suspense>

            {/* Manager View - Team Performance */}
            {isManager ? (
                <TeamPerformanceGrid teamMembers={teamMembers} />
            ) : null}
        </div>
    );
}

async function buildTeamPerformance(
    authorization: RepositoryAuthorizationContext,
): Promise<TeamMemberPerformance[]> {
    const peopleService = getPeopleService();
    const profilesResult = await peopleService.listEmployeeProfiles({
        authorization,
        payload: {},
    }).catch(() => ({ profiles: [] }));

    const directReports = profilesResult.profiles.filter(
        (profile) => profile.managerUserId === authorization.userId,
    );

    const teamMembers: TeamMemberPerformance[] = await Promise.all(
        directReports.map(async (profile) => {
            const reviewsResult = await getPerformanceReviewsForUi({
                authorization,
                userId: profile.userId,
            }).catch(() => ({ reviews: [] }));

            const reviews = reviewsResult.reviews.slice().sort(
                (a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
            );
            const latestReview = reviews.at(0);

            let goalProgress = 0;
            if (latestReview?.id) {
                const goalsResult = await listPerformanceGoalsByReviewForUi({
                    authorization,
                    reviewId: latestReview.id,
                }).catch(() => ({ goals: [] }));

                const goals = goalsResult.goals;
                if (goals.length > 0) {
                    const completed = goals.filter((goal) => goal.status === 'COMPLETED').length;
                    goalProgress = Math.round((completed / goals.length) * 100);
                }
            }

            const status = latestReview?.status ?? 'none';
            const reviewStatus: TeamMemberPerformance['reviewStatus'] =
                status === 'completed'
                    ? 'completed'
                    : status === 'scheduled'
                        ? 'scheduled'
                        : status === 'cancelled'
                            ? 'none'
                            : status === 'submitted'
                                ? 'pending'
                                : 'pending';

            const name = resolveProfileName(profile);

            return {
                id: profile.id,
                name,
                jobTitle: profile.jobTitle ?? 'Team member',
                goalProgress,
                reviewStatus,
                lastReviewRating: latestReview?.overallRating ?? undefined,
            };
        }),
    );

    return teamMembers;
}

function resolveProfileName(
    profile: { displayName?: string | null; firstName?: string | null; lastName?: string | null },
): string {
    const displayName = profile.displayName?.trim();
    if (displayName) {
        return displayName;
    }
    const combined = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    return combined.length > 0 ? combined : 'Employee';
}
