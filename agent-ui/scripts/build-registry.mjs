import { execFileSync } from "node:child_process"
import { readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"

const root = fileURLToPath(new URL("..", import.meta.url))
const BASE = "https://antoshkin.tech/agent-ui"
const items = JSON.parse(readFileSync(join(root, "registry/items.json"), "utf8"))

const registry = {
  $schema: "https://ui.shadcn.com/schema/registry.json",
  name: "agent-ui",
  homepage: `${BASE}/`,
  items: [
    ...items.map((item) => ({
      name: item.name,
      type: "registry:component",
      title: item.title,
      description: item.description,
      dependencies: item.dependencies,
      registryDependencies: ["utils"],
      files: [
        {
          path: `registry/agent-ui/${item.name}.tsx`,
          type: "registry:component",
          target: `components/agent-ui/${item.name}.tsx`,
        },
        {
          path: `registry/rules/${item.name}.mdc`,
          type: "registry:file",
          target: `~/.cursor/rules/agent-ui-${item.name}.mdc`,
        },
      ],
    })),
    {
      name: "all",
      type: "registry:block",
      title: "All agent-ui components",
      description: "Every agent-ui component with its agent rule.",
      registryDependencies: items.map((item) => `${BASE}/r/${item.name}.json`),
      files: [],
    },
  ],
}

writeFileSync(join(root, "registry.json"), JSON.stringify(registry, null, 2) + "\n")

const out = join(root, "r")
rmSync(out, { recursive: true, force: true })
mkdirSync(out)
execFileSync(join(root, "node_modules/.bin/shadcn"), ["build", "registry.json", "--output", "r"], {
  cwd: root,
  stdio: "inherit",
})

const stripFrontmatter = (s) => s.replace(/^---[\s\S]*?---\n+/, "")
const rules = items.map((item) => readFileSync(join(root, `registry/rules/${item.name}.mdc`), "utf8"))

const index = [
  "# agent-ui",
  "",
  "> React components for AI and agent interfaces, shipped with Cursor rules that tell a coding agent when and how to use each one. Tailwind v4 + shadcn theme tokens, no hardcoded colors.",
  "",
  `Install one: \`npx shadcn@latest add ${BASE}/r/<name>.json\`. Install all: \`npx shadcn@latest add ${BASE}/r/all.json\`.`,
  "Each install adds `components/agent-ui/<name>.tsx` and `.cursor/rules/agent-ui-<name>.mdc`.",
  "",
  "## Components",
  "",
  ...items.map((item) => `- [${item.title}](${BASE}/r/${item.name}.json): ${item.description}`),
  "",
  "## Full reference",
  "",
  `- [llms-full.txt](${BASE}/r/llms-full.txt): every agent rule in one file`,
  "",
].join("\n")

writeFileSync(join(out, "llms.txt"), index)
writeFileSync(join(out, "llms-full.txt"), rules.map(stripFrontmatter).join("\n---\n\n"))

console.log(`registry: ${items.length} components + all -> r/`)
