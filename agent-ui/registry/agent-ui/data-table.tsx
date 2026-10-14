"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"

export interface DataTableColumn {
  key: string
  header: string
  align?: "left" | "right"
  mono?: boolean
}

export interface DataTableProps {
  columns: DataTableColumn[]
  rows: Record<string, React.ReactNode>[]
  caption?: string
  empty?: string
  className?: string
}

export function DataTable({ columns, rows, caption, empty = "Nothing to show", className }: DataTableProps) {
  return (
    <div className={cn("w-full shrink-0 overflow-hidden rounded-2xl border border-border bg-card text-card-foreground", className)}>
      {caption && <div className="border-b border-border px-4 py-2.5 text-sm text-muted-foreground">{caption}</div>}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  className={cn(
                    "px-4 py-2 font-medium whitespace-nowrap",
                    column.align === "right" && "text-right",
                    column.mono && "font-mono",
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-muted-foreground">
                  {empty}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={index} className="border-b border-border last:border-b-0">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "px-4 py-2.5 align-top text-foreground",
                        column.align === "right" && "text-right tabular-nums",
                        column.mono && "font-mono text-xs",
                      )}
                    >
                      {row[column.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
