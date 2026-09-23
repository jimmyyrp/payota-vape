-- =============================================================
-- VAPE STORE - MIGRATION 001: FULL SCHEMA v1.0
-- Skema terpadu (fresh-installable) untuk katalog vape store.
--
-- Isi: tabel, indexes, triggers, RPC functions, storage bucket,
--      RLS policies, realtime publication, dan seed data awal.
-- Login awal: admin/admin123 (admin) | dev/dev123 (developer)
--
-- Catatan kritis tipe data:
--   PK/FK = INTEGER/SERIAL. RPC wajib pakai tipe PERSIS sama dengan
--   kolom aktual. get_products_complete meng-cast title::TEXT karena
--   RETURN QUERY plpgsql strict-typed (varchar != text).
--   Urutan BAGIAN 0: tabel dulu baru function.
-- =============================================================

-- BAGIAN 0: EKSTENSI
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================
-- BAGIAN 1: STRUKTUR TABEL
-- =============================================================

-- 1.1 USERS / TIM
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'staff' CHECK (role IN ('staff', 'admin', 'developer')),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 CATEGORIES (Kategori utama produk vape)
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 SUB-CATEGORIES (Varian produk di dalam kategori)
CREATE TABLE IF NOT EXISTS sub_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    price NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(name, category_id)
);

-- 1.4 THEMES (Tema / momen promosi; optional)
CREATE TABLE IF NOT EXISTS themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 POSTS (PRODUK)
-- price = harga terendah (rentang bawah), price_max = harga tertinggi (rentang atas).
-- Bila price_max > price, produk ditampilkan sebagai rentang "Rp 200rb - 350rb".
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    theme_id INTEGER REFERENCES themes(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    deskripsi TEXT DEFAULT '',
    price NUMERIC DEFAULT 0,
    price_max NUMERIC DEFAULT 0,
    gambar_thumbnail TEXT DEFAULT '',
    sub_category_id INTEGER REFERENCES sub_categories(id) ON DELETE SET NULL,
    views INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 POST-CATEGORIES (MANY-TO-MANY)
CREATE TABLE IF NOT EXISTS product_categories (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, category_id)
);

-- 1.7 POST-SUB-CATEGORIES (MANY-TO-MANY)
CREATE TABLE IF NOT EXISTS product_sub_categories (
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    sub_category_id INTEGER REFERENCES sub_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, sub_category_id)
);

-- 1.8 POST IMAGES
CREATE TABLE IF NOT EXISTS product_images (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    url_images TEXT NOT NULL,
    urutan INTEGER DEFAULT 0,
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- 1.9 TESTIMONIALS
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) DEFAULT 'Pelanggan',
    text TEXT NOT NULL,
    rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    deleted_at TIMESTAMPTZ DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.10 TESTIMONIAL TOKENS
CREATE TABLE IF NOT EXISTS review_tokens (
    id SERIAL PRIMARY KEY,
    token TEXT UNIQUE NOT NULL,
    usage_limit INT DEFAULT 1,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.11 SITE SETTINGS
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.12 ADMIN SESSIONS (auth berbasis database)
CREATE TABLE IF NOT EXISTS admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    token_hash TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE
);

-- 1.13 ADMIN ACTIVITY LOG
CREATE TABLE IF NOT EXISTS activity_logs (
    id             BIGSERIAL PRIMARY KEY,
    actor_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
    actor_name     TEXT,
    module         TEXT NOT NULL,
    action         TEXT NOT NULL,
    summary        TEXT,
    ref_type       TEXT,
    ref_id         BIGINT,
    snapshot_before JSONB NOT NULL DEFAULT '[]'::jsonb,
    snapshot_after  JSONB NOT NULL DEFAULT '[]'::jsonb,
    metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    reverted_at     TIMESTAMPTZ DEFAULT NULL,
    reverted_by     INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- =============================================================
-- BAGIAN 2: INDEXES
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_posts_active ON products(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_posts_deleted ON products(deleted_at) WHERE deleted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_posts_theme ON products(theme_id);
CREATE INDEX IF NOT EXISTS idx_posts_sub_category ON products(sub_category_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_sub_categories_category ON sub_categories(category_id);
CREATE INDEX IF NOT EXISTS idx_product_categories_post ON product_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_sub_categories_post ON product_sub_categories(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_post ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_testimonials_deleted ON reviews(deleted_at);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user ON admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_module  ON activity_logs(module);

-- =============================================================
-- BAGIAN 3: TRIGGERS
-- =============================================================

-- 3a. Password Hashing Trigger
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

-- 3b. Auto-update kolom updated_at pada products
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $FN$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$FN$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_posts_updated_at ON products;
CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================
-- BAGIAN 4: RPC FUNCTIONS
-- =============================================================

-- 4a. Login User (menghasilkan session token)
CREATE OR REPLACE FUNCTION public.login_user(p_username TEXT, p_password TEXT)
RETURNS TABLE (id INTEGER, username VARCHAR, full_name VARCHAR, role VARCHAR, session_token TEXT)
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
    SELECT v_user.id, v_user.username::VARCHAR, v_user.full_name, v_user.role, v_token;
END;
$FN$;

-- 4b. Verify Admin Session
CREATE OR REPLACE FUNCTION public.verify_admin_session(p_token TEXT)
RETURNS TABLE (user_id INTEGER, role VARCHAR)
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
    SELECT s.user_id, s.role::VARCHAR
    FROM public.admin_sessions s
    WHERE s.token_hash = v_hash
      AND s.revoked = FALSE
      AND s.expires_at > NOW()
    LIMIT 1;
END;
$FN$;

-- 4c. Revoke Admin Session (logout)
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

-- 4d. Get Posts Complete (katalog publik & admin produk)
CREATE OR REPLACE FUNCTION public.get_products_complete()
RETURNS TABLE (
    id INTEGER, title TEXT, price NUMERIC, price_max NUMERIC, views INTEGER,
    deskripsi TEXT, gambar_thumbnail TEXT, sub_category_id INTEGER,
    is_active BOOLEAN, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
    categories JSON, sub_categories JSON, images JSON
)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $FN$
BEGIN
    RETURN QUERY
    SELECT
        p.id,
        COALESCE(p.title, '')::TEXT,
        p.price,
        COALESCE(p.price_max, 0),
        COALESCE(p.views, 0),
        COALESCE(p.deskripsi, '')::TEXT,
        COALESCE(p.gambar_thumbnail, '')::TEXT,
        p.sub_category_id,
        p.is_active,
        p.created_at,
        p.updated_at,
        COALESCE(
            (SELECT json_agg(json_build_object('id', c.id, 'name', c.name))
             FROM public.product_categories pc JOIN public.categories c ON c.id = pc.category_id WHERE pc.product_id = p.id),
            '[]'::json
        ) AS categories,
        COALESCE(
            (SELECT json_agg(json_build_object('id', sc.id, 'name', sc.name, 'price', sc.price))
             FROM public.product_sub_categories psc JOIN public.sub_categories sc ON sc.id = psc.sub_category_id WHERE psc.product_id = p.id),
            '[]'::json
        ) AS sub_categories,
        COALESCE(
            (SELECT json_agg(json_build_object('id', pi.id, 'url_images', pi.url_images, 'urutan', pi.urutan) ORDER BY pi.urutan ASC)
             FROM public.product_images pi WHERE pi.product_id = p.id),
            '[]'::json
        ) AS images
    FROM public.products p
    WHERE p.deleted_at IS NULL AND p.is_active = TRUE
    ORDER BY p.created_at DESC, p.id DESC;
END;
$FN$;

-- 4e. Get Team Members
CREATE OR REPLACE FUNCTION public.get_team_members()
RETURNS TABLE (id INTEGER, username VARCHAR, full_name VARCHAR, role VARCHAR, created_at TIMESTAMPTZ)
LANGUAGE plpgsql STABLE
SET search_path = public
AS $FN$
BEGIN
    RETURN QUERY
    SELECT u.id, u.username, u.full_name, u.role, u.created_at
    FROM public.users u ORDER BY u.id DESC;
END;
$FN$;

-- 4f. Increment Post Views
CREATE OR REPLACE FUNCTION public.increment_product_views(target_id INTEGER)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $FN$
BEGIN
    UPDATE public.products SET views = COALESCE(views, 0) + 1 WHERE id = target_id AND deleted_at IS NULL;
END;
$FN$;

-- 4g. Submit Testimonial with Token
CREATE OR REPLACE FUNCTION public.submit_review_with_token(
    p_name TEXT, p_role TEXT, p_text TEXT, p_rating INT, p_token TEXT
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $FN$
DECLARE token_record RECORD;
BEGIN
    SELECT * INTO token_record FROM public.review_tokens WHERE token = p_token;
    IF token_record IS NULL THEN RAISE EXCEPTION 'Token tidak valid.'; END IF;
    IF token_record.usage_count >= token_record.usage_limit THEN RAISE EXCEPTION 'Kuota habis.'; END IF;
    INSERT INTO public.reviews (name, role, text, rating) VALUES (p_name, p_role, p_text, p_rating);
    UPDATE public.review_tokens SET usage_count = usage_count + 1 WHERE id = token_record.id;
END;
$FN$;

-- 4h. Cleanup Expired Records
CREATE OR REPLACE FUNCTION public.cleanup_expired_records()
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $FN$
DECLARE
    deleted_count INT := 0;
    row_count INT;
BEGIN
    DELETE FROM public.admin_sessions WHERE expires_at < NOW() OR revoked = TRUE;
    GET DIAGNOSTICS row_count = ROW_COUNT; deleted_count := deleted_count + row_count;
    DELETE FROM public.products WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS row_count = ROW_COUNT; deleted_count := deleted_count + row_count;
    DELETE FROM public.categories WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS row_count = ROW_COUNT; deleted_count := deleted_count + row_count;
    DELETE FROM public.sub_categories WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS row_count = ROW_COUNT; deleted_count := deleted_count + row_count;
    DELETE FROM public.reviews WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS row_count = ROW_COUNT; deleted_count := deleted_count + row_count;
    DELETE FROM public.users WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS row_count = ROW_COUNT; deleted_count := deleted_count + row_count;
    DELETE FROM public.review_tokens WHERE usage_count >= usage_limit;
    RETURN format('Hard delete selesai. %s record dihapus permanen.', deleted_count);
END;
$FN$;

-- 4i. Log Activity
CREATE OR REPLACE FUNCTION public.log_activity(
    p_token       TEXT,
    p_module      TEXT,
    p_action      TEXT,
    p_summary     TEXT,
    p_ref_type    TEXT,
    p_ref_id      BIGINT,
    p_before      JSONB,
    p_after       JSONB,
    p_metadata    JSONB,
    p_actor_name  TEXT DEFAULT NULL,
    p_requestor_id BIGINT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $FN$
DECLARE
    v_hash TEXT;
    v_user_id INTEGER;
    v_full_name TEXT;
    v_log_id BIGINT;
BEGIN
    IF p_token IS NOT NULL AND p_token <> '' THEN
        v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');
        SELECT s.user_id, u.full_name INTO v_user_id, v_full_name
        FROM public.admin_sessions s
        LEFT JOIN public.users u ON u.id = s.user_id
        WHERE s.token_hash = v_hash AND s.revoked = FALSE AND s.expires_at > NOW()
        LIMIT 1;
        IF v_user_id IS NOT NULL THEN
            p_actor_name := COALESCE(v_full_name, p_actor_name);
        END IF;
    END IF;

    IF v_user_id IS NULL AND p_requestor_id IS NOT NULL THEN
        v_user_id := p_requestor_id;
    END IF;

    INSERT INTO public.activity_logs
        (actor_id, actor_name, module, action, summary, ref_type, ref_id,
         snapshot_before, snapshot_after, metadata)
    VALUES
        (v_user_id, p_actor_name, p_module, p_action, p_summary, p_ref_type, p_ref_id,
         COALESCE(p_before, '[]'::jsonb), COALESCE(p_after, '[]'::jsonb), COALESCE(p_metadata, '{}'::jsonb))
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$FN$;

-- 4l. List Activity Logs
CREATE OR REPLACE FUNCTION public.list_activity_logs(
    p_token TEXT,
    p_module TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 200
)
RETURNS TABLE (
    id BIGINT, actor_id INTEGER, actor_name TEXT, module TEXT, action TEXT,
    summary TEXT, ref_type TEXT, ref_id BIGINT,
    snapshot_before JSONB, snapshot_after JSONB, metadata JSONB,
    created_at TIMESTAMPTZ, reverted_at TIMESTAMPTZ, reverted_by INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
STABLE
SET search_path = public
AS $FN$
DECLARE
    v_hash TEXT;
    v_role VARCHAR;
BEGIN
    IF p_token IS NULL OR p_token = '' THEN RETURN; END IF;
    v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');
    SELECT role INTO v_role FROM public.admin_sessions
    WHERE token_hash = v_hash AND revoked = FALSE AND expires_at > NOW()
    LIMIT 1;
    IF v_role IS NULL THEN RETURN; END IF;

    IF p_module IS NOT NULL AND p_module <> '' THEN
        RETURN QUERY
        SELECT l.id, l.actor_id, l.actor_name, l.module, l.action, l.summary,
               l.ref_type, l.ref_id, l.snapshot_before, l.snapshot_after, l.metadata,
               l.created_at, l.reverted_at, l.reverted_by
        FROM public.activity_logs l
        WHERE l.module = p_module
        ORDER BY l.created_at DESC
        LIMIT LEAST(p_limit, 500);
    ELSE
        RETURN QUERY
        SELECT l.id, l.actor_id, l.actor_name, l.module, l.action, l.summary,
               l.ref_type, l.ref_id, l.snapshot_before, l.snapshot_after, l.metadata,
               l.created_at, l.reverted_at, l.reverted_by
        FROM public.activity_logs l
        ORDER BY l.created_at DESC
        LIMIT LEAST(p_limit, 500);
    END IF;
END;
$FN$;

-- 4m. Get Single Activity Log
CREATE OR REPLACE FUNCTION public.get_activity_log(p_token TEXT, p_id BIGINT)
RETURNS TABLE (
    id BIGINT, actor_id INTEGER, actor_name TEXT, module TEXT, action TEXT,
    summary TEXT, ref_type TEXT, ref_id BIGINT,
    snapshot_before JSONB, snapshot_after JSONB, metadata JSONB,
    created_at TIMESTAMPTZ, reverted_at TIMESTAMPTZ, reverted_by INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
STABLE
SET search_path = public
AS $FN$
DECLARE
    v_hash TEXT;
    v_role VARCHAR;
BEGIN
    IF p_token IS NULL OR p_token = '' THEN RETURN; END IF;
    v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');
    SELECT role INTO v_role FROM public.admin_sessions
    WHERE token_hash = v_hash AND revoked = FALSE AND expires_at > NOW()
    LIMIT 1;
    IF v_role IS NULL THEN RETURN; END IF;

    RETURN QUERY
    SELECT l.id, l.actor_id, l.actor_name, l.module, l.action, l.summary,
           l.ref_type, l.ref_id, l.snapshot_before, l.snapshot_after, l.metadata,
           l.created_at, l.reverted_at, l.reverted_by
    FROM public.activity_logs l
    WHERE l.id = p_id;
END;
$FN$;

-- 4n. Mark Activity Reverted
CREATE OR REPLACE FUNCTION public.mark_activity_reverted(p_token TEXT, p_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $FN$
DECLARE
    v_hash TEXT;
    v_role VARCHAR;
    v_user_id INTEGER;
BEGIN
    IF p_token IS NULL OR p_token = '' THEN RETURN FALSE; END IF;
    v_hash := encode(extensions.digest(p_token, 'sha256'), 'hex');
    SELECT role, user_id INTO v_role, v_user_id FROM public.admin_sessions
    WHERE token_hash = v_hash AND revoked = FALSE AND expires_at > NOW()
    LIMIT 1;
    IF v_role IS NULL THEN RETURN FALSE; END IF;

    UPDATE public.activity_logs
       SET reverted_at = NOW(), reverted_by = v_user_id
     WHERE id = p_id AND reverted_at IS NULL;
    RETURN FOUND;
END;
$FN$;

-- Hak eksekusi RPC
GRANT EXECUTE ON FUNCTION
    public.login_user(TEXT, TEXT),
    public.verify_admin_session(TEXT),
    public.revoke_admin_session(TEXT),
    public.get_products_complete(),
    public.get_team_members(),
    public.increment_product_views(INTEGER),
    public.submit_review_with_token(TEXT, TEXT, TEXT, INT, TEXT),
    public.cleanup_expired_records(),
    public.log_activity(TEXT, TEXT, TEXT, TEXT, TEXT, BIGINT, JSONB, JSONB, JSONB, TEXT, BIGINT),
    public.list_activity_logs(TEXT, TEXT, INTEGER),
    public.get_activity_log(TEXT, BIGINT),
    public.mark_activity_reverted(TEXT, BIGINT)
TO anon, authenticated;

-- =============================================================
-- BAGIAN 5: STORAGE CONFIGURATION (Supabase Storage)
-- =============================================================
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage') THEN
        INSERT INTO storage.buckets (id, name, public) VALUES ('vape_media', 'vape_media', true)
        ON CONFLICT (id) DO NOTHING;

        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Public Read Access') THEN
            CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING (bucket_id = 'vape_media');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects' AND policyname='Admin All Access') THEN
            CREATE POLICY "Admin All Access" ON storage.objects FOR ALL USING (bucket_id = 'vape_media') WITH CHECK (bucket_id = 'vape_media');
        END IF;
    END IF;
END $$;

-- =============================================================
-- BAGIAN 6: ROW LEVEL SECURITY
-- =============================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT USING (deleted_at IS NULL AND is_active = TRUE);
DROP POLICY IF EXISTS "public_read_sub_categories" ON sub_categories;
CREATE POLICY "public_read_sub_categories" ON sub_categories FOR SELECT USING (deleted_at IS NULL);
DROP POLICY IF EXISTS "public_read_posts" ON products;
CREATE POLICY "public_read_posts" ON products FOR SELECT USING (deleted_at IS NULL AND is_active = TRUE);
DROP POLICY IF EXISTS "public_read_product_categories" ON product_categories;
CREATE POLICY "public_read_product_categories" ON product_categories FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "public_read_product_sub_categories" ON product_sub_categories;
CREATE POLICY "public_read_product_sub_categories" ON product_sub_categories FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "public_read_product_images" ON product_images;
CREATE POLICY "public_read_product_images" ON product_images FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "public_read_testimonials" ON reviews;
CREATE POLICY "public_read_testimonials" ON reviews FOR SELECT USING (deleted_at IS NULL);
DROP POLICY IF EXISTS "public_insert_testimonials" ON reviews;
CREATE POLICY "public_insert_testimonials" ON reviews FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "public_read_site_settings" ON settings;
CREATE POLICY "public_read_site_settings" ON settings FOR SELECT USING (TRUE);

-- Admin Full Access Policies
DROP POLICY IF EXISTS "admin_full_access_users" ON users;
CREATE POLICY "admin_full_access_users" ON users FOR ALL USING (TRUE);
DROP POLICY IF EXISTS "admin_full_access_categories" ON categories;
CREATE POLICY "admin_full_access_categories" ON categories FOR ALL USING (TRUE);
DROP POLICY IF EXISTS "admin_full_access_sub_categories" ON sub_categories;
CREATE POLICY "admin_full_access_sub_categories" ON sub_categories FOR ALL USING (TRUE);
DROP POLICY IF EXISTS "admin_full_access_themes" ON themes;
CREATE POLICY "admin_full_access_themes" ON themes FOR ALL USING (TRUE);
DROP POLICY IF EXISTS "admin_full_access_posts" ON products;
CREATE POLICY "admin_full_access_posts" ON products FOR ALL USING (TRUE);
DROP POLICY IF EXISTS "admin_full_access_product_categories" ON product_categories;
CREATE POLICY "admin_full_access_product_categories" ON product_categories FOR ALL USING (TRUE);
DROP POLICY IF EXISTS "admin_full_access_product_sub_categories" ON product_sub_categories;
CREATE POLICY "admin_full_access_product_sub_categories" ON product_sub_categories FOR ALL USING (TRUE);
DROP POLICY IF EXISTS "admin_full_access_product_images" ON product_images;
CREATE POLICY "admin_full_access_product_images" ON product_images FOR ALL USING (TRUE);
DROP POLICY IF EXISTS "admin_full_access_testimonials" ON reviews;
CREATE POLICY "admin_full_access_testimonials" ON reviews FOR ALL USING (TRUE);
DROP POLICY IF EXISTS "admin_full_access_testimonial_tokens" ON review_tokens;
CREATE POLICY "admin_full_access_testimonial_tokens" ON review_tokens FOR ALL USING (TRUE);
DROP POLICY IF EXISTS "admin_full_access_site_settings" ON settings;
CREATE POLICY "admin_full_access_site_settings" ON settings FOR ALL USING (TRUE);

-- Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- =============================================================
-- BAGIAN 7: SUPABASE REALTIME
-- =============================================================
DO $$
DECLARE t TEXT;
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        FOREACH t IN ARRAY ARRAY['products', 'reviews', 'settings'] LOOP
            IF NOT EXISTS (
                SELECT 1 FROM pg_publication_tables
                WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = t
            ) THEN
                EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
            END IF;
        END LOOP;
    END IF;
END $$;

-- =============================================================
-- BAGIAN 8: SEED DATA AWAL
-- =============================================================

-- Site Settings
INSERT INTO settings (key, value) VALUES
    ('phone', ''),
    ('whatsapp', ''),
    ('instagram', ''),
    ('tiktok', ''),
    ('address', ''),
    ('message', 'Halo! Saya ingin bertanya tentang produk vape.')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Users (password DI-HASH OTOMATIS oleh trigger)
INSERT INTO users (username, password, full_name, role) VALUES
    ('admin', 'admin123', 'Admin Vape Store', 'admin'),
    ('dev', 'dev123', 'Developer System', 'developer')
ON CONFLICT (username) DO NOTHING;

-- Categories (3 kategori utama sesuai keputusan)
INSERT INTO categories (name, is_active) VALUES
    ('Pod & Mod Device', TRUE),
    ('Liquid / E-Liquid', TRUE),
    ('Disposable', TRUE)
ON CONFLICT DO NOTHING;

-- Sub-Categories
DO $$
DECLARE cat_id INT;
BEGIN
    SELECT id INTO cat_id FROM categories WHERE name = 'Pod & Mod Device';
    IF cat_id IS NOT NULL THEN INSERT INTO sub_categories (name, category_id, price) VALUES
        ('Pod System', cat_id, 0), ('Pod Kit', cat_id, 0), ('Mod Device', cat_id, 0),
        ('Coil & Atomizer', cat_id, 0) ON CONFLICT DO NOTHING; END IF;

    SELECT id INTO cat_id FROM categories WHERE name = 'Liquid / E-Liquid';
    IF cat_id IS NOT NULL THEN INSERT INTO sub_categories (name, category_id, price) VALUES
        ('Freebase', cat_id, 0), ('Salt Nic', cat_id, 0),
        ('Shortfill', cat_id, 0), ('Premium Liquid', cat_id, 0) ON CONFLICT DO NOTHING; END IF;

    SELECT id INTO cat_id FROM categories WHERE name = 'Disposable';
    IF cat_id IS NOT NULL THEN INSERT INTO sub_categories (name, category_id, price) VALUES
        ('Disposable Pod', cat_id, 0), ('Disposable Bar', cat_id, 0),
        ('Disposable High Puff', cat_id, 0) ON CONFLICT DO NOTHING; END IF;
END $$;

-- =============================================================
-- BAGIAN 9: PENJAGA SEQUENCE (ANTI ID BENTROK)
-- =============================================================
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'users', 'categories', 'sub_categories', 'themes', 'products',
        'product_images', 'reviews', 'review_tokens', 'settings'
    ] LOOP
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = t AND column_name = 'id'
        ) THEN
            EXECUTE format(
                'SELECT setval(pg_get_serial_sequence(%L, ''id''), GREATEST(COALESCE((SELECT MAX(id) FROM %I), 0) + 1, 1), false)',
                t, t
            );
        END IF;
    END LOOP;
END
$$;

-- =============================================================
-- BAGIAN 10: RELOAD SKEMA POSTGREST
-- =============================================================
NOTIFY pgrst, 'reload schema';