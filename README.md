# QA Portfolio — Volha Shunko

Manual QA tester portfolio: real bug reports, tester notes (bug patterns, checklists) and learning.
Live site: https://olgagelikrizium-crypto.github.io/qa-portfolio/

Plain HTML, CSS and JavaScript, no frameworks. All content lives in JSON files in `data/`,
so adding a report or a note doesn't require touching the HTML.

| Page | File | Data |
|---|---|---|
| Home | `index.html` | `data/bugs.json` (stats, featured reports) |
| Bug reports | `portfolio.html`, `bugs/bug.html` | `data/bugs.json` |
| Tester Notes | `notes.html`, `note.html` | `data/notes.json` |
| Learning | `achievements.html` | `data/certificates.json` |
| QA Audio Library | `audio-catalog.html`, `audio-category.html`, `audio-lesson.html` | `data/catalog-index.json`, `data/<topic>.json`, `transcripts/` |
| Contact | `contact.html` | Formspree form |
