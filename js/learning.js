/* learning.js — сертификаты (achievements.html). Данные: data/certificates.json
   Новый курс = новый объект в JSON + картинка в images/certificates/ */
(async function () {
  const box = document.getElementById("certificates");
  try {
    const certs = await getJSON("data/certificates.json");
    box.innerHTML = certs.map((c) => `
      <article class="card cert-card" id="${esc(c.id)}">
        <a href="${BASE}${esc(c.image)}" target="_blank" rel="noopener" aria-label="Open certificate image: ${esc(c.title)}">
          <img src="${BASE}${esc(c.image)}" alt="Certificate: ${esc(c.title)}" loading="lazy">
        </a>
        <h3>${esc(c.title)}</h3>
        <p class="meta-line">${esc(c.issuer)} · ${esc(c.date)}${c.duration ? ` · ${esc(c.duration)}` : ""}</p>
        <p class="muted">${esc(c.summary)}</p>
        ${c.topics?.length ? `<details><summary>What I learned</summary><ul>${c.topics.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></details>` : ""}
      </article>`).join("");
    // open the card if the URL points to it (achievements.html#css-essentials)
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) { el.querySelector("details")?.setAttribute("open", ""); el.scrollIntoView(); }
    }
  } catch (e) {
    console.error(e);
    box.innerHTML = `<p class="muted">Certificates could not be loaded.</p>`;
  }

  // audio library numbers
  try {
    const cat = await getJSON("data/catalog-index.json");
    const n = cat.categories.reduce((s, c) => s + (c.questions || 0), 0);
    const el = document.getElementById("audio-count");
    if (el) el.textContent = `${n} lessons in ${cat.categories.length} topics · English transcripts with Russian translation`;
  } catch (e) { /* optional */ }
})();
