import * as React from "react"
import { Copy, RotateCcw, ThumbsUp } from "lucide-react"
import { PromptInput, type PromptAttachment, type PromptInputStatus } from "@/components/agent-ui/prompt-input"
import { Message, MessageAction } from "@/components/agent-ui/message"
import { Thinking } from "@/components/agent-ui/thinking"
import { ToolCall } from "@/components/agent-ui/tool-call"
import { Approval } from "@/components/agent-ui/approval"
import { ContextMeter } from "@/components/agent-ui/context-meter"
import { Suggestions } from "@/components/agent-ui/suggestions"
import { AgentDock, type AgentStatus } from "@/components/agent-ui/agent-dock"
import { Plan, type PlanStatus } from "@/components/agent-ui/plan"
import { Choice } from "@/components/agent-ui/choice"
import { DataTable } from "@/components/agent-ui/data-table"
import { AnswerChart, type ChartPoint } from "@/components/agent-ui/answer-chart"
import { CodeBlock } from "@/components/agent-ui/code-block"
import { Sources } from "@/components/agent-ui/sources"
import { Artifact } from "@/components/agent-ui/artifact"
import {
  agentDockLabels,
  approvalLabels,
  copy,
  promptLabels,
  thinkingLabels,
  toolCallLabels,
} from "./i18n"

function DemoButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...props}
      className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-pressed:bg-muted aria-pressed:text-foreground"
    />
  )
}

export function PromptInputDemo() {
  const [status, setStatus] = React.useState<PromptInputStatus>("idle")
  const [files, setFiles] = React.useState<PromptAttachment[]>([{ id: "1", name: "SettingsPage.tsx" }])
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined)

  return (
    <PromptInput
      className="max-w-xl"
      status={status}
      placeholder={copy.demos.askAnything}
      attachLabel={promptLabels.attachLabel}
      sendLabel={promptLabels.sendLabel}
      stopLabel={promptLabels.stopLabel}
      removeLabel={promptLabels.removeLabel}
      onSubmit={() => {
        setStatus("streaming")
        timer.current = setTimeout(() => setStatus("idle"), 2500)
      }}
      onStop={() => {
        clearTimeout(timer.current)
        setStatus("idle")
      }}
      attachments={files}
      onAttach={() => setFiles((f) => [...f, { id: String(Date.now()), name: `screenshot-${f.length + 1}.png` }])}
      onRemoveAttachment={(id) => setFiles((f) => f.filter((x) => x.id !== id))}
      toolbar={
        <>
          <span className="rounded-full px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted">Opus 5.5</span>
          <ContextMeter used={48_200} limit={200_000} />
        </>
      }
    />
  )
}

export function MessageDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <Message role="user">{copy.demos.msgUser}</Message>
      <Message
        role="assistant"
        actions={
          <>
            <MessageAction label={copy.demos.copy}>
              <Copy className="size-3.5" />
            </MessageAction>
            <MessageAction label={copy.demos.retry}>
              <RotateCcw className="size-3.5" />
            </MessageAction>
            <MessageAction label={copy.demos.good}>
              <ThumbsUp className="size-3.5" />
            </MessageAction>
          </>
        }
      >
        {copy.demos.msgAsst.split("border-border").map((part, i, arr) =>
          i < arr.length - 1 ? (
            <React.Fragment key={i}>
              {part}
              <code className="rounded bg-muted px-1 font-mono text-xs">border-border</code>
            </React.Fragment>
          ) : (
            part
          ),
        )}
      </Message>
      <Message role="assistant" streaming>
        {copy.demos.msgStream}
      </Message>
    </div>
  )
}

export function ThinkingDemo() {
  const [active, setActive] = React.useState(true)
  const [key, setKey] = React.useState(0)

  React.useEffect(() => {
    if (!active) return
    const t = setTimeout(() => setActive(false), 2800)
    return () => clearTimeout(t)
  }, [active, key])

  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-4">
      <Thinking key={key} active={active} {...thinkingLabels}>
        {copy.demos.thinkingBody}
      </Thinking>
      <DemoButton
        onClick={() => {
          setKey((k) => k + 1)
          setActive(true)
        }}
      >
        {copy.demos.runAgain}
      </DemoButton>
    </div>
  )
}

export function ToolCallDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <ToolCall
        name="read_file"
        status="success"
        summary="src/settings/SettingsPage.tsx"
        input={{ path: "src/settings/SettingsPage.tsx", lines: [1, 80] }}
        output={'export function SettingsPage() {\n  return <section className="flex flex-col gap-6">…'}
        defaultOpen
        labels={toolCallLabels}
      />
      <ToolCall name="run_tests" status="running" summary="pnpm test settings" labels={toolCallLabels} />
      <ToolCall name="search_docs" status="pending" summary="“border token”" labels={toolCallLabels} />
      <ToolCall
        name="fetch_figma"
        status="error"
        summary="node 12:408"
        input={{ fileKey: "Xy12", nodeId: "12:408" }}
        error="403: token has no access to this file"
        labels={toolCallLabels}
      />
    </div>
  )
}

export function ApprovalDemo() {
  const [key, setKey] = React.useState(0)
  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-4">
      <Approval
        key={key}
        title={copy.demos.approvalTitle}
        command="pnpm dlx ds-lint src --fix"
        description={copy.demos.approvalDesc}
        allowAlways
        onApprove={() => {}}
        onDeny={() => {}}
        {...approvalLabels}
      />
      <DemoButton onClick={() => setKey((k) => k + 1)}>{copy.demos.reset}</DemoButton>
    </div>
  )
}

export function ContextMeterDemo() {
  const [used, setUsed] = React.useState(64_000)
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-5">
      <div className="flex items-center gap-6">
        <ContextMeter used={used} limit={200_000} />
        <ContextMeter used={used} limit={200_000} size={32} showLabel={false} />
      </div>
      <input
        type="range"
        min={0}
        max={200_000}
        step={1000}
        value={used}
        onChange={(e) => setUsed(+e.target.value)}
        aria-label="Tokens used"
        className="w-full accent-primary"
      />
    </div>
  )
}

export function SuggestionsDemo() {
  const [picked, setPicked] = React.useState<string | null>(null)
  const [key, setKey] = React.useState(0)
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-4">
      <Suggestions key={key} className="justify-center" items={[...copy.demos.suggestions]} onSelect={setPicked} />
      <p className="text-xs text-muted-foreground">
        {picked ? `${copy.demos.wouldSend} “${picked}”` : copy.demos.pickOne}
      </p>
      <DemoButton
        onClick={() => {
          setKey((k) => k + 1)
          setPicked(null)
        }}
      >
        {copy.demos.replay}
      </DemoButton>
    </div>
  )
}

const patch = `--- a/src/settings/SettingsPage.tsx
+++ b/src/settings/SettingsPage.tsx
@@
-    <hr className="border-[#e5e5e5]" />
+    <hr className="border-border" />
-    <Button className="bg-[#111111] text-white">
+    <Button className="bg-primary text-primary-foreground">`

const chartPoints: ChartPoint[] = [
  { label: "settings", value: 6 },
  { label: "nav", value: 2 },
  { label: "dialog", value: 1 },
  { label: "table", value: 0 },
]

export function PlanDemo() {
  const [step, setStep] = React.useState(1)
  const statuses: PlanStatus[] = copy.demos.planSteps.map((_, index) => {
    if (index < step) return "done"
    if (index === step) return "running"
    return "pending"
  })
  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-4">
      <Plan
        title={copy.demos.planTitle}
        labels={copy.demos.planLabels}
        steps={copy.demos.planSteps.map((label, index) => ({
          id: String(index),
          label,
          detail: index === 0 ? copy.demos.planDetail : undefined,
          status: statuses[index],
        }))}
      />
      <DemoButton onClick={() => setStep((n) => (n + 1) % (copy.demos.planSteps.length + 1))}>
        {copy.demos.runAgain}
      </DemoButton>
    </div>
  )
}

export function ChoiceDemo() {
  const [value, setValue] = React.useState<string>()
  return (
    <Choice
      className="max-w-xl"
      question={copy.demos.choiceQuestion}
      value={value}
      onSelect={setValue}
      options={[
        { value: "border", label: "border-border", description: copy.demos.choiceBorder },
        { value: "muted", label: "border-muted", description: copy.demos.choiceMuted },
      ]}
    />
  )
}

export function DataTableDemo() {
  return (
    <DataTable
      className="max-w-xl"
      caption={copy.demos.tableCaption}
      empty={copy.demos.tableEmpty}
      columns={[
        { key: "was", header: copy.demos.tableWas, mono: true },
        { key: "now", header: copy.demos.tableNow, mono: true },
        { key: "count", header: copy.demos.tableCount, align: "right" },
      ]}
      rows={[
        { was: "#e5e5e5", now: "border-border", count: "1" },
        { was: "#111111", now: "bg-primary", count: "1" },
        { was: "#737373", now: "text-muted-foreground", count: "4" },
      ]}
    />
  )
}

export function AnswerChartDemo() {
  const [type, setType] = React.useState<"bar" | "line">("bar")
  return (
    <div className="flex w-full max-w-xl flex-col items-start gap-4">
      <AnswerChart className="w-full" type={type} caption={copy.demos.chartCaption} empty={copy.demos.chartEmpty} data={chartPoints} />
      <div className="flex gap-1.5">
        <DemoButton aria-pressed={type === "bar"} onClick={() => setType("bar")}>
          {copy.demos.chartBar}
        </DemoButton>
        <DemoButton aria-pressed={type === "line"} onClick={() => setType("line")}>
          {copy.demos.chartLine}
        </DemoButton>
      </div>
    </div>
  )
}

export function CodeBlockDemo() {
  return (
    <CodeBlock
      className="max-w-xl"
      filename="src/settings/SettingsPage.tsx"
      language="diff"
      diff
      code={patch}
      copyLabel={copy.demos.copy}
      copiedLabel={copy.hero.copied}
    />
  )
}

export function SourcesDemo() {
  return (
    <Sources
      className="max-w-xl"
      label={copy.demos.sourcesLabel}
      items={[
        {
          title: copy.demos.sourceToken,
          href: "https://ui.shadcn.com/docs/theming",
          excerpt: copy.demos.sourceTokenExcerpt,
        },
        {
          title: copy.demos.sourceLint,
          href: "https://antoshkin.tech/ds-lint.html",
          excerpt: copy.demos.sourceLintExcerpt,
        },
      ]}
    />
  )
}

export function ArtifactDemo() {
  return (
    <Artifact
      className="max-w-xl"
      title="SettingsPage.tsx"
      meta={copy.demos.artifactMeta}
      openLabel={copy.demos.artifactOpen}
      closeLabel={copy.demos.artifactClose}
    >
      <CodeBlock code={patch} language="diff" diff copyLabel={copy.demos.copy} copiedLabel={copy.hero.copied} />
    </Artifact>
  )
}

const dockStates: AgentStatus[] = ["running", "waiting", "done", "error", "idle"]

export function AgentDockDemo() {
  const [status, setStatus] = React.useState<AgentStatus>("running")
  return (
    <div className="flex w-full flex-col items-center gap-6">
      <div className="flex min-h-80 items-end">
        <AgentDock
          floating={false}
          status={status}
          title={copy.demos.dockTitle}
          onStop={() => setStatus("error")}
          actions={<DemoButton>{copy.demos.dockOpen}</DemoButton>}
          labels={agentDockLabels}
          steps={[
            { id: "1", label: copy.demos.dockSteps[0], status: "done" },
            { id: "2", label: copy.demos.dockSteps[1], status: "done" },
            {
              id: "3",
              label: copy.demos.dockSteps[2],
              status: status === "error" ? "error" : status === "done" ? "done" : "running",
            },
            { id: "4", label: copy.demos.dockSteps[3], status: status === "done" ? "done" : "pending" },
          ]}
        />
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {dockStates.map((s) => (
          <DemoButton key={s} aria-pressed={status === s} onClick={() => setStatus(s)}>
            {s}
          </DemoButton>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">{copy.demos.dockHint}</p>
    </div>
  )
}
