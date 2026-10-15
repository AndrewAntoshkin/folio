"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
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
    <figure className={cn("w-full shrink-0 rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-xs", className)}>
      {caption && <figcaption className="mb-4 text-xs font-medium text-muted-foreground">{caption}</figcaption>}
      {data.length === 0 ? (
        <p className="rounded-xl bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ChartPlot data={data} label={label} type={type} />
      )}
    </figure>
  )
}

function ChartPlot({ data, label, type }: { data: ChartPoint[]; label: string; type: "bar" | "line" }) {
  const [hovered, setHovered] = React.useState<number | null>(null)
  const max = Math.max(...data.map((point) => point.value), 1)
  const ticks = [max, max / 2, 0]

  return (
    <div
      className="flex h-52 flex-col select-none"
      role="img"
      aria-label={label}
      onMouseLeave={() => setHovered(null)}
    >
      <div className="flex min-h-0 flex-1 gap-3">
        <div className="relative w-7 shrink-0 text-xs tabular-nums text-muted-foreground">
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
          <Guides count={data.length} hovered={hovered} />
          {type === "line" ? (
            <LineSeries data={data} max={max} hovered={hovered} onHover={setHovered} />
          ) : (
            <BarSeries data={data} max={max} hovered={hovered} onHover={setHovered} />
          )}
        </div>
      </div>
      <div className="mt-3 flex h-4 gap-3">
        <span className="w-7 shrink-0" />
        <div className="flex min-w-0 flex-1">
          {data.map((point, index) => (
            <span
              key={point.label}
              onMouseEnter={() => setHovered(index)}
              className={cn(
                "min-w-0 flex-1 truncate text-center font-mono text-xs leading-4 transition-colors",
                hovered === index ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {point.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function Guides({ count, hovered }: { count: number; hovered: number | null }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      <span className="absolute inset-x-0 top-0 h-px bg-border/70" />
      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border/70" />
      <span className="absolute inset-x-0 bottom-0 h-px bg-border" />
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className={cn(
            "absolute top-0 bottom-0 w-px -translate-x-1/2 transition-colors",
            hovered === index ? "bg-foreground/30" : "bg-border/50",
          )}
          style={{ left: `${((index + 0.5) / count) * 100}%` }}
        />
      ))}
    </div>
  )
}

interface SeriesProps {
  data: ChartPoint[]
  max: number
  hovered: number | null
  onHover: (index: number | null) => void
}

function BarSeries({ data, max, hovered, onHover }: SeriesProps) {
  const reduce = useReducedMotion()

  return (
    <div className="absolute inset-0 flex">
      {data.map((point, index) => {
        const ratio = Math.max(point.value / max, 0)
        const pct = ratio * 100
        const isHovered = hovered === index
        const isDimmed = hovered !== null && !isHovered

        return (
          <div
            key={point.label}
            tabIndex={0}
            role="button"
            aria-label={`${point.label}: ${point.value}`}
            onMouseEnter={() => onHover(index)}
            onFocus={() => onHover(index)}
            onBlur={() => onHover(null)}
            className="group relative min-w-0 flex-1 cursor-pointer outline-none"
          >
            <div
              className={cn(
                "absolute inset-x-1 inset-y-0 rounded-lg transition-colors",
                isHovered && "bg-muted/60",
              )}
            />
            <motion.div
              initial={reduce ? false : { height: "0%" }}
              animate={{
                height: point.value > 0 ? `${Math.max(pct, 4)}%` : "2px",
                opacity: isDimmed ? 0.4 : 1,
              }}
              transition={{
                height: { type: "spring", duration: 0.55, bounce: 0.12, delay: index * 0.04 },
                opacity: { duration: 0.15 },
              }}
              className={cn(
                "absolute inset-x-2.5 bottom-0 rounded-t-lg transition-transform",
                point.value > 0 ? "bg-primary" : "bg-border",
                isHovered && "scale-x-105",
              )}
            />
            <AnimatePresence>
              {isHovered && (
                <Tooltip
                  label={point.label}
                  value={point.value}
                  left={50}
                  top={100 - pct}
                />
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

function LineSeries({ data, max, hovered, onHover }: SeriesProps) {
  const reduce = useReducedMotion()
  const points = data.map((point, index) => {
    const x = ((index + 0.5) / data.length) * 100
    const y = (1 - point.value / max) * 100
    return { x, y, label: point.label, value: point.value }
  })

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x} 100 L ${points[0].x} 100 Z`
      : ""

  return (
    <>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible text-primary"
      >
        <motion.path
          d={areaPath}
          fill="currentColor"
          className="opacity-10"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 0.12 }}
          transition={{ duration: 0.5 }}
        />
        <motion.path
          d={linePath}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
        />
      </svg>

      <div className="absolute inset-0 flex">
        {points.map((point, index) => (
          <div
            key={point.label}
            tabIndex={0}
            role="button"
            aria-label={`${point.label}: ${point.value}`}
            onMouseEnter={() => onHover(index)}
            onFocus={() => onHover(index)}
            onBlur={() => onHover(null)}
            className="relative min-w-0 flex-1 cursor-pointer outline-none"
          />
        ))}
      </div>

      {points.map((point, index) => {
        const isHovered = hovered === index
        return (
          <React.Fragment key={point.label}>
            <motion.span
              initial={reduce ? false : { scale: 0, opacity: 0 }}
              animate={{
                scale: isHovered ? 1.45 : 1,
                opacity: hovered !== null && !isHovered ? 0.5 : 1,
              }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.25, delay: reduce ? 0 : index * 0.04 }}
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-primary shadow-xs"
              style={{ left: `${point.x}%`, top: `${point.y}%` }}
            />
            <AnimatePresence>
              {isHovered && (
                <Tooltip
                  label={point.label}
                  value={point.value}
                  left={point.x}
                  top={point.y}
                />
              )}
            </AnimatePresence>
          </React.Fragment>
        )
      })}
    </>
  )
}

function Tooltip({ label, value, left, top }: { label: string; value: number; left: number; top: number }) {
  const nearTop = top < 22
  return (
    <motion.div
      initial={{ opacity: 0, y: nearTop ? -4 : 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.14 }}
      className={cn(
        "pointer-events-none absolute z-20 flex -translate-x-1/2 items-center gap-1.5 rounded-lg border border-border bg-popover px-2.5 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-md",
        nearTop ? "translate-y-3" : "-translate-y-full -mt-2.5",
      )}
      style={{ left: `${left}%`, top: `${Math.max(0, Math.min(100, top))}%` }}
    >
      <span className="font-mono text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums text-foreground">{value}</span>
    </motion.div>
  )
}

function formatTick(value: number) {
  if (Number.isInteger(value)) return String(value)
  return value.toFixed(1)
}
