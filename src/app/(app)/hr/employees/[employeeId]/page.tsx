import { Suspense } from 'react';
import { headers as nextHeaders } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Building,
    Briefcase,
    User,
    Edit,
} from 'lucide-react';

import { getSessionContextOrRedirect } from '@/server/ui/auth/session-redirect';
import { getPeopleService } from '@/server/services/hr/people/people-service.provider';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { EMPLOYEE_STATUS_LABELS } from '../types';

interface EmployeeDetailPageProps {
    params: Promise<{ employeeId: string }>;
}

function getStatusVariant(
    status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'ACTIVE':
            return 'default';
        case 'ON_LEAVE':
            return 'secondary';
        case 'TERMINATED':
        case 'ARCHIVED':
            return 'destructive';
        default:
            return 'outline';
    }
}

function getInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
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

export default async function EmployeeDetailPage({ params }: EmployeeDetailPageProps) {
    const { employeeId } = await params;
    const headerStore = await nextHeaders();
    const { authorization } = await getSessionContextOrRedirect(
        {},
        {
            headers: headerStore,
            requiredPermissions: { organization: ['read'] },
            auditSource: 'ui:hr:employees:detail',
        },
    );

    const peopleService = getPeopleService();

    let employee;
    try {
        const result = await peopleService.getEmployeeProfile({
            authorization,
            payload: { profileId: employeeId },
        });
        employee = result.profile;
    } catch {
        notFound();
    }

    if (!employee) {
        notFound();
    }

    const displayName = employee.displayName ??
        (`${employee.firstName ?? ''} ${employee.lastName ?? ''}`.trim() ||
            'Unknown Employee');

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
                            <Link href="/hr/employees">Employees</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{displayName}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Back Button */}
            <Button variant="ghost" size="sm" asChild>
                <Link href="/hr/employees">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Directory
                </Link>
            </Button>

            {/* Profile Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Avatar className="h-20 w-20">
                            {employee.photoUrl ? (
                                <AvatarImage src={employee.photoUrl} alt={displayName} />
                            ) : null}
                            <AvatarFallback className="text-xl">
                                {getInitials(
                                    employee.firstName ?? '',
                                    employee.lastName ?? '',
                                )}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold">{displayName}</h1>
                                <Badge variant={getStatusVariant(employee.employmentStatus)}>
                                    {EMPLOYEE_STATUS_LABELS[employee.employmentStatus] ?? employee.employmentStatus}
                                </Badge>
                            </div>
                            <p className="text-muted-foreground">
                                {employee.jobTitle ?? 'No job title'}
                            </p>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                                {employee.email ? (
                                    <a
                                        href={`mailto:${employee.email}`}
                                        className="flex items-center gap-1 hover:text-foreground"
                                    >
                                        <Mail className="h-4 w-4" />
                                        {employee.email}
                                    </a>
                                ) : null}
                                {employee.departmentId ? (
                                    <span className="flex items-center gap-1">
                                        <Building className="h-4 w-4" />
                                        {employee.departmentId}
                                    </span>
                                ) : null}
                            </div>
                        </div>
                        <Button variant="outline">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs for different sections */}
            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="employment">Employment</TabsTrigger>
                    <TabsTrigger value="documents">Documents</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Personal Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Personal Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">First Name</p>
                                        <p className="font-medium">{employee.firstName ?? '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Last Name</p>
                                        <p className="font-medium">{employee.lastName ?? '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Email</p>
                                        <p className="font-medium">{employee.email ?? '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Employee Number</p>
                                        <p className="font-medium">{employee.employeeNumber}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Employment Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" />
                                    Employment Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Job Title</p>
                                        <p className="font-medium">{employee.jobTitle ?? '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Department</p>
                                        <p className="font-medium">{employee.departmentId ?? '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Employment Type</p>
                                        <p className="font-medium">{employee.employmentType}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Start Date</p>
                                        <p className="font-medium">{formatDate(employee.startDate)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="employment">
                    <Card>
                        <CardHeader>
                            <CardTitle>Employment History</CardTitle>
                            <CardDescription>Contract and position history</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Employment history will be displayed here.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documents">
                    <Card>
                        <CardHeader>
                            <CardTitle>Documents</CardTitle>
                            <CardDescription>Employee documents and files</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Document management will be available here.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
