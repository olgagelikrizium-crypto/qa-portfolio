/* =========================================================
   bugs.js — список баг-репортов (portfolio.html)
   и страница одного бага (bugs/bug.html).
   Данные: data/bugs.json
   Фильтры сохраняются в адресе страницы, поэтому можно
   отправить ссылку, например: portfolio.html?tag=Localization
   ========================================================= */

let ALL_BUGS = [];

function sortBugs(list, mode) {
  const byDate = (a, b) => (parseDate(b.date) || 0) - (parseDate(a.date) || 0);
  const copy = [...list];
  if (mode === "old") return copy.sort((a, b) => -byDate(a, b));
  if (mode === "sev") return copy.sort((a, b) => (SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]) || byDate(a, b));
  return copy.sort(byDate);
}

/* ---------------- LIST PAGE ---------------- */
async function initList() {
  const list = document.getElementById("bug-list");
  const form = document.getElementById("filters");
  const countEl = document.getElementById("count");
  const resetBtn = document.getElementById("reset");
  const chipsBox = document.getElementById("tag-chips");

  try {
    ALL_BUGS = await getJSON("data/bugs.json");
  } catch (e) {
    console.error(e);
    countEl.textContent = "Reports could not be loaded.";
    return;
  }

  const uniq = (arr) => [...new Set(arr)];
  const fill = (id, values) => {
    const sel = document.getElementById(id);
    values.forEach((v) => sel.insertAdjacentHTML("beforeend", `<option>${esc(v)}</option>`));
  };
  fill("project", uniq(ALL_BUGS.map((b) => b.project)));
  fill("severity", Object.keys(SEVERITY_ORDER).filter((s) => ALL_BUGS.some((b) => b.severity === s)));
  fill("platform", uniq(ALL_BUGS.flatMap((b) => b.platforms || [])));

  // tag chips with counts, most frequent first
  const tagCount = {};
  ALL_BUGS.forEach((b) => (b.tags || []).forEach((t) => (tagCount[t] = (tagCount[t] || 0) + 1)));
  const tags = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a]);
  chipsBox.innerHTML = tags.map((t) => `<button type="button" class="chip" data-tag="${esc(t)}" aria-pressed="false">${esc(t)} · ${tagCount[t]}</button>`).join("");

  // restore state from URL
  const params = new URLSearchParams(location.search);
  ["q", "project", "severity", "platform", "sort"].forEach((k) => {
    if (params.get(k)) form.elements[k].value = params.get(k);
  });
  let activeTag = params.get("tag") || "";
  const syncChips = () => chipsBox.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.tag === activeTag)));

  function render() {
    const f = Object.fromEntries(new FormData(form));
    const q = (f.q || "").trim().toLowerCase();
    let items = ALL_BUGS.filter((b) =>
      (!f.project || b.project === f.project) &&
      (!f.severity || b.severity === f.severity) &&
      (!f.platform || (b.platforms || []).includes(f.platform)) &&
      (!activeTag || (b.tags || []).includes(activeTag)) &&
      (!q || [b.id, b.title, b.actual, b.expected, b.comments, b.context, ...(b.steps || [])].join(" ").toLowerCase().includes(q))
    );
    items = sortBugs(items, f.sort);

    list.innerHTML = items.length
      ? items.map(bugCard).join("")
      : `<div class="empty card" style="grid-column:1/-1"><p><strong>No reports match these filters.</strong></p><p>Try removing a filter or searching for a different word.</p></div>`;

    const filtered = items.length !== ALL_BUGS.length;
    countEl.textContent = filtered ? `Showing ${items.length} of ${ALL_BUGS.length} reports` : `${ALL_BUGS.length} reports`;
    resetBtn.hidden = !filtered && !f.q && f.sort === "new";

    // keep filters in URL (so links can be shared)
    const out = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v && !(k === "sort" && v === "new")) out.set(k, v); });
    if (activeTag) out.set("tag", activeTag);
    history.replaceState(null, "", out.toString() ? `?${out}` : location.pathname);
    syncChips();

    // remember order so that "Next / Previous" on the detail page follows this list
    try { sessionStorage.setItem("bugOrder", JSON.stringify(items.map((b) => b.id))); } catch (e) { /* storage unavailable */ }
  }

  form.addEventListener("input", render);
  form.addEventListener("change", render);
  chipsBox.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    activeTag = activeTag === chip.dataset.tag ? "" : chip.dataset.tag;
    render();
  });
  resetBtn.addEventListener("click", () => { form.reset(); activeTag = ""; render(); });

  render();
}

/* ---------------- DETAIL PAGE ---------------- */
async function initDetail() {
  const root = document.getElementById("bug");
  const id = new URLSearchParams(location.search).get("id");

  let bugs;
  try {
    bugs = await getJSON("data/bugs.json");
  } catch (e) {
    console.error(e);
    root.innerHTML = `<p>Report could not be loaded. <a href="${BASE}portfolio.html">Back to all reports</a></p>`;
    return;
  }
  const bug = bugs.find((b) => b.id === id);
  if (!bug) {
    root.innerHTML = `<h1>Report not found</h1><p>There is no report with ID “${esc(id)}”. <a href="${BASE}portfolio.html">See all reports</a></p>`;
    return;
  }

  document.title = `${bug.id}: ${bug.title} — Bug report`;

  // order for prev/next: list the user came from, otherwise newest first
  let order = null;
  try { order = JSON.parse(sessionStorage.getItem("bugOrder") || "null"); } catch (e) { /* ignore */ }
  if (!Array.isArray(order) || !order.includes(bug.id)) order = sortBugs(bugs, "new").map((b) => b.id);
  const i = order.indexOf(bug.id);
  const link = (bid) => `bug.html?id=${encodeURIComponent(bid)}`;

  const list = (arr) => `<ul>${(arr || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
  const evidence = bug.evidence
    ? `<div class="video-box"><video controls preload="metadata" src="${BASE}${esc(bug.evidence)}" aria-label="Video evidence for ${esc(bug.id)}"></video></div>`
    : `<div class="video-missing">${esc(bug.note || "No video evidence for this report.")}</div>`;

  root.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="${BASE}portfolio.html">Bug reports</a> / ${esc(bug.id)}</nav>
    <header class="detail-head">
      <div class="top">
        <span class="badge badge-id">${esc(bug.id)}</span>
        <span class="badge ${sevClass(bug.severity)}">Severity: ${esc(bug.severity)}</span>
        <span class="badge badge-outline">Priority: ${esc(bug.priority)}</span>
        <span class="badge badge-outline">${esc(bug.type)}</span>
      </div>
      <h1>${esc(bug.title)}</h1>
      <p class="muted">${esc(bug.context)}</p>
    </header>

    <div class="detail-grid">
      <article class="card">
        <section class="report-block">
          <h2>Steps to reproduce</h2>
          <ol class="steps">${bug.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        </section>
        <section class="report-block result result-actual">
          <h2>Actual result</h2>
          <p>${esc(bug.actual)}</p>
        </section>
        <section class="report-block result result-expected">
          <h2>Expected result</h2>
          <p>${esc(bug.expected)}</p>
        </section>
        ${bug.comments ? `<section class="report-block"><h2>Comments</h2><p>${esc(bug.comments)}</p></section>` : ""}
      </article>

      <aside class="side grid">
        <div class="card">
          <dl>
            <div><dt>Project</dt><dd>${esc(bug.project)} <span class="muted">· ${esc(bug.source)}</span></dd></div>
            <div><dt>Reported</dt><dd>${formatDate(bug.date)}</dd></div>
            <div><dt>Environment</dt><dd>${list(bug.environment)}</dd></div>
            <div><dt>Area</dt><dd><div class="chips">${(bug.tags || []).map((t) => `<a class="chip" href="${BASE}portfolio.html?tag=${encodeURIComponent(t)}">${esc(t)}</a>`).join("")}</div></dd></div>
          </dl>
        </div>
        <div class="card">
          <h2 style="font-size:.8rem;text-transform:uppercase;letter-spacing:.08em;color:var(--ink-3);font-family:var(--font-mono)">Evidence</h2>
          ${evidence}
        </div>
      </aside>
    </div>

    <nav class="pager" aria-label="Other reports">
      ${i > 0 ? `<a class="btn btn-ghost" href="${link(order[i - 1])}">← Previous report</a>` : "<span></span>"}
      <a class="btn btn-ghost" href="${BASE}portfolio.html">All reports</a>
      ${i < order.length - 1 ? `<a class="btn btn-ghost" href="${link(order[i + 1])}">Next report →</a>` : "<span></span>"}
    </nav>`;

  // video file missing -> show a friendly message instead of a broken player
  const video = root.querySelector("video");
  if (video) {
    video.addEventListener("error", () => {
      video.closest(".video-box").outerHTML = `<div class="video-missing">Video evidence is temporarily unavailable.</div>`;
    });
  }
}

if (document.getElementById("bug-list")) initList();
if (document.getElementById("bug")) initDetail();
