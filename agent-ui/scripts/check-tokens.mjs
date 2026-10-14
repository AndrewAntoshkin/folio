import { readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const dir = fileURLToPath(new URL("../registry/agent-ui", import.meta.url))
const prefixes = "bg|text|border|ring|stroke|fill|from|via|to|outline|shadow|divide|placeholder|accent|caret|decoration"
const palette =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"

const checks = [
  ["hex color", /#[0-9a-fA-F]{3,8}\b/],
  ["color function", /\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(/],
  ["palette class", new RegExp(`\\b(?:${prefixes})-(?:${palette})-\\d{2,3}\\b`)],
  ["black/white class", new RegExp(`\\b(?:${prefixes})-(?:black|white)\\b`)],
  ["arbitrary value", /\b[a-z][a-z0-9-]*-\[[^\]]+\]/],
]

let problems = 0
const files = readdirSync(dir).filter((f) => f.endsWith(".tsx"))

for (const file of files) {
  readFileSync(join(dir, file), "utf8")
    .split("\n")
    .forEach((line, i) => {
      for (const [label, re] of checks) {
        const match = line.match(re)
        if (match) {
          problems++
          console.log(`${file}:${i + 1}  ${label}  ${match[0]}`)
        }
      }
    })
}

if (problems) {
  console.log(`\n${problems} hardcoded value(s). Use theme tokens: background, foreground, muted, primary, border, ring, destructive.`)
  process.exit(1)
}
console.log(`tokens: ${files.length} components, 0 hardcoded colors or arbitrary values`)
