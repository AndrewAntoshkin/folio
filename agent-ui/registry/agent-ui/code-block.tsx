"use client"

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CodeBlockProps {
  code: string
  language?: string
  filename?: string
  diff?: boolean
  copyLabel?: string
  copiedLabel?: string
  className?: string
}

export function CodeBlock({
  code,
  language,
  filename,
  diff = false,
  copyLabel = "Copy",
  copiedLabel = "Copied",
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const lines = code.replace(/\n$/, "").split("\n")

  return (
    <div className={cn("w-full min-w-0 shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground", className)}>
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        {filename && <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground">{filename}</span>}
        {!filename && <span className="flex-1" />}
        {language && <span className="font-mono text-xs text-muted-foreground">{language}</span>}
        <button
          type="button"
          aria-label={copied ? copiedLabel : copyLabel}
          onClick={() => {
            navigator.clipboard.writeText(code)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1500)
          }}
          className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-xs leading-5 whitespace-pre">
        {lines.map((line, index) => (
          <div key={index} className={cn("px-1.5 whitespace-pre", lineTone(line, diff))}>
            {line || " "}
          </div>
        ))}
      </pre>
    </div>
  )
}

function lineTone(line: string, diff: boolean) {
  if (!diff) return "text-foreground"
  if (line.startsWith("+") && !line.startsWith("+++")) return "bg-primary/10 text-foreground"
  if (line.startsWith("-") && !line.startsWith("---")) return "bg-destructive/10 text-foreground"
  return "text-muted-foreground"
}
