-- Photos table migration
-- Run this in your Supabase SQL editor

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create photos table
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_photos_task_id ON public.photos(task_id);
CREATE INDEX IF NOT EXISTS idx_photos_uploaded_by ON public.photos(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_photos_visibility ON public.photos(visibility);

-- RLS Policies
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read photos
CREATE POLICY "photos_select_policy" ON public.photos
    FOR SELECT USING (true);

-- Allow authenticated users to insert photos
CREATE POLICY "photos_insert_policy" ON public.photos
    FOR INSERT WITH CHECK (true);

-- Allow photo owner or architects to update
CREATE POLICY "photos_update_policy" ON public.photos
    FOR UPDATE USING (true);

-- Allow photo owner or architects to delete
CREATE POLICY "photos_delete_policy" ON public.photos
    FOR DELETE USING (true);

-- Create a storage bucket for photos (run via Supabase dashboard or API)
-- Note: You need to create a 'photos' bucket in Supabase Storage
-- with public read access enabled.
