import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import type { EmployeeProfile } from '@/server/types/hr-types';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PerformanceReviewsPanel } from '@/app/(app)/hr/performance/_components/performance-reviews-panel';
import { TrainingRecordsPanel } from '@/app/(app)/hr/training/_components/training-records-panel';

export interface EmployeeDevelopmentTabProps {
    authorization: RepositoryAuthorizationContext;
    profile: EmployeeProfile;
}

export function EmployeeDevelopmentTab({ authorization, profile }: EmployeeDevelopmentTabProps) {
    return (
        <div className="grid gap-6 lg:grid-cols-3">
            <PerformanceReviewsPanel
                authorization={authorization}
                userId={profile.userId}
                title="Performance summary"
                description="Recent reviews and rating history for this employee."
            />
            <TrainingRecordsPanel
                authorization={authorization}
                userId={profile.userId}
                title="Training summary"
                description="Training courses and certifications on record."
            />
            <SkillMatrixCard profile={profile} />
        </div>
    );
}

function SkillMatrixCard({ profile }: { profile: EmployeeProfile }) {
    const skills = profile.skills ?? [];
    const certifications = profile.certifications ?? [];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Skills & Certifications</CardTitle>
                <CardDescription>Competencies tracked on the employee profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Skills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {skills.length > 0 ? (
                            skills.map((skill) => (
                                <Badge key={skill} variant="secondary">
                                    {skill}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">No skills recorded yet.</span>
                        )}
                    </div>
                </div>
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Certifications</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {certifications.length > 0 ? (
                            certifications.map((certification) => (
                                <Badge
                                    key={`${certification.name}-${certification.issuer}-${String(certification.dateObtained)}`}
                                    variant="outline"
                                >
                                    {certification.name} ({certification.issuer})
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">No certifications recorded yet.</span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
