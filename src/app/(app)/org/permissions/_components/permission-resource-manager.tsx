'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { listPermissionResourcesQuery } from './permissions.api';
import { X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { PermissionResource } from '@/server/types/security-types';

import { PermissionResourceCreateForm } from './permission-resource-create-form';
import { PermissionResourceRow } from './permission-resource-row';
import {
    buildActionOptions,
    filterPermissionResources,
    sortPermissionResources,
    type SortOption,
} from './permission-resource-manager.utils';

export function PermissionResourceManager(props: { orgId: string; resources: PermissionResource[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const [query, setQuery] = useState(() => searchParams.get('q') ?? '');
    const [actionFilter, setActionFilter] = useState<string[]>(() => {
        const actions = searchParams.get('actions');
        return actions ? actions.split(',').filter(Boolean) : [];
    });
    const [sortBy, setSortBy] = useState<SortOption>(() => {
        const value = searchParams.get('sort');
        if (value === 'resource' || value === 'updated' || value === 'actions') {
            return value;
        }
        return 'resource';
    });

    useEffect(() => {
        let last: number | null = null;
        function onKey(event: KeyboardEvent) {
            if (event.key.toLowerCase() !== 'g') {
                return;
            }
            const now = Date.now();
            if (last && now - last < 450) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                last = null;
            } else {
                last = now;
            }
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const { data: liveResources = props.resources } = useQuery({
        ...listPermissionResourcesQuery(props.orgId),
        initialData: props.resources,
    });

    const actionOptions = useMemo(() => buildActionOptions(liveResources), [liveResources]);

    const filteredResources = useMemo(
        () => filterPermissionResources(liveResources, query, actionFilter),
        [actionFilter, liveResources, query],
    );

    const sortedResources = useMemo(
        () => sortPermissionResources(filteredResources, sortBy),
        [filteredResources, sortBy],
    );

    const totalCount = liveResources.length;
    const filteredCount = sortedResources.length;
    const missingDescriptions = props.resources.filter((resource) => {
        return !resource.description || resource.description.trim().length === 0;
    }).length;
    const hasFilters = query.trim().length > 0 || actionFilter.length > 0;

    const clearFilters = () => {
        setQuery('');
        setActionFilter([]);
    };

    useEffect(() => {
        const params = new URLSearchParams();
        if (query) {
            params.set('q', query);
        }
        if (actionFilter.length > 0) {
            params.set('actions', actionFilter.join(','));
        }
        if (sortBy !== 'resource') {
            params.set('sort', sortBy);
        }
        const nextQuery = params.toString();
        const currentQuery = searchParams.toString();
        if (nextQuery !== currentQuery) {
            const href = nextQuery.length > 0 ? `${pathname}?${nextQuery}` : pathname;
            router.replace(href, { scroll: false });
        }
    }, [actionFilter, pathname, query, router, searchParams, sortBy]);

    return (
        <div className="space-y-6">
            <span id="kbd-gg-hint" className="sr-only">Keyboard: press g twice to jump to the top.</span>
            <PermissionResourceCreateForm orgId={props.orgId} />

            <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold">Registered resources</p>
                        <p className="text-xs text-muted-foreground">
                            Showing {filteredCount} of {totalCount}.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search resources or actions"
                            className="h-9 w-60"
                            aria-label="Search permission resources"
                        />
                        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                            <SelectTrigger className="h-9 w-[170px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="resource">A to Z</SelectItem>
                                <SelectItem value="updated">Recently updated</SelectItem>
                                <SelectItem value="actions">Most actions</SelectItem>
                            </SelectContent>
                        </Select>
                        {hasFilters ? (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-9 px-2 text-muted-foreground hover:text-foreground"
                                onClick={clearFilters}
                            >
                                <X className="mr-1 h-4 w-4" />
                                Clear
                            </Button>
                        ) : null}
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-9 px-3"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            aria-label="Jump to Top"
                            aria-describedby="kbd-gg-hint"
                        >
                            Top
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{totalCount} total</Badge>
                    <Badge variant="outline">{actionOptions.length} unique actions</Badge>
                    <Badge variant="outline">{missingDescriptions} missing descriptions</Badge>
                    {hasFilters ? <Badge variant="secondary">{filteredCount} matching</Badge> : null}
                </div>

                {actionOptions.length > 0 ? (
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">Filter by action</p>
                        <ToggleGroup
                            type="multiple"
                            value={actionFilter}
                            onValueChange={setActionFilter}
                            variant="outline"
                            size="sm"
                            className="w-full flex-wrap gap-2"
                            aria-label="Filter resources by action"
                        >
                            {actionOptions.map((actionOption) => (
                                <ToggleGroupItem key={actionOption} value={actionOption}>
                                    {actionOption}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>
                ) : null}

                {sortedResources.length === 0 ? (
                    <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                        <p>
                            {totalCount === 0
                                ? 'No permission resources defined yet.'
                                : 'No permission resources match your filters.'}
                        </p>
                        {hasFilters ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="mt-3"
                                onClick={clearFilters}
                            >
                                Clear filters
                            </Button>
                        ) : null}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {sortedResources.map((resource) => (
                            <PermissionResourceRow key={resource.id} orgId={props.orgId} resource={resource} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
