import * as React from "react"
import { Check, Copy, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import items from "../registry/items.json"
import { HeroDemo } from "./hero"
import {
  AgentDockDemo,
  ApprovalDemo,
  ContextMeterDemo,
  MessageDemo,
  PromptInputDemo,
  SuggestionsDemo,
  ThinkingDemo,
  ToolCallDemo,
  PlanDemo,
  ChoiceDemo,
  DataTableDemo,
  AnswerChartDemo,
  CodeBlockDemo,
  SourcesDemo,
  ArtifactDemo,
} from "./demos"
import { accents as accentNames, copy, lang } from "./i18n"

const BASE = "https://antoshkin.tech/agent-ui"

const sources = import.meta.glob<string>("../registry/agent-ui/*.tsx", { query: "?raw", import: "default", eager: true })
const rules = import.meta.glob<string>("../registry/rules/*.mdc", { query: "?raw", import: "default", eager: true })

const demos: Record<string, React.ComponentType> = {
  "prompt-input": PromptInputDemo,
  message: MessageDemo,
  thinking: ThinkingDemo,
  "tool-call": ToolCallDemo,
  approval: ApprovalDemo,
  "context-meter": ContextMeterDemo,
  suggestions: SuggestionsDemo,
  "agent-dock": AgentDockDemo,
  plan: PlanDemo,
  choice: ChoiceDemo,
  "data-table": DataTableDemo,
  "answer-chart": AnswerChartDemo,
  "code-block": CodeBlockDemo,
  sources: SourcesDemo,
  artifact: ArtifactDemo,
}

const accentValues = {
  Neutral: null,
  Violet: { primary: "oklch(0.55 0.22 285)", fg: "oklch(0.98 0 0)" },
  Green: { primary: "oklch(0.62 0.16 155)", fg: "oklch(0.15 0 0)" },
  Orange: { primary: "oklch(0.7 0.18 50)", fg: "oklch(0.15 0 0)" },
} as const

type AccentKey = keyof typeof accentValues

const installAll = `npx shadcn@latest add ${BASE}/r/all.json`

export function App() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      <div className="mx-auto w-full max-w-[84rem] px-4 pt-6 sm:px-6 lg:px-10">
        <Header />
      </div>

      <Hero />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-24 px-5 sm:px-8">
        <section id="components" className="flex scroll-mt-8 flex-col gap-20" aria-label={copy.nav.components}>
          {items.map((item) => (
            <ComponentSection key={item.name} item={item} />
          ))}
        </section>

        <AgentsSection />

        <footer className="flex flex-col gap-2 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <span>
            agent-ui {copy.footer.by}{" "}
            <a className="text-foreground transition-colors hover:underline" href={copy.nav.homeHref}>
              Andrew Antoshkin
            </a>
            . MIT.{" "}
            <a className="text-foreground transition-colors hover:underline" href={copy.nav.whyHref}>
              {copy.footer.why}
            </a>
            .
          </span>
        </footer>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="px-4 sm:px-6 lg:px-10">
      <div className="relative mx-auto max-w-[84rem] overflow-hidden rounded-[2rem] bg-muted/40 px-5 pt-14 pb-8 sm:px-10 sm:pt-20 sm:pb-12 dark:bg-card/60">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <p className="inline-flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 rounded-full bg-background/70 px-4 py-1.5 text-xs font-medium text-muted-foreground dark:bg-background/50">
            <span>React</span>
            <span aria-hidden className="size-1 rounded-full bg-current opacity-40" />
            <span>Cursor rules</span>
            <span aria-hidden className="size-1 rounded-full bg-current opacity-40" />
            <span>MIT</span>
            <span aria-hidden className="size-1 rounded-full bg-current opacity-40" />
            <a className="text-foreground transition-colors hover:underline" href={copy.nav.homeHref}>
              Andrew Antoshkin
            </a>
          </p>

          <h1 className="text-4xl leading-[1.04] font-semibold tracking-tight text-balance sm:text-6xl">
            {copy.hero.title}
          </h1>

          <p className="max-w-2xl text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
            {copy.hero.lead}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <CopyCommand command={installAll} label={copy.hero.install} done={copy.hero.copied} />
            <a
              href="#components"
              className="inline-flex items-center rounded-full bg-background/80 px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-background active:scale-95 dark:bg-muted dark:hover:bg-accent"
            >
              {copy.hero.browse}
            </a>
          </div>

          <div className="w-full max-w-xl pt-1">
            <InstallLine command={installAll} />
          </div>

          <p className="max-w-xl pt-2 text-sm leading-6 text-pretty text-muted-foreground">{copy.hero.pointLint}</p>

          <AccentPicker />
        </div>

        <div className="relative mt-10">
          <HeroDemo />
        </div>
      </div>
    </section>
  )
}

function CopyCommand({ command, label, done }: { command: string; label: string; done: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(command)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-all hover:opacity-90 active:scale-95"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? done : label}
    </button>
  )
}

function Header() {
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains("dark"))
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <header className="flex items-center justify-between gap-3">
      <a href={lang === "ru" ? "/agent-ui/" : "/agent-ui/en"} className="font-mono text-sm font-medium">
        {copy.brand}
      </a>
      <nav className="flex flex-wrap items-center justify-end gap-1 text-sm text-muted-foreground">
        <a
          className="rounded-full px-3 py-1.5 transition-all hover:bg-muted hover:text-foreground active:scale-95"
          href="#components"
        >
          {copy.nav.components}
        </a>
        <a
          className="rounded-full px-3 py-1.5 transition-all hover:bg-muted hover:text-foreground active:scale-95"
          href="#agents"
        >
          {copy.nav.agents}
        </a>
        <a
          className="rounded-full px-3 py-1.5 transition-all hover:bg-muted hover:text-foreground active:scale-95"
          href={copy.nav.whyHref}
        >
          {copy.nav.why}
        </a>
        <a
          className="hidden rounded-full px-3 py-1.5 transition-all hover:bg-muted hover:text-foreground active:scale-95 sm:block"
          href={copy.nav.projectsHref}
        >
          {copy.nav.projects}
        </a>
        <a
          className="rounded-full px-3 py-1.5 font-mono text-xs transition-all hover:bg-muted hover:text-foreground active:scale-95"
          href={copy.nav.langHref}
          hrefLang={lang === "ru" ? "en" : "ru"}
        >
          {copy.nav.lang}
        </a>
        <button
          type="button"
          aria-label={dark ? copy.nav.light : copy.nav.dark}
          onClick={() => setDark((d) => !d)}
          className="flex size-8 items-center justify-center rounded-full transition-all hover:bg-muted hover:text-foreground active:scale-90"
        >
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
      </nav>
    </header>
  )
}

function AccentPicker() {
  const [accent, setAccent] = React.useState<AccentKey>("Neutral")

  React.useEffect(() => {
    const root = document.documentElement.style
    const a = accentValues[accent]
    for (const v of ["--primary", "--primary-foreground", "--ring"]) root.removeProperty(v)
    if (a) {
      root.setProperty("--primary", a.primary)
      root.setProperty("--primary-foreground", a.fg)
      root.setProperty("--ring", a.primary)
    }
  }, [accent])

  return (
    <div
      className="inline-flex flex-wrap justify-center gap-1 rounded-full bg-background/70 p-1 dark:bg-background/50"
      role="radiogroup"
      aria-label={copy.accentsLabel}
    >
      {(Object.keys(accentValues) as AccentKey[]).map((name) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={accent === name}
          onClick={() => setAccent(name)}
          className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted-foreground transition-all hover:text-foreground active:scale-95 aria-checked:bg-muted aria-checked:font-medium aria-checked:text-foreground"
        >
          <span
            className="size-2.5 rounded-full"
            style={{ background: accentValues[name]?.primary ?? "var(--foreground)" }}
          />
          {accentNames[name]}
        </button>
      ))}
    </div>
  )
}

type Tab = "preview" | "code" | "rule"

function ComponentSection({ item }: { item: (typeof items)[number] }) {
  const [tab, setTab] = React.useState<Tab>("preview")
  const Demo = demos[item.name]
  const source = sources[`../registry/agent-ui/${item.name}.tsx`]
  const rule = rules[`../registry/rules/${item.name}.mdc`]
  const ru = "ru" in item ? item.ru : undefined
  const description = lang === "ru" && ru?.description ? ru.description : item.description

  return (
    <article id={item.name} className="flex scroll-mt-8 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-medium tracking-tight">{item.title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full bg-muted p-1 text-sm" role="tablist">
          {(
            [
              ["preview", copy.tabs.preview],
              ["code", copy.tabs.code],
              ["rule", copy.tabs.rule],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className="rounded-full px-3.5 py-1 text-muted-foreground transition-all hover:text-foreground active:scale-95 aria-selected:bg-background aria-selected:font-medium aria-selected:text-foreground aria-selected:shadow-xs"
            >
              {label}
            </button>
          ))}
        </div>
        <InstallLine command={`npx shadcn@latest add ${BASE}/r/${item.name}.json`} compact />
      </div>

      <div className="overflow-hidden rounded-3xl bg-muted/40 dark:bg-muted/35">
        {tab === "preview" && (
          <div className="flex min-h-80 items-center justify-center px-5 py-12 sm:px-8">
            <Demo />
          </div>
        )}
        {tab === "code" && <CodeBlock text={source} />}
        {tab === "rule" && (
          <div className="flex flex-col">
            <p className="border-b border-border px-5 py-3 text-xs text-muted-foreground">
              {copy.ruleHint}{" "}
              <code className="font-mono text-foreground">.cursor/rules/agent-ui-{item.name}.mdc</code>
              {copy.ruleHintRest}
            </p>
            <CodeBlock text={rule} />
          </div>
        )}
      </div>
    </article>
  )
}

function CodeBlock({ text }: { text: string }) {
  return (
    <div className="relative">
      <CopyButton text={text} className="absolute top-3 right-3" />
      <pre className="max-h-120 overflow-auto bg-card p-5 font-mono text-xs leading-5 text-card-foreground">{text}</pre>
    </div>
  )
}

function InstallLine({ command, compact }: { command: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-full bg-background/70 pl-4 font-mono text-xs dark:bg-card",
        compact ? "max-w-full py-1 pr-1" : "w-full py-1.5 pr-1.5",
      )}
    >
      <span className="text-muted-foreground">$</span>
      <span className="min-w-0 flex-1 truncate text-muted-foreground">{command}</span>
      <CopyButton text={command} />
    </div>
  )
}

function CopyButton({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      aria-label={copy.copy}
      onClick={() => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-90",
        className,
      )}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  )
}

function AgentsSection() {
  return (
    <section id="agents" className="flex scroll-mt-8 flex-col gap-8">
      <div className="flex max-w-2xl flex-col gap-4">
        <h2 className="text-2xl font-medium tracking-tight">{copy.agents.title}</h2>
        <p className="text-sm leading-6 text-muted-foreground">{copy.agents.lead}</p>
        <ol className="flex flex-col gap-4 text-sm leading-6">
          <li>
            <span className="font-medium">{copy.agents.r1t}</span>{" "}
            <span className="text-muted-foreground">
              {copy.agents.r1Before}
              <code className="font-mono text-xs">.mdc</code>
              {copy.agents.r1After}
            </span>
          </li>
          <li>
            <span className="font-medium">{copy.agents.r2t}</span>{" "}
            <span className="text-muted-foreground">{copy.agents.r2}</span>
          </li>
          <li>
            <span className="font-medium">{copy.agents.r3t}</span>{" "}
            <span className="text-muted-foreground">
              <a className="text-foreground underline underline-offset-4" href={`${BASE}/r/llms.txt`}>
                llms.txt
              </a>{" "}
              {copy.agents.r3a}{" "}
              <a className="text-foreground underline underline-offset-4" href={`${BASE}/r/llms-full.txt`}>
                llms-full.txt
              </a>{" "}
              {copy.agents.r3b}
            </span>
          </li>
        </ol>
      </div>
      <pre className="overflow-auto rounded-3xl bg-card p-6 font-mono text-xs leading-6 text-card-foreground">
{`$ npx shadcn@latest add ${BASE}/r/approval.json

  components/agent-ui/approval.tsx
  .cursor/rules/agent-ui-approval.mdc

${copy.agents.sampleAsk}

  ${copy.agents.sampleLoad}
  <Approval title="${copy.agents.sampleTitle}"
            command="rm -rf ./build"
            onApprove={...} onDeny={...} />`}
      </pre>
    </section>
  )
}
