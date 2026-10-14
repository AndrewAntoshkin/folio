"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, ChevronRight, CircleDashed, Loader2, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToolCallStatus = "pending" | "running" | "success" | "error"

export interface ToolCallProps {
  name: string
  status: ToolCallStatus
  summary?: string
  input?: unknown
  output?: React.ReactNode
  error?: string
  icon?: React.ReactNode
  defaultOpen?: boolean
  labels?: Partial<ToolCallLabels>
  className?: string
}

export type ToolCallLabels = Record<ToolCallStatus | "inputTitle" | "outputTitle" | "errorTitle", string>

const defaultLabels: ToolCallLabels = {
  pending: "Queued",
  running: "Running",
  success: "Done",
  error: "Failed",
  inputTitle: "Input",
  outputTitle: "Output",
  errorTitle: "Error",
}

export function ToolCall({
  name,
  status,
  summary,
  input,
  output,
  error,
  icon,
  defaultOpen = false,
  labels: labelsProp,
  className,
}: ToolCallProps) {
  const labels = { ...defaultLabels, ...labelsProp }
  const [open, setOpen] = React.useState(defaultOpen)
  const id = React.useId()
  const hasBody = input !== undefined || output !== undefined || Boolean(error)

  return (
    <div
      className={cn(
        "w-full shrink-0 overflow-hidden rounded-2xl border bg-card text-card-foreground",
        status === "error" ? "border-destructive/40" : "border-border",
        className,
      )}
      data-status={status}
    >
      <button
        type="button"
        disabled={!hasBody}
        aria-expanded={hasBody ? open : undefined}
        aria-controls={hasBody ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm enabled:hover:bg-muted/50"
      >
        <span className="flex size-5 shrink-0 items-center justify-center text-muted-foreground">
          {icon ?? <StatusIcon status={status} />}
        </span>
        <span className="shrink-0 font-mono text-xs font-medium text-foreground">{name}</span>
        {summary && <span className="min-w-0 flex-1 truncate text-muted-foreground">{summary}</span>}
        <span
          className={cn(
            "ml-auto shrink-0 text-xs",
            status === "error" ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {labels[status]}
        </span>
        {hasBody && (
          <ChevronRight
            className={cn(
              "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
              open && "rotate-90",
            )}
          />
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && hasBody && (
          <motion.div
            id={id}
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-t border-border px-3 py-3">
              {input !== undefined && (
                <Section title={labels.inputTitle}>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-2.5 font-mono text-xs leading-5 text-foreground">
                    {typeof input === "string" ? input : JSON.stringify(input, null, 2)}
                  </pre>
                </Section>
              )}
              {output !== undefined && (
                <Section title={labels.outputTitle}>
                  {typeof output === "string" ? (
                    <pre className="overflow-x-auto rounded-lg bg-muted p-2.5 font-mono text-xs leading-5 text-foreground">
                      {output}
                    </pre>
                  ) : (
                    output
                  )}
                </Section>
              )}
              {error && (
                <Section title={labels.errorTitle}>
                  <p className="rounded-lg bg-destructive/10 p-2.5 font-mono text-xs leading-5 text-destructive">
                    {error}
                  </p>
                </Section>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
      {children}
    </div>
  )
}

function StatusIcon({ status }: { status: ToolCallStatus }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={status}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0.3 }}
        className="flex"
      >
        {status === "pending" && <CircleDashed className="size-4" />}
        {status === "running" && <Loader2 className="size-4 animate-spin" />}
        {status === "success" && <Check className="size-4 text-foreground" />}
        {status === "error" && <TriangleAlert className="size-4 text-destructive" />}
      </motion.span>
    </AnimatePresence>
  )
}
