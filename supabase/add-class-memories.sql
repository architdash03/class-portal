-- Run this once in the Supabase SQL Editor.
-- It adds class memories. Photo files are NOT stored here — only the link text.

create table if not exists class_memories (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  description text not null default '',
  event_date date,
  sort_order int not null default 0,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists memory_photos (
  id uuid primary key default uuid_generate_v4(),
  memory_id uuid references class_memories(id) on delete cascade,
  image_url text not null,
  caption text not null default '',
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_class_memories_class on class_memories(class_id, event_date);
create index if not exists idx_memory_photos_memory on memory_photos(memory_id, sort_order);

alter table class_memories enable row level security;
alter table memory_photos enable row level security;

drop policy if exists "Class members can read memories" on class_memories;
drop policy if exists "Admins insert memories" on class_memories;
drop policy if exists "Admins update memories" on class_memories;
drop policy if exists "Admins delete memories" on class_memories;
drop policy if exists "Class members can read memory photos" on memory_photos;
drop policy if exists "Admins insert memory photos" on memory_photos;
drop policy if exists "Admins update memory photos" on memory_photos;
drop policy if exists "Admins delete memory photos" on memory_photos;

create policy "Class members can read memories" on class_memories
  for select using (class_id = my_class_id() or is_admin());
create policy "Admins insert memories" on class_memories
  for insert with check (is_admin() and class_id = my_class_id());
create policy "Admins update memories" on class_memories
  for update using (is_admin() and class_id = my_class_id()) with check (is_admin());
create policy "Admins delete memories" on class_memories
  for delete using (is_admin() and class_id = my_class_id());

create policy "Class members can read memory photos" on memory_photos
  for select using (
    exists (
      select 1 from class_memories m
      where m.id = memory_id and (m.class_id = my_class_id() or is_admin())
    )
  );
create policy "Admins insert memory photos" on memory_photos
  for insert with check (
    is_admin() and exists (
      select 1 from class_memories m
      where m.id = memory_id and m.class_id = my_class_id()
    )
  );
create policy "Admins update memory photos" on memory_photos
  for update using (
    is_admin() and exists (
      select 1 from class_memories m
      where m.id = memory_id and m.class_id = my_class_id()
    )
  ) with check (is_admin());
create policy "Admins delete memory photos" on memory_photos
  for delete using (
    is_admin() and exists (
      select 1 from class_memories m
      where m.id = memory_id and m.class_id = my_class_id()
    )
  );

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
