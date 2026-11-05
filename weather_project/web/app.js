import { DEFAULTS, rankWindows, validHour, reasons } from './planner.js';
import { forecast, searchPlaces } from './api.js';
import { sampleForecast } from './sample.js';
import { CONFIG } from './config.js';

const $ = s => document.querySelector(s);
const esc = v => String(v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let places = [], data = new Map(), selectedDays = new Map(), p = { ...DEFAULTS }, searchController, generation = 0;
const hour = n => `${n % 12 || 12}${n >= 12 ? 'pm' : 'am'}`;
const dayLabel = day => new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(day + 'T12:00:00Z'));
function prefs() {
  const next = { ...p };
  for (const k of ['duration', 'rain', 'wind', 'minTemp', 'maxTemp']) next[k] = Number($('#' + k).value);
  $('#maxTemp').setCustomValidity(next.maxTemp < next.minTemp ? 'Maximum must be at least the minimum temperature.' : '');
  if (!$('#preferences').checkValidity()) { $('#preference-status').textContent = 'Finish the temperature range to update. Results still use your last valid preferences.'; return; }
  $('#preference-status').textContent = '';
  p = next;
  $('#rain-value').textContent = p.rain + '%'; $('#wind-value').textContent = p.wind + ' km/h';
  $('#limits-summary').textContent = `Rain up to ${p.rain}% · Wind up to ${p.wind} km/h · ${p.minTemp}–${p.maxTemp}°C`;
  try { localStorage.setItem('outside-preferences', JSON.stringify(p)); } catch { /* Preferences are optional. */ }
  render();
}
$('#preferences').addEventListener('input', prefs);
$('#duration').addEventListener('change', prefs);
$('#preferences').addEventListener('submit', e => { e.preventDefault(); prefs(); $('#preferences').reportValidity(); });
try { const saved = JSON.parse(localStorage.getItem('outside-preferences')); if (saved) for (const k of ['duration', 'rain', 'wind', 'minTemp', 'maxTemp']) if (Number.isFinite(saved[k])) $('#' + k).value = saved[k]; } catch { /* Use defaults. */ }
prefs();

async function search(query) {
  searchController?.abort(); searchController = new AbortController();
  $('#search-results').replaceChildren(); $('#search-status').textContent = 'Finding places…';
  try {
    const found = await searchPlaces(query.trim(), searchController.signal);
    $('#search-status').textContent = found.length ? 'Choose a place below.' : 'No places found. Try a nearby city or another spelling.';
    for (const place of found) {
      const button = document.createElement('button'); button.type = 'button';
      button.innerHTML = `${esc(place.name)}<small>${esc(place.region)} · ${esc(place.country)}</small>`;
      button.addEventListener('click', () => addPlace(place)); $('#search-results').append(button);
    }
  } catch (e) { if (e.name !== 'AbortError') $('#search-status').textContent = e.name === 'TimeoutError' ? 'Place search timed out. Try again.' : 'Could not search places. Check your connection and try again.'; }
}
$('#search-form').addEventListener('submit', e => { e.preventDefault(); search($('#city').value); });
document.querySelectorAll('[data-city]').forEach(b => b.addEventListener('click', () => { $('#city').value = b.dataset.city; search(b.dataset.city); $('#city').focus(); }));
function chips() {
  $('#places').replaceChildren();
  $('#compare-hint').hidden = places.length !== 1;
  $('#city').placeholder = places.length ? 'Add another city to compare' : 'Enter a city, e.g. Bengaluru';
  places.forEach(place => {
    const div = document.createElement('div'); div.className = 'place-chip';
    const span = document.createElement('span'); span.textContent = place.name; div.append(span);
    const remove = document.createElement('button'); remove.innerHTML = '<svg class="ui-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 6 12 12M6 18 18 6"/></svg>'; remove.setAttribute('aria-label', `Remove ${place.name}`);
    remove.addEventListener('click', () => { places = places.filter(v => v.id !== place.id); data.delete(place.id); chips(); render(); $('#city').focus(); }); div.append(remove); $('#places').append(div);
  });
}
async function addPlace(place) {
  const id = `${place.latitude},${place.longitude}`;
  if (places.some(v => v.id === id)) { $('#search-status').textContent = 'That place is already in your comparison.'; return; }
  if (places.length === 2) { $('#search-status').textContent = 'Remove a place to add another. You can compare two at a time.'; return; }
  places.push({ ...place, id }); $('#search-results').replaceChildren(); $('#search-status').textContent = ''; $('#city').value = '';
  chips(); await loadPlace(places.at(-1));
  $('.forecast-area').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
}
async function loadPlace(place) {
  const token = ++generation;
  data.set(place.id, { loading: true, token }); render();
  const slow = setTimeout(() => { if (data.get(place.id)?.token === token && data.get(place.id)?.loading) { data.set(place.id, { loading: true, token, slow: true }); render(); } }, 5000);
  try {
    const result = await forecast(place);
    if (!places.some(v => v.id === place.id) || data.get(place.id)?.token !== token) return;
    data.set(place.id, result);
  } catch (e) {
    if (data.get(place.id)?.token !== token) return;
    data.set(place.id, { error: e.name === 'TimeoutError' ? 'The forecast took too long. Please retry.' : e.message || 'Unable to load the forecast. Please retry.' });
  } finally { clearTimeout(slow); render(); }
}
$('#refresh').addEventListener('click', () => { places.forEach(place => { if (place.id !== 'sample') loadPlace(place); }); });
document.addEventListener('click', e => {
  if (!e.target.closest('#sample')) return;
  places = [{ name: 'Meadowfield', region: 'Illustrative location', id: 'sample' }]; data.clear(); data.set('sample', sampleForecast()); chips(); render();
});

function render() {
  const el = $('#results');
  const inspections = new Map([...el.querySelectorAll('[data-result-place]')].map(article => [article.dataset.resultPlace, {
    open: article.querySelector('details')?.open,
    scroll: article.querySelector('.hour-scroll')?.scrollLeft || 0,
    focus: [...article.querySelectorAll('button,summary,[tabindex]')].indexOf(document.activeElement),
  }]));
  if (!places.length) {
    if (!el.querySelector('.welcome')) el.innerHTML = '<div class="welcome"><h3>Start somewhere new.</h3><p>Search a city to find your next weather window.</p></div>';
    $('#refresh').disabled = true; return;
  }
  $('#refresh').disabled = [...data.values()].some(v => v.loading) || places.every(v => v.id === 'sample');
  el.setAttribute('aria-busy', [...data.values()].some(v => v.loading) ? 'true' : 'false');
  el.innerHTML = places.map(place => {
    const d = data.get(place.id) || { loading: true };
    const head = `<div class="place-top"><div><h3>${esc(place.name)}</h3><p>${esc(place.region || '')}${d.data ? ' · ' + esc(d.data.timezone) : ''}</p></div><span class="source-label">${d.sample ? 'Synthetic sample' : d.loading ? 'Connecting' : d.error ? 'Unavailable' : `${d.cached ? 'Cached' : 'Fetched'} ${new Date(d.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}</span></div>`;
    if (d.loading) return `<article class="place-result" data-result-place="${esc(place.id)}">${head}<p class="loading-label">${d.slow ? 'Still reaching the weather service. You can keep adjusting your preferences.' : 'Looking for a little open air…'}</p><div class="skeleton" aria-hidden="true"></div></article>`;
    if (d.error) return `<article class="place-result" data-result-place="${esc(place.id)}">${head}<div class="notice" role="alert">${esc(d.error)} No recommendation is available.<br><button class="text-button" data-retry="${esc(place.id)}">Retry forecast</button></div></article>`;
    const stale = Date.now() - d.at > CONFIG.maxAgeMs;
    const windows = stale ? [] : rankWindows(d.hours.filter(h => h.epoch * 1000 >= Date.now()), p);
    const overallBest = windows[0];
    const days = [...new Set(d.hours.map(h => h.day))];
    let day = selectedDays.get(place.id);
    if (!days.includes(day)) { day = overallBest?.day || days[0]; selectedDays.set(place.id, day); }
    const best = windows.find(w => w.day === day);
    const current = d.hours.filter(h => h.day === day && h.hour >= p.start && h.hour < p.end);
    const summary = best ? `<div class="recommendation"><div class="rec-label"><span>Suggested outing &middot; ${esc(dayLabel(best.day))}</span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg></div><h4>${hour(best.hour)} – ${hour(best.endHour)}</h4><p>${p.duration} uninterrupted hour${p.duration > 1 ? 's' : ''} within your limits.<br>Every hour fits your rain, wind and temperature preferences.</p><div class="weather-metrics"><div><strong>${Math.round(best.temp)}°C</strong><span>Average feels like</span></div><div><strong>${best.rain}%</strong><span>Highest hourly rain chance</span></div><div><strong>${Math.round(best.wind)} km/h</strong><span>Strongest wind</span></div></div></div>` : `<div class="empty"><h4>${stale ? 'Time for a fresh forecast.' : 'No matching time on this day.'}</h4><p>${stale ? 'This forecast is over an hour old. Refresh data before choosing a window.' : 'Try another day, a shorter outing or adjust Weather preferences. We won’t recommend a block with missing data or a thunderstorm forecast.'}</p></div>`;
    return `<article class="place-result" data-result-place="${esc(place.id)}">${head}${d.sample ? '<p class="notice">Sample forecast - Invented weather and place. Search a real city for live results. Sample times use UTC.</p>' : ''}${summary}<div class="day-switch" role="group" aria-label="Forecast day for ${esc(place.name)}">${days.map(v => `<button aria-pressed="${v === day}" data-place="${esc(place.id)}" data-day="${v}">${esc(dayLabel(v))}</button>`).join('')}</div><div class="timeline-legend"><span><i class="key"></i>Fits preferences</span><span><i class="key bad"></i>Outside preferences / missing</span><span><i class="key selected"></i>Suggested outing</span></div><p class="scroll-hint">Scroll the hours to see the full day.</p><div class="hour-scroll" tabindex="0" role="region" aria-label="Hourly overview, scroll for more"><div class="hour-grid">${current.map(h => `<div class="hour ${validHour(h, p) ? 'good' : ''} ${best?.hours.some(v => v.epoch === h.epoch) ? 'chosen' : ''}" title="${hour(h.hour)}: ${esc(reasons(h, p))}"><span>${String(h.hour).padStart(2, '0')}</span><i class="bar"></i><span class="hour-temp">${Number.isFinite(h.temp) ? Math.round(h.temp) + '°' : '—'}</span><span>${Number.isFinite(h.rain) ? h.rain + '%' : '—'}</span></div>`).join('')}</div></div><details class="hour-details"><summary>Hourly forecast &amp; why hours match</summary><div class="table-scroll"><table><caption class="small">${esc(dayLabel(day))} · local time · feels-like °C · wind km/h</caption><thead><tr><th scope="col">Hour</th><th scope="col">Feels</th><th scope="col">Rain</th><th scope="col">Wind</th><th scope="col">Check</th></tr></thead><tbody>${current.map(h => `<tr><td>${hour(h.hour)}</td><td>${esc(h.temp ?? '—')}</td><td>${esc(h.rain ?? '—')}%</td><td>${esc(h.wind ?? '—')}</td><td>${esc(reasons(h, p))}</td></tr>`).join('')}</tbody></table></div></details></article>`;
  }).join('');
  el.querySelectorAll('[data-result-place]').forEach(article => {
    const old = inspections.get(article.dataset.resultPlace);
    if (!old) return;
    if (article.querySelector('details')) article.querySelector('details').open = Boolean(old.open);
    if (article.querySelector('.hour-scroll')) article.querySelector('.hour-scroll').scrollLeft = old.scroll;
    if (old.focus >= 0) article.querySelectorAll('button,summary,[tabindex]')[old.focus]?.focus({ preventScroll: true });
  });
  el.querySelectorAll('[data-day]').forEach(b => b.addEventListener('click', () => { selectedDays.set(b.dataset.place, b.dataset.day); render(); const next = [...el.querySelectorAll('[data-day]')].find(v => v.dataset.place === b.dataset.place && v.dataset.day === b.dataset.day); next?.focus(); }));
  el.querySelectorAll('[data-retry]').forEach(b => b.addEventListener('click', () => loadPlace(places.find(v => v.id === b.dataset.retry))));
}
function connection() { $('#connection').innerHTML = navigator.onLine ? '' : '<p class="notice">You’re offline. Only forecasts cached within the last 20 minutes can load. Sample mode works without weather service access.</p>'; }
window.addEventListener('online', connection); window.addEventListener('offline', connection); connection();
setInterval(() => { if (places.length && !document.hidden) render(); }, 60000);
fetch('./evaluation.json').then(r => r.json()).then(e => { $('#evaluation').textContent = `On ${e.cases.toLocaleString()} deterministic synthetic cases: ${e.agreement}/${e.cases} exact matches with the exhaustive reference; ${e.violations} constraint violations. These are software checks, not a forecast accuracy score.`; }).catch(() => {});

