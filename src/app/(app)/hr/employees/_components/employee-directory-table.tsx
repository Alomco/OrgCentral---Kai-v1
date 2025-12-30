import { Users } from 'lucide-react';

import {
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { EmployeeListResult } from '../types';
import { EmployeeRow } from './employee-row';

interface EmployeeDirectoryTableProps {
    result: EmployeeListResult;
}

export function EmployeeDirectoryTable({ result }: EmployeeDirectoryTableProps) {
    if (result.employees.length === 0) {
        return (
            <div className="rounded-lg border border-dashed bg-muted/50 p-8 text-center">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center space-y-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-7 w-7 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold text-lg">No Employees Found</h3>
                        <p className="text-sm text-muted-foreground">
                            No employees match your current search or filter criteria.
                            Try adjusting your filters or search query.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[280px]">Employee</TableHead>
                        <TableHead className="hidden md:table-cell">Job Title</TableHead>
                        <TableHead className="hidden lg:table-cell">Department</TableHead>
                        <TableHead className="hidden xl:table-cell">Location</TableHead>
                        <TableHead className="hidden sm:table-cell">Status</TableHead>
                        <TableHead className="hidden lg:table-cell">Start Date</TableHead>
                        <TableHead className="w-[50px]">
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {result.employees.map((employee) => (
                        <EmployeeRow key={employee.id} employee={employee} />
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
