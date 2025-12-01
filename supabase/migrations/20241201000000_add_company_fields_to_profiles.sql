-- Adicionar campos corporativos à tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS registro_profissional text,
ADD COLUMN IF NOT EXISTS razao_social text,
ADD COLUMN IF NOT EXISTS endereco_comercial text,
ADD COLUMN IF NOT EXISTS telefone_comercial text,
ADD COLUMN IF NOT EXISTS site_portfolio text,
ADD COLUMN IF NOT EXISTS logo_url text;

