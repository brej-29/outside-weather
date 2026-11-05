export const DEFAULTS = Object.freeze({ duration: 2, rain: 30, wind: 25, minTemp: 8, maxTemp: 28, start: 7, end: 20 });

export function validHour(h, p) {
  return [h.temp, h.rain, h.wind, h.code].every(Number.isFinite)
    && h.rain >= 0 && h.rain <= 100 && h.wind >= 0
    && h.temp >= p.minTemp && h.temp <= p.maxTemp && h.rain <= p.rain && h.wind <= p.wind
    && ![95, 96, 99].includes(h.code);
}

export function rankWindows(hours, p = DEFAULTS) {
  if (!Number.isInteger(p.duration) || p.duration < 1 || p.duration > 3 || p.minTemp > p.maxTemp) return [];
  const result = [];
  for (let i = 0; i <= hours.length - p.duration; i++) {
    const slice = hours.slice(i, i + p.duration);
    const first = slice[0];
    if (first.hour < p.start || first.hour + p.duration > p.end || !slice.every(h => h.day === first.day && validHour(h, p))) continue;
    if (!slice.every((h, j) => h.epoch === first.epoch + j * 3600)) continue;
    const rain = Math.max(...slice.map(h => h.rain));
    const wind = Math.max(...slice.map(h => h.wind));
    const temp = slice.reduce((s, h) => s + h.temp, 0) / slice.length;
    const comfort = slice.reduce((s, h) => s + Math.abs(h.temp - 20), 0) / slice.length;
    result.push({ ...first, hours: slice, rain, wind, temp, comfort, endHour: first.hour + p.duration });
  }
  return result.sort((a, b) => a.rain - b.rain || a.wind - b.wind || a.comfort - b.comfort || a.epoch - b.epoch);
}

export function normalize(data, now = Date.now()) {
  const a = data?.hourly;
  if (!a || !Array.isArray(a.time) || !Number.isFinite(data.utc_offset_seconds) || !data.timezone) throw new Error('Forecast format was incomplete. Please retry.');
  const formatter = new Intl.DateTimeFormat('en-GB', { timeZone: data.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23' });
  return a.time.map((epoch, i) => {
    const parts = Object.fromEntries(formatter.formatToParts(new Date(epoch * 1000)).map(p => [p.type, p.value]));
    return { epoch, day: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour), temp: a.apparent_temperature?.[i], rain: a.precipitation_probability?.[i], wind: a.wind_speed_10m?.[i], code: a.weather_code?.[i] };
  }).filter(h => Number.isFinite(h.epoch) && h.epoch * 1000 >= now);
}

export function reasons(h, p) {
  if (![h.temp, h.rain, h.wind, h.code].every(Number.isFinite)) return 'Missing forecast';
  const out = [];
  if ([95, 96, 99].includes(h.code)) out.push('Thunderstorm forecast');
  if (h.rain > p.rain) out.push('Rain above limit');
  if (h.wind > p.wind) out.push('Wind above limit');
  if (h.temp < p.minTemp || h.temp > p.maxTemp) out.push('Temperature outside range');
  return out.join(' · ') || 'Within your limits';
}
