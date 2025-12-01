# 🧪 Testes de Validação - Sistema de Configurações

## 1️⃣ Testes Manuais da UI

### Teste 1: Salvar Parâmetro Individual

```
PASSOS:
1. Abrir Settings → Aba "Cálculos"
2. Mudar "BDI Padrão" de 20 para 25
3. Clique em "Salvar configurações"

ESPERADO:
✅ Spinner apareça momentaneamente
✅ Toast "✅ Configurações salvas" aparece
✅ Campo continua com valor 25
✅ F5 - recarregar página, valor permanece 25
```

### Teste 2: Restaurar Padrões

```
PASSOS:
1. Abrir Settings → Aba "Cálculos"
2. Clique em "🔄 Restaurar Padrões de Mercado"
3. Confirme no dialog que aparece

ESPERADO:
✅ Dialog mostra valores a serem restaurados
✅ Spinner aparece durante restauração
✅ Todos os campos voltam aos padrões:
   - BDI: 20%
   - Encargos: 88%
   - Hora: R$ 150,00
   - Perda: 5%
✅ Toast "✅ Parâmetros Restaurados" aparece
```

### Teste 3: Cancelar Restauração

```
PASSOS:
1. Abrir Settings → Aba "Cálculos"
2. Mudar BDI para 25
3. Clique em "🔄 Restaurar Padrões de Mercado"
4. Clique "Cancelar" no dialog

ESPERADO:
✅ Dialog fecha
✅ BDI continua com 25 (não restaurado)
✅ Nenhum toast aparece
```

### Teste 4: Múltiplos Campos

```
PASSOS:
1. Abrir Settings → Aba "Cálculos"
2. Mudar:
   - BDI: 30%
   - Encargos: 90%
   - Hora: R$ 200,00
3. Clique "Salvar configurações"

ESPERADO:
✅ Todos os 3 valores são salvos
✅ F5 - recarregar, todos os valores permanecem
✅ Toast aparece
```

### Teste 5: Dark Mode

```
PASSOS:
1. Settings → Aba "Geral"
2. Trocar tema para "🌙 Escuro"
3. Ir para Settings → Aba "Cálculos"
4. Restaurar padrões

ESPERADO:
✅ Botão visível e usável em dark mode
✅ Dialog legível
✅ Toast visível
✅ Spinner animado
```

---

## 2️⃣ Testes de Banco de Dados

### Teste 6: Verificar Columns Criadas

```sql
-- Execute no Supabase SQL Editor

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_settings'
AND column_name IN (
  'cau_crea',
  'professional_phone',
  'business_address',
  'default_bdi',
  'social_charges',
  'tech_hour_rate'
);

-- ESPERADO: 6 linhas com tipos corretos
```

### Teste 7: Verificar Constraints

```sql
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_settings'
AND constraint_type = 'CHECK';

-- ESPERADO: 3 constraints CHECK
-- - check_default_bdi
-- - check_social_charges
-- - check_tech_hour_rate
```

### Teste 8: Verificar Dados Salvos

```sql
-- Substitua USER_ID pelo ID real do usuário logado
SELECT
  user_id,
  bdi_padrao,
  encargos_sociais,
  valor_hora_tecnica,
  perda_padrao_materiais,
  default_bdi,
  social_charges,
  tech_hour_rate,
  updated_at
FROM user_settings
WHERE user_id = 'USER_ID';

-- ESPERADO: 1 linha com todos os dados corretos
-- updated_at deve ser recente
```

---

## 3️⃣ Testes de Validação

### Teste 9: Constraint - BDI > 100%

```sql
-- Execute no Supabase SQL Editor
-- Substitua USER_ID

UPDATE user_settings
SET default_bdi = 150
WHERE user_id = 'USER_ID';

-- ESPERADO: Erro - "new row for relation violates check constraint"
-- BDI deve estar entre 0 e 100
```

### Teste 10: Constraint - Social Charges Negativo

```sql
-- Substitua USER_ID

UPDATE user_settings
SET social_charges = -5
WHERE user_id = 'USER_ID';

-- ESPERADO: Erro - "violates check constraint"
-- Social charges deve ser >= 0
```

### Teste 11: Constraint - Tech Hour Rate Válido

```sql
-- Substitua USER_ID

UPDATE user_settings
SET tech_hour_rate = 0
WHERE user_id = 'USER_ID';

-- ESPERADO: Sucesso ✅
-- Tech hour rate pode ser 0 (trabalho pro bono)

-- Depois restaure:
UPDATE user_settings
SET tech_hour_rate = 150
WHERE user_id = 'USER_ID';
```

---

## 4️⃣ Testes de Erro

### Teste 12: Falha de Rede - Salvar

```
SETUP:
1. Abrir DevTools (F12) → Network
2. Fazer offline: DevTools → Network → Offline

PASSOS:
1. Mudar BDI para 30
2. Clique "Salvar configurações"

ESPERADO:
✅ Erro é capturado
✅ BDI volta para valor anterior
✅ Toast de erro aparece
✅ Mensagem clara: "Erro ao salvar"
```

### Teste 13: Falha de Rede - Restaurar

```
SETUP:
1. DevTools → Offline

PASSOS:
1. Clique "Restaurar Padrões"
2. Confirme no dialog

ESPERADO:
✅ Spinner aparece
✅ Erro é capturado
✅ Toast vermelho: "Erro ao restaurar padrões"
✅ Valores mantêm estado anterior
✅ Conectar internet novamente - tudo funciona
```

---

## 5️⃣ Testes de Performance

### Teste 14: Tempo de Salvar

```
MEDIÇÃO:
1. Abrir Console (F12 → Console)
2. Executar:
   const start = Date.now();
   // Clique em "Salvar configurações"
   // Toast aparece
   console.log(`Tempo: ${Date.now() - start}ms`);

ESPERADO:
✅ Tempo < 1000ms (< 1 segundo)
✅ Resposta imediata (otimistic update)
```

### Teste 15: Tempo de Carregar

```
MEDIÇÃO:
1. DevTools → Performance
2. Abrir Settings
3. Medir tempo até "Aba Cálculos" estar pronta

ESPERADO:
✅ Tempo < 500ms
✅ Spinner não mostra por mais de 200ms
```

---

## 6️⃣ Testes de Integração

### Teste 16: Dados Propagam para Calculadora

```
PASSOS:
1. Settings → Cálculos
2. Restaurar padrões (BDI=20%, Enc.=88%)
3. Ir para Calculators page
4. Abrir CostCalculator
5. Verificar valores padrão

ESPERADO:
✅ CostCalculator usa os valores salvos
✅ BDI = 20%, Encargos = 88%
✅ Mudanças em Settings refletem em Calculators
```

### Teste 17: Multi-usuário

```
SETUP:
- Browser 1: Usuário A logado
- Browser 2: Usuário B logado

PASSOS:
1. Usuário A: BDI = 25, Salvar
2. Usuário B: Ir para Settings → Cálculos
3. Verificar BDI do Usuário B

ESPERADO:
✅ Usuário A vê 25%
✅ Usuário B vê 20% (ou seu próprio valor)
✅ Dados não vazam entre usuários
```

---

## 7️⃣ Testes de Acessibilidade

### Teste 18: Keyboard Navigation

```
PASSOS:
1. Settings → Cálculos
2. Usar Tab para navegar até botão "Restaurar"
3. Pressionar Enter

ESPERADO:
✅ Botão fica focused (outline visível)
✅ Clique funciona com Enter
✅ Dialog pode ser navegado com Tab
```

### Teste 19: Leitura de Tela

```
PASSOS:
1. Ativar leitor de tela (NVDA, JAWS, VoiceOver)
2. Navegar até botão "Restaurar"
3. Clicar no botão
4. Navegar no dialog

ESPERADO:
✅ Botão é anunciado: "Restaurar Padrões de Mercado"
✅ Dialog é anunciado
✅ Opções são claras
```

---

## 📋 Checklist Final de Testes

### UI Tests

- [ ] Teste 1: Salvar Parâmetro Individual
- [ ] Teste 2: Restaurar Padrões
- [ ] Teste 3: Cancelar Restauração
- [ ] Teste 4: Múltiplos Campos
- [ ] Teste 5: Dark Mode

### Database Tests

- [ ] Teste 6: Columns Criadas
- [ ] Teste 7: Constraints Existem
- [ ] Teste 8: Dados Salvos

### Validation Tests

- [ ] Teste 9: BDI Validation
- [ ] Teste 10: Social Charges Validation
- [ ] Teste 11: Tech Hour Rate Validation

### Error Tests

- [ ] Teste 12: Falha de Rede - Salvar
- [ ] Teste 13: Falha de Rede - Restaurar

### Performance Tests

- [ ] Teste 14: Tempo de Salvar
- [ ] Teste 15: Tempo de Carregar

### Integration Tests

- [ ] Teste 16: Dados Propagam
- [ ] Teste 17: Multi-usuário

### Accessibility Tests

- [ ] Teste 18: Keyboard Navigation
- [ ] Teste 19: Leitura de Tela

---

## 🎯 Critérios de Sucesso

✅ **Todos os testes passam** → Ready for Production
⚠️ **3+ testes falhando** → Revisar e corrigir
❌ **5+ testes falhando** → Revisar arquitetura

---

## 📝 Exemplo de Relatório de Teste

```
DATA: 01/12/2025
TESTADOR: [Seu Nome]
AMBIENTE: Development
NAVEGADOR: Chrome 120

RESULTADO FINAL: ✅ PASS

Testes Executados:
✅ Teste 1: PASS (1.2s)
✅ Teste 2: PASS (1.5s)
✅ Teste 3: PASS (0.8s)
...

Observações:
- Todos os campos salvam corretamente
- Dark mode funciona perfeitamente
- Toasts aparecem com timing adequado
- Banco de dados valida constraints

Recomendação: Liberar para produção
```

---

**Status**: 📋 Pronto para testar
**Data**: 01/12/2025
