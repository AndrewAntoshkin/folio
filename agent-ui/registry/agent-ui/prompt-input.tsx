"use client"

import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowUp, Paperclip, Square, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type PromptInputStatus = "idle" | "submitting" | "streaming"

export interface PromptAttachment {
  id: string
  name: string
}

export interface PromptInputProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  onSubmit: (value: string) => void
  onStop?: () => void
  status?: PromptInputStatus
  placeholder?: string
  maxRows?: number
  attachments?: PromptAttachment[]
  onAttach?: () => void
  onRemoveAttachment?: (id: string) => void
  toolbar?: React.ReactNode
  disabled?: boolean
  autoFocus?: boolean
  attachLabel?: string
  sendLabel?: string
  stopLabel?: string
  removeLabel?: (name: string) => string
  className?: string
}

export function PromptInput({
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onSubmit,
  onStop,
  status = "idle",
  placeholder = "Ask anything",
  maxRows = 8,
  attachments = [],
  onAttach,
  onRemoveAttachment,
  toolbar,
  disabled,
  autoFocus,
  attachLabel = "Attach file",
  sendLabel = "Send",
  stopLabel = "Stop generating",
  removeLabel = (name) => `Remove ${name}`,
  className,
}: PromptInputProps) {
  const [inner, setInner] = React.useState(defaultValue)
  const value = valueProp ?? inner
  const ref = React.useRef<HTMLTextAreaElement>(null)
  const busy = status !== "idle"
  const canSubmit = !busy && !disabled && value.trim().length > 0

  const setValue = (next: string) => {
    if (valueProp === undefined) setInner(next)
    onValueChange?.(next)
  }

  React.useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, lineHeight * maxRows)}px`
  }, [value, maxRows])

  const submit = () => {
    if (!canSubmit) return
    onSubmit(value.trim())
    if (valueProp === undefined) setInner("")
  }

  return (
    <form
      className={cn(
        "flex w-full flex-col gap-2 rounded-3xl border border-border bg-background p-2 shadow-sm transition-shadow",
        "focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/15",
        disabled && "opacity-60",
        className,
      )}
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
    >
      <AnimatePresence initial={false}>
        {attachments.length > 0 && (
          <motion.ul
            className="flex flex-wrap gap-1.5 px-1 pt-1"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <AnimatePresence initial={false}>
              {attachments.map((file) => (
                <motion.li
                  key={file.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1 rounded-full bg-muted py-1 pr-1 pl-3 text-xs text-foreground"
                >
                  <span className="max-w-40 truncate">{file.name}</span>
                  {onRemoveAttachment && (
                    <button
                      type="button"
                      aria-label={removeLabel(file.name)}
                      onClick={() => onRemoveAttachment(file.id)}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-background hover:text-foreground"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </motion.ul>
        )}
      </AnimatePresence>

      <textarea
        ref={ref}
        rows={1}
        value={value}
        disabled={disabled}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            submit()
          }
        }}
        className="w-full resize-none bg-transparent px-3 pt-2 text-sm leading-6 text-foreground outline-none placeholder:text-muted-foreground"
      />

      <div className="flex items-center gap-1">
        {onAttach && (
          <button
            type="button"
            aria-label={attachLabel}
            onClick={onAttach}
            disabled={disabled}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Paperclip className="size-4" />
          </button>
        )}
        <div className="flex min-w-0 flex-1 items-center gap-1">{toolbar}</div>

        <motion.button
          type={busy ? "button" : "submit"}
          aria-label={busy ? stopLabel : sendLabel}
          disabled={busy ? !onStop : !canSubmit}
          onClick={busy ? onStop : undefined}
          whileTap={{ scale: 0.92 }}
          className={cn(
            "relative flex size-9 items-center justify-center overflow-hidden rounded-full transition-colors",
            busy || canSubmit
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground",
          )}
        >
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={busy ? "stop" : "send"}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -12, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0 }}
            >
              {busy ? <Square className="size-3.5 fill-current" /> : <ArrowUp className="size-4" />}
            </motion.span>
          </AnimatePresence>
        </motion.button>
      </div>
    </form>
  )
}
