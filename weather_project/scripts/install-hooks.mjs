import { execFileSync } from 'node:child_process';
const root = execFileSync('git',['rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
execFileSync('git',['-C',root,'config','core.hooksPath','.githooks']);
try { execFileSync('git',['-C',root,'update-index','--chmod=+x','.githooks/commit-msg']); } catch { console.log('Stage .githooks/commit-msg and mark it executable before committing.'); }
console.log('Local commit-message guard installed.');
