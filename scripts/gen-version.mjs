/**
 * gen-version.mjs - Menulis identitas versi website ke
 * `src/lib/build-id.generated.ts` setiap kali build/dev dijalankan.
 *
 * Versi = hash commit git (atau env CI bila bukan repo git). Karena identitas
 * diberikan oleh hash commit, kode yang sama menghasilkan versi yang sama
 * (deterministik → tidak membuat working tree kotor) dan SETIAP kode baru
 * (commit baru) otomatis menghasilkan versi baru.
 *
 * Client memakai nilai ini untuk mendeteksi "kode website berubah" lalu
 * membersihkan semua cache browser (localStorage/sessionStorage/CacheStorage).
 */
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const outFile = resolve(projectRoot, 'src/lib/build-id.generated.ts');

function getCommitSha() {
  const env =
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.CI_COMMIT_SHA ||
    process.env.BUILD_ID;
  if (env) return env.trim();
  try {
    return execSync('git rev-parse HEAD', {
      stdio: ['ignore', 'pipe', 'ignore'],
    })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

const sha = (getCommitSha() || '').slice(0, 12);
const fallback = `dev-${new Date().toISOString().replace(/:|\./g, '-')}`;
const version = sha || fallback;

const content = `// GENERATED oleh scripts/gen-version.mjs — DILARANG edit manual.
// Berubah otomatis di tiap build: identitas versi kode website.
export const APP_BUILD_VERSION: string = '${version}';
`;

writeFileSync(outFile, content, 'utf8');
console.log(`[gen-version] APP_BUILD_VERSION = ${version}`);