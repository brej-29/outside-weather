import { readdir,readFile } from 'node:fs/promises';
const pattern=new RegExp(['Clau'+'de','Anthro'+'pic','Co'+'dex','Open'+'AI','Generated'+' with','Co-'+'Authored-By','Ses'+'sion'].join('|'),'i');
let hits=0;
async function scan(path){
  for(const entry of await readdir(path,{withFileTypes:true})){
    const file=`${path}/${entry.name}`;
    if(entry.isDirectory())await scan(file);
    else if(/\.(js|mjs|md|json|html|css|yml|txt)$/.test(file)||entry.name==='commit-msg'){
      const lines=(await readFile(file,'utf8')).split('\n');
      lines.forEach((line,i)=>{if(pattern.test(line)){console.error(`${file}:${i+1}: prohibited text`);hits++;}});
    }
  }
}
for(const path of ['web','scripts','tests','docs','.github','.githooks'])await scan(path);
for(const path of ['README.md','PRODUCT.md','DESIGN.md','package.json','package-lock.json','.gitignore'])if(pattern.test(await readFile(path,'utf8'))){console.error(`${path}: prohibited text`);hits++;}
console.log(`Source scan: ${hits} hits. Commit history and PR body require separate git scan.`);
if(hits)process.exitCode=1;
