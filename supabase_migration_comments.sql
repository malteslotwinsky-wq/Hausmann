-- Task Comments table migration
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create task_comments table
CREATE TABLE IF NOT EXISTS public.task_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES public.users(id),
    content TEXT NOT NULL,
    visibility TEXT NOT NULL DEFAULT 'internal' CHECK (visibility IN ('internal', 'client')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_author_id ON public.task_comments(author_id);

-- RLS Policies
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read comments
CREATE POLICY "task_comments_select_policy" ON public.task_comments
    FOR SELECT USING (true);

-- Allow authenticated users to insert comments
CREATE POLICY "task_comments_insert_policy" ON public.task_comments
    FOR INSERT WITH CHECK (true);
