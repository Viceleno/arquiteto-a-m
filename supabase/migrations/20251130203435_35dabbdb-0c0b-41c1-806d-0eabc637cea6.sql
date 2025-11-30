-- Criar tabela para preços de materiais
CREATE TABLE public.material_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  material_key TEXT NOT NULL,
  composition_index INTEGER NOT NULL,
  composition_name TEXT NOT NULL,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(material_key, composition_index, user_id)
);

-- Índices para performance
CREATE INDEX idx_material_prices_user ON public.material_prices(user_id);
CREATE INDEX idx_material_prices_material ON public.material_prices(material_key);

-- Enable RLS
ALTER TABLE public.material_prices ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own prices"
ON public.material_prices
FOR SELECT
USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert their own prices"
ON public.material_prices
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prices"
ON public.material_prices
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prices"
ON public.material_prices
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_material_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_material_prices_timestamp
BEFORE UPDATE ON public.material_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_material_prices_updated_at();