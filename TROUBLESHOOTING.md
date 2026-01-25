# Troubleshooting - Log de Entrada de Membros

## Problema: Log funciona no PC local mas não na VPS Linux

Se o evento `guildMemberAdd` funciona no seu PC mas não na VPS, verifique os seguintes pontos:

### 1. ✅ Intents Privilegiadas no Discord Developer Portal

O evento `guildMemberAdd` requer a intent **Guild Members** que é uma **intent privilegiada**.

**Como habilitar:**
1. Acesse: https://discord.com/developers/applications
2. Selecione seu bot
3. Vá em **Bot** → **Privileged Gateway Intents**
4. **Habilite** a opção **SERVER MEMBERS INTENT**
5. Salve as alterações
6. Reinicie o bot na VPS

⚠️ **IMPORTANTE:** Esta intent precisa estar habilitada no portal do Discord para funcionar!

### 2. ✅ Verificar se o evento está sendo carregado

Quando o bot iniciar, você deve ver nos logs:
```
✅ Evento guildMemberAdd está registrado
✅ Intent GuildMembers está habilitada
```

Se aparecer avisos (⚠️), significa que há um problema:
- ⚠️ Evento não registrado → Verifique se o arquivo `src/events/guildMemberAdd.ts` existe
- ⚠️ Intent não habilitada → Habilite no Discord Developer Portal (passo 1)

### 3. ✅ Verificar permissões do bot no servidor

O bot precisa ter permissão para:
- Ver canais (View Channels)
- Enviar mensagens (Send Messages)
- Enviar embeds (Embed Links)

### 4. ✅ Configurar canal de log (opcional)

No arquivo `.env`, adicione:
```env
LOG_CHANNEL_ID=1234567890123456789
```

Ou o bot tentará encontrar automaticamente um canal com "log" ou "entrada" no nome.

### 5. ✅ Verificar versões

Certifique-se de que na VPS você tem:
- Node.js versão compatível (verifique com `node --version`)
- Mesmas versões de dependências (execute `npm install` na VPS)

### 6. ✅ Verificar logs na VPS

Quando alguém entrar no servidor, você deve ver no console:
```
[INFO] Membro entrou no servidor: Username#1234 (123456789) no servidor Nome do Servidor (987654321)
```

Se não aparecer essa mensagem, o evento não está sendo disparado.

### Checklist rápido:

- [ ] Intent "SERVER MEMBERS INTENT" habilitada no Discord Developer Portal
- [ ] Bot reiniciado após habilitar a intent
- [ ] Arquivo `src/events/guildMemberAdd.ts` existe na VPS
- [ ] Logs mostram "✅ Evento guildMemberAdd está registrado"
- [ ] Logs mostram "✅ Intent GuildMembers está habilitada"
- [ ] Bot tem permissões adequadas no servidor
- [ ] Versões do Node.js e dependências são compatíveis

### Teste rápido:

1. Faça alguém entrar no servidor (ou use um bot de teste)
2. Verifique os logs do console na VPS
3. Se aparecer a mensagem de log, mas não aparecer no canal Discord, verifique:
   - Se o canal de log está configurado corretamente
   - Se o bot tem permissão para enviar mensagens no canal
   - Se o ID do canal está correto no `.env`
