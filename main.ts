/**
 * Gobble Dash — entry program (Node 22, standard library only).
 *
 * Copies the game and its screenshots into the output directory and writes
 * the dossier the gate expects, with buildDossier from vendor/makefun-game.ts.
 * Fully offline, no network, no model calls, deterministic: two runs write
 * byte-identical files.
 */
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)));
const OUTPUT_DIR = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');

const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
};

function copyEntryTree(sourceDir: string, targetDir: string): void {
  mkdirSync(targetDir, { recursive: true });
  cpSync(sourceDir, targetDir, { recursive: true, dereference: false });
}

function countScreenshots(shotsDir: string): number {
  return readdirSync(shotsDir)
    .filter((name) => !name.startsWith('.'))
    .filter((name) => statSync(join(shotsDir, name)).isFile()).length;
}

function main(): void {
  const gameSource = join(REPO_ROOT, 'game');
  const shotsSource = join(REPO_ROOT, 'screenshots');
  if (!existsSync(gameSource)) throw new Error('main.ts: game/ is missing from the repository');
  if (!existsSync(shotsSource)) throw new Error('main.ts: screenshots/ is missing from the repository');

  const shotCount = countScreenshots(shotsSource);
  if (shotCount < 3 || shotCount > 4) {
    throw new Error(`main.ts: screenshots/ holds ${shotCount} images, the gate needs 3 or 4`);
  }

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  mkdirSync(OUTPUT_DIR, { recursive: true });

  copyEntryTree(gameSource, join(OUTPUT_DIR, 'game'));
  copyEntryTree(shotsSource, join(OUTPUT_DIR, 'screenshots'));

  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  console.log(`gobble-dash: wrote ${OUTPUT_DIR} (game/ + ${shotCount} screenshots, dossier.json ${dossier.length} bytes)`);
}

main();
