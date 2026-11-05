import { chromium } from '@playwright/test';
import gifenc from 'gifenc';
const { GIFEncoder, quantize, applyPalette } = gifenc;
import { PNG } from 'pngjs';
import { mkdir, writeFile } from 'node:fs/promises';

// Record actual sample-mode UI states; no real forecast is portrayed in this demo.
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 720 }, reducedMotion: 'reduce' });
  const gif = GIFEncoder();
  await mkdir('docs/assets', { recursive: true });
  async function frame(delay = 1800) {
    const { data, width, height } = PNG.sync.read(await page.screenshot());
    const palette = quantize(data, 128);
    gif.writeFrame(applyPalette(data, palette), width, height, { palette, delay, repeat: 0 });
  }
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:4173/');
  await page.evaluate(() => document.fonts.ready);
  await frame();
  await page.getByRole('button', { name: /explore a sample/i }).click();
  await page.locator('.forecast-area').scrollIntoViewIfNeeded();
  await frame(2400);
  await page.getByText('Weather preferences', { exact: true }).click();
  await page.locator('.controls').scrollIntoViewIfNeeded();
  await frame(2200);
  await page.getByLabel('How long?').selectOption('1');
  await page.getByText('Weather preferences', { exact: true }).click();
  await page.locator('.recommendation').scrollIntoViewIfNeeded();
  await frame();
  await page.locator('[data-day]').nth(1).click();
  await frame(2200);
  await page.getByText('Hourly forecast & why hours match', { exact: true }).click();
  await page.getByRole('table').scrollIntoViewIfNeeded();
  await frame(2400);
  gif.finish();
  await writeFile('docs/assets/planner-demo.gif', gif.bytes());
  console.log(`Sample-mode demo: ${gif.bytes().length} bytes, 6 frames.`);
} finally { await browser.close(); }
