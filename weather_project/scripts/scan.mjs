import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
const terms=['Clau'+'de','Anthro'+'pic','Co'+'dex','Open'+'AI','Generated'+' with','Co-'+'Authored-By','Ses'+'sion'];
const bad=new RegExp(terms.join('|'),'i');
const base=process.argv[2];
if(!base)throw Error('Supply base revision; optionally supply a PR body file as second argument.');
let failed=false;
for(const [label,args] of [['commit messages',['log',`${base}..HEAD`,'--format=%B']],['diff',['diff',base,'--','.']]]) {
  const content=execFileSync('git',args,{encoding:'utf8'});
  if(bad.test(content)){console.error(`${label}: prohibited text found; inspect locally before publishing.`);failed=true;}
}
if(process.argv[3]&&bad.test(readFileSync(process.argv[3],'utf8'))){console.error('PR body: prohibited text found.');failed=true;}
if(failed)process.exitCode=1;else console.log('Attribution scan passed.');
