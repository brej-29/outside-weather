// Explicitly synthetic, deterministic data for exploring the interface offline.
export function sampleForecast() {
  const base = Math.floor(Date.now() / 86400000) * 86400;
  const hours = Array.from({ length: 72 }, (_, i) => {
    const epoch = base + i * 3600;
    const date = new Date(epoch * 1000);
    const hour = date.getUTCHours();
    return { epoch, day: date.toISOString().slice(0, 10), hour, temp: Math.round(18 + 5 * Math.sin((hour - 8) / 5)), wind: hour < 13 ? 12 : 22, rain: hour >= 15 && hour < 19 ? 65 : hour < 9 ? 25 : 10, code: 2 };
  });
  return { hours: hours.filter(h => h.epoch * 1000 >= Date.now()), at: Date.now(), data: { timezone: 'Etc/UTC' }, sample: true };
}
