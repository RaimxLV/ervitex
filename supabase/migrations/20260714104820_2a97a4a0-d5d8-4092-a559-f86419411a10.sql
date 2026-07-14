CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO service_role;

DO $$
DECLARE
  p record;
  role_list text;
  qual_expr text;
  check_expr text;
  cmd_text text;
BEGIN
  FOR p IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      pol.polname AS policy_name,
      pol.polcmd,
      pol.polroles,
      pol.polpermissive,
      pg_get_expr(pol.polqual, pol.polrelid) AS qual,
      pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname IN ('public', 'storage')
      AND (
        pg_get_expr(pol.polqual, pol.polrelid) ILIKE '%has_role%'
        OR pg_get_expr(pol.polwithcheck, pol.polrelid) ILIKE '%has_role%'
      )
  LOOP
    SELECT string_agg(quote_ident(rolname), ', ')
      INTO role_list
    FROM pg_roles
    WHERE oid = ANY(p.polroles);

    IF role_list IS NULL THEN
      role_list := 'public';
    END IF;

    qual_expr := replace(p.qual, 'public.has_role', 'private.has_role');
    qual_expr := replace(qual_expr, 'has_role', 'private.has_role');
    check_expr := replace(p.with_check, 'public.has_role', 'private.has_role');
    check_expr := replace(check_expr, 'has_role', 'private.has_role');

    cmd_text := CASE p.polcmd
      WHEN 'r' THEN 'SELECT'
      WHEN 'a' THEN 'INSERT'
      WHEN 'w' THEN 'UPDATE'
      WHEN 'd' THEN 'DELETE'
      ELSE 'ALL'
    END;

    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', p.policy_name, p.schema_name, p.table_name);

    EXECUTE 'CREATE POLICY ' || quote_ident(p.policy_name) ||
            ' ON ' || quote_ident(p.schema_name) || '.' || quote_ident(p.table_name) ||
            CASE WHEN p.polpermissive THEN ' AS PERMISSIVE' ELSE ' AS RESTRICTIVE' END ||
            ' FOR ' || cmd_text ||
            ' TO ' || role_list ||
            CASE WHEN qual_expr IS NOT NULL THEN ' USING (' || qual_expr || ')' ELSE '' END ||
            CASE WHEN check_expr IS NOT NULL THEN ' WITH CHECK (' || check_expr || ')' ELSE '' END;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT false
$$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

DROP POLICY IF EXISTS "ss-images public read" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Public can read exact product image paths" ON storage.objects;
DROP POLICY IF EXISTS "Public can read exact ss image paths" ON storage.objects;

CREATE POLICY "Public can read exact product image paths"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images' AND owner IS NOT NULL);

CREATE POLICY "Public can read exact ss image paths"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'ss-images' AND owner IS NOT NULL);