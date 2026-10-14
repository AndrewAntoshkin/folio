"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check, ShieldQuestion, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ApprovalState = "pending" | "approved" | "denied"

export interface ApprovalProps {
  title: string
  description?: React.ReactNode
  command?: string
  state?: ApprovalState
  onApprove: (options: { always: boolean }) => void
  onDeny: () => void
  allowAlways?: boolean
  approveLabel?: string
  denyLabel?: string
  approvedLabel?: string
  deniedLabel?: string
  alwaysLabel?: string
  autoFocus?: boolean
  className?: string
}

export function Approval({
  title,
  description,
  command,
  state: stateProp,
  onApprove,
  onDeny,
  allowAlways = false,
  approveLabel = "Allow",
  denyLabel = "Deny",
  approvedLabel = "Allowed",
  deniedLabel = "Denied",
  alwaysLabel = "Don't ask again for this action",
  autoFocus = false,
  className,
}: ApprovalProps) {
  const [inner, setInner] = React.useState<ApprovalState>("pending")
  const [always, setAlways] = React.useState(false)
  const state = stateProp ?? inner
  const alwaysId = React.useId()

  const decide = (next: Exclude<ApprovalState, "pending">) => {
    if (stateProp === undefined) setInner(next)
    if (next === "approved") onApprove({ always })
    else onDeny()
  }

  return (
    <div
      className={cn("w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground", className)}
      role={state === "pending" ? "alertdialog" : undefined}
      aria-label={state === "pending" ? title : undefined}
      data-state={state}
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "pending" ? (
          <motion.div key="pending" {...collapse}>
            <div className="flex flex-col gap-3 p-4">
              <div className="flex gap-3">
                <ShieldQuestion className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="text-sm font-medium text-foreground">{title}</p>
                  {description && <div className="text-sm text-muted-foreground">{description}</div>}
                </div>
              </div>
              {command && (
                <pre className="overflow-x-auto rounded-lg bg-muted px-3 py-2 font-mono text-xs leading-5 text-foreground">
                  {command}
                </pre>
              )}
              <div className="flex flex-wrap items-center gap-2">
                {allowAlways && (
                  <label htmlFor={alwaysId} className="mr-auto flex items-center gap-2 text-xs text-muted-foreground">
                    <input
                      id={alwaysId}
                      type="checkbox"
                      checked={always}
                      onChange={(e) => setAlways(e.target.checked)}
                      className="size-3.5 accent-primary"
                    />
                    {alwaysLabel}
                  </label>
                )}
                <div className="ml-auto flex gap-2">
                  <button
                    type="button"
                    onClick={() => decide("denied")}
                    className="h-8 rounded-full border border-border px-3.5 text-sm text-foreground transition-colors hover:bg-muted"
                  >
                    {denyLabel}
                  </button>
                  <button
                    type="button"
                    autoFocus={autoFocus}
                    onClick={() => decide("approved")}
                    className="h-8 rounded-full bg-primary px-3.5 text-sm text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    {approveLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div key="resolved" {...collapse}>
            <div className="flex items-center gap-2 px-3 py-2.5 text-sm">
              {state === "approved" ? (
                <Check className="size-4 shrink-0 text-foreground" />
              ) : (
                <X className="size-4 shrink-0 text-destructive" />
              )}
              <span className="shrink-0 text-muted-foreground">{state === "approved" ? approvedLabel : deniedLabel}</span>
              <span className="min-w-0 truncate text-foreground">{command ?? title}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: { height: "auto", opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: { type: "spring", duration: 0.35, bounce: 0 },
  style: { overflow: "hidden" },
} as const
