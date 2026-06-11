-- ============================================================
-- Exit Exam Ethiopia - Supabase Database Schema
-- ============================================================

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ─── Profiles ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid references auth.users on delete cascade primary key,
  full_name    text not null,
  email        text unique not null,
  phone        text,
  avatar_url   text,
  university   text,
  department   text,
  year_of_study integer check (year_of_study between 1 and 6),
  gpa          numeric(3,2) check (gpa between 0 and 4),
  role         text not null default 'student' check (role in ('student', 'admin', 'instructor')),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- RLS policies for profiles
alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- ─── Departments ─────────────────────────────────────────────────────────────
create table if not exists public.departments (
  id           uuid default uuid_generate_v4() primary key,
  name         text not null unique,
  faculty      text not null,
  description  text,
  icon         text,
  created_at   timestamptz not null default now()
);

-- Public read access to departments
alter table public.departments enable row level security;
create policy "Anyone can read departments"
  on public.departments for select
  using (true);

-- ─── Exams ───────────────────────────────────────────────────────────────────
create table if not exists public.exams (
  id               uuid default uuid_generate_v4() primary key,
  department_id    uuid references public.departments(id) on delete cascade not null,
  title            text not null,
  year             integer not null,
  duration_minutes integer not null default 180,
  total_questions  integer not null,
  total_marks      integer not null,
  difficulty       text not null default 'Medium' check (difficulty in ('Easy', 'Medium', 'Hard')),
  description      text,
  is_published     boolean not null default false,
  created_by       uuid references auth.users(id),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.exams enable row level security;
create policy "Anyone can read published exams"
  on public.exams for select
  using (is_published = true);

-- ─── Questions ───────────────────────────────────────────────────────────────
create table if not exists public.questions (
  id           uuid default uuid_generate_v4() primary key,
  exam_id      uuid references public.exams(id) on delete cascade not null,
  question     text not null,
  option_a     text not null,
  option_b     text not null,
  option_c     text not null,
  option_d     text not null,
  correct      text not null check (correct in ('A', 'B', 'C', 'D')),
  explanation  text,
  marks        integer not null default 1,
  order_num    integer,
  created_at   timestamptz not null default now()
);

alter table public.questions enable row level security;
create policy "Anyone can read questions for published exams"
  on public.questions for select
  using (
    exists (
      select 1 from public.exams
      where exams.id = questions.exam_id
        and exams.is_published = true
    )
  );

-- ─── Exam Attempts ───────────────────────────────────────────────────────────
create table if not exists public.exam_attempts (
  id                   uuid default uuid_generate_v4() primary key,
  user_id              uuid references auth.users(id) on delete cascade not null,
  exam_id              uuid references public.exams(id) on delete cascade not null,
  score                numeric(5,2) not null default 0,
  total_marks          integer not null,
  time_taken_seconds   integer,
  answers              jsonb,
  completed_at         timestamptz not null default now()
);

alter table public.exam_attempts enable row level security;
create policy "Users can view their own attempts"
  on public.exam_attempts for select
  using (auth.uid() = user_id);

create policy "Users can insert their own attempts"
  on public.exam_attempts for insert
  with check (auth.uid() = user_id);

-- ─── Notifications ───────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  title      text not null,
  message    text not null,
  type       text not null default 'info' check (type in ('info', 'success', 'warning', 'error')),
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
create policy "Users can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

-- ─── Bookmarks ───────────────────────────────────────────────────────────────
create table if not exists public.bookmarks (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  exam_id    uuid references public.exams(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique(user_id, exam_id)
);

alter table public.bookmarks enable row level security;
create policy "Users can manage their own bookmarks"
  on public.bookmarks for all
  using (auth.uid() = user_id);

-- ─── Functions ───────────────────────────────────────────────────────────────

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();

create trigger exams_updated_at
  before update on public.exams
  for each row execute procedure public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'New Student'),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── Sample data ─────────────────────────────────────────────────────────────
insert into public.departments (name, faculty, icon, description) values
  ('Computer Science', 'Engineering', '💻', 'Software, algorithms, and systems'),
  ('Medicine', 'Health Sciences', '🏥', 'Medical sciences and clinical practice'),
  ('Electrical Engineering', 'Engineering', '⚡', 'Electronics and power systems'),
  ('Law', 'Law', '⚖️', 'Legal studies and jurisprudence'),
  ('Accounting', 'Business', '📊', 'Financial accounting and audit'),
  ('Architecture', 'Engineering', '🏛️', 'Building design and urban planning'),
  ('Agriculture', 'Natural Sciences', '🌾', 'Crop science and agronomy'),
  ('Physics', 'Natural Sciences', '⚛️', 'Theoretical and applied physics')
on conflict (name) do nothing;
