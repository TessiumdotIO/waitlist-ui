-- Create a lightweight cache/table for timezone names to avoid repeated pg_catalog IO
-- Safe to run in Supabase SQL editor. This creates a small table and a refresh function.

BEGIN;

-- table to hold cached timezone names (small, static)
CREATE TABLE IF NOT EXISTS public.timezone_names_cache (
  name text PRIMARY KEY
);

-- populate initially (idempotent: we use TRUNCATE+INSERT so re-running refresh is safe)
TRUNCATE public.timezone_names_cache;
INSERT INTO public.timezone_names_cache (name)
  SELECT name FROM pg_timezone_names;

-- refresh function to be callable when you want to refresh the cache
CREATE OR REPLACE FUNCTION public.refresh_timezone_names_cache()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  TRUNCATE public.timezone_names_cache;
  INSERT INTO public.timezone_names_cache (name)
    SELECT name FROM pg_timezone_names;
END;
$$;

COMMIT;
