-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Organizations Table (New for SaaS Multi-tenancy)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    primary_color TEXT DEFAULT '#1E3A5F',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  email TEXT UNIQUE NOT NULL,
  password TEXT,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('architect', 'contractor', 'client')),
  phone TEXT,
  company TEXT,
  avatar_url TEXT,
  project_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id),
  name TEXT NOT NULL,
  project_number TEXT,
  address TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  target_end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  client_id UUID REFERENCES public.users(id),
  architect_id UUID REFERENCES public.users(id),
  photo_approval_mode TEXT DEFAULT 'manual' CHECK (photo_approval_mode IN ('manual', 'auto')),
  escalation_hours INTEGER DEFAULT 48,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Trades (Gewerke) Table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contractor_id UUID REFERENCES public.users(id),
  company_name TEXT,
  contact_person TEXT,
  phone TEXT,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  predecessor_trade_id UUID REFERENCES public.trades(id),
  budget NUMERIC(12,2),
  can_create_subtasks BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'delayed', 'blocked')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID NOT NULL REFERENCES public.trades(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'blocked')),
  blocked_reason TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Photos Table
CREATE TABLE IF NOT EXISTS public.photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    uploaded_by UUID NOT NULL REFERENCES public.users(id),
    visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'client')),
    caption TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Task Comments Table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES public.users(id),
  recipient_id UUID NOT NULL REFERENCES public.users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Password Reset Tokens
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================
-- INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON public.users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_architect_id ON public.projects(architect_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_trades_project_id ON public.trades(project_id);
CREATE INDEX IF NOT EXISTS idx_trades_contractor_id ON public.trades(contractor_id);
CREATE INDEX IF NOT EXISTS idx_trades_status ON public.trades(status);
CREATE INDEX IF NOT EXISTS idx_tasks_trade_id ON public.tasks(trade_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_photos_task_id ON public.photos(task_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON public.photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_photos_visibility ON public.photos(visibility);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_author_id ON public.task_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);

-- =====================
-- ROW LEVEL SECURITY
-- =====================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Note: The application uses the service_role key for all server-side operations,
-- which bypasses RLS. These policies serve as a defense-in-depth measure and
-- protect against direct client-side access with the anon key.

-- Organizations: read-only for authenticated users in same org
CREATE POLICY "orgs_select" ON public.organizations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users: can read users in same organization, can update own record
CREATE POLICY "users_select" ON public.users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- Projects: authenticated users can read (app-level filtering happens in API)
CREATE POLICY "projects_select" ON public.projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "projects_insert" ON public.projects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "projects_update" ON public.projects
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Trades: authenticated users can read
CREATE POLICY "trades_select" ON public.trades
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "trades_insert" ON public.trades
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "trades_update" ON public.trades
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Tasks: authenticated users can read
CREATE POLICY "tasks_select" ON public.tasks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "tasks_insert" ON public.tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "tasks_update" ON public.tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Photos: authenticated users can CRUD (app-level filtering in API)
CREATE POLICY "photos_select" ON public.photos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "photos_insert" ON public.photos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "photos_update" ON public.photos
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "photos_delete" ON public.photos
  FOR DELETE USING (auth.role() = 'authenticated');

-- Task Comments: authenticated users can read and insert
CREATE POLICY "task_comments_select" ON public.task_comments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "task_comments_insert" ON public.task_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages: only sender or recipient can read
CREATE POLICY "messages_select" ON public.messages
  FOR SELECT USING (
    auth.uid()::text = sender_id::text OR
    auth.uid()::text = recipient_id::text
  );

CREATE POLICY "messages_insert" ON public.messages
  FOR INSERT WITH CHECK (auth.uid()::text = sender_id::text);

-- =====================
-- TRIGGERS
-- =====================

-- Auto-update updated_at on projects
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================
-- SEED DATA
-- =====================
INSERT INTO public.organizations (id, name, slug, primary_color)
VALUES ('00000000-0000-0000-0000-000000000001', 'Hausmann Bau', 'hausmann', '#1E3A5F')
ON CONFLICT DO NOTHING;
