/* home.js — цифры и избранные баги на главной.
   Избранные = баги с "featured": true в data/bugs.json */

(async function () {
  try {
    const bugs = await getJSON("data/bugs.json");

    // Languages mentioned in localization bugs (EN excluded)
    const LANGS = ["PL", "AR", "HU", "DE", "EL", "IT", "RO", "RU"];
    const locBugs = bugs.filter((b) => b.tags?.includes("Localization"));
    const langs = new Set();
    locBugs.forEach((b) => {
      const text = (b.title + " " + b.steps.join(" ")).toUpperCase();
      LANGS.forEach((l) => { if (new RegExp(`\\b${l}\\b`).test(text)) langs.add(l); });
    });

    const set = (key, val) => document.querySelectorAll(`[data-stat="${key}"]`).forEach((el) => (el.textContent = val));
    set("total", bugs.length);
    set("loc", locBugs.length);
    set("langs", langs.size);
    set("video", bugs.filter((b) => b.evidence).length);

    const featured = bugs.filter((b) => b.featured);
    document.getElementById("featured").innerHTML = featured.map(bugCard).join("");
  } catch (err) {
    console.error(err);
    document.getElementById("featured").innerHTML =
      `<p class="muted">Reports could not be loaded. <a href="portfolio.html">Open the full list</a>.</p>`;
  }
})();
