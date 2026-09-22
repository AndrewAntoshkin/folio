const app = document.getElementById("app");
let runs = [];
let view = "overview";

document.querySelectorAll("nav button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("nav button").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    view = btn.dataset.view;
    render();
  });
});

async function load() {
  runs = await (await fetch("/api/runs")).json();
  render();
}

function render() {
  if (view === "overview") return renderOverview();
  if (view === "runs") return renderRuns();
  if (view === "compare") return renderCompare();
}

function renderOverview() {
  const live = runs.filter((r) => r.live || (r.model_config && r.model_config.provider !== "fixture"));
  const shown = live.length ? live : runs;
  if (!shown.length) {
    app.innerHTML = `<h1>No runs yet</h1><p class="muted"><code>ds-eval run --model claude --case page-settings-001</code></p>`;
    return;
  }
  const latest = shown[shown.length - 1];
  app.innerHTML = `
    <h1>Design System AI Evals</h1>
    <p class="muted">${shown.length} runs · latest ${latest.run_id}${live.length ? "" : " · fixture runs only"}</p>
    <div class="grid">
      ${shown.map((r) => `<article class="card ${r === latest ? "teal" : ""}"><span class="muted">${r.model_config?.label || r.model}</span><b>${r.overall}</b><span class="muted">${r.case_count} evals · $${r.cost_usd} · ${r.live ? "live" : r.model_config?.provider || ""}</span></article>`).join("")}
    </div>
    <h2>Latest aggregates</h2>
    <table>
      ${Object.entries(latest.aggregates || {}).map(([k,v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join("")}
    </table>
  `;
}

function renderRuns() {
  app.innerHTML = `<h1>Runs</h1><div id="run-list"></div><div id="run-detail"></div>`;
  const list = document.getElementById("run-list");
  list.innerHTML = `<table><thead><tr><th>Run</th><th>Model</th><th>Overall</th><th></th></tr></thead><tbody>
    ${runs.map((r, i) => `<tr><td>${r.run_id}</td><td>${r.model}</td><td>${r.overall}</td><td><button class="link" data-i="${i}">Open</button></td></tr>`).join("")}
  </tbody></table>`;
  list.querySelectorAll("button.link").forEach((btn) => {
    btn.addEventListener("click", () => showRun(runs[Number(btn.dataset.i)].run_id));
  });
}

async function showRun(id) {
  const data = await (await fetch(`/api/runs/${id}`)).json();
  const el = document.getElementById("run-detail") || app;
  el.innerHTML = `
    <h2>${data.run_id} · ${data.overall}</h2>
    <p class="muted">${data.model} · ${data.model_config?.model || ""} · ${data.case_count} cases · $${data.cost_usd} · ${data.latency_ms} ms</p>
    <table>
      <thead><tr><th>Case</th><th>Cat</th><th>Overall</th><th>DS</th><th>A11y</th></tr></thead>
      <tbody>
        ${data.cases.map((c) => `<tr>
          <td><button class="link case" data-id="${c.id}">${c.id}</button></td>
          <td>${c.category}</td><td>${c.scores.overall}</td>
          <td>${c.scores.ds_compliance}</td><td>${c.scores.accessibility}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <div id="case-detail"></div>
  `;
  el.querySelectorAll("button.case").forEach((btn) => {
    btn.addEventListener("click", () => renderCase(data, btn.dataset.id));
  });
}

function renderCase(data, id) {
  const c = data.cases.find((x) => x.id === id);
  const g = c.generation || {};
  const shot = c.has_screenshot ? `<p><img src="${c.screenshot_url}" alt="screenshot" width="640"></p>` : "<p class='muted'>No screenshot</p>";
  const graders = (c.graders || []).map((item) => `<tr><th>${item.name}</th><td>${item.kind}</td><td>${item.score}</td><td>${escapeHtml(item.reasoning || "")}</td></tr>`).join("");
  document.getElementById("case-detail").innerHTML = `
    <h3>${c.title}</h3>
    <p class="muted">${g.model || ""} · ${g.input_tokens || 0} in / ${g.output_tokens || 0} out · $${g.cost_usd || 0} · ${g.latency_ms || 0} ms</p>
    ${shot}
    <h4>Deterministic graders</h4>
    <table><thead><tr><th>Grader</th><th>Kind</th><th>Score</th><th>Why</th></tr></thead><tbody>${graders}</tbody></table>
    <h4>Task prompt</h4>
    <pre>${escapeHtml(c.prompt || g.task_prompt || "")}</pre>
    <h4>Generated source</h4>
    <pre>${escapeHtml(c.source || "")}</pre>
    <h4>Runtime log</h4>
    <pre>${escapeHtml(c.runtime_log || "")}</pre>
  `;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[ch]));
}

function renderCompare() {
  const opts = runs.map((r) => `<option value="${r.run_id}">${r.run_id} (${r.model})</option>`).join("");
  app.innerHTML = `
    <h1>Compare</h1>
    <div class="row">
      <select id="a">${opts}</select>
      <span>vs</span>
      <select id="b">${opts}</select>
      <button class="link" id="go">Compare</button>
    </div>
    <div id="cmp"></div>
  `;
  document.getElementById("go").addEventListener("click", () => {
    const a = runs.find((r) => r.run_id === document.getElementById("a").value);
    const b = runs.find((r) => r.run_id === document.getElementById("b").value);
    if (!a || !b) return;
    const keys = ["overall", "ds_compliance", "functional", "visual", "ux", "accessibility", "code_quality", "reliability"];
    const rows = keys.map((k) => {
      const av = k === "overall" ? a.overall : a.aggregates[k];
      const bv = k === "overall" ? b.overall : b.aggregates[k];
      const d = ((bv ?? 0) - (av ?? 0)).toFixed(1);
      return `<tr><th>${k}</th><td>${av ?? "—"}</td><td>${bv ?? "—"}</td><td class="${d < 0 ? "down" : ""}">${d > 0 ? "+" : ""}${d}</td></tr>`;
    }).join("");
    document.getElementById("cmp").innerHTML = `<table><thead><tr><th>Axis</th><th>${a.model}</th><th>${b.model}</th><th>Δ</th></tr></thead><tbody>${rows}</tbody></table>`;
  });
}

load().catch((err) => {
  app.innerHTML = `<h1>Dashboard API is down</h1><p class="muted">${err}</p><p class="muted">Run <code>ds-eval dashboard</code></p>`;
});
