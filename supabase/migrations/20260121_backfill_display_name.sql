-- Backfill display_name for existing users
-- Deterministic generator that mirrors src/lib/nameGenerator.ts (sums char codes of id)

BEGIN;

-- Create a helper function to generate a display name from the user's id text
CREATE OR REPLACE FUNCTION public.generate_display_name_from_id(p_id text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  s integer := 0;
  i integer;
  ch text;
  adjectives text[] := ARRAY[
    'Swift','Bright','Bold','Cosmic','Digital','Electric','Stellar','Quantum','Cyber','Neon','Turbo','Ultra','Mega','Super','Hyper'
  ];
  nouns text[] := ARRAY[
    'Phoenix','Dragon','Tiger','Eagle','Falcon','Wolf','Lion','Panther','Hawk','Viper','Ninja','Samurai','Warrior','Knight'
  ];
  adj_idx integer;
  noun_idx integer;
  num integer;
BEGIN
  -- Sum ascii codes of characters in the id string (mirrors JS reducer)
  FOR i IN 1..char_length(p_id) LOOP
    ch := substr(p_id, i, 1);
    s := s + ascii(ch);
  END LOOP;

  adj_idx := (s % array_length(adjectives, 1)) + 1; -- 1-based index
  noun_idx := ((s * 7) % array_length(nouns, 1)) + 1;
  num := (s % 9000) + 1000;

  RETURN adjectives[adj_idx] || nouns[noun_idx] || num::text;
END;
$$;

-- Update all users where display_name is missing or empty
UPDATE public.users
SET display_name = public.generate_display_name_from_id(id::text)
WHERE display_name IS NULL OR trim(display_name) = '';

COMMIT;
