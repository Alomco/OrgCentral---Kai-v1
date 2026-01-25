import { CalendarClock, Clock, Users, AlertTriangle } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
import { getLeaveRequests } from '@/server/use-cases/hr/leave/get-leave-requests';
import { getAbsences } from '@/server/use-cases/hr/absences/get-absences';
import { getTimeTrackingService } from '@/server/services/hr/time-tracking/time-tracking-service.provider';
import { PrismaLeaveRequestRepository } from '@/server/repositories/prisma/hr/leave/prisma-leave-request-repository';
import { PrismaUnplannedAbsenceRepository } from '@/server/repositories/prisma/hr/absences/prisma-unplanned-absence-repository';
import type { EmployeeProfile } from '@/server/types/hr-types';
import { formatHumanDate } from '../../_components/format-date';

interface ManagerSnapshotProps {
    authorization: RepositoryAuthorizationContext;
}

function normalizeDate(value: Date | string | null | undefined): Date | null {
    if (!value) {
        return null;
    }
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function buildUpcomingAnniversaries(profiles: EmployeeProfile[], windowDays = 45) {
    const today = new Date();
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const upcoming = profiles
        .map((profile) => {
            const startDate = normalizeDate(profile.startDate);
            if (!startDate) {
                return null;
            }

            const anniversary = new Date(
                startOfToday.getFullYear(),
                startDate.getMonth(),
                startDate.getDate(),
            );
            if (anniversary < startOfToday) {
                anniversary.setFullYear(anniversary.getFullYear() + 1);
            }

            const diffMs = anniversary.getTime() - startOfToday.getTime();
            const diffDays = Math.round(diffMs / 86400000);
            if (diffDays > windowDays) {
                return null;
            }

            return {
                id: profile.id,
                name: resolveProfileName(profile),
                anniversary,
                diffDays,
            };
        })
        .filter((value): value is NonNullable<typeof value> => Boolean(value))
        .sort((left, right) => left.diffDays - right.diffDays)
        .slice(0, 3);

    return upcoming;
}

function resolveProfileName(profile: { displayName?: string | null; firstName?: string | null; lastName?: string | null }): string {
    const displayName = profile.displayName?.trim();
    if (displayName) {
        return displayName;
    }
    const combined = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
    return combined.length > 0 ? combined : 'Employee';
}

export async function ManagerSnapshot({ authorization }: ManagerSnapshotProps) {
    const peopleService = getPeopleService();
    const profilesResult = await peopleService.listEmployeeProfiles({
        authorization,
        payload: {},
    }).catch(() => ({ profiles: [] }));

    const directReports = profilesResult.profiles.filter(
        (profile) => profile.managerUserId === authorization.userId,
    );

    if (directReports.length === 0) {
        return null;
    }

    const teamUserIds = new Set(directReports.map((profile) => profile.userId));
    const teamEmployeeIds = new Set(directReports.map((profile) => profile.id));

    const [leaveRequestsResult, absencesResult, timeEntriesResult] = await Promise.all([
        getLeaveRequests(
            { leaveRequestRepository: new PrismaLeaveRequestRepository() },
            {
                authorization,
                filters: { status: 'submitted' },
            },
        ).catch(() => ({ requests: [] })),
        getAbsences(
            { absenceRepository: new PrismaUnplannedAbsenceRepository() },
            {
                authorization,
                filters: {
                    from: new Date(),
                    to: new Date(),
                },
            },
        ).catch(() => ({ absences: [] })),
        getTimeTrackingService()
            .listTimeEntries({
                authorization,
                filters: { status: 'COMPLETED' },
            })
            .catch(() => ({ entries: [] })),
    ]);

    const pendingLeaveRequests = leaveRequestsResult.requests.filter((request) =>
        teamEmployeeIds.has(request.employeeId),
    ).length;
    const teamAbsencesToday = absencesResult.absences.filter((absence) =>
        teamUserIds.has(absence.userId),
    ).length;
    const pendingTimeEntries = timeEntriesResult.entries.filter((entry) =>
        teamUserIds.has(entry.userId),
    ).length;

    const upcomingAnniversaries = buildUpcomingAnniversaries(directReports);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Manager Snapshot
                </CardTitle>
                <CardDescription>Team coverage and approvals at a glance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <MetricItem label="Direct reports" value={directReports.length} icon={Users} />
                    <MetricItem label="Absences today" value={teamAbsencesToday} icon={AlertTriangle} />
                    <MetricItem label="Pending leave approvals" value={pendingLeaveRequests} icon={CalendarClock} />
                    <MetricItem label="Pending timesheets" value={pendingTimeEntries} icon={Clock} />
                </div>

                <div className="space-y-2 rounded-lg border border-dashed p-3">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Upcoming anniversaries
                        </p>
                        <Badge variant="secondary">{upcomingAnniversaries.length}</Badge>
                    </div>
                    {upcomingAnniversaries.length > 0 ? (
                        <div className="space-y-1 text-sm">
                            {upcomingAnniversaries.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <span className="font-medium">{item.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {formatHumanDate(item.anniversary)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">
                            No anniversaries in the next 45 days.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

function MetricItem({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: number;
    icon: typeof Users;
}) {
    return (
        <div data-ui-surface="item" className="flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4" />
                <span>{label}</span>
            </div>
            <span className="text-lg font-semibold">{value}</span>
        </div>
    );
}

export function ManagerSnapshotSkeleton() {
    return (
        <Card>
            <CardHeader>
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="h-4 w-48 rounded bg-muted" />
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="h-12 rounded border bg-muted/40" />
                    ))}
                </div>
                <div className="h-16 rounded border border-dashed bg-muted/30" />
            </CardContent>
        </Card>
    );
}
