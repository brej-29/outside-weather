# Validation record

Run date: 2026-11-05. Node 24.17.0 on Windows. No default branch or remote git history is available in the supplied folder.

| Check | Evidence | Outcome |
| --- | --- | --- |
| Core rules | `npm test` | 6 passing tests |
| Complete deterministic ranking | `npm run evaluate` | 3,000/3,000 rankings agree; zero invalid recommendations |
| Main browser flow | `npm run test:e2e` | 3 passing tests including service failure and sample exploration |
| Accessibility and responsive layout | axe in browser suite | Zero automated A/AA violations and no page overflow at 390, 820, 1440px |
| Real data flow | `node scripts/browser-live.mjs` | Search, select Bengaluru, fetch real forecast, recommend; zero browser errors |
| Local mobile Lighthouse | `node scripts/lighthouse.mjs` | 99 performance; 100 accessibility; 100 best practices; 100 SEO |
| Package audit | `npm audit` | Zero known vulnerabilities in complete dependency tree |
| Static build | `npm run build` | Only web source copied to dist |
| Attribution source scan | `node scripts/scan-source.mjs` | Zero hits |
| Remote CI, PR, production smoke | Requires git remote and valid authentication | Not run |

Browser tooling: install Chromium with Playwright; set PLAYWRIGHT_BROWSERS_PATH when its cache must be inside the writable workspace. Live check accepts APP_URL (default localhost:4174). Lighthouse accepts APP_URL, CHROME_PATH and LIGHTHOUSE_PROFILE; point the latter to a writable scratch directory. Smoke accepts LIVE_URL. The dev server accepts PORT (default 4173).

Negative findings and fixes: the original Python launcher could not spawn; no original dependency manifest or git metadata exists. The first browser attempt lacked an installed browser. Initial package versions had advisories; resolved versions audit clean. First screenshot review revealed garbled punctuation and an incorrect heavy font, both repaired. Independent review caught sample data spanning four dates, loss of open-table state across updates, and missing visible scroll guidance; corrected and recaptured. First local performance score was 81; reducing font transfer to 22,772 bytes produced 99.

The design detector reported contextual warnings for cream ground, serif display and a system control font. Independent review judged the outdoor-journal direction coherent; these are design judgments, not waived accessibility findings. Native controls and authored SVG provide the working interface.

Not established: real-world forecast calibration, demand, comparative decision speed, assistive-technology usability, production performance, global quota enforcement or uptime. The proposed user study in WHY.md remains future work. No historical secret exposure or attribution in previous commits can be established without the missing history.
