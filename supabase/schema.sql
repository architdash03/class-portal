-- ============================================================
-- CLASS PORTAL — FULL DATABASE SCHEMA + ROW LEVEL SECURITY
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run
-- ============================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "uuid-ossp";

-- ---------- CLASSES ----------
create table if not exists classes (
  id uuid primary key default uuid_generate_v4(),
  class_name text not null,
  department text,
  year text,
  section text,
  created_at timestamptz default now()
);

-- ---------- PROFILES (one row per user, linked to Supabase Auth) ----------
create table if not exists profiles (
  id uuid primary key default uuid_generate_v4(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null,
  student_id text unique,
  email text,
  role text not null check (role in ('student', 'content_admin', 'head_admin')),
  class_id uuid references classes(id) on delete set null,
  is_active boolean not null default true,
  must_change_password boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- SUBJECTS ----------
create table if not exists subjects (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  name text not null,
  code text,
  teacher_name text,
  created_at timestamptz default now()
);

-- ---------- ANNOUNCEMENTS ----------
create table if not exists announcements (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  title text not null,
  description text not null,
  priority text not null default 'normal' check (priority in ('normal', 'important', 'urgent')),
  attachment_url text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists announcement_reads (
  id uuid primary key default uuid_generate_v4(),
  announcement_id uuid references announcements(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  read_at timestamptz default now(),
  unique (announcement_id, student_id)
);

-- ---------- ASSIGNMENTS ----------
create table if not exists assignments (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  description text,
  assigned_date date not null default current_date,
  due_date date not null,
  reminder_date date,
  submission_instructions text,
  attachment_url text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists assignment_status (
  id uuid primary key default uuid_generate_v4(),
  assignment_id uuid references assignments(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (assignment_id, student_id)
);

-- ---------- HOMEWORK ----------
create table if not exists homework (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  title text not null,
  description text,
  assigned_date date not null default current_date,
  due_date date not null,
  reminder_date date,
  attachment_url text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists homework_status (
  id uuid primary key default uuid_generate_v4(),
  homework_id uuid references homework(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (homework_id, student_id)
);

-- ---------- CLASS UPDATES ("What Was Taught") ----------
create table if not exists class_updates (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  topic text not null,
  description text,
  teacher_name text,
  taught_date date not null default current_date,
  attachment_url text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- EXAMS ----------
create table if not exists exams (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  exam_name text not null,
  exam_date date not null,
  exam_time text,
  venue text,
  description text,
  attachment_url text,
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ---------- ATTENDANCE ----------
create table if not exists attendance (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  subject_id uuid references subjects(id) on delete set null,
  student_id uuid references profiles(id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('present', 'absent', 'leave')),
  marked_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (student_id, subject_id, attendance_date)
);

-- ---------- NOTIFICATIONS ----------
create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  title text not null,
  message text not null,
  notification_type text not null check (notification_type in ('assignment', 'homework', 'exam', 'announcement', 'general')),
  related_id uuid,
  is_read boolean not null default false,
  created_at timestamptz default now()
);

-- ---------- NOTIFICATION PREFERENCES ----------
create table if not exists notification_preferences (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid references profiles(id) on delete cascade unique,
  assignment_reminders boolean not null default true,
  homework_reminders boolean not null default true,
  exam_reminders boolean not null default true,
  announcement_notifications boolean not null default true,
  browser_notifications boolean not null default false,
  updated_at timestamptz default now()
);

-- ---------- CLASS SETTINGS ----------
create table if not exists class_settings (
  id uuid primary key default uuid_generate_v4(),
  class_id uuid references classes(id) on delete cascade unique,
  website_name text not null default 'Class Portal',
  class_description text,
  whatsapp_group_url text,
  whatsapp_channel_url text,
  updated_at timestamptz default now()
);

-- ---------- CLASS INFORMATION (editable notes shown to the class) ----------
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

-- ---------- CLASS MEMORIES (text only; photo files live outside Supabase) ----------
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

-- ---------- INDEXES ----------
create index if not exists idx_profiles_class on profiles(class_id);
create index if not exists idx_subjects_class on subjects(class_id);
create index if not exists idx_announcements_class on announcements(class_id);
create index if not exists idx_assignments_class on assignments(class_id);
create index if not exists idx_assignment_status_student on assignment_status(student_id);
create index if not exists idx_homework_class on homework(class_id);
create index if not exists idx_homework_status_student on homework_status(student_id);
create index if not exists idx_class_updates_class_date on class_updates(class_id, taught_date);
create index if not exists idx_exams_class_date on exams(class_id, exam_date);
create index if not exists idx_attendance_student on attendance(student_id, attendance_date);
create index if not exists idx_notifications_student on notifications(student_id, is_read);
create index if not exists idx_class_information_class on class_information(class_id, sort_order);
create index if not exists idx_class_memories_class on class_memories(class_id, event_date);
create index if not exists idx_memory_photos_memory on memory_photos(memory_id, sort_order);

-- ============================================================
-- HELPER FUNCTION: get the role & class of the currently logged in user
-- (SECURITY DEFINER so it can read profiles even though RLS is on)
-- ============================================================
create or replace function auth_profile()
returns table (profile_id uuid, role text, class_id uuid, is_active boolean)
language sql
security definer
set search_path = public
as $$
  select id, role, class_id, is_active from profiles where auth_user_id = auth.uid();
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where auth_user_id = auth.uid()
    and role in ('content_admin', 'head_admin')
    and is_active = true
  );
$$;

create or replace function is_head_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where auth_user_id = auth.uid()
    and role = 'head_admin'
    and is_active = true
  );
$$;

create or replace function my_profile_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from profiles where auth_user_id = auth.uid();
$$;

create or replace function my_class_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select class_id from profiles where auth_user_id = auth.uid();
$$;

-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================
alter table classes enable row level security;
alter table profiles enable row level security;
alter table subjects enable row level security;
alter table announcements enable row level security;
alter table announcement_reads enable row level security;
alter table assignments enable row level security;
alter table assignment_status enable row level security;
alter table homework enable row level security;
alter table homework_status enable row level security;
alter table class_updates enable row level security;
alter table exams enable row level security;
alter table attendance enable row level security;
alter table notifications enable row level security;
alter table notification_preferences enable row level security;
alter table class_settings enable row level security;
alter table class_information enable row level security;
alter table class_memories enable row level security;
alter table memory_photos enable row level security;

-- Drop existing policies so this file can be run again on a project
-- that already has them (a second Run used to stop with error 42710).
do $$
declare r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
  loop
    execute format('drop policy if exists %I on public.%I', r.policyname, r.tablename);
  end loop;
end $$;

-- ---------- CLASSES ----------
create policy "Anyone logged in can read their own class" on classes
  for select using (id = my_class_id() or is_admin());
create policy "Only head admin can modify classes" on classes
  for all using (is_head_admin()) with check (is_head_admin());

-- ---------- PROFILES ----------
create policy "Users can read their own profile" on profiles
  for select using (auth_user_id = auth.uid());
create policy "Admins can read profiles in their class" on profiles
  for select using (is_admin() and class_id = my_class_id());
create policy "Only head admin can insert profiles" on profiles
  for insert with check (is_head_admin());
create policy "Only head admin can delete profiles" on profiles
  for delete using (is_head_admin());
create policy "Only head admin can update any profile" on profiles
  for update using (is_head_admin()) with check (is_head_admin());
create policy "Students can update their own row (guarded by trigger)" on profiles
  for update using (auth_user_id = auth.uid()) with check (auth_user_id = auth.uid());

-- A student's own UPDATE is only ever allowed to change must_change_password
-- (used to clear the "please set a new password" flag after first login).
-- Every other column is silently reset back to its old value if a non-head-admin
-- tries to change it — this closes off role/class/ID tampering even though the
-- RLS policy above lets the request through at the row level.
create or replace function protect_profile_columns()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_head_admin() then
    new.role := old.role;
    new.class_id := old.class_id;
    new.student_id := old.student_id;
    new.is_active := old.is_active;
    new.auth_user_id := old.auth_user_id;
    new.full_name := old.full_name;
    new.email := old.email;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_columns on profiles;
create trigger trg_protect_profile_columns
  before update on profiles
  for each row execute function protect_profile_columns();

-- ---------- SUBJECTS ----------
create policy "Class members can read subjects" on subjects
  for select using (class_id = my_class_id() or is_admin());
create policy "Head admin manages subjects" on subjects
  for insert with check (is_head_admin());
create policy "Head admin updates subjects" on subjects
  for update using (is_head_admin()) with check (is_head_admin());
create policy "Head admin deletes subjects" on subjects
  for delete using (is_head_admin());

-- ---------- ANNOUNCEMENTS ----------
create policy "Class members can read announcements" on announcements
  for select using (class_id = my_class_id() or is_admin());
create policy "Admins insert announcements" on announcements
  for insert with check (is_admin() and class_id = my_class_id());
create policy "Admins update announcements" on announcements
  for update using (is_admin() and class_id = my_class_id()) with check (is_admin());
create policy "Admins delete announcements" on announcements
  for delete using (is_admin() and class_id = my_class_id());

create policy "Students manage their own read receipts" on announcement_reads
  for all using (student_id = my_profile_id()) with check (student_id = my_profile_id());
create policy "Admins can view read receipts" on announcement_reads
  for select using (is_admin());

-- ---------- ASSIGNMENTS ----------
create policy "Class members can read assignments" on assignments
  for select using (class_id = my_class_id() or is_admin());
create policy "Admins insert assignments" on assignments
  for insert with check (is_admin() and class_id = my_class_id());
create policy "Admins update assignments" on assignments
  for update using (is_admin() and class_id = my_class_id()) with check (is_admin());
create policy "Admins delete assignments" on assignments
  for delete using (is_admin() and class_id = my_class_id());

create policy "Students read own assignment status" on assignment_status
  for select using (student_id = my_profile_id() or is_admin());
create policy "Students insert own assignment status" on assignment_status
  for insert with check (student_id = my_profile_id());
create policy "Students update own assignment status" on assignment_status
  for update using (student_id = my_profile_id()) with check (student_id = my_profile_id());

-- ---------- HOMEWORK ----------
create policy "Class members can read homework" on homework
  for select using (class_id = my_class_id() or is_admin());
create policy "Admins insert homework" on homework
  for insert with check (is_admin() and class_id = my_class_id());
create policy "Admins update homework" on homework
  for update using (is_admin() and class_id = my_class_id()) with check (is_admin());
create policy "Admins delete homework" on homework
  for delete using (is_admin() and class_id = my_class_id());

create policy "Students read own homework status" on homework_status
  for select using (student_id = my_profile_id() or is_admin());
create policy "Students insert own homework status" on homework_status
  for insert with check (student_id = my_profile_id());
create policy "Students update own homework status" on homework_status
  for update using (student_id = my_profile_id()) with check (student_id = my_profile_id());

-- ---------- CLASS UPDATES ----------
create policy "Class members can read class updates" on class_updates
  for select using (class_id = my_class_id() or is_admin());
create policy "Admins insert class updates" on class_updates
  for insert with check (is_admin() and class_id = my_class_id());
create policy "Admins update class updates" on class_updates
  for update using (is_admin() and class_id = my_class_id()) with check (is_admin());
create policy "Admins delete class updates" on class_updates
  for delete using (is_admin() and class_id = my_class_id());

-- ---------- EXAMS ----------
create policy "Class members can read exams" on exams
  for select using (class_id = my_class_id() or is_admin());
create policy "Admins insert exams" on exams
  for insert with check (is_admin() and class_id = my_class_id());
create policy "Admins update exams" on exams
  for update using (is_admin() and class_id = my_class_id()) with check (is_admin());
create policy "Admins delete exams" on exams
  for delete using (is_admin() and class_id = my_class_id());

-- ---------- ATTENDANCE ----------
create policy "Students read own attendance" on attendance
  for select using (student_id = my_profile_id() or is_admin());
create policy "Admins insert attendance" on attendance
  for insert with check (is_admin() and class_id = my_class_id());
create policy "Admins update attendance" on attendance
  for update using (is_admin() and class_id = my_class_id()) with check (is_admin());
create policy "Admins delete attendance" on attendance
  for delete using (is_admin() and class_id = my_class_id());

-- ---------- NOTIFICATIONS ----------
create policy "Students read own notifications" on notifications
  for select using (student_id = my_profile_id() or is_admin());
create policy "Students update own notifications (mark read)" on notifications
  for update using (student_id = my_profile_id()) with check (student_id = my_profile_id());
create policy "Admins insert notifications" on notifications
  for insert with check (is_admin() and class_id = my_class_id());
create policy "Admins delete notifications" on notifications
  for delete using (is_admin());

-- ---------- NOTIFICATION PREFERENCES ----------
create policy "Students manage own notification preferences" on notification_preferences
  for all using (student_id = my_profile_id()) with check (student_id = my_profile_id());

-- ---------- CLASS SETTINGS ----------
create policy "Class members can read class settings" on class_settings
  for select using (class_id = my_class_id() or is_admin());
create policy "Head admin manages class settings" on class_settings
  for insert with check (is_head_admin());
create policy "Head admin updates class settings" on class_settings
  for update using (is_head_admin()) with check (is_head_admin());

-- ---------- CLASS INFORMATION ----------
create policy "Class members can read class information" on class_information
  for select using (class_id = my_class_id() or is_admin());
create policy "Admins insert class information" on class_information
  for insert with check (is_admin() and class_id = my_class_id());
create policy "Admins update class information" on class_information
  for update using (is_admin() and class_id = my_class_id()) with check (is_admin());
create policy "Admins delete class information" on class_information
  for delete using (is_admin() and class_id = my_class_id());

-- ---------- CLASS MEMORIES ----------
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

-- ============================================================
-- AUTO-NOTIFICATIONS: new announcement -> notify every active student
-- ============================================================
create or replace function notify_new_announcement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into notifications (class_id, student_id, title, message, notification_type, related_id)
  select
    new.class_id,
    p.id,
    case new.priority
      when 'urgent' then 'Urgent: ' || new.title
      when 'important' then 'Important: ' || new.title
      else new.title
    end,
    left(new.description, 200),
    'announcement',
    new.id
  from profiles p
  left join notification_preferences np on np.student_id = p.id
  where p.class_id = new.class_id
    and p.role = 'student'
    and p.is_active = true
    and coalesce(np.announcement_notifications, true) = true;
  return new;
end;
$$;

drop trigger if exists trg_notify_new_announcement on announcements;
create trigger trg_notify_new_announcement
  after insert on announcements
  for each row execute function notify_new_announcement();

-- ============================================================
-- SEED DATA (safe to run once — creates one class + settings row)
-- ============================================================
insert into classes (class_name, department, year, section)
select 'B.Tech CSE', 'Computer Science', '2nd Year', 'A'
where not exists (select 1 from classes);

insert into class_settings (class_id, website_name)
select id, 'Class Portal' from classes
where not exists (select 1 from class_settings);

-- Logged-in users need table privileges as well as RLS policies.
grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- ============================================================
-- DONE. Next: create your Head Admin account (see README.md)
-- ============================================================
