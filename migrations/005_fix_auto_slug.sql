-- =============================================================
-- VAPE STORE - MIGRATION 005: PERBAIKAN PAYOTA_FILL_SLUG
--
-- Bug 004: kelas [^a-z0-9] tidak mencakup huruf kapital sehingga
-- huruf besar ikut dibuang ("Tes Auto" -> "-es-uto-").
-- Paduan 005 menimpa fungsi dengan logika yang benar:
--   * remove "payota" (case-insensitive)
--   * sisanya (case-insensitive) -> "-", bersihkan tepi
--   * dedup "-n" (relogika sama)
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

-- Trigger tak berubah, tapi dipasang ulang agar pasti sinkron.
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

NOTIFY pgrst, 'reload schema';