
-- Criar tabela para links compartilháveis
CREATE TABLE public.shared_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  calculation_id UUID REFERENCES public.calculations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  share_token UUID NOT NULL DEFAULT gen_random_uuid(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_count INTEGER NOT NULL DEFAULT 0,
  UNIQUE(share_token)
);

-- Criar índices para performance
CREATE INDEX idx_shared_calculations_share_token ON public.shared_calculations(share_token);
CREATE INDEX idx_shared_calculations_user_id ON public.shared_calculations(user_id);
CREATE INDEX idx_shared_calculations_calculation_id ON public.shared_calculations(calculation_id);

-- Habilitar RLS
ALTER TABLE public.shared_calculations ENABLE ROW LEVEL SECURITY;

-- Política para que usuários vejam apenas seus próprios compartilhamentos
CREATE POLICY "Users can view their own shared calculations" 
  ON public.shared_calculations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para criar compartilhamentos
CREATE POLICY "Users can create shared calculations" 
  ON public.shared_calculations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para atualizar compartilhamentos
CREATE POLICY "Users can update their own shared calculations" 
  ON public.shared_calculations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para deletar compartilhamentos
CREATE POLICY "Users can delete their own shared calculations" 
  ON public.shared_calculations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Função para visualização pública de cálculos compartilhados (sem autenticação)
CREATE OR REPLACE FUNCTION public.get_shared_calculation(token UUID)
RETURNS TABLE (
  calculation_id UUID,
  calculator_type TEXT,
  name TEXT,
  input_data JSONB,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  share_expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
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
$$;

-- Função para incrementar contador de visualizações
CREATE OR REPLACE FUNCTION public.increment_share_view_count(token UUID)
RETURNS VOID
LANGUAGE SQL
SECURITY DEFINER
AS $$
  UPDATE public.shared_calculations 
  SET view_count = view_count + 1 
  WHERE share_token = token AND is_active = true;
$$;
