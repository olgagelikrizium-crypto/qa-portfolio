/* =========================================================
   audio.js — QA Audio Library
   audio-catalog.html  : список тем (data/catalog-index.json)
   audio-category.html : уроки темы (data/<category>.json)
   audio-lesson.html   : урок + транскрипт (transcripts/...json)
   Новая тема = запись в catalog-index.json + файл data/<id>.json
   ========================================================= */

const qs = new URLSearchParams(location.search);

function lessonCard(catId, q) {
  return `
    <article class="card linked">
      <span class="badge badge-id">Lesson ${esc(q.id)} · ${esc(q.duration)}</span>
      <h3 style="margin-top:10px"><a class="stretched" href="audio-lesson.html?category=${encodeURIComponent(catId)}&id=${encodeURIComponent(q.id)}">${esc(q.title)}</a></h3>
      <div class="bug-card"><div class="tags">${(q.keywords || []).map((k) => `<span>${esc(k)}</span>`).join("")}</div></div>
    </article>`;
}

/* ---------- catalog: all topics with their lessons ---------- */
async function initCatalog() {
  const box = document.getElementById("catalog");
  try {
    const index = await getJSON("data/catalog-index.json");
    const cats = await Promise.all(index.categories.map(async (c) => ({ ...c, data: await getJSON(`data/${c.id}.json`).catch(() => null) })));
    const ready = cats.filter((c) => c.data?.questions?.length);

    box.innerHTML = ready.map((c) => `
      <section class="audio-cat" style="margin-bottom:36px">
        <div class="section-head" style="margin-bottom:14px">
          <div><h2 style="font-size:1.35rem;margin:0">${esc(c.title)}</h2><p>${esc(c.description)}</p></div>
          <a class="link-arrow" href="audio-category.html?category=${encodeURIComponent(c.id)}">${c.data.questions.length} ${c.data.questions.length === 1 ? "lesson" : "lessons"}</a>
        </div>
        <div class="grid grid-auto">${c.data.questions.map((q) => lessonCard(c.id, q)).join("")}</div>
      </section>`).join("") || `<p class="muted">No lessons yet.</p>`;

    const search = document.getElementById("audio-search");
    search?.addEventListener("input", () => {
      const q = search.value.trim().toLowerCase();
      box.querySelectorAll(".audio-cat").forEach((sec) => {
        let visible = 0;
        sec.querySelectorAll(".card").forEach((card) => {
          const show = !q || card.textContent.toLowerCase().includes(q);
          card.hidden = !show; if (show) visible++;
        });
        sec.hidden = visible === 0;
      });
    });
  } catch (e) {
    console.error(e);
    box.innerHTML = `<p class="muted">The library could not be loaded.</p>`;
  }
}

/* ---------- one category ---------- */
async function initCategory() {
  const root = document.getElementById("category");
  const id = qs.get("category");
  try {
    const data = await getJSON(`data/${id}.json`);
    document.title = `${data.category} — QA Audio Library`;
    root.innerHTML = `
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="achievements.html">Learning</a> / <a href="audio-catalog.html">Audio library</a> / ${esc(data.category)}</nav>
      <h1 style="font-size:clamp(1.6rem,3.4vw,2.4rem)">${esc(data.category)}</h1>
      <p class="lede">${esc(data.description)}</p>
      <div class="grid grid-auto" style="margin-top:24px">${data.questions.map((q) => lessonCard(id, q)).join("")}</div>`;
  } catch (e) {
    console.error(e);
    root.innerHTML = `<h1>Topic not found</h1><p><a href="audio-catalog.html">Back to the audio library</a></p>`;
  }
}

/* ---------- one lesson ---------- */
function toSeconds(t) {
  return String(t).split(":").map(Number).reduce((acc, n) => acc * 60 + n, 0); // "MM:SS" or "HH:MM:SS"
}

async function initLesson() {
  const root = document.getElementById("lesson");
  const catId = qs.get("category");
  const lessonId = Number(qs.get("id"));
  try {
    const data = await getJSON(`data/${catId}.json`);
    const lesson = data.questions.find((q) => q.id === lessonId);
    if (!lesson) throw new Error("lesson not found");
    const tr = lesson.transcript_file ? await getJSON(lesson.transcript_file).catch(() => ({})) : {};
    document.title = `${lesson.title} — QA Audio Library`;

    const vocab = tr.vocabulary?.length
      ? `<dl class="vocab">${tr.vocabulary.map((v) => `<dt>${esc(v.term)}</dt><dd>${esc(v.definition)}</dd>`).join("")}</dl>`
      : `<div class="chips">${(lesson.keywords || []).map((k) => `<span class="chip">${esc(k)}</span>`).join("")}</div>`;
    const stamps = tr.timestamps?.length
      ? `<ul style="list-style:none;padding:0;margin:0">${tr.timestamps.map((t) => `<li><button type="button" class="ts-link" data-t="${esc(t.time)}">${esc(t.time)}</button> — ${esc(t.label)}</li>`).join("")}</ul>`
      : `<p class="muted">No timestamps yet.</p>`;
    const short = tr.short_answer
      ? `<div class="card"><h2 style="font-size:1rem">Short answer</h2><p>${esc(tr.short_answer.en)}</p><p class="muted" lang="ru">${esc(tr.short_answer.ru)}</p></div>` : "";
    const practice = tr.practice_questions?.length
      ? `<div class="card"><h2 style="font-size:1rem">Practice questions</h2><ul>${tr.practice_questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ul></div>` : "";
    const transcript = tr.transcript?.length
      ? tr.transcript.map((b) => `
          <div class="transcript-block" id="t-${esc(b.time).replace(":", "-")}">
            <button type="button" class="ts-link" data-t="${esc(b.time)}">▶ ${esc(b.time)}</button>
            <div class="transcript-cols">
              <div><h3>English</h3><p lang="en">${esc(b.en)}</p></div>
              <div><h3>Русский</h3><p lang="ru">${esc(b.ru)}</p></div>
            </div>
          </div>`).join("")
      : `<p class="muted">Transcript coming soon.</p>`;

    root.innerHTML = `
      <nav class="breadcrumbs" aria-label="Breadcrumb"><a href="audio-catalog.html">Audio library</a> / <a href="audio-category.html?category=${encodeURIComponent(catId)}">${esc(data.category)}</a> / Lesson ${lesson.id}</nav>
      <h1 style="font-size:clamp(1.5rem,3.2vw,2.2rem)">${esc(lesson.title)}</h1>
      <div class="lesson-layout" style="margin-top:20px">
        <aside class="lesson-side">
          <div class="card">
            <p class="meta-line">Duration: ${esc(lesson.duration)}</p>
            <audio id="player" controls preload="metadata" src="${esc(lesson.audio)}"></audio>
          </div>
          <div class="card"><h2 style="font-size:1rem">Timestamps</h2>${stamps}</div>
          <div class="card"><h2 style="font-size:1rem">Key vocabulary</h2>${vocab}</div>
        </aside>
        <div class="grid">
          ${short}
          ${practice}
          <div class="card"><h2 style="font-size:1.1rem">Transcript &amp; translation</h2>${transcript}</div>
        </div>
      </div>`;

    const player = document.getElementById("player");
    root.addEventListener("click", (e) => {
      const btn = e.target.closest(".ts-link");
      if (!btn) return;
      player.currentTime = toSeconds(btn.dataset.t);
      player.play().catch(() => {});
      document.getElementById("t-" + btn.dataset.t.replace(":", "-"))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } catch (e) {
    console.error(e);
    root.innerHTML = `<h1>Lesson not found</h1><p><a href="audio-catalog.html">Back to the audio library</a></p>`;
  }
}

if (document.getElementById("catalog")) initCatalog();
if (document.getElementById("category")) initCategory();
if (document.getElementById("lesson")) initLesson();
