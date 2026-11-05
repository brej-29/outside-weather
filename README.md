# Outside

Find a continuous weather window for an ordinary walk or casual ride. Compare two cities, set rain, wind and feels-like limits, and inspect why each hour qualifies.

**Live deployment: pending.** This supplied folder has no git metadata or remote, and GitHub authentication is invalid. No default branch, PR, CI run or live deployment is claimed. The original source is retained; a source-only backup lives one directory above the project.

## The problem

The original Django comparison showed current weather and a noon-based daily summary. A dry noon can hide a rainy second hour. Outside checks the entire outing against explicit preferences and exposes hourly evidence. User demand remains unvalidated; see [the full defense and 15 skeptical questions](weather_project/docs/WHY.md).

## Evidence and result

Threshold fixed before implementation: **zero invalid recommendations and exact agreement with an independent complete search**.

| Seeded synthetic evaluation | Result |
| --- | --- |
| Complete rankings agreeing with reference | 3,000 / 3,000 |
| Constraint violations | 0 |
| Cases with an eligible window | 1,735 |
| First daytime baseline: valid / optimal | 109 / 56 |
| Noon baseline: valid / optimal | 95 / 41 |
| First-hour-only ablation: valid / optimal | 1,284 / 1,284 |

These are scheduling correctness results on synthetic stress inputs, **not forecast accuracy, typical weather frequencies or user benefit**. A live transport check returned 72 hours for Asia/Kolkata; transport success is not prediction validation. [Evaluation](weather_project/docs/evaluation.json), [architecture](weather_project/docs/ARCHITECTURE.md), [design tokens](weather_project/DESIGN.md).

Six core tests and three browser tests pass. The main browser test uses explicit test fixtures; a separate [live browser check](weather_project/docs/live-check.json) completed city search, selection, real forecast retrieval and planning with zero browser errors. Automated WCAG A/AA checks find no violations at 390px, 820px and 1440px; this does not replace a screen-reader usability study. Reviewed captures: [phone](weather_project/docs/screenshots/phone.png), [tablet](weather_project/docs/screenshots/tablet.png), [desktop](weather_project/docs/screenshots/desktop.png).

The first local mobile Lighthouse run scored 81 performance; a smaller, preloaded 22.8 KB font improved the next run to **99 performance / 100 accessibility / 100 best practices / 100 SEO**. [Report](weather_project/docs/lighthouse.json). These are single local simulated-throttling runs, not a production SLA. The runtime has no dependencies; the complete development dependency audit reports zero known vulnerabilities at verification time.

## Run and reproduce

Node 22 or newer. The runtime has no packages or secret keys.

```sh
npm ci
npm test
npm run evaluate
npm run dev
# http://127.0.0.1:4173
npm run test:e2e
npm run build
```

On PowerShell with script restrictions use `npm.cmd`. Install the test browser with `npx playwright install chromium`; CI installs it through Playwright. A cache directory inside the writable workspace may be needed in restricted environments. `npm run build` copies only `web/` into `dist/`; legacy Django files and the database are never deployed.

## Data, cost and limits

[Open-Meteo weather](https://open-meteo.com/en/docs) and GeoNames geocoding via Open-Meteo; weather data under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The [free API terms](https://open-meteo.com/en/terms) restrict use to noncommercial purposes, below 10,000 requests/day, 5,000/hour and 600/minute, without uptime guarantees. There are no subscriptions, ads, models or payments in this app. Do not commercialize it without revisiting these terms.

The browser caches forecasts for 20 minutes and times out requests after 12 seconds. Recommendations expire after an hour. No stale forecast is silently converted to live data; synthetic sample mode is always labeled. Cache is local, not global rate enforcement. Weather queries disclose selected locations to the provider. No tracking or location permission is used.

Only 1–3 whole hours between 07:00 and 20:00 are considered. These are civil daytime hours, not guaranteed daylight. Wind is sustained 10m wind, not gusts. The app omits air quality, UV, ice, route conditions and official warnings. Preferences are not medical or outdoor safety thresholds.

## Deployment and repository handoff

The included GitHub Pages workflow runs tests and builds static files; the deploy job is restricted to the repository's default branch. [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) apply; free availability depends on repository visibility and account plan. A public repository on GitHub Free supports Pages without a card. No hosting account was created.

Restore the intended repository metadata and authenticate `gh`, then pull its actual default branch and reconcile this work on a feature branch. Do not replace existing remote history. Tag the original remote starting state, run `node scripts/install-hooks.mjs`, scan changes using `node scripts/scan.mjs`, open a focused PR, and merge only after CI. In repository Settings → Pages choose GitHub Actions. After deployment set `LIVE_URL` and run `npm run smoke` plus `npm run test:e2e`; record the resulting URL and repository description.

No tool attribution configuration was modified: the official configuration reference did not establish a supported commit-attribution setting and user-level configuration is outside this writable workspace. The repository hook rejects prohibited attribution lines once installed; the scan checks new commits and diffs before publishing. No original history was available to audit.

## Security and provenance

`weather_project/settings.py` in the retained original contained `SECRET_KEY`; it has been replaced with an environment lookup. Whether it was ever committed cannot be determined without history. Rotate it if previously deployed. A separate `API_KEY` file exists outside this project; its value was never read or copied. Neither the legacy source nor that key is part of the static build. Newsreader is distributed under its included SIL Open Font License.

