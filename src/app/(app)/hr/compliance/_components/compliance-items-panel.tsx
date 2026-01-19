import { unstable_noStore as noStore } from 'next/cache';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { RepositoryAuthorizationContext } from '@/server/repositories/security';
import { PrismaComplianceCategoryRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-category-repository';
import { PrismaComplianceItemRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-item-repository';
import { PrismaComplianceTemplateRepository } from '@/server/repositories/prisma/hr/compliance/prisma-compliance-template-repository';
import {
    listComplianceItemsGrouped,
    type ListComplianceItemsGroupedDependencies,
} from '@/server/use-cases/hr/compliance/list-compliance-items-grouped';
import { listComplianceTemplates } from '@/server/use-cases/hr/compliance/list-compliance-templates';

import { formatHumanDate } from '../../_components/format-date';
import { complianceItemStatusBadgeVariant } from '../../_components/hr-badge-variants';
import { buildTemplateItemLookup } from './compliance-template-lookup';

export interface ComplianceItemsPanelProps {
    authorization: RepositoryAuthorizationContext;
    userId: string;
    title?: string;
    description?: string;
}

function formatDate(value: Date | null | undefined): string {
    if (!value) {
        return '—';
    }
    return formatHumanDate(value);
}

export async function ComplianceItemsPanel({
    authorization,
    userId,
    title,
    description,
}: ComplianceItemsPanelProps) {
    if (authorization.dataClassification !== 'OFFICIAL') {
        noStore();
    }

    const useCaseDeps: ListComplianceItemsGroupedDependencies = {
        complianceItemRepository: new PrismaComplianceItemRepository(),
        complianceCategoryRepository: new PrismaComplianceCategoryRepository(),
    };

    const [groups, templates] = await Promise.all([
        listComplianceItemsGrouped(useCaseDeps, { authorization, userId }),
        listComplianceTemplates(
            { complianceTemplateRepository: new PrismaComplianceTemplateRepository() },
            { authorization },
        ),
    ]);

    const templateLookup = buildTemplateItemLookup(templates);

    const filteredGroups = groups
        .map((group) => {
            const items = group.items.filter((item) => {
                const template = templateLookup.get(item.templateItemId);
                return !template?.item.isInternalOnly;
            });
            return { ...group, items };
        })
        .filter((group) => group.items.length > 0);

    const totalItems = filteredGroups.reduce((accumulator, group) => accumulator + group.items.length, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title ?? 'Your compliance items'}</CardTitle>
                <CardDescription>{description ?? 'Assigned items and their current status.'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {totalItems === 0 ? (
                    <div className="text-sm text-muted-foreground">No compliance items assigned yet.</div>
                ) : (
                    filteredGroups.map((group) => (
                        <div key={group.categoryKey} className="space-y-2">
                            <div className="text-sm font-medium">{group.categoryLabel}</div>
                            <div className="overflow-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Item</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Due</TableHead>
                                            <TableHead>Completed</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {group.items.map((item) => {
                                            const templateMeta = templateLookup.get(item.templateItemId);
                                            const itemName = templateMeta?.item.name ?? item.templateItemId;
                                            const guidance = templateMeta?.item.guidanceText;
                                            const itemType = templateMeta?.item.type ?? 'DOCUMENT';

                                            return (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        <Link
                                                            href={`/hr/compliance/${item.id}`}
                                                            className="hover:underline"
                                                        >
                                                            {itemName}
                                                        </Link>
                                                        {guidance ? (
                                                            <div className="text-xs text-muted-foreground">
                                                                {guidance}
                                                            </div>
                                                        ) : null}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {itemType}
                                                    </TableCell>
                                                <TableCell>
                                                    <Badge variant={complianceItemStatusBadgeVariant(item.status)}>
                                                        {item.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{formatDate(item.dueDate)}</TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    {formatDate(item.completedAt)}
                                                </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
