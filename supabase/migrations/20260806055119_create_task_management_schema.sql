/*
# Task Management System - Initial Schema

## Overview
Creates a multi-user task management system with profiles, categories, tasks, and notifications.
Each user only sees their own data. Uses Supabase Auth for authentication.

## 1. New Tables

### profiles
- `id` (uuid, PK, references auth.users) - one row per user
- `name` (text) - display name
- `avatar_url` (text) - profile picture URL
- `created_at` (timestamptz) - account creation time

### categories
- `id` (uuid, PK)
- `name` (text, not null) - category label
- `user_id` (uuid, references auth.users) - owner, defaults to auth.uid()
- `created_at` (timestamptz)

### tasks
- `id` (uuid, PK)
- `title` (text, not null)
- `description` (text) - optional long description
- `priority` (text) - 'Low' | 'Medium' | 'High', default 'Medium'
- `status` (text) - 'Pending' | 'In Progress' | 'Completed', default 'Pending'
- `due_date` (timestamptz) - optional due date
- `category_id` (uuid, references categories, nullable) - optional category
- `tags` (text[]) - flexible tag list
- `estimated_time` (integer) - estimated minutes
- `notes` (text) - private notes
- `archived` (boolean, default false) - soft archive flag
- `deleted` (boolean, default false) - soft delete flag
- `pinned` (boolean, default false) - pinned to top
- `favorite` (boolean, default false) - marked favorite
- `completed_at` (timestamptz) - when task was completed (for streaks/charts)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)
- `user_id` (uuid, references auth.users) - owner, defaults to auth.uid()

### notifications
- `id` (uuid, PK)
- `user_id` (uuid, references auth.users) - owner, defaults to auth.uid()
- `type` (text) - notification type
- `message` (text) - human-readable message
- `task_id` (uuid, references tasks, nullable) - related task
- `read` (boolean, default false)
- `created_at` (timestamptz)

## 2. Security (RLS)
- RLS enabled on all tables.
- profiles: users read/update own profile.
- categories, tasks, notifications: owner-scoped CRUD.
- All owner columns default to auth.uid() so inserts omitting user_id succeed.

## 3. Indexes
- tasks(user_id), tasks(status), tasks(priority), tasks(due_date), tasks(category_id)
- categories(user_id), notifications(user_id, read)

## 4. Triggers
- handle_new_user: creates a profiles row when a new auth.users row is inserted.
- tasks_updated_at: maintains updated_at and completed_at on tasks.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_categories" ON categories;
CREATE POLICY "select_own_categories" ON categories FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_categories" ON categories;
CREATE POLICY "insert_own_categories" ON categories FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_categories" ON categories;
CREATE POLICY "update_own_categories" ON categories FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_categories" ON categories;
CREATE POLICY "delete_own_categories" ON categories FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low','Medium','High')),
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending','In Progress','Completed')),
  due_date timestamptz,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  estimated_time integer,
  notes text,
  archived boolean NOT NULL DEFAULT false,
  deleted boolean NOT NULL DEFAULT false,
  pinned boolean NOT NULL DEFAULT false,
  favorite boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  message text NOT NULL,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_notifications" ON notifications;
CREATE POLICY "select_own_notifications" ON notifications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_notifications" ON notifications;
CREATE POLICY "insert_own_notifications" ON notifications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_notifications" ON notifications;
CREATE POLICY "update_own_notifications" ON notifications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_notifications" ON notifications;
CREATE POLICY "delete_own_notifications" ON notifications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);

-- Trigger: create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: maintain tasks.updated_at and completed_at
CREATE OR REPLACE FUNCTION public.tasks_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  IF NEW.status = 'Completed' AND OLD.status <> 'Completed' THEN
    NEW.completed_at = now();
  ELSIF NEW.status <> 'Completed' THEN
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
CREATE TRIGGER trg_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION public.tasks_updated_at();
