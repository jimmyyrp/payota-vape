-- =============================================================
-- VAPE STORE - MIGRATION 002: PAYOTA PRODUCT CATALOG
-- Skema khusus PAYOTA (katalog premium lifestyle statis -> DB).
--
-- Isi: kategori + produk PAYOTA (spesifikasi JSONB, art, glow),
--      auth admin (users/admin_sessions + RPC login) idempoten,
--      RLS + grants, seed kategori default.
--
-- Login awal: admin/admin123 (admin) | dev/dev123 (developer)
-- =============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================
-- BAGIAN 1: TABEL KATEGORI PAYOTA
-- =============================================================
CREATE TABLE IF NOT EXISTS payota_categories (
    id         SERIAL PRIMARY KEY,
    slug       VARCHAR(255) NOT NULL UNIQUE,
    name       VARCHAR(255) NOT NULL,
    tagline    TEXT NOT NULL DEFAULT '',
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payota_categories_active
    ON payota_categories(is_active);

-- =============================================================
-- BAGIAN 2: TABEL PRODUK PAYOTA
-- =============================================================
CREATE TABLE IF NOT EXISTS payota_products (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(255) NOT NULL UNIQUE,
    index       INTEGER NOT NULL DEFAULT 0,
    category    VARCHAR(255) NOT NULL DEFAULT 'Perangkat',
    name        VARCHAR(255) NOT NULL,
    tagline     TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    specs       JSONB NOT NULL DEFAULT '[]'::jsonb,
    art         VARCHAR(255) NOT NULL DEFAULT 'device',
    glow        VARCHAR(255) NOT NULL DEFAULT '#E4E4E7',
    glow_soft   VARCHAR(255) NOT NULL DEFAULT 'rgba(228,228,231,0.14)',
    badge       VARCHAR(255),
    featured    BOOLEAN NOT NULL DEFAULT FALSE,
    price       TEXT NOT NULL DEFAULT '',
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payota_products_active
    ON payota_products(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_payota_products_featured
    ON payota_products(featured) WHERE featured = TRUE AND is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_payota_products_category
    ON payota_products(category);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION payota_update_updated_at()
RETURNS TRIGGER AS $FN$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$FN$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_payota_products_updated_at ON payota_products;
CREATE TRIGGER trg_payota_products_updated_at
    BEFORE UPDATE ON payota_products
    FOR EACH ROW
    EXECUTE FUNCTION payota_update_updated_at();

DROP TRIGGER IF EXISTS trg_payota_categories_updated_at ON payota_categories;
CREATE TRIGGER trg_payota_categories_updated_at
    BEFORE UPDATE ON payota_categories
    FOR EACH ROW
    EXECUTE FUNCTION payota_update_updated_at();

-- =============================================================
-- BAGIAN 3: AUTH ADMIN (IDEMPOTEN, aman kalau sudah ada di v1)
-- =============================================================

-- Password hashing trigger (BEFORE INSERT/UPDATE)
CREATE OR REPLACE FUNCTION hash_password_trigger()
RETURNS TRIGGER AS $FN$
BEGIN
    IF (TG_OP = 'INSERT') OR (TG_OP = 'UPDATE' AND NEW.password <> OLD.password) THEN
        NEW.password = crypt(NEW.password, gen_salt('bf'));
    END IF;
    RETURN NEW;
END;
$FN$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_hash_password ON users;
CREATE TRIGGER trigger_hash_password
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION hash_password_trigger();

-- Buang fungsi v1 yang tipenya beda agar bisa dibuat ulang dengan signature baru.
DROP FUNCTION IF EXISTS public.login_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.verify_admin_session(TEXT);
DROP FUNCTION IF EXISTS public.revoke_admin_session(TEXT);

-- 3a. Login -> buat session token
CREATE OR REPLACE FUNCTION public.login_user(p_username TEXT, p_password TEXT)
RETURNS TABLE (id INTEGER, username TEXT, full_name TEXT, role TEXT, session_token TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $FN$
DECLARE
    v_user public.users%ROWTYPE;
    v_token TEXT;
    v_hash TEXT;
BEGIN
    SELECT * INTO v_user
    FROM public.users u
    WHERE LOWER(u.username) = LOWER(TRIM(p_username))
      AND u.password = extensions.crypt(p_password, u.password)
      AND u.deleted_at IS NULL;

    IF v_user.id IS NULL THEN
        RETURN;
    END IF;

    v_token := encode(extensions.gen_random_bytes(32), 'hex');
    v_hash := encode(extensions.digest(v_token, 'sha256'), 'hex');

    INSERT INTO public.admin_sessions (user_id, role, token_hash, expires_at)
    VALUES (v_user.id, v_user.role, v_hash, NOW() + INTERVAL '12 hours')
    ON CONFLICT (token_hash) DO NOTHING;

    RETURN QUERY
    SELECT v_user.id, v_user.username::TEXT, v_user.full_name::TEXT, v_user.role::TEXT, v_token;
END;
$FN$;

-- 3b. Verify session
CREATE OR REPLACE FUNCTION public.verify_admin_session(p_token TEXT)
RETURNS TABLE (user_id INTEGER, role TEXT)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
STABLE
AS $FN$
DECLARE
    v_hash TEXT;
BEGIN
    IF p_token IS NULL OR p_token = '' THEN
        RETURN;
    END IF;
    v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');

    RETURN QUERY
    SELECT s.user_id, s.role::TEXT
    FROM public.admin_sessions s
    WHERE s.token_hash = v_hash
      AND s.revoked = FALSE
      AND s.expires_at > NOW()
    LIMIT 1;
END;
$FN$;

-- 3c. Logout / revoke session
CREATE OR REPLACE FUNCTION public.revoke_admin_session(p_token TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $FN$
DECLARE
    v_hash TEXT;
BEGIN
    IF p_token IS NULL OR p_token = '' THEN
        RETURN;
    END IF;
    v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');
    UPDATE public.admin_sessions SET revoked = TRUE WHERE token_hash = v_hash;
END;
$FN$;

GRANT EXECUTE ON FUNCTION
    public.login_user(TEXT, TEXT),
    public.verify_admin_session(TEXT),
    public.revoke_admin_session(TEXT)
TO anon, authenticated, service_role;

-- =============================================================
-- BAGIAN 4: ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE payota_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE payota_products ENABLE ROW LEVEL SECURITY;

-- Publik: hanya baca data aktif
DROP POLICY IF EXISTS "payota_public_read_categories" ON payota_categories;
CREATE POLICY "payota_public_read_categories"
    ON payota_categories FOR SELECT
    USING (is_active = TRUE);

DROP POLICY IF EXISTS "payota_public_read_products" ON payota_products;
CREATE POLICY "payota_public_read_products"
    ON payota_products FOR SELECT
    USING (is_active = TRUE);

-- =============================================================
-- BAGIAN 5: GRANTS
-- anon: SELECT saja (kontrol lewat RLS)
-- authenticated/service_role: penuh (admin CMS via service role server-side)
-- =============================================================
GRANT SELECT ON payota_categories TO anon, authenticated, service_role;
GRANT ALL ON payota_categories TO authenticated, service_role;

GRANT SELECT ON payota_products TO anon;
GRANT ALL ON payota_products TO authenticated, service_role;

GRANT USAGE, SELECT ON SEQUENCE payota_categories_id_seq TO authenticated, service_role;
GRANT USAGE, SELECT ON SEQUENCE payota_products_id_seq TO authenticated, service_role;

-- =============================================================
-- BAGIAN 6: SEED DATA AWAL
-- =============================================================

-- User admin default (password di-hash trigger; idempoten)
INSERT INTO users (username, password, full_name, role) VALUES
    ('admin', 'admin123', 'Admin PAYOTA', 'admin'),
    ('dev', 'dev123', 'Developer System', 'developer')
ON CONFLICT (username) DO NOTHING;

-- Kategori default PAYOTA (nama & tagline dalam Bahasa Indonesia)
INSERT INTO payota_categories (slug, name, tagline) VALUES
    ('devices', 'Perangkat', 'Inti dari koleksi.'),
    ('accessories', 'Aksesori', 'Pendamping dengan bahasa yang sama.'),
    ('essentials', 'Esensial', 'Perlengkapan harian yang terkurasi.'),
    ('limited', 'Terbatas', 'Bernomor, langka, terdokumentasi.')
ON CONFLICT (slug) DO NOTHING;

-- =============================================================
-- RELOAD POSTGREST
-- =============================================================
NOTIFY pgrst, 'reload schema';