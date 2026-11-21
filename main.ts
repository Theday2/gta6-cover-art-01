// main.ts — entrypoint for the gta6-cover-art-01 submission.
// Copies app/ + screenshots/ (alphabetical order, deterministic) into
// MAKEFUN_OUTPUT_DIR (default /output) and writes /output/dossier.json
// with buildDossier from vendor/makefun-app.ts. Node 22 stdlib only.
import { buildDossier } from './vendor/makefun-app.ts';
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const root = new URL('.', import.meta.url).pathname;

mkdirSync(outDir, { recursive: true });

// Copy app/ and screenshots/ in alphabetical order for determinism.
for (const name of ['app', 'screenshots']) {
  const src = join(root, name);
  if (existsSync(src)) {
    cpSync(src, join(outDir, name), { recursive: true });
  }
}

writeFileSync(join(outDir, 'dossier.json'), buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
}));

console.log('Wrote dossier to ' + join(outDir, 'dossier.json'));
