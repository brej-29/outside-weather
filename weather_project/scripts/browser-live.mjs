import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const browser=await chromium.launch({headless:true});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.APP_URL||'http://127.0.0.1:4174/');
 await page.getByLabel('Where are you heading?').fill('Bengaluru');
 await page.getByRole('button',{name:'Find my window',exact:true}).click();
 await page.locator('#search-results').getByRole('button',{name:/Bengaluru/}).first().click({timeout:20000});
 await page.locator('.recommendation,.empty,.notice[role=alert]').waitFor({timeout:20000});
 if(await page.locator('.notice[role=alert]').count())throw Error(await page.locator('.notice[role=alert]').innerText());
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:'docs/screenshots/live-desktop.png',fullPage:true});
 const result={checkedAt:new Date().toISOString(),flow:'Live geocoding → selected Bengaluru → live hourly forecast → planner result',heading:await page.locator('.place-top h3').innerText(),recommendation:await page.locator('.recommendation,.empty').innerText(),browserErrors:errors};
 await writeFile('docs/live-check.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
 if(errors.length)process.exitCode=1;
}finally{await browser.close();}
