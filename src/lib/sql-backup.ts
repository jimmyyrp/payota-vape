
import { supabase } from './supabase';

/**
 * Vape Store Blueprint - Backup SQL Builder v1.0
 * Membangun file .sql berisi seluruh data produksi dengan
 * sinkronisasi sequence ID otomatis.
 */

export const BACKUP_TABLES = [
  'users', 'categories', 'sub_categories', 'themes', 'products',
  'product_categories', 'product_sub_categories', 'product_images',
  'reviews', 'settings', 'review_tokens'
] as const;

function escapeValue(val: unknown): string {
  if (val === null) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
  return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
}

export async function buildBackupSql(): Promise<string> {
  let sql = `-- =============================================================\n`;
  sql += `-- FEE RAINBOW PADANG - RAINBOW BLUEPRINT\n`;
  sql += `-- Generated: ${new Date().toLocaleString()}\n`;
  sql += `-- =============================================================\n\n`;
  sql += `BEGIN;\n\n`;

  for (const table of BACKUP_TABLES) {
    // PostgREST memotong tiap request ke maks 1000 baris (db-max-rows),
    // jadi ambil SEMUA baris via loop .range() agar backup tidak terpotong.
    const allRows: Record<string, unknown>[] = [];
    const PAGE = 1000;
    let offset = 0;
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .range(offset, offset + PAGE - 1);
      if (error) throw error;
      const batch = (data || []) as Record<string, unknown>[];
      allRows.push(...batch);
      if (batch.length < PAGE) break;
      offset += PAGE;
    }
    if (allRows.length === 0) continue;

    const columns = Object.keys(allRows[0]);
    sql += `-- Table: ${table}\n`;

    for (const row of allRows) {
      const values = columns.map((col) => escapeValue(row[col]));
      sql += `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${values.join(', ')}) ON CONFLICT DO NOTHING;\n`;
    }

    if (columns.includes('id')) {
      sql += `\nSELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE(MAX(id), 1));\n`;
    }
    sql += `\n`;
  }

  sql += `COMMIT;\n`;
  return sql;
}

/** Picu unduhan file backup ke browser admin. */
export function downloadSqlBackup(content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.body.appendChild(document.createElement('a'));
  link.href = url;
  link.download = `rainbow_backup_${new Date().toISOString().split('T')[0]}.sql`;
  link.click();
  document.body.removeChild(link);
}
