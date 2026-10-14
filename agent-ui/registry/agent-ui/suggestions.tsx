"use client"

import { motion, useReducedMotion } from "motion/react"
import { cn } from "@/lib/utils"

export type Suggestion = string | { label: string; value: string }

export interface SuggestionsProps {
  items: Suggestion[]
  onSelect: (value: string) => void
  className?: string
}

export function Suggestions({ items, onSelect, className }: SuggestionsProps) {
  const reduce = useReducedMotion()

  return (
    <ul className={cn("flex flex-wrap gap-2", className)} aria-label="Suggestions">
      {items.map((item, i) => {
        const { label, value } = typeof item === "string" ? { label: item, value: item } : item
        return (
          <motion.li
            key={value}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0, delay: i * 0.05 }}
          >
            <button
              type="button"
              onClick={() => onSelect(value)}
              className="rounded-full border border-border bg-background px-3.5 py-1.5 text-sm text-foreground transition-colors hover:bg-muted active:scale-95"
            >
              {label}
            </button>
          </motion.li>
        )
      })}
    </ul>
  )
}
