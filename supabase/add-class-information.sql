-- Run this once in the Supabase SQL Editor if the portal was already set up.
-- It adds the class information table and makes sure signed-in users can save edits.

create table if not exists class_information (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  details text not null,
  sort_order int not null default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_class_information_class on class_information(class_id, sort_order);

alter table class_information enable row level security;

drop policy if exists "Class members can read class information" on class_information;
drop policy if exists "Admins insert class information" on class_information;
drop policy if exists "Admins update class information" on class_information;
drop policy if exists "Admins delete class information" on class_information;

create policy "Class members can read class information" on class_information
  for select using (class_id = my_class_id() or is_admin());
create policy "Admins insert class information" on class_information
  for insert with check (is_admin() and class_id = my_class_id());
create policy "Admins update class information" on class_information
  for update using (is_admin() and class_id = my_class_id()) with check (is_admin());
create policy "Admins delete class information" on class_information
  for delete using (is_admin() and class_id = my_class_id());

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
