-- Row Level Security policies for client-side (anon key) reads.
-- Members/gyms are matched to their Supabase Auth user by email — there is
-- no separate auth_user_id column, so policies compare against the JWT email.

alter table gyms enable row level security;
alter table members enable row level security;
alter table visits enable row level security;
alter table tiers enable row level security;
alter table member_tiers enable row level security;

-- Tier pricing is shown publicly on the onboarding page — safe to expose.
create policy "tiers are publicly readable" on tiers
  for select using (true);

-- Gym name/location is needed by members (check-in, dashboard) and the
-- public tablet display — not sensitive.
create policy "gyms are publicly readable" on gyms
  for select using (true);

-- A member can read only their own row.
create policy "members can read own row" on members
  for select using (email = (auth.jwt() ->> 'email'));

-- A member can read only their own visits.
create policy "members can read own visits" on visits
  for select using (
    member_id in (
      select id from members where email = (auth.jwt() ->> 'email')
    )
  );

-- A member can insert their own visits (check-in flow); server-side token
-- validation happens in the API route before this insert is issued.
create policy "members can insert own visits" on visits
  for insert with check (
    member_id in (
      select id from members where email = (auth.jwt() ->> 'email')
    )
  );

-- A member can read only their own tier history.
create policy "members can read own member_tiers" on member_tiers
  for select using (
    member_id in (
      select id from members where email = (auth.jwt() ->> 'email')
    )
  );

-- A gym admin (matched by gyms.email) can read all members/visits/member_tiers
-- belonging to their own gym, for the admin dashboard.
create policy "gym admins can read own members" on members
  for select using (
    gym_id in (select id from gyms where email = (auth.jwt() ->> 'email'))
  );

create policy "gym admins can read own visits" on visits
  for select using (
    gym_id in (select id from gyms where email = (auth.jwt() ->> 'email'))
  );

create policy "gym admins can read own member_tiers" on member_tiers
  for select using (
    gym_id in (select id from gyms where email = (auth.jwt() ->> 'email'))
  );

-- A gym admin can insert new members (CSV import).
create policy "gym admins can insert members" on members
  for insert with check (
    gym_id in (select id from gyms where email = (auth.jwt() ->> 'email'))
  );
