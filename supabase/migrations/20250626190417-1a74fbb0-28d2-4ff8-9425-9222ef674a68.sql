
-- Adicionar políticas RLS para a tabela calculations (segurança)
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seus próprios cálculos
CREATE POLICY "Users can view their own calculations" 
  ON public.calculations 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários criem seus próprios cálculos
CREATE POLICY "Users can create their own calculations" 
  ON public.calculations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários atualizem seus próprios cálculos
CREATE POLICY "Users can update their own calculations" 
  ON public.calculations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários excluam seus próprios cálculos
CREATE POLICY "Users can delete their own calculations" 
  ON public.calculations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_calculations_user_id ON public.calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_calculations_created_at ON public.calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_calculations_calculator_type ON public.calculations(calculator_type);

-- Adicionar políticas RLS para a tabela profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seu próprio perfil
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Política para permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Política para permitir inserção de perfil (para novos usuários)
CREATE POLICY "Users can insert their own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Adicionar políticas RLS para a tabela user_settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas suas próprias configurações
CREATE POLICY "Users can view their own settings" 
  ON public.user_settings 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Política para permitir que usuários atualizem suas próprias configurações
CREATE POLICY "Users can update their own settings" 
  ON public.user_settings 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Política para permitir inserção de configurações (para novos usuários)
CREATE POLICY "Users can insert their own settings" 
  ON public.user_settings 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Criar função para lidar com novos usuários (atualizar a existente se necessário)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Inserir perfil do usuário
  INSERT INTO public.profiles (id, username, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  
  -- Inserir configurações padrão do usuário
  INSERT INTO public.user_settings (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
