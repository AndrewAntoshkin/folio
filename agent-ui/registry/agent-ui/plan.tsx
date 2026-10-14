"use client"

import { AnimatePresence, motion } from "motion/react"
import { Check, CircleDashed, Loader2, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export type PlanStatus = "pending" | "running" | "done" | "error"

export interface PlanStep {
  id: string
  label: string
  detail?: string
  status: PlanStatus
}

export interface PlanProps {
  title?: string
  steps: PlanStep[]
  labels?: Partial<Record<PlanStatus, string>>
  className?: string
}

const defaultLabels: Record<PlanStatus, string> = {
  pending: "Pending",
  running: "In progress",
  done: "Done",
  error: "Failed",
}

export function Plan({ title, steps, labels: labelsProp, className }: PlanProps) {
  const labels = { ...defaultLabels, ...labelsProp }

  return (
    <div className={cn("w-full shrink-0", className)}>
      {title && <p className="mb-3 text-sm font-medium text-foreground">{title}</p>}
      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <li key={step.id} className="flex gap-3" data-status={step.status}>
            <span className="flex flex-col items-center">
              <StepIcon status={step.status} label={labels[step.status]} />
              {index < steps.length - 1 && <span className="my-1 w-px flex-1 bg-border" />}
            </span>
            <div className={cn("min-w-0 flex-1", index < steps.length - 1 && "pb-4")}>
              <p className={cn("text-sm", step.status === "pending" ? "text-muted-foreground" : "text-foreground")}>
                {step.label}
              </p>
              {step.detail && <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function StepIcon({ status, label }: { status: PlanStatus; label: string }) {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground" role="img" aria-label={label}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={status}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          className="flex"
        >
          {status === "pending" && <CircleDashed className="size-4" />}
          {status === "running" && <Loader2 className="size-4 animate-spin text-foreground" />}
          {status === "done" && <Check className="size-4 text-foreground" />}
          {status === "error" && <TriangleAlert className="size-4 text-destructive" />}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
