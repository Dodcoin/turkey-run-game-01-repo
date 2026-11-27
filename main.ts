/**
 * Gobble Dash — entry program (Node 22, standard library only).
 *
 * Copies the game and its screenshots into the output directory and writes
 * the dossier the gate expects, with buildDossier from vendor/makefun-game.ts.
 * Fully offline, no network, no model calls, deterministic: two runs write
 * byte-identical files.
 *
 * The output directory itself is never removed: on the grader it is a mount
 * point, and deleting a mount point fails with EBUSY and exits 1. Instead the
 * directory is created if missing and its contents are emptied entry by entry.
 */
import { cpSync, existsSync, lstatSync, mkdirSync, readdirSync, realpathSync, rmSync, statSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, sep } from 'node:path';
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

/**
 * Refuse to run when the output directory would be dangerous to empty:
 * the filesystem root, the repo itself, or any ancestor of the repo.
 * Symlinks are resolved too, so a symlinked output dir pointing at the
 * repo (or an ancestor of it) is refused just like the plain path.
 */
function guardOutputDir(outputDir: string): void {
  const root = resolve(sep);
  if (outputDir === root) {
    throw new Error('main.ts: refusing to use the filesystem root as the output directory');
  }
  if (outputDir === REPO_ROOT) {
    throw new Error('main.ts: refusing to use the repository root as the output directory');
  }
  if (REPO_ROOT.startsWith(outputDir + sep)) {
    throw new Error('main.ts: refusing to use an ancestor of the repository as the output directory');
  }
  if (existsSync(outputDir)) {
    const realOutput = realpathSync(outputDir);
    const realRepo = realpathSync(REPO_ROOT);
    if (realOutput === realRepo || realRepo.startsWith(realOutput + sep)) {
      throw new Error('main.ts: refusing to use a directory that resolves to the repository or its ancestor as the output directory');
    }
  }
}

/**
 * Empty the contents of the output directory without ever removing the
 * directory itself. Entries are handled one by one in sorted order;
 * lstat is used so symlinks are unlinked, never followed.
 */
function emptyOutputDir(outputDir: string): void {
  mkdirSync(outputDir, { recursive: true });
  for (const name of readdirSync(outputDir).sort()) {
    const entry = join(outputDir, name);
    const info = lstatSync(entry);
    if (info.isSymbolicLink() || info.isFile()) {
      unlinkSync(entry);
    } else if (info.isDirectory()) {
      rmSync(entry, { recursive: true, force: true });
    } else {
      unlinkSync(entry);
    }
  }
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

  guardOutputDir(OUTPUT_DIR);
  emptyOutputDir(OUTPUT_DIR);

  copyEntryTree(gameSource, join(OUTPUT_DIR, 'game'));
  copyEntryTree(shotsSource, join(OUTPUT_DIR, 'screenshots'));

  const dossier = buildDossier(OUTPUT_DIR, DOSSIER_CAPS);
  writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
  console.log(`gobble-dash: wrote ${OUTPUT_DIR} (game/ + ${shotCount} screenshots, dossier.json ${dossier.length} bytes)`);
}

main();
