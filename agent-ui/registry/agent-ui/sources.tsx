"use client"

import { cn } from "@/lib/utils"

export interface SourceItem {
  title: string
  href: string
  excerpt?: string
}

export interface SourcesProps {
  items: SourceItem[]
  label?: string
  className?: string
}

function hostOf(href: string) {
  try {
    return new URL(href).host
  } catch {
    return href
  }
}

export function Sources({ items, label = "Sources", className }: SourcesProps) {
  return (
    <div className={cn("flex w-full shrink-0 flex-col gap-2", className)}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <ol className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className="block rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/50"
            >
              <span className="block text-sm text-foreground">{item.title}</span>
              <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">{hostOf(item.href)}</span>
              {item.excerpt && <span className="mt-1 block text-sm leading-6 text-muted-foreground">{item.excerpt}</span>}
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
