-- Adicionar campos de configuração empresarial à tabela user_settings
-- Esta migration adiciona informações para identificação profissional, contato e parâmetros padrão de negócio

ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS cau_crea varchar(50),
ADD COLUMN IF NOT EXISTS professional_phone varchar(20),
ADD COLUMN IF NOT EXISTS business_address text,
ADD COLUMN IF NOT EXISTS default_bdi numeric(5,2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS social_charges numeric(5,2) DEFAULT 88.00,
ADD COLUMN IF NOT EXISTS tech_hour_rate numeric(10,2) DEFAULT 150.00;

-- Comentários para documentação e manutenção
COMMENT ON COLUMN public.user_settings.cau_crea IS 'Registro profissional (CAU/CREA) do responsável técnico - Ex: CAU A12345-6 ou CREA 12345-D';
COMMENT ON COLUMN public.user_settings.professional_phone IS 'Telefone profissional para contato em orçamentos e propostas - Formato: (00) 0000-0000 ou (00) 00000-0000';
COMMENT ON COLUMN public.user_settings.business_address IS 'Endereço completo do escritório/empresa para uso em documentos e orçamentos';
COMMENT ON COLUMN public.user_settings.default_bdi IS 'Percentual padrão de BDI (Benefícios e Despesas Indiretas) - Default: 20% (SINAPI standard)';
COMMENT ON COLUMN public.user_settings.social_charges IS 'Percentual de encargos sociais sobre mão de obra - Default: 88% (mercado brasileiro)';
COMMENT ON COLUMN public.user_settings.tech_hour_rate IS 'Valor em R$ da hora técnica do responsável para orçamentos de consultoria - Default: R$ 150,00';

-- Criar índice para melhor performance em queries do usuário
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- Adicionar constraint de validação para valores percentuais (0-100)
ALTER TABLE public.user_settings 
ADD CONSTRAINT check_default_bdi CHECK (default_bdi >= 0 AND default_bdi <= 100),
ADD CONSTRAINT check_social_charges CHECK (social_charges >= 0 AND social_charges <= 200),
ADD CONSTRAINT check_tech_hour_rate CHECK (tech_hour_rate >= 0);
