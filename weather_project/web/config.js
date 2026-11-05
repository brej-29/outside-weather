export const CONFIG = Object.freeze({
  forecast: 'https://api.open-meteo.com/v1/forecast',
  geocoding: 'https://geocoding-api.open-meteo.com/v1/search',
  cacheMinutes: 20,
  timeoutMs: 12000,
  maxAgeMs: 60 * 60 * 1000,
  days: 3,
});
