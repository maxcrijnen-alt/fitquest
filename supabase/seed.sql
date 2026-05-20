insert into public.badges (id, name, description, icon, condition_type) values
  ('00000000-0000-4000-8000-000000000001', 'First workout logged', 'Logged the first strength session.', 'Dumbbell', 'first_workout'),
  ('00000000-0000-4000-8000-000000000002', 'First run logged', 'Logged the first run.', 'Footprints', 'first_run'),
  ('00000000-0000-4000-8000-000000000003', 'First 5K completed', 'Completed a 5K run.', 'Flag', 'first_5k'),
  ('00000000-0000-4000-8000-000000000004', '7-day streak', 'Kept a seven day consistency streak.', 'Flame', 'streak_7'),
  ('00000000-0000-4000-8000-000000000005', '30-day streak', 'Kept a 30 day consistency streak.', 'Flame', 'streak_30'),
  ('00000000-0000-4000-8000-000000000006', 'First strength PR', 'Set the first strength personal record.', 'Trophy', 'first_strength_pr'),
  ('00000000-0000-4000-8000-000000000007', 'Protein goal 7 days in a row', 'Hit protein seven days in a row.', 'BadgeCheck', 'protein_7'),
  ('00000000-0000-4000-8000-000000000008', 'Alcohol-free week', 'Logged seven alcohol-free days.', 'ShieldCheck', 'alcohol_free_week'),
  ('00000000-0000-4000-8000-000000000009', 'Level 5 reached', 'Reached level 5.', 'Sparkles', 'level_5'),
  ('00000000-0000-4000-8000-000000000010', 'Level 10 reached', 'Reached level 10.', 'Sparkles', 'level_10'),
  ('00000000-0000-4000-8000-000000000011', 'Father-son weekly challenge completed', 'Completed a shared weekly consistency challenge.', 'Users', 'family_challenge'),
  ('00000000-0000-4000-8000-000000000012', 'Consistency champion', 'Completed all daily tasks multiple days in a row.', 'Medal', 'consistency_champion')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon,
  condition_type = excluded.condition_type;

insert into public.profiles (
  id,
  email,
  name,
  nickname,
  gym_level,
  running_level,
  main_goal,
  age,
  body_weight_kg,
  five_k_goal,
  calorie_target,
  protein_target,
  water_target,
  alcohol_goal,
  workout_split,
  xp,
  level,
  coins,
  current_streak
) values
  (
    '11111111-1111-4111-8111-111111111111',
    'max@example.com',
    'Max',
    'Advanced',
    'advanced',
    'can run 5K slowly',
    'both',
    24,
    75,
    'Run a controlled sub-30 minute 5K',
    2700,
    180,
    3.0,
    true,
    array['Chest + triceps', 'Back + biceps', 'Legs'],
    0,
    1,
    0,
    0
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    'father@example.com',
    'Peter',
    'Beginner',
    'beginner',
    'cannot run 5K yet',
    'build muscle',
    60,
    85,
    'Complete a relaxed 5K without stopping',
    2300,
    130,
    2.2,
    true,
    array['Chest + triceps', 'Back + biceps', 'Legs'],
    0,
    1,
    0,
    0
  )
on conflict (id) do update set
  email = excluded.email,
  name = excluded.name,
  nickname = excluded.nickname,
  gym_level = excluded.gym_level,
  running_level = excluded.running_level,
  main_goal = excluded.main_goal,
  age = excluded.age,
  body_weight_kg = excluded.body_weight_kg,
  five_k_goal = excluded.five_k_goal,
  calorie_target = excluded.calorie_target,
  protein_target = excluded.protein_target,
  water_target = excluded.water_target,
  alcohol_goal = excluded.alcohol_goal,
  workout_split = excluded.workout_split,
  xp = excluded.xp,
  level = excluded.level,
  coins = excluded.coins,
  current_streak = excluded.current_streak;

insert into public.partner_connections (id, requester_id, receiver_id, status, invite_code) values
  (
    '33333333-3333-4333-8333-333333333333',
    '11111111-1111-4111-8111-111111111111',
    '22222222-2222-4222-8222-222222222222',
    'accepted',
    'FIT-DAD-2026'
  )
on conflict (id) do update set status = excluded.status, invite_code = excluded.invite_code;

insert into public.strength_workouts (id, user_id, workout_date, split_type, notes, total_volume) values
  ('44444444-4444-4444-8444-444444444441', '11111111-1111-4111-8111-111111111111', current_date - 6, 'Chest + triceps', 'Solid pressing day.', 8450),
  ('44444444-4444-4444-8444-444444444442', '11111111-1111-4111-8111-111111111111', current_date - 4, 'Back + biceps', 'Rows felt strong.', 9120),
  ('44444444-4444-4444-8444-444444444443', '11111111-1111-4111-8111-111111111111', current_date - 2, 'Legs', 'Conservative top sets.', 10440),
  ('44444444-4444-4444-8444-444444444444', '22222222-2222-4222-8222-222222222222', current_date - 5, 'Chest + triceps', 'Technique focus.', 1380),
  ('44444444-4444-4444-8444-444444444445', '22222222-2222-4222-8222-222222222222', current_date - 2, 'Back + biceps', 'Kept it easy.', 1660)
on conflict (id) do nothing;

insert into public.strength_exercises (workout_id, exercise_name, sets, reps, weight, is_bodyweight, estimated_1rm, notes) values
  ('44444444-4444-4444-8444-444444444441', 'Bench press', 4, 6, 85, false, 102, 'Last set smooth.'),
  ('44444444-4444-4444-8444-444444444441', 'Incline dumbbell press', 3, 10, 30, false, 40, ''),
  ('44444444-4444-4444-8444-444444444442', 'Barbell row', 4, 8, 80, false, 101.33, ''),
  ('44444444-4444-4444-8444-444444444443', 'Back squat', 4, 6, 105, false, 126, ''),
  ('44444444-4444-4444-8444-444444444444', 'Machine chest press', 3, 10, 25, false, 33.33, 'Easy pace.'),
  ('44444444-4444-4444-8444-444444444445', 'Seated row', 3, 10, 30, false, 40, ''),
  ('44444444-4444-4444-8444-444444444445', 'Assisted chin-up', 3, 6, 0, true, 0, 'Slow reps.');

insert into public.running_workouts (id, user_id, run_date, distance_km, time_minutes, pace_per_km, notes) values
  ('55555555-5555-4555-8555-555555555551', '11111111-1111-4111-8111-111111111111', current_date - 8, 5.0, 34.0, 6.80, 'Easy 5K.'),
  ('55555555-5555-4555-8555-555555555552', '11111111-1111-4111-8111-111111111111', current_date - 3, 5.2, 34.2, 6.58, 'Slightly faster finish.'),
  ('55555555-5555-4555-8555-555555555553', '22222222-2222-4222-8222-222222222222', current_date - 7, 1.8, 18.0, 10.00, 'Run/walk intervals.'),
  ('55555555-5555-4555-8555-555555555554', '22222222-2222-4222-8222-222222222222', current_date - 3, 2.2, 21.0, 9.55, 'More continuous jogging.')
on conflict (id) do nothing;

insert into public.daily_lifestyle_logs (id, user_id, log_date, calories, protein, water_liters, alcohol_free) values
  ('66666666-6666-4666-8666-666666666661', '11111111-1111-4111-8111-111111111111', current_date - 6, 2680, 182, 3.1, true),
  ('66666666-6666-4666-8666-666666666662', '11111111-1111-4111-8111-111111111111', current_date - 5, 2750, 175, 2.8, true),
  ('66666666-6666-4666-8666-666666666663', '11111111-1111-4111-8111-111111111111', current_date - 4, 2635, 188, 3.3, true),
  ('66666666-6666-4666-8666-666666666664', '22222222-2222-4222-8222-222222222222', current_date - 5, 2320, 136, 2.3, true),
  ('66666666-6666-4666-8666-666666666665', '22222222-2222-4222-8222-222222222222', current_date - 4, 2400, 126, 1.9, false),
  ('66666666-6666-4666-8666-666666666666', '22222222-2222-4222-8222-222222222222', current_date - 2, 2215, 137, 2.2, true)
on conflict (user_id, log_date) do update set
  calories = excluded.calories,
  protein = excluded.protein,
  water_liters = excluded.water_liters,
  alcohol_free = excluded.alcohol_free;

insert into public.tasks (user_id, task_date, title, description, category, target_value, difficulty, xp_reward, coin_reward, completed) values
  ('11111111-1111-4111-8111-111111111111', current_date, 'Train Chest + triceps', 'Aim for controlled volume near 10000 kg.', 'strength', 10000, 'hard', 50, 10, false),
  ('11111111-1111-4111-8111-111111111111', current_date, 'Complete an easy run', 'Cover 5 km at a sustainable pace.', 'running', 5, 'steady', 50, 10, false),
  ('11111111-1111-4111-8111-111111111111', current_date, 'Hit protein target', 'Reach 180 g protein.', 'protein', 180, 'steady', 25, 5, false),
  ('22222222-2222-4222-8222-222222222222', current_date, 'Easy run/walk', 'Cover 2 km with relaxed intervals.', 'running', 2, 'easy', 50, 10, false),
  ('22222222-2222-4222-8222-222222222222', current_date, 'Hit water target', 'Drink 2.2 L water.', 'water', 2.2, 'easy', 20, 4, false);

delete from public.user_badges
where user_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222'
);

insert into public.rewards (id, user_id, title, description, coin_cost) values
  ('77777777-7777-4777-8777-777777777771', '11111111-1111-4111-8111-111111111111', 'New gym item', 'Put coins toward a useful training accessory.', 160),
  ('77777777-7777-4777-8777-777777777772', '11111111-1111-4111-8111-111111111111', 'Coffee together', 'Plan a coffee after a strong week.', 80),
  ('77777777-7777-4777-8777-777777777773', '22222222-2222-4222-8222-222222222222', 'Movie night', 'Pick a movie after completing the weekly challenge.', 90)
on conflict (id) do nothing;

delete from public.xp_transactions
where user_id in (
  '11111111-1111-4111-8111-111111111111',
  '22222222-2222-4222-8222-222222222222'
);

insert into public.encouragements (sender_id, receiver_id, message, created_at) values
  ('11111111-1111-4111-8111-111111111111', '22222222-2222-4222-8222-222222222222', 'Proud of you!', now() - interval '2 days'),
  ('22222222-2222-4222-8222-222222222222', '11111111-1111-4111-8111-111111111111', 'Strong week!', now() - interval '1 day');
