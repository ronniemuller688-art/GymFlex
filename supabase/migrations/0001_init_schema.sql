-- GymFlex initial schema

create table if not exists gyms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  address text,
  lat double precision,
  lng double precision,
  plan text not null default 'starter' check (plan in ('starter', 'growth', 'pro')),
  stripe_customer_id text,
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  name text not null,
  email text not null,
  stripe_customer_id text,
  stripe_subscription_id text,
  status text not null default 'active' check (status in ('active', 'cancelled')),
  created_at timestamptz not null default now(),
  unique (gym_id, email)
);

create table if not exists visits (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  gym_id uuid not null references gyms(id) on delete cascade,
  visited_at timestamptz not null default now()
);

create table if not exists tiers (
  id uuid primary key default gen_random_uuid(),
  gym_id uuid not null references gyms(id) on delete cascade,
  name text not null,
  min_visits integer not null,
  max_visits integer,
  price_chf numeric(10, 2) not null
);

create table if not exists member_tiers (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  gym_id uuid not null references gyms(id) on delete cascade,
  month text not null,
  tier_id uuid not null references tiers(id),
  price_chf numeric(10, 2) not null,
  unique (member_id, month)
);

create index if not exists idx_members_gym_id on members(gym_id);
create index if not exists idx_visits_member_id on visits(member_id);
create index if not exists idx_visits_gym_id on visits(gym_id);
create index if not exists idx_visits_visited_at on visits(visited_at);
create index if not exists idx_tiers_gym_id on tiers(gym_id);
create index if not exists idx_member_tiers_member_id on member_tiers(member_id);
create index if not exists idx_member_tiers_gym_id on member_tiers(gym_id);
