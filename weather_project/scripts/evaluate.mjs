import { rankWindows, DEFAULTS } from '../web/planner.js';
import { mkdir, writeFile } from 'node:fs/promises';
// Separate reference: constructs each duration window by explicit epoch lookup,
// checks its constraints inline, sorts a tuple, and never calls production validators.
function oracle(a,p, skipInterior = false) {
  const candidates=[];
  for(const first of a) {
    const block=[];
    for(let n=0;n<p.duration;n++) block.push(a.find(h=>h.epoch===first.epoch+n*3600));
    if(block.some(h=>!h) || first.hour<7 || first.hour+p.duration>20 || block.some(h=>h.day!==first.day)) continue;
    const checked=skipInterior ? [first] : block;
    if(checked.some(h=>[h.temp,h.rain,h.wind,h.code].some(x=>typeof x!=='number'||!Number.isFinite(x)) || h.temp<p.minTemp || h.temp>p.maxTemp || h.rain<0 || h.rain>p.rain || h.wind<0 || h.wind>p.wind || [95,96,99].includes(h.code))) continue;
    candidates.push({epoch:first.epoch,tuple:[Math.max(...block.map(h=>h.rain)),Math.max(...block.map(h=>h.wind)),block.reduce((s,h)=>s+Math.abs(h.temp-20),0)/block.length,first.epoch]});
  }
  candidates.sort((a,b)=>{for(let i=0;i<4;i++){if(a.tuple[i]!==b.tuple[i]) return a.tuple[i]-b.tuple[i];}return 0;});
  return candidates;
}
let seed=3741;
function rand(){seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}
const result={cases:3000,seed:3741,agreement:0,violations:0,feasible:0,baselines:{firstDaytime:{valid:0,optimal:0},noon:{valid:0,optimal:0},firstHourOnly:{valid:0,optimal:0}},kind:'synthetic scheduling correctness, not forecast accuracy'};
for(let i=0;i<result.cases;i++) {
  const p={...DEFAULTS,duration:1+i%3,rain:[20,30,50][i%3],wind:[15,25,35][i%3]};
  const hours=Array.from({length:72},(_,j)=>({epoch:Date.UTC(2026,10,5)/1000+j*3600,day:`2026-11-${String(5+Math.floor(j/24)).padStart(2,'0')}`,hour:j%24,temp:Math.floor(rand()*36),rain:Math.floor(rand()*80),wind:Math.floor(rand()*45),code:rand()<.03?95:2}));
  if(i%5===0) hours[Math.floor(rand()*72)].rain=null;
  if(i%7===0) hours.splice(Math.floor(rand()*72),1);
  const reference=oracle(hours,p), actual=rankWindows(hours,p), valid=new Set(reference.map(h=>h.epoch));
  if(JSON.stringify(actual.map(h=>h.epoch))===JSON.stringify(reference.map(h=>h.epoch))) result.agreement++;
  result.violations+=actual.filter(h=>!valid.has(h.epoch)).length;
  if(!reference.length) continue;
  result.feasible++;
  const choices={firstDaytime:hours.find(h=>h.hour===7)?.epoch,noon:hours.find(h=>h.hour===12)?.epoch,firstHourOnly:oracle(hours,p,true)[0]?.epoch};
  for(const [key,epoch] of Object.entries(choices)){if(valid.has(epoch))result.baselines[key].valid++;if(epoch===reference[0].epoch)result.baselines[key].optimal++;}
}
await mkdir('docs',{recursive:true});
await writeFile('docs/evaluation.json',JSON.stringify(result,null,2)+'\n');
await writeFile('web/evaluation.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
if(result.agreement!==result.cases||result.violations) process.exitCode=1;
