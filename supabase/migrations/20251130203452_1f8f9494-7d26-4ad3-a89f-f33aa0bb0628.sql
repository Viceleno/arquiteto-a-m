-- Corrigir search_path da função
CREATE OR REPLACE FUNCTION public.update_material_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;