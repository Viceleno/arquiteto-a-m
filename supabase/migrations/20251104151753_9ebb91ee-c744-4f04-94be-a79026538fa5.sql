-- 1. Create enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- 3. Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- 5. Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 6. Create analytics_events table
CREATE TABLE public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  event_data jsonb,
  page_path text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 7. Create indexes for analytics_events
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

-- 8. Enable RLS on analytics_events
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- 9. RLS policies for analytics_events
CREATE POLICY "Users can insert their own analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can view their own analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- 10. Create analytics_summary view
CREATE OR REPLACE VIEW public.analytics_summary AS
SELECT 
  event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE(created_at) as event_date
FROM public.analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY event_name, DATE(created_at)
ORDER BY event_date DESC, event_count DESC;

-- 11. Grant access to the view
GRANT SELECT ON public.analytics_summary TO authenticated;