-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table (Mirroring NextAuth users for simplicity, or connecting to Supabase Auth)
-- Note: For this demo, we store users directly to match our existing logic. 
-- In production, you might sync with auth.users.
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password TEXT, -- In real app, rely on Auth provider. Here we store hashed from NextAuth demo.
  name TEXT,
  role TEXT CHECK (role IN ('architect', 'contractor', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  avatar_url TEXT
);

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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

-- Enable Row Level Security (RLS) - Optional for now but recommended
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Simple Policies (Open for Demo, restrict in Production)
CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.users FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.projects FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.trades FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.trades FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.trades FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON public.messages FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.messages FOR UPDATE USING (true);
