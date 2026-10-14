"use client"

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { FileText, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ArtifactProps {
  title: string
  meta?: string
  icon?: React.ReactNode
  children?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  openLabel?: string
  closeLabel?: string
  className?: string
}

export function Artifact({
  title,
  meta,
  icon,
  children,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  openLabel = "Open",
  closeLabel = "Close",
  className,
}: ArtifactProps) {
  const reduce = useReducedMotion()
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const setOpen = (next: boolean) => {
    setUncontrolled(next)
    onOpenChange?.(next)
  }
  const titleId = React.useId()

  React.useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  return (
    <div className={cn("w-full shrink-0", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={openLabel}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-muted/50"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
          {icon ?? <FileText className="size-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-foreground">{title}</span>
          {meta && <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">{meta}</span>}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.button
              type="button"
              aria-label={closeLabel}
              className="absolute inset-0 bg-foreground/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={reduce ? false : { x: 24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={reduce ? undefined : { x: 24, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0 }}
              className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-background"
            >
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p id={titleId} className="truncate text-sm font-medium text-foreground">
                    {title}
                  </p>
                  {meta && <p className="truncate font-mono text-xs text-muted-foreground">{meta}</p>}
                </div>
                <button
                  type="button"
                  aria-label={closeLabel}
                  onClick={() => setOpen(false)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-auto p-4">{children}</div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
