"use client"

import { cn } from "@/lib/utils"

export interface ChartPoint {
  label: string
  value: number
}

export interface AnswerChartProps {
  data: ChartPoint[]
  type?: "bar" | "line"
  caption?: string
  empty?: string
  className?: string
}

export function AnswerChart({ data, type = "bar", caption, empty = "Nothing to chart", className }: AnswerChartProps) {
  const label = caption ?? data.map((point) => `${point.label} ${point.value}`).join(", ")

  return (
    <figure className={cn("w-full shrink-0", className)}>
      {data.length === 0 ? (
        <p className="rounded-2xl border border-border px-4 py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ChartPlot data={data} label={label} type={type} />
      )}
      {caption && <figcaption className="mt-2 text-xs text-muted-foreground">{caption}</figcaption>}
    </figure>
  )
}

function ChartPlot({ data, label, type }: { data: ChartPoint[]; label: string; type: "bar" | "line" }) {
  const max = Math.max(...data.map((point) => point.value), 1)
  const ticks = [max, max / 2, 0]

  return (
    <div className="flex h-48 flex-col" role="img" aria-label={label}>
      <div className="flex min-h-0 flex-1 gap-2">
        <div className="relative w-8 shrink-0 text-xs tabular-nums text-muted-foreground">
          {ticks.map((tick, index) => (
            <span
              key={index}
              className={cn(
                "absolute right-0",
                index === 0 && "top-0 -translate-y-1/2",
                index === 1 && "top-1/2 -translate-y-1/2",
                index === 2 && "bottom-0",
              )}
            >
              {formatTick(tick)}
            </span>
          ))}
        </div>
        <div className="relative min-w-0 flex-1">
          <Guides count={data.length} />
          {type === "line" ? <LineSeries data={data} max={max} /> : <BarSeries data={data} max={max} />}
        </div>
      </div>
      <div className="mt-3 flex h-4 gap-2">
        <span className="w-8 shrink-0" />
        {data.map((point) => (
          <span key={point.label} className="min-w-0 flex-1 truncate text-center text-xs leading-4 text-muted-foreground">
            {point.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function Guides({ count }: { count: number }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <span className="absolute inset-x-0 top-0 h-px bg-border" />
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" />
      <span className="absolute inset-x-0 bottom-0 h-px bg-border" />
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="absolute top-0 bottom-0 w-px -translate-x-1/2 bg-border"
          style={{ left: `${((index + 0.5) / count) * 100}%` }}
        />
      ))}
    </div>
  )
}

function BarSeries({ data, max }: { data: ChartPoint[]; max: number }) {
  return (
    <div className="absolute inset-0 flex">
      {data.map((point) => (
        <div key={point.label} className="relative min-w-0 flex-1">
          <div
            className="absolute inset-x-1.5 bottom-0 rounded-t-md bg-primary"
            style={{ height: `${(point.value / max) * 100}%` }}
          />
        </div>
      ))}
    </div>
  )
}

function LineSeries({ data, max }: { data: ChartPoint[]; max: number }) {
  const points = data.map((point, index) => {
    const x = ((index + 0.5) / data.length) * 100
    const y = (1 - point.value / max) * 100
    return { x, y, label: point.label }
  })

  return (
    <>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible text-primary"
      >
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          points={points.map((point) => `${point.x},${point.y}`).join(" ")}
        />
      </svg>
      {points.map((point) => (
        <span
          key={point.label}
          className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
          style={{ left: `${point.x}%`, top: `${point.y}%` }}
        />
      ))}
    </>
  )
}

function formatTick(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}
