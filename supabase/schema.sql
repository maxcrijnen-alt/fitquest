create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text not null,
  nickname text not null,
  gym_level text not null check (gym_level in ('beginner', 'intermediate', 'advanced')),
  running_level text not null check (
    running_level in (
      'cannot run 5K yet',
      'can run 5K slowly',
      'can run 5K comfortably',
      'can run 5K fast'
    )
  ),
  main_goal text not null check (main_goal in ('build muscle', 'improve running endurance', 'both')),
  age integer not null default 30 check (age between 12 and 100),
  body_weight_kg numeric(5,2) not null default 80 check (body_weight_kg between 30 and 250),
  five_k_goal text not null default 'Build toward a steady 5K',
  calorie_target integer not null,
  protein_target integer not null,
  water_target numeric(5,2) not null,
  alcohol_goal boolean not null default true,
  workout_split text[] not null default array['Chest + triceps', 'Back + biceps', 'Legs'],
  xp integer not null default 0,
  level integer not null default 1,
  coins integer not null default 0,
  current_streak integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists age integer not null default 30 check (age between 12 and 100),
  add column if not exists body_weight_kg numeric(5,2) not null default 80 check (body_weight_kg between 30 and 250);

create table if not exists public.partner_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  invite_code text not null unique,
  created_at timestamptz not null default now(),
  constraint partner_connections_not_self check (requester_id <> receiver_id)
);

create table if not exists public.strength_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  workout_date date not null,
  split_type text not null check (split_type in ('Chest + triceps', 'Back + biceps', 'Legs')),
  notes text not null default '',
  total_volume numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.strength_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.strength_workouts(id) on delete cascade,
  exercise_name text not null,
  sets integer not null check (sets > 0),
  reps integer not null check (reps > 0),
  weight numeric(8,2) not null default 0,
  is_bodyweight boolean not null default false,
  estimated_1rm numeric(8,2) not null default 0,
  notes text not null default ''
);

create table if not exists public.running_workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  run_date date not null,
  distance_km numeric(6,2) not null check (distance_km > 0),
  time_minutes numeric(7,2) not null check (time_minutes > 0),
  pace_per_km numeric(6,2) not null check (pace_per_km > 0),
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.daily_lifestyle_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  log_date date not null,
  calories integer not null check (calories >= 0),
  protein integer not null check (protein >= 0),
  water_liters numeric(5,2) not null check (water_liters >= 0),
  alcohol_free boolean not null default true,
  created_at timestamptz not null default now(),
  unique (user_id, log_date)
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  task_date date not null,
  title text not null,
  description text not null,
  category text not null check (
    category in ('strength', 'running', 'protein', 'water', 'calories', 'alcohol', 'mobility')
  ),
  target_value numeric(10,2),
  difficulty text not null check (difficulty in ('easy', 'steady', 'hard')),
  xp_reward integer not null default 0,
  coin_reward integer not null default 0,
  completed boolean not null default false
);

create table if not exists public.badges (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text not null,
  icon text not null,
  condition_type text not null unique
);

create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

create table if not exists public.rewards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null default '',
  coin_cost integer not null check (coin_cost > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.reward_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  reward_id uuid not null references public.rewards(id) on delete cascade,
  purchased_at timestamptz not null default now()
);

create table if not exists public.xp_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.encouragements (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_strength_workouts_user_date on public.strength_workouts(user_id, workout_date desc);
create index if not exists idx_running_workouts_user_date on public.running_workouts(user_id, run_date desc);
create index if not exists idx_lifestyle_user_date on public.daily_lifestyle_logs(user_id, log_date desc);
create index if not exists idx_tasks_user_date on public.tasks(user_id, task_date desc);
create index if not exists idx_xp_transactions_user_date on public.xp_transactions(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.partner_connections enable row level security;
alter table public.strength_workouts enable row level security;
alter table public.strength_exercises enable row level security;
alter table public.running_workouts enable row level security;
alter table public.daily_lifestyle_logs enable row level security;
alter table public.tasks enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;
alter table public.rewards enable row level security;
alter table public.reward_purchases enable row level security;
alter table public.xp_transactions enable row level security;
alter table public.encouragements enable row level security;

drop policy if exists "profiles_own_select" on public.profiles;
create policy "profiles_own_select" on public.profiles
  for select using (id = auth.uid());

drop policy if exists "profiles_own_insert" on public.profiles;
create policy "profiles_own_insert" on public.profiles
  for insert with check (id = auth.uid());

drop policy if exists "profiles_own_update" on public.profiles;
create policy "profiles_own_update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "partner_connections_visible_to_members" on public.partner_connections;
create policy "partner_connections_visible_to_members" on public.partner_connections
  for select using (requester_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "partner_connections_insert_by_requester" on public.partner_connections;
create policy "partner_connections_insert_by_requester" on public.partner_connections
  for insert with check (requester_id = auth.uid());

drop policy if exists "partner_connections_update_by_members" on public.partner_connections;
create policy "partner_connections_update_by_members" on public.partner_connections
  for update using (requester_id = auth.uid() or receiver_id = auth.uid())
  with check (requester_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "strength_workouts_own_all" on public.strength_workouts;
create policy "strength_workouts_own_all" on public.strength_workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "strength_exercises_own_select" on public.strength_exercises;
create policy "strength_exercises_own_select" on public.strength_exercises
  for select using (
    exists (
      select 1 from public.strength_workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "strength_exercises_own_insert" on public.strength_exercises;
create policy "strength_exercises_own_insert" on public.strength_exercises
  for insert with check (
    exists (
      select 1 from public.strength_workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "strength_exercises_own_update" on public.strength_exercises;
create policy "strength_exercises_own_update" on public.strength_exercises
  for update using (
    exists (
      select 1 from public.strength_workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.strength_workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "strength_exercises_own_delete" on public.strength_exercises;
create policy "strength_exercises_own_delete" on public.strength_exercises
  for delete using (
    exists (
      select 1 from public.strength_workouts w
      where w.id = workout_id and w.user_id = auth.uid()
    )
  );

drop policy if exists "running_workouts_own_all" on public.running_workouts;
create policy "running_workouts_own_all" on public.running_workouts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "daily_lifestyle_logs_own_all" on public.daily_lifestyle_logs;
create policy "daily_lifestyle_logs_own_all" on public.daily_lifestyle_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "tasks_own_all" on public.tasks;
create policy "tasks_own_all" on public.tasks
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "badges_read_all" on public.badges;
create policy "badges_read_all" on public.badges
  for select using (true);

drop policy if exists "user_badges_own_all" on public.user_badges;
create policy "user_badges_own_all" on public.user_badges
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "rewards_own_all" on public.rewards;
create policy "rewards_own_all" on public.rewards
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "reward_purchases_own_all" on public.reward_purchases;
create policy "reward_purchases_own_all" on public.reward_purchases
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "xp_transactions_own_all" on public.xp_transactions;
create policy "xp_transactions_own_all" on public.xp_transactions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists "encouragements_member_select" on public.encouragements;
create policy "encouragements_member_select" on public.encouragements
  for select using (sender_id = auth.uid() or receiver_id = auth.uid());

drop policy if exists "encouragements_sender_insert" on public.encouragements;
create policy "encouragements_sender_insert" on public.encouragements
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.partner_connections pc
      where pc.status = 'accepted'
        and (
          (pc.requester_id = sender_id and pc.receiver_id = receiver_id)
          or (pc.requester_id = receiver_id and pc.receiver_id = sender_id)
        )
    )
  );

create or replace function public.get_partner_summaries()
returns table (
  profile_id uuid,
  name text,
  nickname text,
  xp integer,
  level integer,
  coins integer,
  current_streak integer,
  weekly_completion numeric,
  weekly_xp integer,
  age integer,
  body_weight_kg numeric,
  weight_class text,
  relative_strength_index numeric,
  age_adjusted_strength_index numeric,
  badges jsonb,
  recent_milestones text[],
  encouragement_messages text[]
)
language sql
security definer
set search_path = public
as $$
  with partner_ids as (
    select
      case
        when requester_id = auth.uid() then receiver_id
        else requester_id
      end as partner_id
    from public.partner_connections
    where status = 'accepted'
      and (requester_id = auth.uid() or receiver_id = auth.uid())
  )
  select
    p.id as profile_id,
    p.name,
    p.nickname,
    p.xp,
    p.level,
    p.coins,
    p.current_streak,
    coalesce((
      select round(100.0 * count(*) filter (where completed) / nullif(count(*), 0), 0)
      from public.tasks t
      where t.user_id = p.id
        and t.task_date >= current_date - interval '6 days'
    ), 0) as weekly_completion,
    coalesce((
      select sum(amount)
      from public.xp_transactions x
      where x.user_id = p.id
        and x.created_at >= now() - interval '7 days'
    ), 0) as weekly_xp,
    p.age,
    p.body_weight_kg,
    case
      when p.body_weight_kg <= 59 then '59 kg'
      when p.body_weight_kg <= 66 then '66 kg'
      when p.body_weight_kg <= 74 then '74 kg'
      when p.body_weight_kg <= 83 then '83 kg'
      when p.body_weight_kg <= 93 then '93 kg'
      when p.body_weight_kg <= 105 then '105 kg'
      when p.body_weight_kg <= 120 then '120 kg'
      else '120+ kg'
    end as weight_class,
    coalesce((
      select round((sum(top_lifts.best_1rm) / nullif(p.body_weight_kg, 0)) * 100, 1)
      from (
        select max(se.estimated_1rm) as best_1rm
        from public.strength_workouts sw
        join public.strength_exercises se on se.workout_id = sw.id
        where sw.user_id = p.id
          and se.is_bodyweight = false
        group by lower(se.exercise_name)
        order by max(se.estimated_1rm) desc
        limit 3
      ) top_lifts
    ), 0) as relative_strength_index,
    coalesce((
      select round(
        ((sum(top_lifts.best_1rm) / nullif(p.body_weight_kg, 0)) * 100)
        * case
            when p.age >= 70 then 1.42
            when p.age >= 60 then 1.28
            when p.age >= 50 then 1.16
            when p.age >= 40 then 1.07
            else 1
          end,
        1
      )
      from (
        select max(se.estimated_1rm) as best_1rm
        from public.strength_workouts sw
        join public.strength_exercises se on se.workout_id = sw.id
        where sw.user_id = p.id
          and se.is_bodyweight = false
        group by lower(se.exercise_name)
        order by max(se.estimated_1rm) desc
        limit 3
      ) top_lifts
    ), 0) as age_adjusted_strength_index,
    coalesce((
      select jsonb_agg(jsonb_build_object('name', b.name, 'description', b.description, 'icon', b.icon))
      from public.user_badges ub
      join public.badges b on b.id = ub.badge_id
      where ub.user_id = p.id
    ), '[]'::jsonb) as badges,
    coalesce((
      select array_agg(reason)
      from (
        select reason
        from public.xp_transactions x
        where x.user_id = p.id
          and x.reason in (
            'Logged strength workout',
            'Logged run',
            'Personal record',
            'Completed all daily tasks'
          )
        order by x.created_at desc
        limit 5
      ) milestones
    ), array[]::text[]) as recent_milestones,
    coalesce((
      select array_agg(message)
      from (
        select message
        from public.encouragements e
        where e.sender_id = p.id or e.receiver_id = p.id
        order by e.created_at desc
        limit 5
      ) messages
    ), array[]::text[]) as encouragement_messages
  from public.profiles p
  join partner_ids pi on pi.partner_id = p.id;
$$;

revoke all on function public.get_partner_summaries() from public;
grant execute on function public.get_partner_summaries() to authenticated;
