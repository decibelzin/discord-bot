# Discord Bot - Sistema de Canais Dinâmicos de Voz

Bot Discord desenvolvido em TypeScript com sistema completo de gerenciamento de canais dinâmicos de voz, painel de controle interativo e funcionalidades avançadas.

## 🚀 Funcionalidades

### Canais Dinâmicos de Voz
- **Criação automática**: Canais são criados automaticamente quando usuários entram no canal criador
- **Painel de controle**: Interface interativa com botões para gerenciar o canal
- **Proteção de canal**: Sistema de proteção que impede entrada de usuários não autorizados
- **Transferência de propriedade**: Permite transferir a propriedade do canal para outro usuário
- **Persistência**: Dados salvos em arquivos JSON para sobreviver a reinicializações

### Comandos Disponíveis
- `/ping` - Verifica a latência do bot
- `/userinfo` - Mostra informações sobre um usuário
- `/vccreator` - Define um canal como criador de canais dinâmicos
- `/welcome` - Envia mensagem de boas-vindas com verificação de cargo
- `/nuke` - Clona o canal atual e deleta o antigo (apenas admins)
- `/clear` - Limpa mensagens do canal

### Painel de Controle
- **Limite de usuários**: Define quantos usuários podem entrar no canal
- **Status da call**: Define um status personalizado para o canal
- **Gerenciar usuários**: Permite/bloqueia usuários específicos
- **Mais opções**: Renomear, trancar/destrancar, esconder/mostrar canal, ajustar bitrate, controlar vídeo/screen share

## 📋 Requisitos

- Node.js 18+ 
- npm ou yarn
- Bot do Discord criado no [Discord Developer Portal](https://discord.com/developers/applications)
- Token do bot
- Permissões necessárias no servidor:
  - Gerenciar Canais
  - Conectar (Voice)
  - Enviar Mensagens
  - Usar Componentes de Mensagem
  - Gerenciar Mensagens

## 🛠️ Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/discord-bot.git
cd discord-bot
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

4. **Edite o arquivo `.env`** com suas credenciais:
```env
DISCORD_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
GUILD_ID=seu_guild_id_aqui_opcional
NODE_ENV=production
```

## ⚙️ Configuração

### Obter Token do Bot
1. Acesse o [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação ou selecione uma existente
3. Vá em **Bot** > **Reset Token** (ou copie o token existente)
4. Cole o token no arquivo `.env`

### Obter Client ID
1. No Discord Developer Portal, vá em **General Information**
2. Copie o **Application ID**
3. Cole no arquivo `.env` como `CLIENT_ID`

### Obter Guild ID (Opcional)
- Se quiser registrar comandos apenas em um servidor específico (mais rápido):
  1. Ative o Modo Desenvolvedor no Discord (Configurações > Avançado)
  2. Clique com botão direito no servidor > Copiar ID
  3. Cole no arquivo `.env` como `GUILD_ID`
- Se não definir `GUILD_ID`, os comandos serão registrados globalmente (pode levar até 1 hora)

## 🚀 Executando

### Desenvolvimento
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Produção
```bash
npm run build
npm start
```

## 📁 Estrutura do Projeto

```
discord-bot/
├── src/
│   ├── commands/          # Comandos slash
│   ├── events/            # Eventos do Discord
│   ├── handlers/          # Handlers modulares
│   ├── builders/          # Builders para mensagens e modais
│   ├── services/          # Serviços (proteção, canais dinâmicos)
│   ├── constants/         # Constantes centralizadas
│   ├── types/             # Tipos TypeScript
│   ├── utils/             # Utilitários
│   ├── validators/        # Validadores
│   ├── config/            # Configurações
│   └── index.ts           # Entry point
├── data/                  # Dados persistentes (JSON)
├── assets/                # Assets (imagens, GIFs)
├── dist/                  # Build output (gerado)
├── .env                   # Variáveis de ambiente (não commitado)
├── .env.example           # Exemplo de variáveis de ambiente
├── .gitignore             # Arquivos ignorados pelo Git
├── tsconfig.json          # Configuração TypeScript
├── package.json           # Dependências e scripts
└── README.md              # Este arquivo
```

## 🔧 Desenvolvimento

### Adicionar um novo comando
1. Crie um arquivo em `src/commands/nome-do-comando.ts`
2. Siga a estrutura:
```typescript
import { ChatInputCommandInteraction } from 'discord.js';
import { Command } from '../types';

const command: Command = {
  name: 'nome-do-comando',
  description: 'Descrição do comando',
  execute: async (interaction: ChatInputCommandInteraction) => {
    // Sua lógica aqui
  },
};

export default command;
```

### Adicionar um novo evento
1. Crie um arquivo em `src/events/nome-do-evento.ts`
2. Siga a estrutura:
```typescript
import { Event } from '../types';

const event: Event = {
  name: 'nomeDoEvento',
  execute: async (...args) => {
    // Sua lógica aqui
  },
};

export default event;
```

## 📦 Deploy

### Opções de Deploy

#### 1. VPS/Cloud (Recomendado)
- **DigitalOcean**, **AWS**, **Google Cloud**, etc.
- Instale Node.js 18+
- Clone o repositório
- Configure `.env`
- Use PM2 ou systemd para manter o bot rodando:
```bash
npm install -g pm2
pm2 start dist/index.js --name discord-bot
pm2 save
pm2 startup
```

#### 2. Railway
- Conecte seu repositório GitHub
- Configure as variáveis de ambiente
- Railway detecta automaticamente e faz o deploy

#### 3. Heroku
- Conecte seu repositório GitHub
- Configure as variáveis de ambiente
- Adicione `Procfile`:
```
worker: node dist/index.js
```

#### 4. Replit
- Importe o repositório
- Configure as variáveis de ambiente
- Execute `npm start`

### Variáveis de Ambiente no Deploy
Certifique-se de configurar todas as variáveis de ambiente no seu serviço de deploy:
- `DISCORD_TOKEN`
- `CLIENT_ID`
- `GUILD_ID` (opcional)
- `NODE_ENV=production`

## 🐛 Troubleshooting

### Bot não responde aos comandos
- Verifique se o token está correto
- Certifique-se de que os comandos foram registrados (pode levar até 1 hora para comandos globais)
- Verifique os logs para erros

### Erro de permissões
- Verifique se o bot tem as permissões necessárias no servidor
- Certifique-se de que o bot está no servidor

### Canais dinâmicos não funcionam
- Execute `/vccreator` para definir um canal criador
- Verifique se o bot tem permissão para criar canais

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se livre para abrir issues ou pull requests.

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📚 Documentação Adicional

- [CHANGELOG.md](./CHANGELOG.md) - Histórico de mudanças
- [src/constants/README.md](./src/constants/README.md) - Documentação das constantes

## 🔗 Links Úteis

- [Discord.js Documentation](https://discord.js.org/#/docs)
- [Discord Developer Portal](https://discord.com/developers/applications)
- [Discord API Documentation](https://discord.com/developers/docs/intro)

---

Desenvolvido com ❤️ usando TypeScript e Discord.js
