import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import { writeFile, mkdir } from 'node:fs/promises';
await mkdir(process.env.LIGHTHOUSE_PROFILE||'../.lighthouse-profile',{recursive:true});
const chrome=await launch({chromePath:process.env.CHROME_PATH,chromeFlags:['--headless','--no-sandbox'],userDataDir:process.env.LIGHTHOUSE_PROFILE||'../.lighthouse-profile'});
try{
 const result=await lighthouse(process.env.APP_URL||'http://127.0.0.1:4174/',{port:chrome.port,output:'json',onlyCategories:['performance','accessibility','best-practices','seo'],logLevel:'error'});
 const summary={checkedAt:new Date().toISOString(),environment:'Local development server, mobile simulated throttling, single run',scores:Object.fromEntries(Object.entries(result.lhr.categories).map(([k,v])=>[k,Math.round(v.score*100)])),failedAudits:Object.entries(result.lhr.audits).filter(([,v])=>v.score!==null&&v.score<.9).map(([k,v])=>({id:k,title:v.title,score:v.score}))};
 await writeFile('docs/lighthouse.json',JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary));
}finally{await chrome.kill();}
