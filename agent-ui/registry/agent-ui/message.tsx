"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export interface MessageProps {
  role: "user" | "assistant"
  children: React.ReactNode
  streaming?: boolean
  actions?: React.ReactNode
  className?: string
}

export function Message({ role, children, streaming, actions, className }: MessageProps) {
  const reduce = useReducedMotion()
  const isUser = role === "user"

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", duration: 0.35, bounce: 0 }}
      className={cn("group flex w-full shrink-0 flex-col gap-1", isUser ? "items-end" : "items-start", className)}
      data-role={role}
    >
      <div
        className={cn(
          "text-sm leading-6 text-foreground",
          isUser ? "max-w-md rounded-2xl bg-muted px-4 py-2.5" : "w-full",
        )}
      >
        {children}
        {streaming && <StreamingCaret />}
      </div>
      {actions && !streaming && (
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          {actions}
        </div>
      )}
    </motion.div>
  )
}

function StreamingCaret() {
  const reduce = useReducedMotion()
  return (
    <motion.span
      aria-hidden
      className="ml-1 inline-block size-2 rounded-full bg-foreground align-middle"
      animate={reduce ? undefined : { opacity: [1, 0.25, 1], scale: [1, 0.8, 1] }}
      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
    />
  )
}

export interface MessageActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
}

export function MessageAction({ label, className, children, ...props }: MessageActionProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
