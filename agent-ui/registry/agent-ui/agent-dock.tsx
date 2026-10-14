"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check, CircleDashed, Loader2, Square, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export type AgentStatus = "idle" | "running" | "waiting" | "done" | "error"
export type AgentStepStatus = "pending" | "running" | "done" | "error"

export interface AgentStep {
  id: string
  label: string
  status: AgentStepStatus
}

export interface AgentDockProps {
  status: AgentStatus
  title: string
  steps?: AgentStep[]
  onStop?: () => void
  actions?: React.ReactNode
  floating?: boolean
  closeDelay?: number
  labels?: Partial<AgentDockLabels>
  className?: string
}

export type AgentDockLabels = Record<AgentStatus | "stop", string>

const defaultLabels: AgentDockLabels = {
  idle: "Idle",
  running: "Working",
  waiting: "Needs your input",
  done: "Finished",
  error: "Stopped with an error",
  stop: "Stop agent",
}

export function AgentDock({
  status,
  title,
  steps = [],
  onStop,
  actions,
  floating = true,
  closeDelay = 150,
  labels: labelsProp,
  className,
}: AgentDockProps) {
  const labels = { ...defaultLabels, ...labelsProp }
  const [open, setOpen] = React.useState(false)
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)
  const panelId = React.useId()
  const done = steps.filter((s) => s.status === "done").length
  const canExpand = steps.length > 0
  const isOpen = open && canExpand

  // A tap fires mouseover and click in the same tick, before React re-renders, so read state from refs.
  const openRef = React.useRef(false)
  const openedAt = React.useRef(0)
  const set = (next: boolean) => {
    if (next && !openRef.current) openedAt.current = Date.now()
    openRef.current = next
    setOpen(next)
  }

  const enter = () => {
    clearTimeout(timer.current)
    set(true)
  }
  const toggle = () => {
    if (openRef.current && Date.now() - openedAt.current < 400) return
    set(!openRef.current)
  }
  const leave = () => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => set(false), closeDelay)
  }
  React.useEffect(() => () => clearTimeout(timer.current), [])

  const dock = (
    <motion.div
      initial={false}
      animate={{ width: isOpen ? 320 : "auto" }}
      transition={{ type: "spring", duration: 0.4, bounce: 0 }}
      onMouseEnter={enter}
      onMouseLeave={leave}
      onKeyDown={(e) => e.key === "Escape" && set(false)}
      className={cn(
        "pointer-events-auto flex max-w-full flex-col overflow-hidden rounded-3xl border border-border bg-popover text-popover-foreground shadow-lg",
        !floating && className,
      )}
      data-status={status}
    >
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="panel"
            id={panelId}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0 }}
          >
            <div className="flex flex-col gap-1 p-3 pb-1">
              <p className="px-1 pb-1 text-xs text-muted-foreground">{labels[status]}</p>
              <ol className="flex flex-col">
                {steps.map((step, i) => (
                  <motion.li
                    key={step.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.03 * i }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-1 py-1.5 text-sm",
                      step.status === "pending" ? "text-muted-foreground" : "text-foreground",
                    )}
                  >
                    <StepIcon status={step.status} />
                    <span className="min-w-0 truncate">{step.label}</span>
                  </motion.li>
                ))}
              </ol>
              {actions && <div className="flex gap-2 px-1 pt-2">{actions}</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 p-1.5">
        <button
          type="button"
          onClick={toggle}
          onFocus={enter}
          aria-expanded={canExpand ? isOpen : undefined}
          aria-controls={canExpand ? panelId : undefined}
          className="flex min-w-0 flex-1 items-center gap-2.5 rounded-full py-1.5 pr-2 pl-2.5 text-left text-sm hover:bg-muted"
        >
          <StatusDot status={status} />
          <span className="max-w-56 min-w-0 truncate text-foreground">{title}</span>
          {canExpand && (
            <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">
              {done}/{steps.length}
            </span>
          )}
          <span className="sr-only">{labels[status]}</span>
        </button>
        {onStop && (status === "running" || status === "waiting") && (
          <button
            type="button"
            onClick={onStop}
            aria-label={labels.stop}
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Square className="size-3 fill-current" />
          </button>
        )}
      </div>
    </motion.div>
  )

  if (!floating) return dock

  return (
    <div className={cn("pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4", className)}>
      {dock}
    </div>
  )
}

function StatusDot({ status }: { status: AgentStatus }) {
  const reduce = useReducedMotion()

  if (status === "done") return <Check className="size-3.5 shrink-0 text-foreground" />
  if (status === "error") return <span className="size-2 shrink-0 rounded-full bg-destructive" />
  if (status === "waiting") return <span className="size-2 shrink-0 rounded-full border-2 border-foreground" />
  if (status === "idle") return <span className="size-2 shrink-0 rounded-full bg-muted-foreground" />

  return (
    <span className="relative flex size-2 shrink-0">
      {!reduce && (
        <motion.span
          className="absolute inset-0 rounded-full bg-primary"
          animate={{ scale: [1, 2.4], opacity: [0.5, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
        />
      )}
      <span className="relative size-2 rounded-full bg-primary" />
    </span>
  )
}

function StepIcon({ status }: { status: AgentStepStatus }) {
  const cls = "size-4 shrink-0"
  if (status === "done") return <Check className={cn(cls, "text-foreground")} />
  if (status === "running") return <Loader2 className={cn(cls, "animate-spin text-foreground")} />
  if (status === "error") return <TriangleAlert className={cn(cls, "text-destructive")} />
  return <CircleDashed className={cn(cls, "text-muted-foreground")} />
}
