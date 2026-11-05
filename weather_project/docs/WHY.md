# Why Outside exists

## Problem and evidence

The original project compared current weather and daily summaries for two cities. Its `fetch_weather_and_forecast_1` selects the forecast closest to noon for each day's description. That makes it impossible to infer a continuous two-hour outing from the displayed result: a dry noon says nothing about a rainy 13:00. An hourly constraint solver addresses this information loss for people with flexible schedules planning ordinary walks or casual rides.

This is a demonstrated software information-loss problem and an unvalidated user-demand hypothesis. No interviews, adoption figures or market-size estimates are claimed. The deterministic suite contains 3,000 cases, including missing values, gaps and thunderstorms; results are in [evaluation.json](evaluation.json). A fixed noon baseline is an intentionally simple comparator, not a faithful reconstruction of a competing product or human planning.

## Why now

[Open-Meteo](https://open-meteo.com/en/docs) exposes hourly feels-like temperature, precipitation probability, wind and weather codes with timezone metadata. Its [terms](https://open-meteo.com/en/terms) permit noncommercial access without a key, below 10,000 requests/day, 5,000/hour and 600/minute; availability is not guaranteed. This makes a credential-free static experiment practical; it does not imply the weather data or planning problem is new.

## Alternatives on the same criteria

| Approach | Hourly evidence | Continuous custom duration | Explanation | Operational cost |
| --- | --- | --- | --- | --- |
| Original app | Noon summary | No | Weather description | Python server and API key |
| [Apple Weather](https://support.apple.com/guide/iphone/check-the-weather-iph1ac0b35f/ios) | Hourly forecast UI | User can inspect manually | Rich forecast details | Existing consumer product |
| [Windy](https://www.windy.com/) | Maps and timeline | User can inspect manually | Extensive meteorological layers | Existing consumer product |
| [meteoblue where2go](https://www.meteoblue.com/en/weather/outdoorsports/where2go) | Outdoor weather context | Destination-oriented planning | Multiple forecasts and outdoor tools | Existing consumer product |
| Spreadsheet/manual inspection | Yes, if imported | Possible | Fully inspectable | User effort and data import |
| Outside | Hourly table | Explicit 1–3 hours | Every rejected hour has a reason | Static hosting; noncommercial API quota |

We do not claim competitors lack every comparable feature; this comparison covers the referenced experiences and our narrow workflow. A person already comfortable reading hourly weather may gain little. The hypothesis is reduced decision effort, which still needs a timed usability study against manual hourly inspection.

## Why this implementation

A complete scan is simpler and easier to audit than a learned recommendation. There are at most 72 hourly points, so an optimizer or model adds no useful capability. Static ES modules eliminate backend keys and sleep behavior; Node tests reproduce scheduling results without a network. A proxy with shared caching is the next best choice if quota coordination becomes necessary.

## Numbers and limits

On the seeded suite, 3,000/3,000 complete rankings match the independent epoch-lookup oracle, with zero constraint violations. There are 1,735 feasible cases; first daytime yields 109 valid starts, noon yields 95, and an ablation checking only the first hour yields 1,284. Baseline counts describe this deliberately difficult synthetic distribution only. No statistical confidence interval is appropriate for an exhaustive comparison on fixed generated inputs; there are no repeated human trials or forecast-outcome observations.

The experiment proves constraint implementation under tested inputs, not the correctness of our preferences, forecast calibration, optimal outdoor experience, weather safety, or commercial viability. Peak hourly rain probability is not a joint outing probability. Wind gusts, air pollution, UV, ice, terrain and local warnings are outside the model. Forecast-grid precision cannot predict conditions along a route.

## Falsification and next experiment

Any oracle disagreement or returned block with an invalid hour fails the correctness threshold and blocks release. For usefulness, recruit at least 12 people who regularly take flexible urban walks, counterbalance manual hourly inspection and Outside over identical forecasts, and pre-register median decision-time improvement of at least 25% with no increase in preference violations. This threshold is a proposed future study, not a completed result. If the result fails, build a simpler annotated hourly viewer rather than adding prediction machinery.

## Fifteen hard questions

1. **Why build another weather app?** The original daily summary discards hours needed for a continuous outing. Outside tests a narrow scheduling layer; it does not compete on forecasting breadth.
2. **Who asked for it?** No interviewed users are documented. Flexible-schedule walkers are a hypothesis recorded before implementation in PRODUCT.md; a timed study is the next validation gate.
3. **Are the impressive numbers manufactured?** The inputs are explicitly synthetic, seeded and reproducible with `npm run evaluate`. They measure software correctness and include baselines and a first-hour-only ablation; they are not user or meteorological outcomes.
4. **Is the reference just the same code twice?** The reference builds windows through epoch lookup and inline predicates; production slices arrays and uses a shared validator. The oracle never imports the production validator, though both intentionally implement the same written contract.
5. **Why no machine learning?** The full search is tiny and the rules are explicit. A model would introduce cost and unmeasured ranking behavior without improving this decision problem.
6. **What does best mean?** Lowest peak hourly rain chance, then peak sustained wind, then average absolute distance from 20°C, then earliest start. This is a transparent preference ordering, not a calibrated utility function or a safety score.
7. **Why 20°C?** It is a documented ranking heuristic, while the user's acceptable temperature range is configurable. It needs user validation; all otherwise eligible blocks remain inspectable through the hourly evidence.
8. **Can you promise a dry walk?** No. The interface labels peak hourly rain chance and does not convert it into a probability of staying dry for multiple hours.
9. **What happens to missing data?** Any missing required variable rejects a window. The UI exposes missing hours, and unit tests plus stress cases exercise that behavior.
10. **Can timezone handling silently change the day?** Epochs are normalized through the location's IANA timezone. Unit tests include a half-hour-offset zone; the browser timezone is not used to group forecast hours.
11. **What happens when the free API runs out?** The app shows a recoverable unavailable state and makes no recommendation from failed requests. It uses 12-second timeouts and 20-minute local caching; there is no global quota guarantee.
12. **Is this really free forever?** No perpetual guarantee is possible. The weather tier is explicitly noncommercial and subject to provider changes; static files can migrate between hosts without changing the planner.
13. **What privacy do users give up?** Searches and selected coordinates are sent to Open-Meteo; preferences and cached forecasts stay in browser storage. There is no account, analytics or automatic geolocation.
14. **What could make a recommendation harmful?** The rules omit gusts, air quality, UV, surface hazards and official warnings. The product describes ordinary outing preferences and asks users to check local warnings; it does not certify safety.
15. **What is the strongest reason to abandon it?** If people choose just as quickly and accurately with a basic hourly forecast, the scheduling layer has little value. The proposed counterbalanced study would determine whether to retain the planner or simplify to an hourly viewer.
