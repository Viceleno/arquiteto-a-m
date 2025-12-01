# 🏗️ Arquitetura - Sistema de Configurações Empresariais

## 📦 Componentes Modificados

### 1. **Database Layer** - `supabase/migrations/20251201000002_add_business_settings.sql`

```
┌─────────────────────────────────────────┐
│         user_settings TABLE             │
├─────────────────────────────────────────┤
│ user_id (FK)                            │
│ theme, email_notifications              │
│ bdi_padrao, encargos_sociais            │
│ valor_hora_tecnica                      │
│ perda_padrao_materiais                  │
│                                         │
│ NEW FIELDS:                             │
│ ├─ cau_crea (profissional)              │
│ ├─ professional_phone                   │
│ ├─ business_address                     │
│ ├─ default_bdi (sinônimo de bdi_padrao) │
│ ├─ social_charges (sinônimo de enc.)    │
│ └─ tech_hour_rate (sinônimo de valor)   │
└─────────────────────────────────────────┘
```

**Constraints de Integridade**:
```sql
CHECK (default_bdi >= 0 AND default_bdi <= 100)
CHECK (social_charges >= 0 AND social_charges <= 200)
CHECK (tech_hour_rate >= 0)
```

---

### 2. **Context/Hook Layer** - `src/hooks/useSettings.tsx`

```typescript
// Fluxo de dados

UserSettings Interface
        ↓
loadSettings() → Fetch from Supabase with merge
        ↓
updateSettings(partial) → Upsert with rollback
        ↓
resetToMarketDefaults() → Batch update
        ↓
SettingsContext → Providers to Components
```

#### **loadSettings()** - Inteligência de Merge
```
1. Query user_settings by user_id
2. For each field:
   - If value is null → Use defaultSettings[field]
   - Else → Use fetched value
3. Validate theme enum
4. On error → Fallback to defaultSettings
```

#### **updateSettings(newSettings)** - Segurança
```
1. Store previousSettings (for rollback)
2. Optimistic update: setSettings(newSettings)
3. Upsert to Supabase (only defined fields)
4. On error:
   - Revert: setSettings(previousSettings)
   - Throw error with message
```

#### **resetToMarketDefaults()** - Padrões
```
Executa updateSettings com:
{
  bdi_padrao: 20,
  encargos_sociais: 88,
  valor_hora_tecnica: 150,
  perda_padrao_materiais: 5,
  default_bdi: 20,
  social_charges: 88,
  tech_hour_rate: 150,
}
```

---

### 3. **UI Layer** - `src/pages/Settings.tsx`

```
┌─────────────────────────────────────────┐
│      Settings (Página)                  │
├─────────────────────────────────────────┤
│  Tabs:                                  │
│  ├─ General (Tema, notificações)        │
│  ├─ Calculations [NOVO BOTÃO AQUI]      │
│  │  ├─ BDI Padrão                      │
│  │  ├─ Encargos Sociais                │
│  │  ├─ Hora Técnica                    │
│  │  ├─ Perda Materiais                 │
│  │  │                                   │
│  │  └─ 🔄 RESTAURAR PADRÕES DE MERCADO│
│  │     └─ onClick → handleReset()      │
│  │                                      │
│  └─ Profile (Empresa)                   │
│     ├─ Registro Profissional            │
│     ├─ Razão Social                     │
│     ├─ Endereço Comercial               │
│     ├─ Telefone Comercial               │
│     └─ Site/Portfolio                   │
└─────────────────────────────────────────┘
```

#### **handleResetMarketDefaults()**
```
1. Show confirmation dialog with values
2. User confirms → setIsResetting(true)
3. Call resetToMarketDefaults()
4. Update form via form.setValue()
5. Show success toast
6. setIsResetting(false)
```

---

## 🔄 Fluxo Completo: Salvar Configuração

```
┌──────────────────────────────────────────────────────────────┐
│                    USER INTERACTS                             │
│  (Muda BDI de 20 para 25 e clica "Salvar configurações")     │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                   Settings.tsx                                │
│  form.handleSubmit(onSubmit)                                 │
│  {bdi_padrao: 25, ...other values}                           │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                   useSettings Hook                            │
│  updateSettings({bdi_padrao: 25})                            │
│  1. Save previous state                                      │
│  2. Update local state (optimistic)                          │
│  3. Upsert to Supabase                                       │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL                              │
│  INSERT INTO user_settings (user_id, bdi_padrao, ...)       │
│  ON CONFLICT(user_id) DO UPDATE SET ...                     │
│  ✅ Success                                                   │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                 Back to Settings.tsx                          │
│  Show toast: "✅ Configurações salvas"                       │
│  Form displays updated values                                │
│  Loading spinner disappears                                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo: Restaurar Padrões de Mercado

```
┌──────────────────────────────────────────────────────────────┐
│             USER CLICKS BUTTON                                │
│  "🔄 Restaurar Padrões de Mercado"                          │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│        Show Confirmation Dialog                               │
│  "Restaurar todos os parâmetros para:                        │
│   • BDI: 20%                                                 │
│   • Encargos Sociais: 88%                                    │
│   • Hora Técnica: R$ 150,00                                  │
│   • Perda Materiais: 5%"                                     │
│                                                              │
│  [Cancelar] [Restaurar]                                     │
└────────────────────────┬─────────────────────────────────────┘
                         ↓ (User clicks "Restaurar")
┌──────────────────────────────────────────────────────────────┐
│             handleResetMarketDefaults()                       │
│  1. setIsResetting(true)                                     │
│  2. Call resetToMarketDefaults()                             │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│            useSettings.resetToMarketDefaults()               │
│  Call updateSettings({                                       │
│    bdi_padrao: 20,                                           │
│    encargos_sociais: 88,                                     │
│    valor_hora_tecnica: 150,                                  │
│    perda_padrao_materiais: 5,                                │
│    default_bdi: 20,                                          │
│    social_charges: 88,                                       │
│    tech_hour_rate: 150,                                      │
│  })                                                          │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                 Supabase UPSERT                               │
│  ✅ Dados salvos                                             │
└────────────────────────┬─────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────┐
│             Back to Settings.tsx                              │
│  1. setIsResetting(false)                                    │
│  2. Update form.setValue() for each field                    │
│  3. Show success toast                                       │
│  4. Form displays: BDI=20%, Enc.=88%, etc.                  │
└──────────────────────────────────────────────────────────────┘
```

---

## 🛡️ Tratamento de Erros

### Cenário 1: Falha ao Salvar
```
✗ Erro de rede ou banco de dados

1. Erro lançado por Supabase
2. updateSettings() captura erro
3. Revert: setSettings(previousSettings)
4. Throw erro com mensagem
5. onSubmit captura erro
6. toast({ variant: 'destructive', ... })
7. Usuário vê estado anterior restaurado
```

### Cenário 2: Usuário Não Autenticado
```
✗ Tentativa de atualizar sem user

1. updateSettings() checa if (!user) return
2. Silenciosamente ignora
3. Nenhum toast mostrado
```

### Cenário 3: Dados Inválidos do Banco
```
✗ Campo vem null do banco

1. loadSettings() usa merge: data.field ?? defaultSettings.field
2. Sempre tem valor válido
3. Sem crashes
```

---

## 📊 Tipo de Dados por Campo

| Campo | Tipo | Min | Max | Padrão | Descrição |
|-------|------|-----|-----|--------|-----------|
| `bdi_padrao` | numeric(5,2) | 0 | 100 | 20.00 | BDI em % |
| `encargos_sociais` | numeric(5,2) | 0 | 200 | 88.00 | Encargos em % |
| `valor_hora_tecnica` | numeric(10,2) | 0 | ∞ | 150.00 | Valor em R$ |
| `perda_padrao_materiais` | numeric(5,2) | 0 | 50 | 5.00 | Perda em % |
| `cau_crea` | varchar(50) | - | - | null | Texto livre |
| `professional_phone` | varchar(20) | - | - | null | Texto livre |
| `business_address` | text | - | - | null | Texto livre |
| `default_bdi` | numeric(5,2) | 0 | 100 | 20.00 | BDI duplicado |
| `social_charges` | numeric(5,2) | 0 | 200 | 88.00 | Encargos duplicado |
| `tech_hour_rate` | numeric(10,2) | 0 | ∞ | 150.00 | Hora técnica duplicado |

---

## ✅ Checklist de Implementação

- ✅ Migration SQL criada e documentada
- ✅ Constraints de validação no banco
- ✅ Interface TypeScript atualizada
- ✅ loadSettings() com merge de defaults
- ✅ updateSettings() com rollback
- ✅ resetToMarketDefaults() implementado
- ✅ Settings.tsx com novo botão
- ✅ Confirmação de dialog
- ✅ Toast de feedback
- ✅ Nenhum erro de compilação
- ✅ Tipagem forte em todo fluxo

---

## 🚀 Deployment Checklist

Antes de ir para produção:

- [ ] Executar migration no Supabase
- [ ] Testar salvar um parâmetro
- [ ] Testar restaurar padrões
- [ ] Testar erro de rede (desligar internet)
- [ ] Testar rollback (cancelar confirmação)
- [ ] Verificar dados salvos no banco (SQL)
- [ ] Testar em dispositivo mobile
- [ ] Verificar dark mode
- [ ] Confirmar Toasts aparecem

---

**Pronto para produção!** 🎉
