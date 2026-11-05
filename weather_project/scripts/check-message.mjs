import { readFileSync } from 'node:fs';
const disallowed = new RegExp(['Clau'+'de','Anthro'+'pic','Co'+'dex','Open'+'AI','Generated'+' with','Co-'+'Authored-By','Ses'+'sion'].join('|'),'i');
if(disallowed.test(readFileSync(process.argv[2],'utf8'))) { console.error('Commit message contains prohibited attribution text. Edit the message and retry.');process.exitCode=1; }
