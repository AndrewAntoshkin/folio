"use client"

import { cn } from "@/lib/utils"

export interface ChoiceOption {
  value: string
  label: string
  description?: string
}

export interface ChoiceProps {
  question: string
  options: ChoiceOption[]
  value?: string
  onSelect?: (value: string) => void
  disabled?: boolean
  className?: string
}

export function Choice({ question, options, value, onSelect, disabled, className }: ChoiceProps) {
  return (
    <div className={cn("flex w-full shrink-0 flex-col gap-2", className)} role="radiogroup" aria-label={question}>
      <p className="text-sm text-foreground">{question}</p>
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onSelect?.(option.value)}
            className={cn(
              "rounded-2xl border px-4 py-3 text-left text-sm transition-colors disabled:opacity-50",
              selected ? "border-foreground bg-muted" : "border-border bg-card hover:bg-muted/50",
            )}
          >
            <span className="block font-medium text-foreground">{option.label}</span>
            {option.description && <span className="mt-0.5 block text-muted-foreground">{option.description}</span>}
          </button>
        )
      })}
    </div>
  )
}
