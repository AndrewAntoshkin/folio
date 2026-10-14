import * as React from "react"
import { AnimatePresence, motion } from "motion/react"
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

type Item =
  | { kind: "user"; id: string; text: string }
  | { kind: "thinking"; id: string; active: boolean; text: string }
  | { kind: "tool"; id: string; name: string; summary: string; status: ToolCallStatus; input?: unknown; output?: string; error?: string }
  | { kind: "approval"; id: string; state: ApprovalState }
  | { kind: "answer"; id: string; text: string; streaming: boolean }

interface Run {
  items: Item[]
  status: AgentStatus
  steps: AgentStep[]
  used: number
}

const empty: Run = { items: [], status: "idle", steps: [], used: 1800 }
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function steps(): AgentStep[] {
  return [
    { id: "s1", label: copy.demo.step1, status: "pending" },
    { id: "s2", label: copy.demo.step2, status: "pending" },
    { id: "s3", label: copy.demo.step3, status: "pending" },
    { id: "s4", label: copy.demo.step4, status: "pending" },
    { id: "s5", label: copy.demo.step5, status: "pending" },
  ]
}

export function HeroDemo() {
  const [run, setRun] = React.useState<Run>(empty)
  const token = React.useRef(0)
  const decision = React.useRef<((ok: boolean) => void) | null>(null)

  const patch = (fn: (r: Run) => Run) => setRun(fn)
  const updateItem = (id: string, fn: (i: Item) => Item) =>
    patch((r) => ({ ...r, items: r.items.map((i) => (i.id === id ? fn(i) : i)) }))
  const step = (id: string, status: AgentStep["status"]) =>
    patch((r) => ({ ...r, steps: r.steps.map((s) => (s.id === id ? { ...s, status } : s)) }))
  const add = (item: Item) => patch((r) => ({ ...r, items: [...r.items, item] }))
  const spend = (n: number) => patch((r) => ({ ...r, used: r.used + n }))

  const start = async (prompt: string) => {
    const t = ++token.current
    const alive = () => token.current === t
    const wait = async (ms: number) => {
      await sleep(ms)
      if (!alive()) throw new Error("cancelled")
    }

    setRun({ ...empty, status: "running", steps: steps() })
    try {
      add({ kind: "user", id: "u", text: prompt })
      spend(400)
      await wait(400)
      add({ kind: "thinking", id: "th", active: true, text: copy.demo.thinking })
      await wait(1800)
      updateItem("th", (i) => ({ ...i, active: false }) as Item)

      step("s1", "running")
      add({
        kind: "tool",
        id: "t1",
        name: "grep",
        summary: "#[0-9a-f]{6} in src/settings",
        status: "running",
        input: { pattern: "#[0-9a-fA-F]{6}", path: "src/settings" },
      })
      await wait(1200)
      updateItem("t1", (i) => ({ ...i, status: "success", output: copy.demo.matches }) as Item)
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
      await wait(1100)
      updateItem("t2", (i) => ({ ...i, status: "success", output: "214 lines" }) as Item)
      step("s2", "done")
      spend(5400)

      step("s3", "running")
      patch((r) => ({ ...r, status: "waiting" }))
      add({ kind: "approval", id: "ap", state: "pending" })
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
          summary: "6 replacements",
          status: "running",
          input: { path: "src/settings/SettingsPage.tsx", edits: 6 },
        })
        await wait(1300)
        updateItem("t3", (i) => ({ ...i, status: "success", output: "+6 −6" }) as Item)
        step("s4", "done")
        spend(1900)
      }

      step("s5", "running")
      const text = ok ? copy.demo.answerOk : copy.demo.answerNo
      add({ kind: "answer", id: "a", text: "", streaming: true })
      for (let n = 0; n <= text.length; n += 3) {
        await wait(18)
        updateItem("a", (i) => ({ ...i, text: text.slice(0, n) }) as Item)
      }
      updateItem("a", (i) => ({ ...i, text, streaming: false }) as Item)
      step("s5", "done")
      spend(900)
      patch((r) => ({ ...r, status: "done" }))
    } catch {
      /* cancelled by stop or reset */
    }
  }

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

  React.useEffect(() => () => void token.current++, [])

  const thread = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    const el = thread.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [run.items])

  const busy = run.status === "running" || run.status === "waiting"
  const inputStatus: PromptInputStatus = busy ? "streaming" : "idle"

  return (
    <div className="relative flex h-[34rem] w-full flex-col overflow-hidden bg-background sm:h-[40rem]">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="text-sm text-muted-foreground">{copy.demo.title}</span>
        {run.items.length > 0 && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <RotateCcw className="size-3" /> {copy.demo.reset}
          </button>
        )}
      </div>

      <div ref={thread} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 pt-5 pb-48 sm:px-6">
        <AnimatePresence mode="popLayout">
          {run.items.length === 0 && (
            <motion.div
              key="empty"
              exit={{ opacity: 0, y: -8 }}
              className="m-auto flex max-w-md flex-col items-center gap-4 text-center"
            >
              <p className="text-lg text-foreground">{copy.demo.ask}</p>
              <Suggestions
                className="justify-center"
                items={[
                  { label: copy.demo.s1, value: copy.demo.prompt },
                  { label: copy.demo.s2, value: copy.demo.prompt2 },
                  copy.demo.s3,
                ]}
                onSelect={start}
              />
            </motion.div>
          )}
        </AnimatePresence>

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
                  command="src/settings/SettingsPage.tsx  (6 replacements)"
                  description={copy.demo.approvalDesc}
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

      <div className="absolute inset-x-0 bottom-0 bg-background px-3 pb-3 sm:px-4 sm:pb-4">
        {run.steps.length > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-full flex justify-center pb-3">
            <AgentDock
              floating={false}
              status={run.status}
              title={run.status === "done" ? copy.demo.dockDone : copy.demo.dockRun}
              steps={run.steps}
              onStop={stop}
              labels={agentDockLabels}
            />
          </div>
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
  )
}
