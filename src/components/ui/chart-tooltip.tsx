"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "@/lib/utils"
import { useChart } from "./chart-context"
import { getPayloadConfigFromPayload } from "./chart.utils"

export const ChartTooltip = RechartsPrimitive.Tooltip

export function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: React.ComponentProps<typeof RechartsPrimitive.Tooltip> &
  React.ComponentProps<"div"> & {
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: "line" | "dot" | "dashed"
    nameKey?: string
    labelKey?: string
  }) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !payload?.length) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || "value"}`
    const itemConfig = getPayloadConfigFromPayload(config, item, key)
    const value =
      !labelKey && typeof label === "string"
        ? config[label as keyof typeof config]?.label || label
        : itemConfig?.label

    if (labelFormatter) {
      return (
        <div className={cn("font-medium", labelClassName)}>
          {labelFormatter(value, payload)}
        </div>
      )
    }

    if (!value) {
      return null
    }

    return <div className={cn("font-medium", labelClassName)}>{value}</div>
  }, [
    label,
    labelFormatter,
    payload,
    hideLabel,
    labelClassName,
    config,
    labelKey,
  ])

  if (!active || !payload?.length) {
    return null
  }

  const nestLabel = payload.length === 1 && indicator !== "dot"

  const renderIndicator = (indicatorColor: string | undefined) => {
    const resolvedColor = indicatorColor ?? "var(--foreground)"

    if (indicator === "line") {
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 12 10"
          className="h-2.5 w-3"
        >
          <line
            x1="1"
            x2="11"
            y1="5"
            y2="5"
            stroke={resolvedColor}
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )
    }

    if (indicator === "dashed") {
      return (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 12 10"
          className={cn("h-2.5 w-3", nestLabel && "my-0.5")}
        >
          <line
            x1="1"
            x2="11"
            y1="5"
            y2="5"
            stroke={resolvedColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="3 2"
          />
        </svg>
      )
    }

    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 12 12"
        className="h-2.5 w-2.5"
      >
        <circle cx="6" cy="6" r="5" fill={resolvedColor} stroke={resolvedColor} />
      </svg>
    )
  }

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-32 max-w-[min(320px,calc(100vw-16px))] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {payload
          .filter((item) => item.type !== "none")
          .map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor = color || item.payload.fill || item.color

            return (
              <div
                key={item.dataKey}
                className={cn(
                  "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && item?.value !== undefined && item.name ? (
                  formatter(item.value, item.name, item, index, item.payload)
                ) : (
                  <>
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      !hideIndicator && (
                        <>{renderIndicator(indicatorColor)}</>
                      )
                    )}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? tooltipLabel : null}
                        <span className="text-muted-foreground">
                          {itemConfig?.label || item.name}
                        </span>
                      </div>
                      {item.value && (
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {item.value.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
      </div>
    </div>
  )
}
