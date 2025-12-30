import { Suspense } from 'react';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft,
    Calendar,
    FileText,
    User,
    Clock,
    CheckCircle,
    AlertTriangle,
    Upload,
} from 'lucide-react';

import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbList,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface ComplianceItemDetailPageProps {
    params: Promise<{ itemId: string }>;
}

function getStatusDetails(status: string): {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
    icon: typeof CheckCircle;
} {
    switch (status) {
        case 'COMPLETED':
            return { label: 'Completed', variant: 'default', icon: CheckCircle };
        case 'PENDING':
            return { label: 'Pending', variant: 'secondary', icon: Clock };
        case 'OVERDUE':
            return { label: 'Overdue', variant: 'destructive', icon: AlertTriangle };
        case 'EXPIRED':
            return { label: 'Expired', variant: 'destructive', icon: AlertTriangle };
        default:
            return { label: status, variant: 'outline', icon: Clock };
    }
}

function formatDate(date: Date | string | null | undefined): string {
    if (!date) {return '—';}
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

export default async function ComplianceItemDetailPage({
    params,
}: ComplianceItemDetailPageProps) {
    const { itemId } = await params;
    const headerStore = await nextHeaders();
    await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'ui:hr:compliance:detail',
        },
    );

    // Placeholder compliance item data
    // In real implementation, this would fetch from the compliance service
    const complianceItem = {
        id: itemId,
        title: 'Annual Compliance Training',
        description: 'Complete the required annual compliance training module.',
        category: 'Training',
        status: 'PENDING',
        assignedTo: 'John Doe',
        assignedToId: 'user-123',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        completedAt: null,
        documents: [],
    };

    const statusDetails = getStatusDetails(complianceItem.status);
    const StatusIcon = statusDetails.icon;

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
                        <BreadcrumbLink asChild>
                            <Link href="/hr/compliance">Compliance</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{complianceItem.title}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Back Button */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/hr/compliance">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Compliance
                </Link>
            </Button>

            {/* Header Card */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CardTitle>{complianceItem.title}</CardTitle>
                                <Badge variant={statusDetails.variant}>
                                    <StatusIcon className="h-3 w-3 mr-1" />
                                    {statusDetails.label}
                                </Badge>
                            </div>
                            <CardDescription>{complianceItem.description}</CardDescription>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Document
                            </Button>
                            <Button>Mark as Complete</Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-muted-foreground">Category</p>
                                <p className="font-medium">{complianceItem.category}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Status</p>
                                <p className="font-medium">{statusDetails.label}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Due Date</p>
                                <p className="font-medium">{formatDate(complianceItem.dueDate)}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">Created</p>
                                <p className="font-medium">{formatDate(complianceItem.createdAt)}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Assignment */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Assignment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <Link
                                    href={`/hr/employees/${complianceItem.assignedToId}`}
                                    className="font-medium hover:underline"
                                >
                                    {complianceItem.assignedTo}
                                </Link>
                                <p className="text-sm text-muted-foreground">Assigned Employee</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Documents
                        </CardTitle>
                        <CardDescription>
                            Supporting documents and attachments
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {complianceItem.documents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center border-2 border-dashed rounded-lg">
                                <Upload className="h-10 w-10 text-muted-foreground/50 mb-3" />
                                <p className="text-sm font-medium">No Documents</p>
                                <p className="text-xs text-muted-foreground mb-4">
                                    Upload documents to attach them to this compliance item
                                </p>
                                <Button variant="outline" size="sm">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Document
                                </Button>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                Documents will be displayed here.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Activity History */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Activity History
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="h-2 w-2 rounded-full bg-muted-foreground/50 mt-2" />
                                <div>
                                    <p className="text-sm">Compliance item created</p>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDate(complianceItem.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
