-- =============================================================
-- VAPE STORE - MIGRATION 004: SLUG OTOMATIS DARI NAMA
--
-- Slug produk & kategori dibuat otomatis dari kolom `name`
-- (huruf kecil, spasi -> "-", awalan "payota" dibuang) dengan
-- penangkal duplikat (base, base-2, base-3, ...).
--
-- Aturan:
--  * Jika slug sudah terisi (INSERT/UPDATE) -> slug DIHORMATI.
--  * Jika slug kosong -> dihasilkan dari `name` secara unik.
--
-- UI admin mengirim slug kosong saat slug masih bawaan nama,
-- sehingga URL selalu sinkron tanpa tabrakan unique constraint.
-- =============================================================

CREATE OR REPLACE FUNCTION public.payota_fill_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $FN$
DECLARE
    v_tbl     TEXT := TG_TABLE_NAME;
    v_base    TEXT;
    v_cursor  TEXT;
    v_num     INTEGER := 2;
    v_exists  INTEGER;
BEGIN
    IF NEW.slug IS NOT NULL AND NEW.slug <> '' THEN
        RETURN NEW;
    END IF;

    v_base := LOWER(BTRIM(
        REGEXP_REPLACE(
            REGEXP_REPLACE(NEW.name, 'payota\s*', '', 'i'),
            '[^a-zA-Z0-9]+', '-', 'g'
        ),
        '-'
    ));

    IF v_base = '' THEN
        v_base := CASE WHEN v_tbl = 'payota_categories' THEN 'kategori' ELSE 'produk' END;
    END IF;

    NEW.slug := v_base;
    LOOP
        EXECUTE format('SELECT 1 FROM public.%I WHERE slug = $1 AND id IS DISTINCT FROM $2', v_tbl)
            INTO v_exists
            USING NEW.slug, NEW.id;
        EXIT WHEN v_exists IS NULL;
        v_cursor := v_base || '-' || v_num;
        IF length(v_cursor) <= 255 THEN
            NEW.slug := v_cursor;
        END IF;
        v_num := v_num + 1;
    END LOOP;

    RETURN NEW;
END;
$FN$;

DROP TRIGGER IF EXISTS trg_payota_products_fill_slug ON payota_products;
CREATE TRIGGER trg_payota_products_fill_slug
    BEFORE INSERT OR UPDATE ON payota_products
    FOR EACH ROW
    EXECUTE FUNCTION public.payota_fill_slug();

DROP TRIGGER IF EXISTS trg_payota_categories_fill_slug ON payota_categories;
CREATE TRIGGER trg_payota_categories_fill_slug
    BEFORE INSERT OR UPDATE ON payota_categories
    FOR EACH ROW
    EXECUTE FUNCTION public.payota_fill_slug();

-- Reload skema PostgREST agar fungsi trigger terdaftar dengan benar.
NOTIFY pgrst, 'reload schema';