-- Fix 1: Add public SELECT policy for shared_calculations
-- This allows public access to shared calculations via share_token
CREATE POLICY "Public can view active shared calculations"
ON public.shared_calculations
FOR SELECT
USING (
  is_active = true 
  AND (expires_at IS NULL OR expires_at > now())
);

-- Fix 2: Recreate SECURITY DEFINER functions with fixed search_path
-- This prevents SQL injection via search path manipulation

-- Recreate get_current_profile with search_path
DROP FUNCTION IF EXISTS public.get_current_profile();
CREATE OR REPLACE FUNCTION public.get_current_profile()
RETURNS profiles
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT *
  FROM public.profiles
  WHERE id = auth.uid()
$function$;

-- Recreate get_shared_calculation with search_path
DROP FUNCTION IF EXISTS public.get_shared_calculation(uuid);
CREATE OR REPLACE FUNCTION public.get_shared_calculation(token uuid)
RETURNS TABLE(
  calculation_id uuid,
  calculator_type text,
  name text,
  input_data jsonb,
  result jsonb,
  created_at timestamp with time zone,
  share_expires_at timestamp with time zone,
  is_active boolean
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    c.id,
    c.calculator_type,
    c.name,
    c.input_data,
    c.result,
    c.created_at,
    sc.expires_at,
    sc.is_active
  FROM public.calculations c
  JOIN public.shared_calculations sc ON c.id = sc.calculation_id
  WHERE sc.share_token = token 
    AND sc.is_active = true 
    AND (sc.expires_at IS NULL OR sc.expires_at > now());
$function$;

-- Recreate increment_share_view_count with search_path
DROP FUNCTION IF EXISTS public.increment_share_view_count(uuid);
CREATE OR REPLACE FUNCTION public.increment_share_view_count(token uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  UPDATE public.shared_calculations 
  SET view_count = view_count + 1 
  WHERE share_token = token AND is_active = true;
$function$;

-- Fix 3: Remove duplicate RLS policies
-- Keep the more descriptive versions, remove shorter duplicates

-- user_settings: Remove shorter versions
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can read own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;

-- profiles: Remove shorter versions
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- calculations: Remove shorter versions
DROP POLICY IF EXISTS "Users can insert own calculations" ON public.calculations;
DROP POLICY IF EXISTS "Users can read own calculations" ON public.calculations;
DROP POLICY IF EXISTS "Users can update own calculations" ON public.calculations;
DROP POLICY IF EXISTS "Users can delete own calculations" ON public.calculations;