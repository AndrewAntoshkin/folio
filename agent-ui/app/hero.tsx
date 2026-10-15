import * as React from "react"
import { RotateCcw } from "lucide-react"
import { PromptInput, type PromptInputStatus } from "@/components/agent-ui/prompt-input"
import { Message } from "@/components/agent-ui/message"
import { Thinking } from "@/components/agent-ui/thinking"
import { ToolCall, type ToolCallStatus } from "@/components/agent-ui/tool-call"
import { Approval, type ApprovalState } from "@/components/agent-ui/approval"
import { ContextMeter } from "@/components/agent-ui/context-meter"
import { Suggestions } from "@/components/agent-ui/suggestions"
import { AgentDock, type AgentStatus, type AgentStep } from "@/components/agent-ui/agent-dock"
import {
  agentDockLabels,
  approvalLabels,
  copy,
  promptLabels,
  thinkingLabels,
  toolCallLabels,
} from "./i18n"

type ScenarioId = "colors" | "spacing" | "buttons"

interface ScenarioConfig {
  id: ScenarioId
  short: string
  label: string
  prompt: string
  thinking: string
  grepSummary: string
  grepPattern: string
  matches: string
  approvalCommand: string
  approvalDesc: string
  editSummary: string
  editCount: number
  editDiff: string
  answerOk: string
  dockRun: string
  steps: [string, string, string, string, string]
}

const scenarios: ScenarioConfig[] = [
  {
    id: "colors",
    short: copy.demo.s1Short,
    label: copy.demo.s1,
    prompt: copy.demo.prompt,
    thinking: copy.demo.thinking,
    grepSummary: "#[0-9a-f]{6} in src/settings",
    grepPattern: "#[0-9a-fA-F]{6}",
    matches: copy.demo.matches,
    approvalCommand: "src/settings/SettingsPage.tsx  (6 replacements)",
    approvalDesc: copy.demo.approvalDesc,
    editSummary: "6 replacements",
    editCount: 6,
    editDiff: "+6 −6",
    answerOk: copy.demo.answerOk,
    dockRun: copy.demo.s1,
    steps: [copy.demo.step1, copy.demo.step2, copy.demo.step3, copy.demo.step4, copy.demo.step5],
  },
  {
    id: "spacing",
    short: copy.demo.s2Short,
    label: copy.demo.s2,
    prompt: copy.demo.prompt2,
    thinking: copy.demo.thinking2,
    grepSummary: "\\[[0-9]+px\\] in src/settings",
    grepPattern: "\\[[0-9]+px\\]",
    matches: copy.demo.matches2,
    approvalCommand: "src/settings/SettingsPage.tsx  (4 replacements)",
    approvalDesc: copy.demo.approvalDesc2,
    editSummary: "4 replacements",
    editCount: 4,
    editDiff: "+4 −4",
    answerOk: copy.demo.answerOk2,
    dockRun: copy.demo.s2,
    steps: [copy.demo.step1Spacing, copy.demo.step2, copy.demo.step3, copy.demo.step4Spacing, copy.demo.step5],
  },
  {
    id: "buttons",
    short: copy.demo.s3Short,
    label: copy.demo.s3,
    prompt: copy.demo.prompt3,
    thinking: copy.demo.thinking3,
    grepSummary: "<button in src/settings",
    grepPattern: "<button\\b",
    matches: copy.demo.matches3,
    approvalCommand: "src/settings/SettingsPage.tsx  (2 replacements)",
    approvalDesc: copy.demo.approvalDesc3,
    editSummary: "2 replacements",
    editCount: 2,
    editDiff: "+2 −5",
    answerOk: copy.demo.answerOk3,
    dockRun: copy.demo.s3,
    steps: [copy.demo.step1Buttons, copy.demo.step2, copy.demo.step3, copy.demo.step4Buttons, copy.demo.step5],
  },
]

type Item =
  | { kind: "user"; id: string; text: string }
  | { kind: "thinking"; id: string; active: boolean; text: string }
  | { kind: "tool"; id: string; name: string; summary: string; status: ToolCallStatus; input?: unknown; output?: string; error?: string }
  | { kind: "approval"; id: string; state: ApprovalState; command: string; description: string }
  | { kind: "answer"; id: string; text: string; streaming: boolean }

interface Run {
  scenarioId: ScenarioId
  items: Item[]
  status: AgentStatus
  steps: AgentStep[]
  used: number
}

const empty: Run = { scenarioId: "colors", items: [], status: "idle", steps: [], used: 1800 }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function makeSteps(cfg: ScenarioConfig): AgentStep[] {
  return cfg.steps.map((label, i) => ({
    id: `s${i + 1}`,
    label,
    status: "pending",
  }))
}

function matchScenario(prompt: string): ScenarioConfig {
  const found = scenarios.find((s) => s.prompt === prompt || s.label === prompt)
  if (found) return found
  const lower = prompt.toLowerCase()
  if (lower.includes("отступ") || lower.includes("spac") || lower.includes("px")) return scenarios[1]
  if (lower.includes("кноп") || lower.includes("button")) return scenarios[2]
  return { ...scenarios[0], prompt }
}

export function HeroDemo() {
  const [run, setRun] = React.useState<Run>(empty)
  const token = React.useRef(0)
  const decision = React.useRef<((ok: boolean) => void) | null>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const autoStarted = React.useRef(false)

  const patch = (fn: (r: Run) => Run) => setRun(fn)
  const updateItem = (id: string, fn: (i: Item) => Item) =>
    patch((r) => ({ ...r, items: r.items.map((i) => (i.id === id ? fn(i) : i)) }))
  const step = (id: string, status: AgentStep["status"]) =>
    patch((r) => ({ ...r, steps: r.steps.map((s) => (s.id === id ? { ...s, status } : s)) }))
  const add = (item: Item) => patch((r) => ({ ...r, items: [...r.items, item] }))
  const spend = (n: number) => patch((r) => ({ ...r, used: r.used + n }))

  const start = React.useCallback(async (prompt: string) => {
    const cfg = matchScenario(prompt)
    const t = ++token.current
    decision.current = null
    const alive = () => token.current === t
    const wait = async (ms: number) => {
      await sleep(ms)
      if (!alive()) throw new Error("cancelled")
    }

    setRun({
      scenarioId: cfg.id,
      items: [{ kind: "user", id: "u", text: cfg.prompt }],
      status: "running",
      steps: makeSteps(cfg),
      used: 2200,
    })

    try {
      await wait(320)
      add({ kind: "thinking", id: "th", active: true, text: cfg.thinking })
      await wait(1100)
      updateItem("th", (i) => ({ ...i, active: false }) as Item)

      step("s1", "running")
      add({
        kind: "tool",
        id: "t1",
        name: "grep",
        summary: cfg.grepSummary,
        status: "running",
        input: { pattern: cfg.grepPattern, path: "src/settings" },
      })
      await wait(850)
      updateItem("t1", (i) => ({ ...i, status: "success", output: cfg.matches }) as Item)
      step("s1", "done")
      spend(2600)

      step("s2", "running")
      add({
        kind: "tool",
        id: "t2",
        name: "read_file",
        summary: "src/settings/SettingsPage.tsx",
        status: "running",
        input: { path: "src/settings/SettingsPage.tsx" },
      })
      await wait(750)
      updateItem("t2", (i) => ({ ...i, status: "success", output: "214 lines" }) as Item)
      step("s2", "done")
      spend(5400)

      step("s3", "running")
      patch((r) => ({ ...r, status: "waiting" }))
      add({
        kind: "approval",
        id: "ap",
        state: "pending",
        command: cfg.approvalCommand,
        description: cfg.approvalDesc,
      })
      const ok = await new Promise<boolean>((resolve) => (decision.current = resolve))
      if (!alive()) return
      updateItem("ap", (i) => ({ ...i, state: ok ? "approved" : "denied" }) as Item)
      patch((r) => ({ ...r, status: "running" }))
      step("s3", "done")

      if (ok) {
        step("s4", "running")
        add({
          kind: "tool",
          id: "t3",
          name: "edit_file",
          summary: cfg.editSummary,
          status: "running",
          input: { path: "src/settings/SettingsPage.tsx", edits: cfg.editCount },
        })
        await wait(950)
        updateItem("t3", (i) => ({ ...i, status: "success", output: cfg.editDiff }) as Item)
        step("s4", "done")
        spend(1900)
      }

      step("s5", "running")
      const text = ok ? cfg.answerOk : copy.demo.answerNo
      add({ kind: "answer", id: "a", text: "", streaming: true })
      for (let n = 0; n <= text.length; n += 4) {
        await wait(16)
        updateItem("a", (i) => ({ ...i, text: text.slice(0, n) }) as Item)
      }
      updateItem("a", (i) => ({ ...i, text, streaming: false }) as Item)
      step("s5", "done")
      spend(900)
      patch((r) => ({ ...r, status: "done" }))
    } catch {
      /* cancelled by stop or reset */
    }
  }, [])

  React.useEffect(() => {
    const el = rootRef.current
    if (!el || autoStarted.current) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && !autoStarted.current) {
          autoStarted.current = true
          start(scenarios[0].prompt)
          io.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [start])

  React.useEffect(() => () => void token.current++, [])

  const stop = () => {
    token.current++
    decision.current = null
    setRun((r) => ({
      ...r,
      status: "error",
      steps: r.steps.map((s) => (s.status === "running" ? { ...s, status: "error" } : s)),
      items: r.items.map((i) => {
        if (i.kind === "tool" && i.status === "running") return { ...i, status: "error", error: copy.demo.stopped }
        if (i.kind === "thinking") return { ...i, active: false }
        if (i.kind === "answer") return { ...i, streaming: false }
        if (i.kind === "approval" && i.state === "pending") return { ...i, state: "denied" }
        return i
      }),
    }))
  }

  const reset = () => {
    token.current++
    decision.current = null
    setRun(empty)
  }

  const thread = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = thread.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [run.items])

  const busy = run.status === "running" || run.status === "waiting"
  const inputStatus: PromptInputStatus = busy ? "streaming" : "idle"
  const currentScenario = scenarios.find((s) => s.id === run.scenarioId) ?? scenarios[0]

  return (
    <div
      ref={rootRef}
      className="mx-auto w-full max-w-4xl overflow-hidden rounded-3xl border border-border bg-background shadow-2xl shadow-black/25"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5" aria-hidden>
            <i className="size-2.5 rounded-full bg-[#ff5f57]" />
            <i className="size-2.5 rounded-full bg-[#febc2e]" />
            <i className="size-2.5 rounded-full bg-[#28c840]" />
          </span>
          <span className="truncate text-xs font-medium text-muted-foreground">{copy.demo.title}</span>
        </div>

        <div className="flex items-center gap-1">
          <div className="hidden items-center gap-0.5 rounded-full bg-background/60 p-0.5 sm:flex">
            {scenarios.map((s) => {
              const active = run.items.length > 0 && run.scenarioId === s.id
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => start(s.prompt)}
                  className={`rounded-full px-2.5 py-1 text-xs transition-all active:scale-95 ${
                    active
                      ? "bg-foreground text-background font-medium"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.short}
                </button>
              )
            })}
          </div>
          {run.items.length > 0 && (
            <button
              type="button"
              onClick={reset}
              className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground transition-all hover:bg-muted hover:text-foreground active:scale-95"
            >
              <RotateCcw className="size-3" /> {copy.demo.reset}
            </button>
          )}
        </div>
      </div>

      <div className="relative flex h-[36rem] w-full flex-col overflow-hidden bg-background sm:h-[42rem]">
        <div ref={thread} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-6 pb-56 sm:px-8">
          {run.items.length === 0 ? (
            <div className="m-auto flex max-w-md flex-col items-center gap-4 py-12 text-center">
              <p className="text-base font-medium text-foreground">{copy.demo.ask}</p>
              <Suggestions
                className="justify-center"
                items={scenarios.map((s) => ({ label: s.label, value: s.prompt }))}
                onSelect={start}
              />
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
              {run.items.map((item) => {
                switch (item.kind) {
                  case "user":
                    return (
                      <Message key={item.id} role="user">
                        {item.text}
                      </Message>
                    )
                  case "thinking":
                    return (
                      <Thinking key={item.id} active={item.active} {...thinkingLabels}>
                        {item.text}
                      </Thinking>
                    )
                  case "tool":
                    return (
                      <ToolCall
                        key={item.id}
                        name={item.name}
                        summary={item.summary}
                        status={item.status}
                        input={item.input}
                        output={item.output}
                        error={item.error}
                        labels={toolCallLabels}
                      />
                    )
                  case "approval":
                    return (
                      <Approval
                        key={item.id}
                        title={copy.demo.approvalTitle}
                        command={item.command}
                        description={item.description}
                        state={item.state}
                        onApprove={() => decision.current?.(true)}
                        onDeny={() => decision.current?.(false)}
                        {...approvalLabels}
                      />
                    )
                  case "answer":
                    return (
                      <Message key={item.id} role="assistant" streaming={item.streaming}>
                        {item.text}
                      </Message>
                    )
                }
              })}
            </div>
          )}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background via-background/95 to-transparent px-4 pt-10 pb-4 sm:px-8">
          <div className="pointer-events-auto mx-auto flex w-full max-w-2xl flex-col items-center gap-2.5">
            {run.steps.length > 0 && (
              <AgentDock
                floating={false}
                status={run.status}
                title={run.status === "done" ? copy.demo.dockDone : currentScenario.dockRun}
                steps={run.steps}
                onStop={stop}
                labels={agentDockLabels}
              />
            )}
            <PromptInput
              status={inputStatus}
              onSubmit={start}
              onStop={stop}
              placeholder={copy.demo.placeholder}
              attachLabel={promptLabels.attachLabel}
              sendLabel={promptLabels.sendLabel}
              stopLabel={promptLabels.stopLabel}
              removeLabel={promptLabels.removeLabel}
              toolbar={<ContextMeter used={run.used} limit={200_000} />}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
