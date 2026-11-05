const base=process.env.LIVE_URL;
if(!base) throw new Error('Set LIVE_URL to the deployed URL.');
for(const path of ['','app.js','planner.js','evaluation.json']) {
  const r=await fetch(new URL(path,base.endsWith('/')?base:base+'/'));
  if(!r.ok)throw new Error(`${path}: ${r.status}`);
  const text=await r.text();if(path===''&&!text.includes('outside?'))throw new Error('Wrong application');
  console.log(`${path||'/'}: ${r.status}`);
}
