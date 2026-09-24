-- =============================================================
-- VAPE STORE - MIGRATION 003: PERBAIKAN RPC LOGIN ADMIN
--
-- Perbaikan: fungsi login_user/verify_admin_session gagal dengan
-- "structure of query does not match function result type" karena
-- RETURNS TABLE memakai TEXT sedangkan RETURN QUERY menghasilkan
-- kolom VARCHAR (users.username/full_name/role, admin_sessions.role).
--
-- Solusi: cast eksplisit ::TEXT pada RETURN QUERY dengan signature
-- fungsi yang TETAP SAMA (login_user(TEXT,TEXT) dll.) sehingga
-- PostgREST tidak perlu invalidasi argumen.
-- =============================================================

-- Buang dulu versi lama (idempoten), lalu buat ulang dengan cast.
DROP FUNCTION IF EXISTS public.login_user(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.verify_admin_session(TEXT);
DROP FUNCTION IF EXISTS public.revoke_admin_session(TEXT);

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

-- Reload skema PostgREST agar signature terbaru dipakai.
NOTIFY pgrst, 'reload schema';