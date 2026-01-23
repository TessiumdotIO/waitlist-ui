-- Add read-only points calculation function
CREATE OR REPLACE FUNCTION get_user_points(p_user_id UUID)
RETURNS TABLE(
  current_points NUMERIC,
  points_rate NUMERIC,
  last_update TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_user RECORD;
  v_elapsed_seconds NUMERIC;
  v_calculated_points NUMERIC;
BEGIN
  SELECT points, points_rate, last_update 
  INTO v_user
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - v_user.last_update));
  v_calculated_points := v_user.points + (v_elapsed_seconds * v_user.points_rate);

  RETURN QUERY SELECT 
    v_calculated_points,
    v_user.points_rate,
    v_user.last_update;
END;
$$;

-- Optimize sync_points to prevent excessive updates
CREATE OR REPLACE FUNCTION sync_points(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user RECORD;
  v_elapsed_seconds NUMERIC;
  v_new_points NUMERIC;
BEGIN
  SELECT * INTO v_user
  FROM users
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN;
  END IF;

  v_elapsed_seconds := EXTRACT(EPOCH FROM (NOW() - v_user.last_update));
  
  -- Only update if elapsed time is significant
  IF v_elapsed_seconds < 1 THEN
    RETURN;
  END IF;

  v_new_points := v_user.points + (v_elapsed_seconds * v_user.points_rate);

  UPDATE users
  SET 
    points = v_new_points,
    last_update = NOW()
  WHERE id = p_user_id;
END;
$$;