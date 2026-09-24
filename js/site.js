/* =========================================================
   site.js — общий код для ВСЕХ страниц:
   шапка, меню, подвал и вспомогательные функции.
   Чтобы добавить пункт меню — допишите его в массив NAV.
   ========================================================= */

const SITE = {
  name: "Volha Shunko",
  role: "Manual QA Tester",
  linkedin: "https://www.linkedin.com/in/volha-shunko-667101387/",
  github: "https://github.com/olgagelikrizium-crypto",
};

// [file, label, section key]
const NAV = [
  ["index.html", "Home", "home"],
  ["portfolio.html", "Bug Reports", "bugs"],
  ["notes.html", "Tester Notes", "notes"],
  ["achievements.html", "Learning", "learning"],
  ["contact.html", "Contact", "contact"],
];

// Path prefix for pages in subfolders (bugs/, achievements/): <body data-base="../">
const BASE = document.body.dataset.base || "";
const PAGE = document.body.dataset.page || "";

function renderHeader() {
  const header = document.createElement("header");
  header.className = "site-header";
  header.innerHTML = `
    <a class="skip-link" href="#main">Skip to content</a>
    <div class="container">
      <a class="brand" href="${BASE}index.html" aria-label="${SITE.name} — home">
        <span class="brand-mark" aria-hidden="true">VS</span>
        <span>${SITE.name}<small>${SITE.role}</small></span>
      </a>
      <button class="burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">
        <span></span><span></span><span></span>
      </button>
      <nav class="site-nav" id="site-nav" aria-label="Main">
        <ul class="nav-list">
          ${NAV.map(([href, label, key]) => `
            <li><a href="${BASE}${href}" ${key === "contact" ? 'class="nav-cta"' : ""} ${key === PAGE ? 'aria-current="page"' : ""}>${label}</a></li>
          `).join("")}
        </ul>
      </nav>
    </div>`;
  document.body.prepend(header);

  const burger = header.querySelector(".burger");
  const nav = header.querySelector(".site-nav");
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("open")) {
      nav.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
      burger.focus();
    }
  });
}

function renderFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `
    <div class="container">
      <span>© ${new Date().getFullYear()} ${SITE.name} · Gdańsk, Poland</span>
      <span class="footer-links">
        <a href="${SITE.linkedin}" target="_blank" rel="noopener">LinkedIn</a>
        <a href="${SITE.github}" target="_blank" rel="noopener">GitHub</a>
        <a href="${BASE}contact.html">Contact</a>
      </span>
    </div>`;
  document.body.append(footer);
}

/* ---------- helpers ---------- */

// Escape text before putting it into HTML (защита от «поломки» вёрстки символами < > &)
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

async function getJSON(path) {
  const res = await fetch(BASE + path);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return res.json();
}

// "29.03.2026" -> Date
function parseDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split(".").map(Number);
  return y ? new Date(y, m - 1, d) : null;
}
function formatDate(str) {
  const d = parseDate(str);
  return d ? d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
}

const SEVERITY_ORDER = { Critical: 0, Major: 1, Minor: 2, Trivial: 3 };
const sevClass = (s) => "sev-" + String(s || "trivial").toLowerCase();

const ICON_VIDEO = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="2" y="6" width="14" height="12" rx="2"/><path d="m22 8-6 4 6 4z"/></svg>`;

// One bug card (used on Home and Bug Reports pages)
function bugCard(bug) {
  const url = `${BASE}bugs/bug.html?id=${encodeURIComponent(bug.id)}`;
  return `
    <article class="card linked bug-card">
      <div class="top">
        <span class="badge badge-id">${esc(bug.id)}</span>
        <span class="badge ${sevClass(bug.severity)}">${esc(bug.severity)}</span>
        ${bug.evidence ? `<span class="badge badge-outline" title="Video evidence attached">${ICON_VIDEO} video</span>` : ""}
      </div>
      <h3><a class="stretched" href="${url}">${esc(bug.title)}</a></h3>
      <div class="tags">${(bug.tags || []).map((t) => `<span>${esc(t)}</span>`).join("")}</div>
      <div class="meta">
        <span>${esc(bug.project)}</span>
        <span class="dot">${(bug.platforms || []).join(" + ")}</span>
        <span class="dot">${formatDate(bug.date)}</span>
      </div>
    </article>`;
}

renderHeader();
renderFooter();
