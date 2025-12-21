"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

function stableSkeletonWidth(seed: string): string {
    let hash = 0
    for (const char of seed) {
        hash = (hash << 5) - hash + char.charCodeAt(0)
        hash |= 0
    }
    const normalized = Math.abs(hash % 41) + 50
    return `${normalized}%`
}

export function SidebarMenuSkeleton({
    className,
    showIcon = false,
    ...props
}: React.ComponentProps<"div"> & {
    showIcon?: boolean
}) {
    const instanceId = React.useId()
    const width = React.useMemo(() => stableSkeletonWidth(instanceId), [instanceId])

    return (
        <div
            data-slot="sidebar-menu-skeleton"
            data-sidebar="menu-skeleton"
            className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
            {...props}
        >
            {showIcon && (
                <Skeleton
                    className="size-4 rounded-md"
                    data-sidebar="menu-skeleton-icon"
                />
            )}
            <Skeleton
                className="h-4 max-w-(--skeleton-width) flex-1"
                data-sidebar="menu-skeleton-text"
                style={{ "--skeleton-width": width } as React.CSSProperties}
            />
        </div>
    )
}
