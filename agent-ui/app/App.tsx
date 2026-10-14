import * as React from "react"
import { Check, Copy, Diamond, Layers, Moon, Square, Sun, Tag } from "lucide-react"
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
      <div className="mx-auto w-full max-w-[88rem] px-4 pt-6 sm:px-6 lg:px-10">
        <Header />
      </div>

      <Hero />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-24 px-5 sm:px-8">
      <section id="components" className="flex scroll-mt-8 flex-col gap-20" aria-label={copy.nav.components}>
        {items.map((item) => (
          <ComponentSection key={item.name} item={item} />
        ))}
      </section>

      <AgentsSection />

      <footer className="flex flex-col gap-2 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:justify-between">
        <span>
          agent-ui {copy.footer.by}{" "}
          <a className="text-foreground" href={copy.nav.homeHref}>
            Andrew Antoshkin
          </a>
          . MIT.{" "}
          <a className="text-foreground" href={copy.nav.whyHref}>
            {copy.footer.why}
          </a>
          .
        </span>
        <span>
          {copy.footer.motion}{" "}
          <a className="text-foreground" href="https://www.chamaac.com/">
            Chamaac UI
          </a>{" "}
          (MIT).
        </span>
      </footer>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="px-4 sm:px-6 lg:px-10">
      <div className="relative mx-auto max-w-[88rem] overflow-hidden rounded-[2rem] border border-border bg-muted/70 px-5 pt-16 pb-6 sm:px-10 sm:pt-20 sm:pb-10 dark:bg-muted/30">
        <HeroPattern />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
          <p className="text-sm text-muted-foreground">React · Cursor rules · MIT</p>
          <h1 className="text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            {copy.hero.title}
          </h1>
          <p className="max-w-2xl text-base leading-7 text-pretty text-muted-foreground sm:text-lg">{copy.hero.lead}</p>
          <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
            <span>{copy.hero.openSource}</span>
            <span aria-hidden className="size-1 rounded-full bg-current opacity-40" />
            <span>MIT</span>
            <span aria-hidden className="size-1 rounded-full bg-current opacity-40" />
            <a className="text-foreground" href={copy.nav.homeHref}>
              Andrew Antoshkin
            </a>
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CopyCommand command={installAll} label={copy.hero.install} done={copy.hero.copied} />
            <a
              href="#components"
              className="inline-flex items-center rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium hover:bg-muted"
            >
              {copy.hero.browse}
            </a>
          </div>
          <p className="text-sm text-muted-foreground">{copy.hero.note}</p>
          <p className="max-w-full truncate font-mono text-xs text-muted-foreground">{installAll}</p>
          <ul className="flex max-w-xl flex-col gap-2 text-left text-sm text-muted-foreground">
            <Point>
              <code className="font-mono text-xs text-foreground">components/agent-ui/*.tsx</code>
              {" · "}
              <code className="font-mono text-xs text-foreground">.cursor/rules/agent-ui-*.mdc</code>
              {" — "}
              {copy.hero.pointFiles}
            </Point>
            <Point>
              <a className="text-foreground underline underline-offset-4" href={`${BASE}/r/llms.txt`}>
                llms.txt
              </a>{" "}
              {copy.hero.pointLlms}
            </Point>
            <Point>{copy.hero.pointLint}</Point>
          </ul>
          <AccentPicker />
        </div>

        <div className="relative mt-12">
          <PreviewFrame url={copy.hero.frame}>
            <HeroDemo />
          </PreviewFrame>
        </div>
      </div>
    </section>
  )
}

function HeroPattern() {
  const marks = [
    { Icon: Layers, className: "top-[8%] left-[6%] size-7" },
    { Icon: Square, className: "top-[22%] left-[14%] size-4" },
    { Icon: Diamond, className: "top-[14%] right-[10%] size-6" },
    { Icon: Tag, className: "top-[28%] right-[18%] size-5" },
    { Icon: Square, className: "top-[6%] right-[28%] size-3.5" },
    { Icon: Layers, className: "right-[7%] bottom-[18%] size-7" },
    { Icon: Diamond, className: "bottom-[12%] left-[9%] size-5" },
    { Icon: Tag, className: "bottom-[22%] left-[20%] size-4" },
  ]
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 text-foreground/15">
      {marks.map(({ Icon, className }, i) => (
        <Icon key={i} strokeWidth={1.25} className={cn("absolute", className)} />
      ))}
    </div>
  )
}

function PreviewFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-2xl shadow-black/10">
      <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          <i className="size-2.5 rounded-full bg-[#ff5f57]" />
          <i className="size-2.5 rounded-full bg-[#febc2e]" />
          <i className="size-2.5 rounded-full bg-[#28c840]" />
        </span>
        <span className="mx-auto truncate rounded-md bg-background px-3 py-1 font-mono text-xs text-muted-foreground">
          {url}
        </span>
        <span className="w-10 shrink-0" />
      </div>
      {children}
    </div>
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
      className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
      {copied ? done : label}
    </button>
  )
}

function Point({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5">
      <Check className="mt-0.5 size-4 shrink-0 text-foreground" />
      <span>{children}</span>
    </li>
  )
}

function Header() {
  const [dark, setDark] = React.useState(() => document.documentElement.classList.contains("dark"))
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <header className="flex items-center justify-between gap-3">
      <a href={lang === "ru" ? "/agent-ui/" : "/agent-ui/en.html"} className="font-mono text-sm font-medium">
        {copy.brand}
      </a>
      <nav className="flex flex-wrap items-center justify-end gap-1 text-sm text-muted-foreground">
        <a className="rounded-full px-3 py-1.5 hover:bg-muted hover:text-foreground" href="#components">
          {copy.nav.components}
        </a>
        <a className="rounded-full px-3 py-1.5 hover:bg-muted hover:text-foreground" href="#agents">
          {copy.nav.agents}
        </a>
        <a className="rounded-full px-3 py-1.5 hover:bg-muted hover:text-foreground" href={copy.nav.whyHref}>
          {copy.nav.why}
        </a>
        <a
          className="hidden rounded-full px-3 py-1.5 hover:bg-muted hover:text-foreground sm:block"
          href={copy.nav.projectsHref}
        >
          {copy.nav.projects}
        </a>
        <a
          className="rounded-full px-3 py-1.5 font-mono text-xs hover:bg-muted hover:text-foreground"
          href={copy.nav.langHref}
          hrefLang={lang === "ru" ? "en" : "ru"}
        >
          {copy.nav.lang}
        </a>
        <button
          type="button"
          aria-label={dark ? copy.nav.light : copy.nav.dark}
          onClick={() => setDark((d) => !d)}
          className="flex size-8 items-center justify-center rounded-full hover:bg-muted hover:text-foreground"
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
    <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label={copy.accentsLabel}>
      {(Object.keys(accentValues) as AccentKey[]).map((name) => (
        <button
          key={name}
          type="button"
          role="radio"
          aria-checked={accent === name}
          onClick={() => setAccent(name)}
          className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground aria-checked:bg-muted aria-checked:text-foreground"
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
  const credit = lang === "ru" && ru && "credit" in ru && ru.credit ? ru.credit : "credit" in item ? item.credit : undefined

  return (
    <article id={item.name} className="flex scroll-mt-8 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-medium tracking-tight">{item.title}</h2>
        <p className="text-sm text-muted-foreground">
          {description}
          {credit && <span className="text-muted-foreground"> {credit}.</span>}
        </p>
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
              className="rounded-full px-3 py-1 text-muted-foreground transition-colors aria-selected:bg-background aria-selected:text-foreground aria-selected:shadow-sm"
            >
              {label}
            </button>
          ))}
        </div>
        <InstallLine command={`npx shadcn@latest add ${BASE}/r/${item.name}.json`} compact />
      </div>

      <div className="overflow-hidden rounded-3xl border border-border">
        {tab === "preview" && (
          <div className="flex min-h-80 items-center justify-center bg-muted/30 px-5 py-12">
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
        "flex min-w-0 items-center gap-2 rounded-full border border-border bg-card pl-4 font-mono text-xs",
        compact ? "max-w-full py-0.5 pr-0.5" : "w-full py-1 pr-1",
      )}
    >
      <span className="text-muted-foreground">$</span>
      <span className="min-w-0 flex-1 truncate">{command}</span>
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
        "flex size-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground",
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
      <pre className="overflow-auto rounded-3xl border border-border bg-card p-5 font-mono text-xs leading-6 text-card-foreground">
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
