-- Create a referral handler that credits the referrer and marks the new user as referred
-- Usage: select public.handle_referral('REFCODE', 'new-user-uuid');

create or replace function public.handle_referral(p_referral_code text, p_new_user_id uuid)
returns json as $$
declare
  referrer users%rowtype;
  result json;
  referral_bonus numeric := 0.5; -- change if you want a different bonus
begin
  -- find the referrer by referral_code
  select * into referrer from users where referral_code = p_referral_code limit 1;

  if referrer is null then
    raise notice 'No referrer found for code %', p_referral_code;
    return json_build_object('ok', false, 'reason', 'no_referrer');
  end if;

  -- prevent self-referral
  if referrer.id = p_new_user_id then
    raise notice 'Self-referral attempt by %', p_new_user_id;
    return json_build_object('ok', false, 'reason', 'self_referral');
  end if;

  -- ensure new user exists and hasn't been referred already
  if not exists(select 1 from users where id = p_new_user_id) then
    raise notice 'New user does not exist %', p_new_user_id;
    return json_build_object('ok', false, 'reason', 'new_user_missing');
  end if;

  if (select referred_by from users where id = p_new_user_id) is not null then
    raise notice 'User % already has referrer', p_new_user_id;
    return json_build_object('ok', false, 'reason', 'already_referred');
  end if;

  -- credit the referrer: increment referral_count and points
  update users
  set referral_count = coalesce(referral_count, 0) + 1,
      points = coalesce(points, 0) + referral_bonus,
      last_update = now()
  where id = referrer.id;

  -- mark the new user as referred_by this referrer
  update users
  set referred_by = referrer.id
  where id = p_new_user_id;

  -- return the updated referrer row as JSON
  select row_to_json(u) into result from users u where u.id = referrer.id;
  return json_build_object('ok', true, 'referrer', result);
end;
$$ language plpgsql security definer;
