import 'dotenv/config';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Pool } = pg;
const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const migrationsDirectory = join(projectRoot, 'migrations');
const databaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;

function withoutTransactionWrapper(sql) {
  return sql
    .replace(/^\s*BEGIN\s*;?/i, '')
    .replace(/COMMIT\s*;?\s*$/i, '');
}

/** Buang UTF-8 BOM yang bisa bikin Postgres error "syntax error at or near" di posisi 1. */
function stripBom(sql) {
  return sql.replace(/^\uFEFF/, '');
}

if (!databaseUrl) {
  console.error('Migration dibatalkan: isi SUPABASE_DB_URL atau DATABASE_URL di .env.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  max: 1,
});

const client = await pool.connect();

try {
  await client.query('SELECT pg_advisory_lock(hashtext($1))', ['fee-rainbow-pdg:migrations']);
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationFiles = (await readdir(migrationsDirectory))
    .filter((file) => /^\d+_[a-z0-9_-]+\.sql$/i.test(file))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  if (migrationFiles.length === 0) {
    throw new Error(`Tidak ada file migration di ${migrationsDirectory}`);
  }

  console.log(`Membaca migration dari: ${migrationsDirectory}`);
  console.log(`Ditemukan ${migrationFiles.length} file migration.\n`);

  const { rows: appliedRows } = await client.query(
    'SELECT version FROM public.schema_migrations',
  );
  const appliedVersions = new Set(appliedRows.map(({ version }) => version));

  for (const file of migrationFiles) {
    if (appliedVersions.has(file)) {
      console.log(`  Lewati ${file} (sudah diterapkan)`);
      continue;
    }

    const sql = await readFile(join(migrationsDirectory, file), 'utf8');
    if (!sql.trim()) {
      throw new Error(`Migration kosong: ${file}`);
    }

    console.log(`  Menerapkan ${file}...`);
    await client.query('BEGIN');
    try {
      await client.query(withoutTransactionWrapper(stripBom(sql)));
      await client.query('INSERT INTO public.schema_migrations (version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`  ✅ Berhasil ${file}\n`);
    } catch (error) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${file} gagal: ${error.message}`, { cause: error });
    }
  }

  console.log('✅ Database sudah sinkron.');
} finally {
  await client.query('SELECT pg_advisory_unlock(hashtext($1))', ['fee-rainbow-pdg:migrations']).catch(() => {});
  client.release();
  await pool.end();
}