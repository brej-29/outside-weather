import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankWindows, normalize, DEFAULTS } from '../web/planner.js';
const h = (hour, extras = {}) => ({ epoch: hour * 3600, hour, day: '2026-11-05', rain: 10, wind: 10, temp: 20, code: 2, ...extras });
test('every hour must fit, including second and third hours', () => {
  assert.equal(rankWindows([h(9), h(10, { rain: 60 }), h(11)], DEFAULTS).length, 0);
});
test('missing values fail closed', () => {
  for (const key of ['temp','rain','wind','code']) assert.equal(rankWindows([h(9), h(10, { [key]: null })]).length, 0);
});
test('gaps, midnight and repeated local-hour transitions cannot form fake windows', () => {
  assert.equal(rankWindows([h(9), h(11)]).length, 0);
  assert.equal(rankWindows([h(19), h(20)]).length, 0);
  assert.equal(rankWindows([h(9), h(10, { day: '2026-11-06' })]).length, 0);
});
test('boundaries inclusive, thunderstorm rejected', () => {
  assert.equal(rankWindows([h(7, { rain: 30, wind: 25, temp: 8 }), h(8, { temp: 28 })]).length, 1);
  for (const code of [95,96,99]) assert.equal(rankWindows([h(9, { code }), h(10)]).length, 0);
});
test('ranking is peak rain, peak wind, comfort then chronological', () => {
  const p = { ...DEFAULTS, duration: 1 };
  assert.equal(rankWindows([h(9, { rain: 20 }), h(10), h(11, { wind: 5 })],p)[0].hour, 11);
  assert.equal(rankWindows([h(9), h(10)],p)[0].hour, 9);
});
test('normalization uses location timezone and excludes past hours', () => {
  const epoch = Date.parse('2026-11-05T04:00:00Z') / 1000;
  const d = { timezone:'Asia/Kolkata',utc_offset_seconds:19800,hourly:{time:[epoch],apparent_temperature:[20],precipitation_probability:[0],wind_speed_10m:[2],weather_code:[0]}};
  assert.equal(normalize(d,epoch*1000)[0].hour,9);
  assert.equal(normalize(d,epoch*1000+1).length,0);
  assert.throws(() => normalize({}));
});
