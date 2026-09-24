/* =========================================================
   notes.js — Tester Notes (notes.html) и одна заметка (note.html)
   Данные: data/notes.json
   Типы заметок: "golden" (Золотая жила), "checklist", "lesson".
   Блоки внутри заметки (sections):
     { "h": "Заголовок", "p": "Абзац" }
     { "h": "Заголовок", "list": ["пункт", "пункт"] }
     { "h": "Заголовок", "check": ["пункт чек-листа", ...] }
   ========================================================= */

const NOTE_TYPES = {
  golden: "Golden mine · bug pattern",
  checklist: "Checklist",
  lesson: "Lesson learned",
};

function noteCard(n) {
  return `
    <article class="card linked">
      <span class="note-type ${esc(n.type)}">${esc(NOTE_TYPES[n.type] || n.type)}</span>
      <h3 style="margin-top:8px"><a class="stretched" href="note.html?id=${encodeURIComponent(n.id)}">${esc(n.title)}</a></h3>
      <p class="muted">${esc(n.summary)}</p>
      <div class="bug-card"><div class="tags">${(n.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div></div>
    </article>`;
}

async function initNotesList() {
  const box = document.getElementById("notes-list");
  const chips = document.getElementById("note-types");
  let notes;
  try { notes = await getJSON("data/notes.json"); }
  catch (e) { console.error(e); box.innerHTML = `<p class="muted">Notes could not be loaded.</p>`; return; }

  let active = new URLSearchParams(location.search).get("type") || "";
  const types = Object.keys(NOTE_TYPES).filter((t) => notes.some((n) => n.type === t));
  chips.innerHTML = [["", `All · ${notes.length}`], ...types.map((t) => [t, `${NOTE_TYPES[t].split(" · ")[0]} · ${notes.filter((n) => n.type === t).length}`])]
    .map(([t, label]) => `<button type="button" class="chip" data-type="${t}">${esc(label)}</button>`).join("");

  function render() {
    chips.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.type === active)));
    box.innerHTML = notes.filter((n) => !active || n.type === active).map(noteCard).join("");
    history.replaceState(null, "", active ? `?type=${active}` : location.pathname);
  }
  chips.addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (c) { active = c.dataset.type; render(); }
  });
  render();
}

async function initNote() {
  const root = document.getElementById("note");
  const id = new URLSearchParams(location.search).get("id");
  let notes, bugs = [];
  try {
    [notes, bugs] = await Promise.all([getJSON("data/notes.json"), getJSON("data/bugs.json").catch(() => [])]);
  } catch (e) { console.error(e); root.innerHTML = `<p>Note could not be loaded.</p>`; return; }

  const n = notes.find((x) => x.id === id);
  if (!n) { root.innerHTML = `<h1>Note not found</h1><p><a href="notes.html">See all notes</a></p>`; return; }
  document.title = `${n.title} — Tester Notes`;

  const section = (s) => {
    let html = s.h ? `<h2>${esc(s.h)}</h2>` : "";
    if (s.p) html += `<p>${esc(s.p)}</p>`;
    if (s.list) html += `<ul>${s.list.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
    if (s.check) html += `<ul class="checklist">${s.check.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>`;
    return html;
  };
  const related = (n.related_bugs || []).map((bid) => bugs.find((b) => b.id === bid)).filter(Boolean);

  root.innerHTML = `
    <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="notes.html">Tester Notes</a> / ${esc(NOTE_TYPES[n.type] || n.type)}</nav>
    <article class="article">
      <span class="note-type ${esc(n.type)}">${esc(NOTE_TYPES[n.type] || n.type)}</span>
      <h1 style="font-size:clamp(1.6rem,3.4vw,2.4rem);margin-top:8px">${esc(n.title)}</h1>
      <p class="lede">${esc(n.summary)}</p>
      ${n.sections.map(section).join("")}
    </article>
    ${related.length ? `
      <section style="margin-top:40px">
        <h2 style="font-size:1.2rem">Real reports behind this note</h2>
        <div class="grid grid-auto">${related.map(bugCard).join("")}</div>
      </section>` : ""}
    <nav class="pager"><a class="btn btn-ghost" href="notes.html">← All notes</a></nav>`;
}

if (document.getElementById("notes-list")) initNotesList();
if (document.getElementById("note")) initNote();
