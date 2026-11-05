# Architecture

Browser → Open-Meteo geocoding → explicit place selection → Open-Meteo hourly forecast → normalizer → pure exhaustive window planner → explained recommendation and hourly table.

`web/config.js` owns endpoint IDs, timeout, cache age, and forecast horizon. `api.js` owns transport and a 20-minute browser-local cache. `planner.js` contains no DOM or network dependencies. `app.js` owns browser state, escaping of external strings, parallel per-place loading and UI updates. `sample.js` is isolated, synthetic and visibly labeled.

Unix epochs enforce real contiguous hours. `Intl.DateTimeFormat` derives local day and hour in the forecast timezone. This avoids interpreting a city's times in the browser timezone and respects timezone transitions. Starts in the past are excluded. Hourly granularity means an outing starting at 09:30 begins no earlier than 10:00; this is a deliberate limitation.

Forecasts older than one hour cannot produce recommendations. Errors never silently substitute synthetic data. Invalid/missing weather values and thunderstorm codes reject a block. The preference interval is 07:00–20:00 local civil time, not sunrise-to-sunset. It may be dark at these hours in winter; the product makes no daylight or route-safety claim.

No backend, database, tracking, location permission, runtime packages, paid API or model. City queries and coordinates go directly to the data provider, whose privacy terms apply. Static hosting avoids cold starts. The provider can still time out, throttle or stop service. Browser cache and bounded requests reduce traffic but are not a shared application-wide rate limiter.

Next best architecture: a server proxy with shared cache and global quota enforcement. It would improve API coordination, but introduces host credentials, operational work and possible sleep behavior. Add it if real traffic warrants it; current scale is unproven.
