# Site LeanLia

Website completo e responsivo para a LeanLia - Consultoria de Inteligência Artificial para o Agronegócio.

## 🌟 Características

- **Design Moderno e Responsivo**: Interface otimizada para desktop, tablet e mobile
- **Suporte Multilíngue**: Português (BR), Inglês e Espanhol com seletor de idioma
- **Identidade Visual Agronegócio**: Paleta de cores verde (campo) e azul (tecnologia)
- **10 Seções Principais**:
  1. Hero Section - Apresentação impactante
  2. Sobre a LeanLia - Missão e diferenciais
  3. LIA - Assistente de IA dedicado
  4. 4 Visões de IA - Descritiva, Diagnóstica, Preditiva e Prescritiva
  5. Metodologia TAIA - 4 fases de implementação
  6. Benefícios - Resultados práticos
  7. Casos de Sucesso - Exemplos reais
  8. Processo de Trabalho - Timeline
  9. Equipe Multidisciplinar
  10. Contato - Formulário e informações

- **Página de Login**: Interface simples para assinantes da LIA (pronta para integração)
- **Imagens Ilustrativas**: 5 imagens de alta qualidade contextualizando o negócio

## 🚀 Tecnologias

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11
- **Database**: MySQL (via Drizzle ORM)
- **Auth**: Manus OAuth (configurável)
- **Build**: Vite

## 📦 Instalação

```bash
# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env

# Rodar migrações do banco de dados
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

## 🌐 URLs

- **Desenvolvimento**: http://localhost:3000
- **Produção**: [A ser configurado]
- **GitHub**: https://github.com/AgroIAActionPlan/Site_LeanLia

## 📝 Estrutura do Projeto

```
Site_LeanLia/
├── client/                 # Frontend React
│   ├── public/            # Imagens e assets estáticos
│   │   ├── hero-agro-tech.jpg
│   │   ├── ai-dashboard-field.jpg
│   │   ├── smart-irrigation.jpg
│   │   ├── agro-machinery.jpg
│   │   └── team-collaboration.jpg
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   │   └── LanguageSelector.tsx
│   │   ├── contexts/      # Contextos React
│   │   │   ├── ThemeContext.tsx
│   │   │   └── LanguageContext.tsx
│   │   ├── lib/          # Bibliotecas e utilidades
│   │   │   ├── trpc.ts
│   │   │   └── translations.ts
│   │   ├── pages/        # Páginas da aplicação
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   └── NotFound.tsx
│   │   ├── App.tsx       # Configuração de rotas
│   │   ├── main.tsx      # Entry point
│   │   └── index.css     # Estilos globais
├── server/                # Backend Express + tRPC
│   ├── routers.ts        # Rotas tRPC
│   ├── db.ts            # Queries do banco
│   └── _core/           # Configurações core
├── drizzle/              # Schema do banco de dados
│   └── schema.ts
└── shared/               # Tipos compartilhados
```

## 🎨 Paleta de Cores

- **Primary (Verde Agrícola)**: `oklch(0.45 0.15 145)` - Representa o campo e natureza
- **Secondary (Azul Tecnologia)**: `oklch(0.55 0.18 220)` - Representa IA e inovação
- **Accent (Dourado)**: `oklch(0.75 0.15 75)` - Representa colheita e prosperidade

## 🌍 Internacionalização

O site suporta 3 idiomas através do sistema de traduções em `client/src/lib/translations.ts`:

- **Português (pt)**: Idioma padrão
- **English (en)**: Tradução completa
- **Español (es)**: Tradução completa

O idioma é persistido no localStorage e pode ser alterado através do seletor no header.

## 🔐 Autenticação

A página de login (`/login`) está implementada com interface completa, pronta para integração com seu sistema de autenticação. Atualmente é uma demonstração que pode ser conectada a:

- Sistema próprio de autenticação
- OAuth providers
- JWT tokens
- Qualquer backend de autenticação

## 📱 Responsividade

O site é totalmente responsivo com breakpoints:

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

## 🔧 Próximos Passos

1. **Integração de Autenticação**: Conectar a página de login com sistema real
2. **Backend do Formulário**: Implementar envio de emails do formulário de contato
3. **Analytics**: Adicionar Google Analytics ou similar
4. **SEO**: Otimizar meta tags e estrutura para SEO
5. **Deploy**: Configurar CI/CD e deploy em produção

## 📞 Contato

- **Email**: contato@leanlia.com
- **WhatsApp**: (11) 93396-7595
- **Endereço**: Av. Pereira Barreto, 1201, Sala 24B, Torre Vitória, Centro, São Bernardo do Campo, SP
- **Instagram**: [@leanlia](https://instagram.com/leanlia)
- **LinkedIn**: [leanlia](https://linkedin.com/company/leanlia)

## 📄 Licença

© 2024 LeanLia. Todos os direitos reservados.

