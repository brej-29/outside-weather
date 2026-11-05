# Product
Outside helps people with flexible schedules choose a continuous 1–3 hour window for an ordinary walk or casual ride in either of two places. It retains the original city's weather-comparison idea.

## Platform
Web, static, responsive, browser-local preferences. Noncommercial, no account, no paid services.

## Audience and job
A person deciding when to take a walk over the next three days. They choose a place, duration and personal weather limits, inspect the forecast, and choose a window. Assumption from the autonomous brief; no user interviews conducted.

## Mechanism
Evaluate every contiguous hourly window in local daytime, reject any hour outside user limits or with missing data, rank remaining windows by rain then wind then temperature comfort. Show reasons and full hourly values. Never describe a forecast as a guarantee.

## Success, fixed before implementation
Zero constraint-violating recommendations; 100% agreement with independent exhaustive enumeration on a deterministic stress suite. Compare against first daytime and noon-only baselines. Separately test live data transport and main browser flow. No claims of improved meteorological accuracy or validated demand.

## Stack
Browser ES modules, static hosting, Node built-in tests. Configurable Open-Meteo service endpoints; no model required.

## Visual authority
Replacement of the unstyled city-summary form. Code-first operate surface; the user explicitly delegated creative decisions and asked questions only for blockers, so the skill's optional interview is superseded by that instruction.
