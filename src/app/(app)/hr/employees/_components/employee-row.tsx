import Link from 'next/link';
import { MoreHorizontal, Mail, User } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TableCell, TableRow } from '@/components/ui/table';
import type { EmployeeListItem } from '../types';
import { EMPLOYEE_STATUS_LABELS } from '../types';

interface EmployeeRowProps {
    employee: EmployeeListItem;
}

function getStatusVariant(
    status: EmployeeListItem['employmentStatus'],
): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
        case 'ACTIVE':
            return 'default';
        case 'ON_LEAVE':
            return 'secondary';
        case 'INACTIVE':
        case 'OFFBOARDING':
            return 'outline';
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

function formatDate(date: Date | null): string {
    if (!date) { return '—'; }
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export function EmployeeRow({ employee }: EmployeeRowProps) {
    return (
        <TableRow>
            <TableCell>
                <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                        {employee.avatarUrl ? (
                            <AvatarImage src={employee.avatarUrl} alt={employee.displayName} />
                        ) : null}
                        <AvatarFallback className="text-xs">
                            {getInitials(employee.firstName, employee.lastName)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <Link
                            href={`/hr/employees/${employee.id}`}
                            className="font-medium text-sm hover:underline truncate block"
                        >
                            {employee.displayName}
                        </Link>
                        <p className="text-xs text-muted-foreground truncate">
                            {employee.email}
                        </p>
                    </div>
                </div>
            </TableCell>
            <TableCell className="hidden md:table-cell">
                <span className="text-sm">{employee.jobTitle ?? '—'}</span>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
                <span className="text-sm">{employee.department ?? '—'}</span>
            </TableCell>
            <TableCell className="hidden xl:table-cell">
                <span className="text-sm">{employee.location ?? '—'}</span>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
                <Badge variant={getStatusVariant(employee.employmentStatus)}>
                    {EMPLOYEE_STATUS_LABELS[employee.employmentStatus]}
                </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-muted-foreground">
                    {formatDate(employee.startDate)}
                </span>
            </TableCell>
            <TableCell>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href={`/hr/employees/${employee.id}`}>
                                <User className="h-4 w-4 mr-2" />
                                View Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <a href={`mailto:${employee.email}`}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                            </a>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </TableCell>
        </TableRow>
    );
}
