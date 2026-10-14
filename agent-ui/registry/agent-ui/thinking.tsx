"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ThinkingProps {
  active: boolean
  children?: React.ReactNode
  duration?: number
  label?: string
  doneLabel?: (seconds: number) => string
  defaultOpen?: boolean
  className?: string
}

export function Thinking({
  active,
  children,
  duration,
  label = "Thinking",
  doneLabel = (s) => `Thought for ${s}s`,
  defaultOpen = false,
  className,
}: ThinkingProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const measured = useActiveDuration(active)
  const seconds = duration ?? measured
  const id = React.useId()
  const hasBody = Boolean(children)

  return (
    <div className={cn("flex shrink-0 flex-col", className)}>
      <button
        type="button"
        disabled={!hasBody}
        aria-expanded={hasBody ? open : undefined}
        aria-controls={hasBody ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        className="group flex w-fit items-center gap-1 text-sm text-muted-foreground transition-colors enabled:hover:text-foreground"
      >
        {active ? <ShimmerText>{label}</ShimmerText> : <span>{doneLabel(seconds)}</span>}
        {hasBody && (
          <ChevronRight
            className={cn("size-3.5 transition-transform duration-200", open && "rotate-90")}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && hasBody && (
          <motion.div
            id={id}
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-2 border-l-2 border-border pl-3 text-sm leading-6 text-muted-foreground">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function ShimmerText({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.span
      className={cn("bg-clip-text text-transparent", className)}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--muted-foreground) 0%, var(--muted-foreground) 35%, var(--foreground) 50%, var(--muted-foreground) 65%, var(--muted-foreground) 100%)",
        backgroundSize: "250% 100%",
      }}
      initial={{ backgroundPosition: "100% 0%" }}
      animate={reduce ? undefined : { backgroundPosition: ["100% 0%", "0% 0%"] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
    >
      {children}
    </motion.span>
  )
}

function useActiveDuration(active: boolean) {
  const start = React.useRef<number | null>(active ? Date.now() : null)
  const [seconds, setSeconds] = React.useState(0)

  React.useEffect(() => {
    if (active) {
      start.current = Date.now()
    } else if (start.current !== null) {
      setSeconds(Math.max(1, Math.round((Date.now() - start.current) / 1000)))
      start.current = null
    }
  }, [active])

  return seconds
}
