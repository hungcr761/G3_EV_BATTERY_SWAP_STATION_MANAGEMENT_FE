import * as React from "react"
import * as RechartsPrimitive from "recharts"

import { cn } from "../../lib/utils"

const THEMES = { light: "", dark: ".dark" }

const ChartContainer = React.forwardRef(
    ({ id, className, children, config, ...props }, ref) => {
        const uniqueId = React.useId()
        const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

        return (
            <div
                data-chart={chartId}
                ref={ref}
                className={cn(
                    "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
                    className
                )}
                {...props}
            >
                <ChartStyle id={chartId} config={config} />
                <RechartsPrimitive.ResponsiveContainer>
                    {React.isValidElement(children)
                        ? React.cloneElement(children, {
                            id: chartId,
                            ...children.props,
                        })
                        : children}
                </RechartsPrimitive.ResponsiveContainer>
            </div>
        )
    }
)
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config = {} }) => {
    const colorConfig = Object.entries(config).filter(
        ([_, config]) => config.theme || config.color
    )

    if (!colorConfig.length) {
        return null
    }

    return (
        <style
            dangerouslySetInnerHTML={{
                __html: Object.entries(THEMES)
                    .map(
                        ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
                                .map(([key, itemConfig]) => {
                                    const color = itemConfig.theme?.[theme] || itemConfig.color
                                    return color ? `  --color-${key}: ${color};` : null
                                })
                                .join("\n")}
}
`
                    )
                    .join("\n"),
            }}
        />
    )
}

const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef(
    ({ active, payload, className, indicator = "dot", ...props }, ref) => {
        const tooltipContent = payload?.map((item, index) => ({
            ...item,
            color: item.payload?.fill || item.color,
        }))

        if (!active || !tooltipContent?.length) {
            return null
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "grid min-w-[8rem] items-start gap-2 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl",
                    className
                )}
                {...props}
            >
                {tooltipContent.map((item, index) => (
                    <div
                        key={item.dataKey + index}
                        className="flex items-center gap-2 [&>svg]:h-3 [&>svg]:w-3"
                        style={{
                            "--color": item.color,
                        }}
                    >
                        {indicator === "dot" && (
                            <div
                                className="h-2 w-2 shrink-0 rounded-full"
                                style={{
                                    backgroundColor: "var(--color)",
                                }}
                            />
                        )}
                        {indicator === "line" && (
                            <div
                                className="h-0.5 w-3 shrink-0 border-b-[3px]"
                                style={{
                                    borderBottomColor: "var(--color)",
                                }}
                            />
                        )}
                        {indicator === "dashed" && (
                            <div
                                className="h-0.5 w-3 shrink-0 border-b-2 border-dashed"
                                style={{
                                    borderBottomColor: "var(--color)",
                                }}
                            />
                        )}
                        <div
                            className={cn(
                                "flex flex-1 justify-between leading-none",
                                indicator === "dot" && "items-center"
                            )}
                        >
                            <div className="grid gap-1.5">
                                <span className="text-muted-foreground">
                                    {item.name || item.dataKey}
                                </span>
                                {item.value && (
                                    <span className="font-mono font-medium tabular-nums text-foreground">
                                        {typeof item.value === "number"
                                            ? item.value.toLocaleString()
                                            : item.value}
                                    </span>
                                )}
                                {item.unit && (
                                    <span className="font-mono font-medium tabular-nums text-foreground">
                                        {item.unit}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }
)
ChartTooltipContent.displayName = "ChartTooltip"

const ChartLegend = RechartsPrimitive.Legend

const ChartLegendContent = React.forwardRef(
    (
        {
            className,
            hideIcon = false,
            payload,
            verticalAlign = "bottom",
            ...props
        },
        ref
    ) => {
        if (!payload?.length) {
            return null
        }

        return (
            <div
                ref={ref}
                className={cn(
                    "flex items-center justify-center gap-4",
                    verticalAlign === "top" ? "pb-3" : "pt-3",
                    className
                )}
                {...props}
            >
                {payload.map((item) => (
                    <div
                        key={item.dataKey}
                        className={cn(
                            "flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground",
                            item.inactive && "opacity-50"
                        )}
                    >
                        {!hideIcon && (
                            <div
                                className="h-2 w-2 shrink-0 rounded-[2px]"
                                style={{
                                    backgroundColor: item.color,
                                }}
                            />
                        )}
                        {item.payload?.fill ? (
                            <div
                                className="h-3 w-3 shrink-0"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='16' height='16' rx='2' fill='${encodeURIComponent(item.payload.fill)
                                        }'/%3E%3C/svg%3E")`,
                                }}
                            />
                        ) : null}
                        {item.dataKey && (
                            <span className="text-muted-foreground">{item.dataKey}</span>
                        )}
                    </div>
                ))}
            </div>
        )
    }
)
ChartLegendContent.displayName = "ChartLegend"

export {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
    ChartStyle,
}

