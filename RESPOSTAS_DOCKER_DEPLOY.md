# Respostas - Configuração Docker e Deploy

Respostas objetivas para configuração do deploy com Docker + Traefik na VPS.

---

## 📋 Respostas às Questões

### 1. **Dockerfiles existem?**

❌ **NÃO** - O projeto atualmente não possui Dockerfiles.

**Ação necessária**: Criar Dockerfiles de produção.

**Estrutura do projeto atual**:
- É um projeto **monorepo** (frontend + backend no mesmo repositório)
- Frontend: Vite (React) em `client/`
- Backend: Express + tRPC em `server/`
- Build unificado: `pnpm build` gera tudo em `dist/`

**Solução proposta**: 
- Criar **1 Dockerfile** que serve tanto frontend quanto backend
- OU criar **2 Dockerfiles** separados (frontend em `client/Dockerfile`, backend em `server/Dockerfile`)

👉 **Recomendação**: Dockerfile único (mais simples para este projeto)

---

### 2. **Portas internas corretas?**

**Backend (Express)**:
- ✅ Porta configurável via variável `PORT`
- ✅ Default: `3000`
- ✅ Escuta em `0.0.0.0` (todas as interfaces)
- Arquivo: `server/_core/index.ts`

**Frontend (após build)**:
- ⚠️ Após build, os arquivos estáticos ficam em `client/dist/`
- ⚠️ Em produção, o **backend Express serve o frontend** na mesma porta
- ✅ Não há servidor separado para frontend

**Configuração Traefik correta**:
```yaml
# Apenas 1 serviço (backend serve tudo)
traefik.http.services.site-api.loadbalancer.server.port: "3000"
```

**Ajustes necessários no compose**:
- ❌ Remover serviço `site-frontend` (não é necessário)
- ✅ Manter apenas `site-api` na porta 3000
- ✅ Backend Express já serve arquivos estáticos do frontend

---

### 3. **Escolha do banco**

✅ **PostgreSQL** (projeto já migrado)

**Configuração**:
- Usar `--profile pg` no docker-compose
- PostgreSQL 15+
- Porta: 5432

**Justificativa**:
- Projeto já refatorado para PostgreSQL
- Schema pronto em `database/schema_postgresql.sql`
- Drizzle ORM configurado para PostgreSQL
- Melhor performance e recursos

---

### 4. **Variáveis do banco (.env)**

**Arquivo**: `/opt/site/.env`

```env
# ============================================
# Database Configuration (PostgreSQL)
# ============================================
DATABASE_URL=postgresql://appuser:super_senha_segura@db:5432/lialean_db

# ============================================
# JWT & Security
# ============================================
JWT_SECRET=gerar_com_node_crypto_randomBytes_32_hex

# ============================================
# Application Configuration
# ============================================
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# ============================================
# Application Info
# ============================================
VITE_APP_ID=lialean
VITE_APP_TITLE=LiaLean - IA para Agronegócio
VITE_APP_LOGO=/logo.png

# ============================================
# Owner (Opcional)
# ============================================
OWNER_NAME=Admin LiaLean
OWNER_OPEN_ID=

# ============================================
# OAuth (Opcional - deixar vazio se não usar)
# ============================================
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# ============================================
# Analytics (Opcional)
# ============================================
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

**Gerar JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Variáveis do PostgreSQL para docker-compose**:
```env
# No .env do docker-compose
POSTGRES_USER=appuser
POSTGRES_PASSWORD=super_senha_segura
POSTGRES_DB=lialean_db
```

---

### 5. **Express atrás de proxy (ajuste no código)**

⚠️ **PRECISA AJUSTAR** - Adicionar configuração de trust proxy

**Arquivo a modificar**: `server/_core/index.ts`

**Código a adicionar**:
```typescript
// Logo após criar o app Express
const app = express();

// IMPORTANTE: Confiar no proxy (Traefik)
app.set('trust proxy', 1);

// ... resto do código
```

**Benefícios**:
- ✅ `req.ip` retorna IP real do cliente
- ✅ Rate limiting funciona corretamente
- ✅ Cookies seguros (secure) funcionam via HTTPS
- ✅ Headers X-Forwarded-* são respeitados

---

### 6. **CORS**

⚠️ **PRECISA CONFIGURAR** - Adicionar configuração de CORS

**Arquivo a modificar**: `server/_core/index.ts`

**Código a adicionar**:
```typescript
import cors from 'cors';

// Configurar CORS
app.use(cors({
  origin: [
    'https://app.vps.lialean.cloud',
    'https://lialean.cloud',
    'https://www.lialean.cloud'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Dependência necessária**:
```bash
pnpm add cors
pnpm add -D @types/cors
```

**Nota**: Se frontend e backend estão no mesmo domínio (mesma porta), CORS não é necessário.

---

### 7. **Traefik**

**Configuração atual assumida**:
- ✅ Resolver ACME: `le`
- ✅ Rede: `proxy`
- ✅ Certificados Let's Encrypt

**Verificar no seu Traefik**:
```bash
# Ver resolvers configurados
docker exec traefik cat /etc/traefik/traefik.yml | grep -A 5 certificatesResolvers

# Ver redes
docker network ls | grep proxy
```

**Se o resolver tiver outro nome** (ex: `letsencrypt`, `myresolver`):
```yaml
# Trocar em TODOS os routers
traefik.http.routers.site-frontend.tls.certresolver: "SEU_RESOLVER"
traefik.http.routers.site-api.tls.certresolver: "SEU_RESOLVER"
```

**Se a rede tiver outro nome**:
```yaml
networks:
  proxy:
    external: true
    name: SEU_NOME_DA_REDE  # ex: traefik_proxy
```

---

## 📝 Resumo das Ações Necessárias

### ✅ Confirmado (OK)
1. Banco de dados: **PostgreSQL**
2. Porta backend: **3000**
3. Schema PostgreSQL: **pronto**

### ⚠️ Precisa Criar
1. **Dockerfile** (1 arquivo unificado)
2. **docker-compose.yml** completo
3. **.env** de produção
4. **.dockerignore**

### ⚠️ Precisa Ajustar no Código
1. Adicionar `app.set('trust proxy', 1)` no Express
2. Configurar CORS (se necessário)
3. Verificar que backend serve arquivos estáticos do frontend

### ⚠️ Precisa Configurar
1. Criar rede `proxy` no Docker (se não existir)
2. Verificar nome do resolver Traefik
3. Configurar DNS apontando para VPS

---

## 🎯 Próximos Passos

1. **Gerar Dockerfiles** ✅ (vou criar)
2. **Gerar docker-compose.yml** ✅ (vou criar)
3. **Ajustar código Express** ✅ (vou fazer)
4. **Criar .env.example** ✅ (vou criar)
5. **Testar build local** ⏳ (você testa)
6. **Deploy na VPS** ⏳ (você executa)

---

## 📞 Informações Adicionais Necessárias

Para finalizar a configuração, preciso saber:

1. **Domínio exato**:
   - Frontend: `app.vps.lialean.cloud` ✅
   - Backend API: `api.vps.lialean.cloud` ou mesma URL?

2. **Nome do resolver Traefik**:
   - Default: `le` ✅
   - Ou outro? (verificar no seu traefik.yml)

3. **Nome da rede Docker**:
   - Default: `proxy` ✅
   - Ou outro? (verificar com `docker network ls`)

4. **Subpath para API**:
   - `/api` ✅ (padrão)
   - Ou outro? (ex: `/trpc`, `/v1`)

---

**Última atualização**: 17 de outubro de 2024  
**Status**: Aguardando confirmações para gerar arquivos Docker

