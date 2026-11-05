import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
const output = resolve('dist');
if (dirname(output) !== process.cwd()) throw new Error('Build output must be inside this project.');
await rm(output, { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('web', 'dist', { recursive: true });
console.log('Static app copied to dist. No runtime dependencies.');
