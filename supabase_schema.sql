-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. Organizations Table (New for SaaS Multi-tenancy)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL, -- for subdomain or path routing e.g., app.com/hausmann
    logo_url TEXT,
    primary_color TEXT DEFAULT '#1E3A5F', -- Customizable branding
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1. Users Table (Mirroring NextAuth users for simplicity, or connecting to Supabase Auth)
-- Note: For this demo, we store users directly to match our existing logic. 
-- In production, you might sync with auth.users.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id), -- Multi-tenancy link
  email TEXT UNIQUE NOT NULL,
  password TEXT, -- In real app, rely on Auth provider. Here we store hashed from NextAuth demo.
  name TEXT,
  role TEXT CHECK (role IN ('architect', 'contractor', 'client', 'admin')), -- added admin for consistency
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES public.organizations(id), -- Multi-tenancy link
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE,
  target_end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  client_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Trades (Gewerke) Table
CREATE TABLE IF NOT EXISTS public.trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contractor_id UUID REFERENCES public.users(id),
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  progress INTEGER DEFAULT 0,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES public.users(id),
  recipient_id UUID REFERENCES public.users(id),
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- POLICIES (Simplified for specific demo context, but Structure is ready for SaaS)
-- In a real SaaS, these would restrict based on auth.uid() -> user.organization_id

-- Organizations: users can read their own org
CREATE POLICY "Enable read for users of org" ON public.organizations FOR SELECT USING (true); -- Placeholder for org check

-- Users: users can read users in their org
CREATE POLICY "Enable read for same org" ON public.users FOR SELECT USING (true); -- Placeholder for org logic

-- Projects: users can read projects in their org
CREATE POLICY "Enable read for same org projects" ON public.projects FOR SELECT USING (true); -- Placeholder

-- Trades: access via project
CREATE POLICY "Enable read for same org trades" ON public.trades FOR SELECT USING (true); -- Placeholder

-- Messages: access via sender/recipient
CREATE POLICY "Enable read for own messages" ON public.messages FOR SELECT USING (true); -- Placeholder

-- SEED DATA (Hausmann Construction as default tenant)
INSERT INTO public.organizations (id, name, slug, primary_color) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Hausmann Bau', 'hausmann', '#1E3A5F')
ON CONFLICT DO NOTHING;

