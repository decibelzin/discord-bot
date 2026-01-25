# 📦 Constants - Documentação

## 🎯 Objetivo

Centralizar todos os valores fixos do bot (strings, IDs, permissões, timeouts) em um único lugar para:

- ✅ **Eliminar "magic strings"** e "magic numbers"
- ✅ **Facilitar manutenção** e tradução
- ✅ **Prevenir typos** em IDs customizados
- ✅ **Melhorar legibilidade** do código
- ✅ **Type-safety** completo com TypeScript

---

## 📁 Estrutura

```
src/constants/
├── index.ts           # Exportações centralizadas
├── messages.ts        # Todas as mensagens do bot
├── permissions.ts     # Conjuntos de permissões
├── timeouts.ts        # Delays e timeouts
├── customIds.ts       # IDs de componentes interativos
├── limits.ts          # Limites e validações
└── README.md          # Esta documentação
```

---

## 📖 Como Usar

### Import Centralizado

```typescript
// ✅ RECOMENDADO: Import único de todas as constants
import { MESSAGES, CUSTOM_IDS, TIMEOUTS, LIMITS } from '../constants';

// ❌ EVITE: Imports individuais
import { MESSAGES } from '../constants/messages';
import { CUSTOM_IDS } from '../constants/customIds';
```

---

## 🔤 Messages (`messages.ts`)

### Estrutura

```typescript
MESSAGES = {
  PROTECTION: { ... },      // Mensagens de proteção
  ERRORS: { ... },          // Mensagens de erro
  SUCCESS: { ... },         // Mensagens de sucesso
  WARNINGS: { ... },        // Avisos
  MENUS: { ... },           // Títulos de menus
  LABELS: { ... },          // Labels de botões/opções
  DESCRIPTIONS: { ... },    // Descrições de opções
  DYNAMIC_CHANNEL: { ... }, // Mensagens de canal dinâmico
  NAVIGATION: { ... },      // Navegação
}
```

### Exemplos de Uso

```typescript
// Mensagem simples
await interaction.reply({
  content: MESSAGES.ERRORS.ONLY_OWNER,
  flags: MessageFlags.Ephemeral,
});

// Mensagem com função (para interpolação)
const message = MESSAGES.PROTECTION.NO_PERMISSION(member.toString());

// Sucesso com valor dinâmico
const successMsg = MESSAGES.SUCCESS.CHANNEL_RENAMED('Novo Nome');

// Status de proteção
const status = MESSAGES.DYNAMIC_CHANNEL.PROTECTION_STATUS(isProtected);
```

---

## 🔑 Custom IDs (`customIds.ts`)

### Estrutura

```typescript
CUSTOM_IDS = {
  MAIN_PANEL: { ... },      // Botões principais
  MANAGE_USERS: { ... },    // Menu de usuários
  SELECT_MENUS: { ... },    // Select menus
  CHANNEL_ACTIONS: { ... }, // Ações de canal
  USER_ACTIONS: { ... },    // Ações de usuário
  VIDEO_ACTIONS: { ... },   // Ações de vídeo
  NAVIGATION: { ... },      // Navegação
  PREFIXES: { ... },        // Prefixos para IDs dinâmicos
  OTHER: { ... },           // Outros botões
  LEGACY: { ... },          // IDs legados
}
```

### Helpers para IDs Dinâmicos

```typescript
// Criar ID com channelId
const modalId = createDynamicId.modalStatus(channelId);
// Resultado: "vc_modal_status_1234567890"

// Extrair channelId de um ID
const channelId = extractChannelId.fromModalStatus(interaction.customId);
// Input: "vc_modal_status_1234567890" → Output: "1234567890"
```

### Exemplos de Uso

```typescript
// Botão simples
new ButtonBuilder()
  .setCustomId(CUSTOM_IDS.MAIN_PANEL.USER_LIMIT)
  .setLabel(MESSAGES.LABELS.USER_LIMIT)
  .setStyle(ButtonStyle.Primary);

// Modal com ID dinâmico
const modal = new ModalBuilder()
  .setCustomId(createDynamicId.modalStatus(voiceChannel.id))
  .setTitle('Status da Call');

// Verificar ID em handler
if (interaction.customId === CUSTOM_IDS.MANAGE_USERS.TOGGLE_PROTECTION) {
  // ...
}

// Verificar múltiplos IDs
if ([
  CUSTOM_IDS.MAIN_PANEL.USER_LIMIT,
  CUSTOM_IDS.MAIN_PANEL.CALL_STATUS,
  CUSTOM_IDS.MAIN_PANEL.MANAGE_USERS
].includes(interaction.customId)) {
  // ...
}
```

---

## ⏱️ Timeouts (`timeouts.ts`)

### Estrutura

```typescript
TIMEOUTS = {
  MESSAGE_AUTO_DELETE: 10000,  // 10s
  MENU_RELOAD: 2000,           // 2s
  BACK_TO_MAIN: 1500,          // 1.5s
  CHANNEL_EMPTY_CHECK: 1000,   // 1s
}
```

### Exemplos de Uso

```typescript
// Deletar mensagem após timeout
setTimeout(async () => {
  await message.delete();
}, TIMEOUTS.MESSAGE_AUTO_DELETE);

// Recarregar menu
setTimeout(async () => {
  await showMenu(interaction, channel);
}, TIMEOUTS.MENU_RELOAD);
```

---

## 🔐 Permissions (`permissions.ts`)

### Conjuntos Disponíveis

```typescript
OWNER_PERMISSIONS           // Permissões completas do dono
BASIC_VOICE_PERMISSIONS     // Connect, Speak, Stream
ALLOWED_USER_PERMISSIONS    // Usuário permitido (pode gerenciar)
PROTECTION_DENY_PERMISSIONS // Bloqueado quando protegido
VIDEO_DENY_PERMISSIONS      // Bloqueado quando vídeo off
```

### Exemplos de Uso

```typescript
import { OWNER_PERMISSIONS, BASIC_VOICE_PERMISSIONS } from '../constants';

// Definir permissões do dono
{
  id: ownerId,
  allow: OWNER_PERMISSIONS,
}

// Permissões básicas de voz
{
  id: userId,
  allow: BASIC_VOICE_PERMISSIONS,
}
```

---

## 📏 Limits (`limits.ts`)

### Estrutura

```typescript
LIMITS = {
  VOICE_CHANNEL: {
    NAME_MIN_LENGTH: 1,
    NAME_MAX_LENGTH: 100,
    USER_LIMIT_MIN: 0,
    USER_LIMIT_MAX: 99,
    BITRATE_MIN: 8,
    BITRATE_MAX: 384,
    STATUS_MAX_LENGTH: 500,
  },
  TEXT_INPUT: { ... },
}

DEFAULTS = {
  USER_LIMIT_UNLIMITED: 0,
  BITRATE_DEFAULT: 64,
}
```

### Exemplos de Uso

```typescript
// Validação
if (limit < LIMITS.VOICE_CHANNEL.USER_LIMIT_MIN || 
    limit > LIMITS.VOICE_CHANNEL.USER_LIMIT_MAX) {
  return interaction.reply({
    content: `❌ O limite deve ser entre ${LIMITS.VOICE_CHANNEL.USER_LIMIT_MIN} e ${LIMITS.VOICE_CHANNEL.USER_LIMIT_MAX}!`,
  });
}

// Input com limite
const statusInput = new TextInputBuilder()
  .setMaxLength(LIMITS.VOICE_CHANNEL.STATUS_MAX_LENGTH);

// Valor padrão
const limitText = limit === DEFAULTS.USER_LIMIT_UNLIMITED 
  ? 'ilimitado' 
  : limit.toString();
```

---

## ✅ Benefícios da Refatoração

### Antes (❌ Sem Constants)

```typescript
// Strings hardcoded espalhadas
await interaction.reply({
  content: '❌ Apenas o criador do canal pode fazer isso!',
});

// IDs mágicos com typos
if (interaction.customId === 'vc_user_limit') { // Pode ter typo!
  // ...
}

// Números mágicos
setTimeout(() => { ... }, 10000); // O que é 10000?
```

### Depois (✅ Com Constants)

```typescript
// Mensagens centralizadas
await interaction.reply({
  content: MESSAGES.ERRORS.ONLY_OWNER,
});

// IDs type-safe
if (interaction.customId === CUSTOM_IDS.MAIN_PANEL.USER_LIMIT) {
  // Autocompletar + sem typos!
}

// Timeouts nomeados
setTimeout(() => { ... }, TIMEOUTS.MESSAGE_AUTO_DELETE);
```

---

## 🔄 Migração Gradual

Para migrar código existente:

1. **Identifique** strings/IDs hardcoded
2. **Verifique** se já existe em `constants/`
3. **Se não existe**: adicione à constant apropriada
4. **Substitua** o valor hardcoded pelo import
5. **Teste** para garantir que funciona

### Exemplo de Migração

```typescript
// ANTES
await interaction.reply({
  content: '✅ Canal trancado! Apenas usuários permitidos podem entrar.',
});

// DEPOIS
await interaction.reply({
  content: MESSAGES.SUCCESS.CHANNEL_LOCKED,
});
```

---

## 🎨 Boas Práticas

1. ✅ **Sempre use constants** para valores fixos
2. ✅ **Agrupe** mensagens relacionadas juntas
3. ✅ **Use funções** para mensagens com interpolação
4. ✅ **Documente** constants complexas com comentários
5. ✅ **Mantenha** estrutura consistente
6. ❌ **Evite** criar constants para valores únicos sem reuso
7. ❌ **Não** coloque lógica dentro de constants

---

## 📚 Referência Rápida

```typescript
import { 
  MESSAGES,        // Todas as mensagens
  CUSTOM_IDS,      // IDs de componentes
  TIMEOUTS,        // Delays e timeouts
  LIMITS,          // Limites de validação
  DEFAULTS,        // Valores padrão
  OWNER_PERMISSIONS, // Conjuntos de permissões
  createDynamicId, // Helper para IDs dinâmicos
  extractChannelId // Helper para extrair channelId
} from '../constants';
```

---

## 🚀 Próximos Passos

Após constants estarem implementadas:

1. **Types e Interfaces** - Expandir `src/types/`
2. **Services Layer** - Criar `src/services/`
3. **Validators** - Criar `src/validators/`
4. **Repositories** - Criar `src/repositories/`

---

**Documentação atualizada em:** 2026-01-24
