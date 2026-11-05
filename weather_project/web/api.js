import { CONFIG } from './config.js';
import { normalize } from './planner.js';

const memory = new Map();
function read(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return memory.get(key); } }
function write(key, value) { memory.set(key, value); try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Memory cache works when browser storage is unavailable. */ } }
async function request(url, signal) {
  const timeout = AbortSignal.timeout(CONFIG.timeoutMs);
  const response = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
  if (!response.ok) throw new Error(response.status === 429 ? 'Weather service is busy. Wait a minute and retry.' : 'Weather service unavailable. Please retry.');
  return response.json();
}
export async function searchPlaces(query, signal) {
  const url = new URL(CONFIG.geocoding);
  url.search = new URLSearchParams({ name: query, count: '6', language: 'en', format: 'json' });
  const data = await request(url, signal);
  return (data.results || []).map(p => ({ name: p.name, region: p.admin1 || p.country || '', country: p.country || '', latitude: p.latitude, longitude: p.longitude }));
}
export async function forecast(place) {
  const key = `outside-v1:${place.latitude},${place.longitude}`;
  const cached = read(key);
  if (cached && Date.now() - cached.at < CONFIG.cacheMinutes * 60000) {
    try { return { ...cached, hours: normalize(cached.data), cached: true }; } catch { /* Replace invalid cached responses. */ }
  }
  const url = new URL(CONFIG.forecast);
  url.search = new URLSearchParams({ latitude: place.latitude, longitude: place.longitude, hourly: 'apparent_temperature,precipitation_probability,wind_speed_10m,weather_code', forecast_days: String(CONFIG.days), timezone: 'auto', timeformat: 'unixtime', wind_speed_unit: 'kmh' });
  const data = await request(url);
  const hours = normalize(data);
  const at = Date.now();
  write(key, { data, at });
  return { data, hours, at, cached: false };
}
