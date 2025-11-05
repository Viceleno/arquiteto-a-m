-- Fix SECURITY DEFINER view issue by dropping the analytics_summary view
-- The view bypasses RLS policies, which is a security concern
-- Admins should query analytics_events table directly, which has proper RLS policies

DROP VIEW IF EXISTS public.analytics_summary;

-- Remove the grant that was given to the view
-- (This will automatically be removed when the view is dropped, but explicit for clarity)