-- =============================================================
-- VAPE STORE - MIGRATION 007: FOTO PRODUK (UPLOAD + CROP)
--
-- Menambah kolom image (TEXT) di payota_products untuk menyimpan
-- foto produk hasil upload & crop dari dashboard admin (data URL
-- JPEG/WebP hasil pemrosesan canvas di sisi klien).
--
-- Kosong/NULL = produk memakai visual SVG otomatis (varian Art).
-- =============================================================

ALTER TABLE payota_products
    ADD COLUMN IF NOT EXISTS image TEXT;

-- Reload skema PostgREST agar kolom baru dipakai.
NOTIFY pgrst, 'reload schema';