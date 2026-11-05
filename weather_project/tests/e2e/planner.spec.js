import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('main flow: search, choose, plan, inspect, change preferences',async({page})=>{
  // Network fixtures are explicit synthetic test inputs, never product live results.
  await page.route('**/v1/search?**',route=>route.fulfill({json:{results:[{name:'Test City',admin1:'Test region',country:'Test country',latitude:12,longitude:77}]}}));
  const base=Math.ceil(Date.now()/3600000)*3600;
  await page.route('**/v1/forecast?**',route=>route.fulfill({json:{timezone:'Etc/UTC',utc_offset_seconds:0,hourly:{time:Array.from({length:72},(_,i)=>base+i*3600),apparent_temperature:Array(72).fill(20),precipitation_probability:Array(72).fill(10),wind_speed_10m:Array(72).fill(10),weather_code:Array(72).fill(2)}}}));
  await page.goto('/');await page.getByLabel('Where are you heading?').fill('Test');await page.getByRole('button',{name:'Search places',exact:true}).click();
  await page.getByRole('button',{name:/Test City/}).click();await expect(page.locator('.recommendation')).toContainText('2 uninterrupted hours');
  await page.getByText(/See hourly values/).click();await expect(page.getByRole('table')).toBeVisible();
  await page.getByLabel('Minimum',{exact:true}).fill('25');await expect(page.getByText('No window fits all your limits.')).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
});
test('sample, responsive screenshots, accessibility and no overflow',async({page})=>{
  await page.goto('/');await page.getByRole('button',{name:/Explore a sample/}).click();await expect(page.getByText(/Invented weather/)).toBeVisible();
  expect(await page.locator('[data-day]').count()).toBeLessThanOrEqual(3);
  await page.evaluate(()=>document.fonts.ready);
  for(const [name,width,height] of [['phone',390,844],['tablet',820,1180],['desktop',1440,1000]]) {
    await page.setViewportSize({width,height});await page.screenshot({path:`docs/screenshots/${name}.png`,fullPage:true});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations).toEqual([]);
  }
});
test('service error has recovery and no false recommendation',async({page})=>{
  await page.route('**/v1/search?**',r=>r.fulfill({json:{results:[{name:'Unavailable',latitude:1,longitude:2}]}}));
  await page.route('**/v1/forecast?**',r=>r.fulfill({status:429,json:{error:true}}));
  await page.goto('/');await page.getByLabel('Where are you heading?').fill('Unavailable');await page.getByRole('button',{name:'Search places',exact:true}).click();await page.getByRole('button',{name:/Unavailable/}).click();
  await expect(page.getByRole('alert')).toContainText('busy');await expect(page.locator('.recommendation')).toHaveCount(0);await expect(page.getByRole('button',{name:'Retry forecast'})).toBeVisible();
});
