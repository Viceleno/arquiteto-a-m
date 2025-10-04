-- Add unique index on profiles.email
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_key ON public.profiles(email) WHERE email IS NOT NULL;

-- Insert test data into shared_calculations (using existing calculation)
-- First, let's create a test shared calculation if there are existing calculations
DO $$
DECLARE
  test_calc_id uuid;
  test_user_id uuid;
BEGIN
  -- Get the first calculation and its user
  SELECT id, user_id INTO test_calc_id, test_user_id
  FROM public.calculations
  LIMIT 1;
  
  -- Only insert if we found a calculation
  IF test_calc_id IS NOT NULL THEN
    INSERT INTO public.shared_calculations (
      calculation_id,
      user_id,
      expires_at,
      is_active
    )
    VALUES (
      test_calc_id,
      test_user_id,
      now() + interval '7 days',
      true
    )
    ON CONFLICT DO NOTHING;
  END IF;
END $$;