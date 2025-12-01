-- Adicionar parâmetros de engenharia à tabela user_settings
ALTER TABLE public.user_settings 
ADD COLUMN IF NOT EXISTS bdi_padrao numeric(5,2) DEFAULT 20.00,
ADD COLUMN IF NOT EXISTS encargos_sociais numeric(5,2) DEFAULT 88.00,
ADD COLUMN IF NOT EXISTS valor_hora_tecnica numeric(10,2) DEFAULT 150.00,
ADD COLUMN IF NOT EXISTS perda_padrao_materiais numeric(5,2) DEFAULT 5.00;

-- Comentários para documentação
COMMENT ON COLUMN public.user_settings.bdi_padrao IS 'Percentual padrão de BDI (Benefícios e Despesas Indiretas) - Default: 20%';
COMMENT ON COLUMN public.user_settings.encargos_sociais IS 'Percentual de encargos sociais sobre mão de obra - Default: 88%';
COMMENT ON COLUMN public.user_settings.valor_hora_tecnica IS 'Valor da hora técnica do responsável (R$) - Default: R$ 150,00';
COMMENT ON COLUMN public.user_settings.perda_padrao_materiais IS 'Percentual de perda padrão para materiais - Default: 5%';

