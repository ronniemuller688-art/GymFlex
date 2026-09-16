-- Adds monthly/yearly billing plan selection to members.

alter table members
  add column if not exists plan_type text not null default 'monthly'
    check (plan_type in ('monthly', 'yearly'));
