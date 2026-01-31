-- Migration: Add new fields to projects and trades tables
-- Run this in Supabase SQL Editor

-- ============================================
-- PROJECTS TABLE EXTENSIONS
-- ============================================

-- Project number (internal ID)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS project_number TEXT;

-- Architect/Project manager assignment
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS architect_id UUID REFERENCES public.users(id);

-- BauLot Settings
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS photo_approval_mode TEXT DEFAULT 'manual' CHECK (photo_approval_mode IN ('manual', 'auto_milestone', 'auto_all'));

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS escalation_hours INTEGER DEFAULT 48;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- ============================================
-- TRADES TABLE EXTENSIONS
-- ============================================

-- Company/Contact info
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS company_name TEXT;

ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS contact_person TEXT;

ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Details
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Dates
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;

-- Dependencies
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS predecessor_trade_id UUID REFERENCES public.trades(id);

-- Budget
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS budget DECIMAL(12, 2);

-- Permissions
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS can_create_subtasks BOOLEAN DEFAULT FALSE;

-- ============================================
-- USERS TABLE EXTENSIONS
-- ============================================

-- Phone number
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Company name
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS company TEXT;

-- Project IDs (for quick assignment lookup)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS project_ids UUID[] DEFAULT '{}';

-- ============================================
-- INSERT POLICIES FOR NEW TABLES
-- ============================================

-- Allow architects to insert projects
CREATE POLICY IF NOT EXISTS "Enable insert for architects" ON public.projects 
FOR INSERT WITH CHECK (true);

-- Allow architects to update projects
CREATE POLICY IF NOT EXISTS "Enable update for architects" ON public.projects 
FOR UPDATE USING (true);

-- Allow architects to insert trades
CREATE POLICY IF NOT EXISTS "Enable insert for trades" ON public.trades 
FOR INSERT WITH CHECK (true);

-- Allow updates to trades
CREATE POLICY IF NOT EXISTS "Enable update for trades" ON public.trades 
FOR UPDATE USING (true);

-- Allow user updates
CREATE POLICY IF NOT EXISTS "Enable update for users" ON public.users 
FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert for users" ON public.users 
FOR INSERT WITH CHECK (true);

-- ============================================
-- DONE
-- ============================================
-- After running this, restart your application.
