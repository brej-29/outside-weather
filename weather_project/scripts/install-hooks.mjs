import { execFileSync } from 'node:child_process';
execFileSync('git',['rev-parse','--git-dir'],{stdio:'ignore'});
execFileSync('git',['config','core.hooksPath','.githooks']);
try { execFileSync('git',['update-index','--chmod=+x','.githooks/commit-msg']); } catch { console.log('Stage .githooks/commit-msg and mark it executable before committing.'); }
console.log('Local commit-message guard installed.');
