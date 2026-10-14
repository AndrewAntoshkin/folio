"use client"

import { motion } from "motion/react"
import { cn } from "@/lib/utils"

export interface ContextMeterProps {
  used: number
  limit: number
  size?: number
  showLabel?: boolean
  warnAt?: number
  className?: string
}

export function formatTokens(n: number) {
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${+(n / 1_000).toFixed(1)}k`
  return String(n)
}

export function ContextMeter({
  used,
  limit,
  size = 18,
  showLabel = true,
  warnAt = 0.9,
  className,
}: ContextMeterProps) {
  const ratio = limit > 0 ? Math.min(Math.max(used / limit, 0), 1) : 0
  const stroke = 2.5
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const warn = ratio >= warnAt
  const percent = Math.round(ratio * 100)

  return (
    <div
      role="meter"
      aria-label="Context window"
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={used}
      aria-valuetext={`${formatTokens(used)} of ${formatTokens(limit)} tokens, ${percent}%`}
      title={`${percent}% of context used`}
      className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums", className)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-muted" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={false}
          animate={{ strokeDashoffset: circumference * (1 - ratio) }}
          transition={{ type: "spring", duration: 0.6, bounce: 0 }}
          className={cn("transition-colors", warn ? "stroke-destructive" : "stroke-foreground")}
        />
      </svg>
      {showLabel && (
        <span className={cn(warn && "text-destructive")}>
          {formatTokens(used)} / {formatTokens(limit)}
        </span>
      )}
    </div>
  )
}
