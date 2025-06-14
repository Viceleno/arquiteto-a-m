
-- Adicionar colunas faltantes na tabela user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS default_margin integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS auto_save_calculations boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS decimal_places integer DEFAULT 2,
ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS push_notifications boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS calculation_reminders boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS share_calculations boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS data_analytics boolean DEFAULT true;

-- Adicionar colunas faltantes na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio text,
ADD COLUMN IF NOT EXISTS company text;
