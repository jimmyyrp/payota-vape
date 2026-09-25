-- =============================================================
-- VAPE STORE - MIGRATION 008: HAPUS KOLOM WARNA GLOW
--
-- Kolom glow & glow_soft pada payota_products tidak lagi dipakai:
-- visual SVG otomatis kini memakai aksen netral yang konsisten
-- (warna glow yang bisa dikustomisasi dihilangkan dari UI admin).
-- =============================================================

ALTER TABLE payota_products
    DROP COLUMN IF EXISTS glow;

ALTER TABLE payota_products
    DROP COLUMN IF EXISTS glow_soft;

-- Reload skema PostgREST agar perubahan dipakai.
NOTIFY pgrst, 'reload schema';