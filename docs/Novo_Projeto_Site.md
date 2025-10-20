# Novo Projeto Site LiaLean

Guia completo para preparar o servidor Ubuntu 24.04, padronizar a stack Docker (com Portainer, N8N, Redis e PostgreSQL) e organizar o código do projeto React/Express. O texto foi escrito em linguagem acessível para quem está começando, com cada comando explicado.

---

## 1. Visão geral do estado atual do repositório

- Monorepo Node 20 gerenciado por `pnpm`, com frontend em `client/`, backend em `server/` e tipos compartilhados em `shared/`. O build (`pnpm build`) usa Vite + esbuild e gera um bundle único que atende frontend e API.
- `Dockerfile` multi-stage funcional, porém o `docker-compose.yml` atual só provisiona `app` + `db` e depende de uma rede Traefik externa já existente. Não contempla Redis nem a topologia recomendada para N8N (instância principal, webhook dedicado e workers).
- Documentação (`README.md`) e script de deploy (`scripts/deploy.sh`) ainda citam MySQL e PM2, embora o projeto tenha migrado para PostgreSQL e pretenda usar Docker/Portainer; isso pode confundir novas pessoas.
- Backend Express (`server/_core/index.ts`) exposto sem middlewares essenciais (`helmet`, `cors`, rate limiting) e sem validação forte das variáveis de ambiente (arquivo `server/_core/env.ts` apenas lê `process.env`).
- Fluxo de logs e observabilidade inexistente além do `console.log`. Não há tracing, métricas ou alertas de erro.
- Testes automatizados praticamente ausentes; `vitest` está instalado, mas não há cobertura mínima (0 suites).
- Base de dados definida em Drizzle (`drizzle/schema.ts`), porém apenas com a tabela de usuários e sem migrações geradas para a estrutura completa do site, formulário, etc.

---

## 2. Prioridades imediatas

1. **Infraestrutura**: subir uma stack Docker com Traefik + Portainer + PostgreSQL + Redis + N8N (instância principal, webhook e worker) + aplicação `Site_LeanLia`.
2. **Documentação coerente**: atualizar guias e scripts para refletir PostgreSQL, Docker/Portainer e o novo fluxo de deploy.
3. **Hardening da API**: adicionar camadas de segurança (helmet, cors, rate limiting), validação de env com `zod` e logging estruturado.
4. **Qualidade de código**: organizar backlog de testes, limpeza de dependências e padronização de scripts (`lint`, `typecheck`, `test`, `build`).

---

## 3. Preparar a VPS Ubuntu 24.04

Todas as etapas abaixo devem ser executadas logado via SSH na VPS.

### 3.1 Atualizar o sistema

```bash
sudo apt update && sudo apt upgrade -y
```

Atualiza a lista de pacotes e instala correções de segurança. Reinicie se o kernel for atualizado:

```bash
sudo reboot
```

Volte a conectar via SSH após o reboot.

### 3.2 Instalar utilitários básicos

```bash
sudo apt install -y ca-certificates curl gnupg lsb-release ufw
```

- `ca-certificates`, `curl`, `gnupg` são usados para adicionar o repositório oficial do Docker.
- `ufw` será o firewall que vamos configurar.

### 3.3 Configurar firewall UFW

1. Permitir SSH (porta 22) para não perder a conexão:
   ```bash
   sudo ufw allow 22/tcp
   ```
2. Permitir HTTP/HTTPS (Traefik):
   ```bash
   sudo ufw allow 80,443/tcp
   ```
3. Ativar o firewall:
   ```bash
   sudo ufw enable
   ```
4. Conferir o status:
   ```bash
   sudo ufw status
   ```

### 3.4 Definir timezone

```bash
sudo timedatectl set-timezone America/Sao_Paulo
```

Adapte se você estiver em outro fuso horário; o valor será reutilizado na stack Docker (`GENERIC_TIMEZONE`).

---

## 4. Instalar Docker e Portainer

### 4.1 Adicionar repositório oficial do Docker

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

### 4.2 Instalar Docker Engine + Compose plugin

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

Verifique se instalou corretamente:

```bash
docker --version
docker compose version
```

### 4.3 Permitir que o usuário atual use Docker sem `sudo`

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Saia e entre novamente na sessão SSH se necessário.

### 4.4 Instalar Portainer (interface web para gerenciar Docker)

1. Criar volume para persistir dados do Portainer:
   ```bash
   docker volume create portainer_data
   ```
2. Subir o container em modo daemon:
   ```bash
   docker run -d \
     -p 9443:9443 \
     --name portainer \
     --restart=unless-stopped \
     -v /var/run/docker.sock:/var/run/docker.sock \
     -v portainer_data:/data \
     portainer/portainer-ce:2.21.5
   ```
3. Acesse `https://SEU_IP:9443`, crie usuário administrador e conecte-se ao ambiente local (`local` environment).

---

## 5. Organizar diretórios e backups no servidor

Crie uma pasta para o projeto e para armazenar backups:

```bash
sudo mkdir -p /opt/lialean/{stacks,backups,logs}
sudo chown -R $USER:$USER /opt/lialean
```

- `stacks/`: arquivos `docker-compose.yml`, `.env`, scripts auxiliares.
- `backups/`: dumps manuais do PostgreSQL ou exportações do Portainer.
- `logs/`: logs agregados (Traefik, aplicação, n8n) caso deseje redirecionar para arquivos.

Use Portainer para subir stacks apontando para `/opt/lialean/stacks`.

---

## 6. Criar os segredos e arquivo `.env`

Na pasta `/opt/lialean/stacks`, crie um arquivo `.env` com todas as variáveis. Primeiro gere segredos aleatórios:

```bash
openssl rand -hex 32
```

Use o resultado para `JWT_SECRET` e `N8N_ENCRYPTION_KEY`. Gere senhas individuais para cada usuário do PostgreSQL:

```bash
openssl rand -base64 24
```

Exemplo de `.env` (ajuste domínios e senhas):

```
# Domínios públicos
DOMAIN_APP=app.seudominio.com
DOMAIN_N8N=n8n.seudominio.com

# Traefik
TRAEFIK_ACME_EMAIL=contato@seudominio.com

# Timezone
TIMEZONE=America/Sao_Paulo

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=troque_esta_senha
POSTGRES_APP_DB=lialean_db
APP_DB_USER=appuser
APP_DB_PASSWORD=troque_para_app
N8N_DB_NAME=n8n_db
N8N_DB_USER=n8nuser
N8N_DB_PASSWORD=troque_para_n8n

# URLs utilizadas pela aplicação
DATABASE_URL=postgresql://${APP_DB_USER}:${APP_DB_PASSWORD}@postgres:5432/${POSTGRES_APP_DB}
JWT_SECRET=hex_gerado_pelo_openssl
VITE_APP_ID=lialean
VITE_APP_TITLE=LiaLean - IA para Agronegócio
VITE_APP_LOGO=/logo.png
OWNER_NAME=Admin LiaLean
OWNER_OPEN_ID=
OAUTH_SERVER_URL=https://oauth.seudominio.com
VITE_OAUTH_PORTAL_URL=https://portal.seudominio.com
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# N8N
N8N_BASIC_USER=admin
N8N_BASIC_PASS=troque_para_n8n_ui
N8N_ENCRYPTION_KEY=hex_gerado_pelo_openssl
N8N_WORKER_CONCURRENCY=5

# Docker Hub / imagem da aplicação (opcional)
APP_IMAGE=lialean/site:latest
```

> **Importante:** mantenha o arquivo `.env` fora do repositório Git (adicione ao `.gitignore` se necessário).

---

## 7. Stack Docker completa (Traefik + Aplicação + N8N + Redis + PostgreSQL)

Salve o arquivo abaixo como `/opt/lialean/stacks/lialean-stack.yml`. Ele foi pensado para ser importado diretamente no Portainer como uma stack.

```yaml
version: "3.9"

services:
  traefik:
    image: traefik:v3.1
    container_name: traefik
    restart: unless-stopped
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --providers.docker.network=proxy
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.le.acme.httpchallenge=true
      - --certificatesresolvers.le.acme.httpchallenge.entrypoint=web
      - --certificatesresolvers.le.acme.email=${TRAEFIK_ACME_EMAIL}
      - --certificatesresolvers.le.acme.storage=/letsencrypt/acme.json
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_letsencrypt:/letsencrypt
    networks:
      - proxy

  postgres:
    image: postgres:16-alpine
    container_name: lialean-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=${POSTGRES_USER}
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
      - POSTGRES_DB=${POSTGRES_USER}
      - PGDATA=/var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - internal

  redis:
    image: redis:7-alpine
    container_name: lialean-redis
    restart: unless-stopped
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_data:/data
    networks:
      - internal

  app:
    image: ${APP_IMAGE:-lialean/site:latest}
    container_name: lialean-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOST=0.0.0.0
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
      - VITE_APP_ID=${VITE_APP_ID}
      - VITE_APP_TITLE=${VITE_APP_TITLE}
      - VITE_APP_LOGO=${VITE_APP_LOGO}
      - OWNER_NAME=${OWNER_NAME}
      - OWNER_OPEN_ID=${OWNER_OPEN_ID}
      - OAUTH_SERVER_URL=${OAUTH_SERVER_URL}
      - VITE_OAUTH_PORTAL_URL=${VITE_OAUTH_PORTAL_URL}
      - BUILT_IN_FORGE_API_URL=${BUILT_IN_FORGE_API_URL}
      - BUILT_IN_FORGE_API_KEY=${BUILT_IN_FORGE_API_KEY}
      - VITE_ANALYTICS_ENDPOINT=${VITE_ANALYTICS_ENDPOINT}
      - VITE_ANALYTICS_WEBSITE_ID=${VITE_ANALYTICS_WEBSITE_ID}
    networks:
      - proxy
      - internal
    labels:
      - traefik.enable=true
      - traefik.http.routers.lialean-app.rule=Host(`${DOMAIN_APP}`)
      - traefik.http.routers.lialean-app.entrypoints=websecure
      - traefik.http.routers.lialean-app.tls.certresolver=le
      - traefik.http.services.lialean-app.loadbalancer.server.port=3000
      - traefik.http.routers.lialean-app-http.rule=Host(`${DOMAIN_APP}`)
      - traefik.http.routers.lialean-app-http.entrypoints=web
      - traefik.http.routers.lialean-app-http.middlewares=redirect-to-https
      - traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https
      - traefik.http.middlewares.redirect-to-https.redirectscheme.permanent=true

  n8n-main:
    image: n8nio/n8n:1.75.1
    container_name: n8n-main
    restart: unless-stopped
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${N8N_DB_NAME}
      - DB_POSTGRESDB_USER=${N8N_DB_USER}
      - DB_POSTGRESDB_PASSWORD=${N8N_DB_PASSWORD}
      - EXECUTIONS_PROCESS=main
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_DEFAULT_BASIC_AUTH_USER=${N8N_BASIC_USER}
      - N8N_DEFAULT_BASIC_AUTH_PASSWORD=${N8N_BASIC_PASS}
      - N8N_HOST=${DOMAIN_N8N}
      - N8N_PORT=5678
      - WEBHOOK_URL=https://${DOMAIN_N8N}/
      - GENERIC_TIMEZONE=${TIMEZONE}
      - N8N_DIAGNOSTICS_ENABLED=false
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    networks:
      - proxy
      - internal
    labels:
      - traefik.enable=true
      - traefik.http.routers.lialean-n8n.rule=Host(`${DOMAIN_N8N}`)
      - traefik.http.routers.lialean-n8n.entrypoints=websecure
      - traefik.http.routers.lialean-n8n.tls.certresolver=le
      - traefik.http.services.lialean-n8n.loadbalancer.server.port=5678

  n8n-webhook:
    image: n8nio/n8n:1.75.1
    container_name: n8n-webhook
    restart: unless-stopped
    command: n8n webhook
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${N8N_DB_NAME}
      - DB_POSTGRESDB_USER=${N8N_DB_USER}
      - DB_POSTGRESDB_PASSWORD=${N8N_DB_PASSWORD}
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - N8N_HOST=${DOMAIN_N8N}
      - WEBHOOK_URL=https://${DOMAIN_N8N}/
      - GENERIC_TIMEZONE=${TIMEZONE}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    depends_on:
      - n8n-main
    networks:
      - proxy
      - internal

  n8n-worker:
    image: n8nio/n8n:1.75.1
    container_name: n8n-worker
    restart: unless-stopped
    command: /bin/sh -c "n8n worker --concurrency ${N8N_WORKER_CONCURRENCY}"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=${N8N_DB_NAME}
      - DB_POSTGRESDB_USER=${N8N_DB_USER}
      - DB_POSTGRESDB_PASSWORD=${N8N_DB_PASSWORD}
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - GENERIC_TIMEZONE=${TIMEZONE}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
    depends_on:
      - redis
      - postgres
    networks:
      - internal

networks:
  proxy:
    driver: bridge
  internal:
    driver: bridge
    internal: true

volumes:
  traefik_letsencrypt:
  postgres_data:
  redis_data:
  n8n_data:
```

### O que cada serviço faz

- **traefik**: proxy reverso com HTTPS automático via Let’s Encrypt.
- **postgres**: banco único. Usaremos usuários diferentes (`appuser`, `n8nuser`) e dois bancos (`lialean_db`, `n8n_db`).
- **redis**: fila Bull para o N8N (necessário para modo queue/worker).
- **app**: imagem do site (backend + frontend) criada com o `Dockerfile` do repositório.
- **n8n-main**: interface principal do N8N; mantém execução em fila.
- **n8n-webhook**: instancia especializada para receber webhooks sem bloquear a interface.
- **n8n-worker**: executa os jobs que chegam via fila Redis; ajuste `N8N_WORKER_CONCURRENCY` conforme recursos da VPS.

---

## 8. Provisionar tudo via Portainer

1. Acesse Portainer (`https://SEU_IP:9443`), entre no ambiente `local`.
2. Vá em *Stacks* → *Add Stack*.
3. Defina um nome (ex.: `lialean`) e cole o conteúdo do `lialean-stack.yml`.
4. Marque **"Use environment variables"** e carregue o `.env` criado em `/opt/lialean/stacks/.env`.
5. Clique em **Deploy the stack**. Portainer criará todos os containers.

### 8.1 Criar bancos e usuários específicos no PostgreSQL

Assim que o container `postgres` estiver saudável:

```bash
docker exec -it lialean-postgres psql -U ${POSTGRES_USER} <<'SQL'
CREATE USER appuser WITH PASSWORD 'troque_para_app';
CREATE DATABASE lialean_db WITH OWNER appuser ENCODING 'UTF8';
CREATE USER n8nuser WITH PASSWORD 'troque_para_n8n';
CREATE DATABASE n8n_db WITH OWNER n8nuser ENCODING 'UTF8';
GRANT ALL PRIVILEGES ON DATABASE lialean_db TO appuser;
GRANT ALL PRIVILEGES ON DATABASE n8n_db TO n8nuser;
SQL
```

> Substitua as senhas pelos valores reais usados no `.env`. Execute esse bloco uma única vez.

### 8.2 Aplicar o schema da aplicação

No seu computador local:

1. Garanta que `DATABASE_URL` aponte para o banco remoto (`postgresql://appuser:senha@vps:5432/lialean_db`).
2. Rode:
   ```bash
   pnpm install
   pnpm db:push
   ```

Isso gera/aplica as migrações do Drizzle no banco remoto.

### 8.3 Primeiro acesso

- Site: `https://app.seudominio.com`
- N8N: `https://n8n.seudominio.com` (login com `N8N_BASIC_USER` / `N8N_BASIC_PASS`)

---

## 9. Rotina de atualização manual (deploys futuros)

1. **Gerar nova imagem da aplicação** na sua máquina local:
   ```bash
   pnpm install
   pnpm build
   docker build -t lialean/site:TAG .
   docker tag lialean/site:TAG DOCKER_USER/lialean-site:TAG
   docker push DOCKER_USER/lialean-site:TAG
   ```
   Ajuste `TAG` ou abuse de `latest`.

2. **Atualizar stack no Portainer**:
   - Editar a stack `lialean`.
   - Alterar `APP_IMAGE` no `.env` para a nova tag ou usar `docker compose pull` na aba *Recreate*.
   - Clicar em *Update the stack* → marcar *Re-pull image*.

3. **Rodar testes rápidos**:
   - Verificar logs `docker logs lialean-app`.
   - Acessar `/health` para validar status da API.

---

## 9.1 Validação direta na VPS (sem ambiente de staging)

Quando não houver servidor provisório, valide o procedimento na própria VPS com cuidado:

1. **Crie backups antes de tudo**:
   ```bash
   sudo tar czf /opt/lialean/backups/pre-deploy_$(date +%F_%H%M).tar.gz /opt/lialean/stacks
   docker exec lialean-postgres pg_dump -U ${POSTGRES_USER} -d ${POSTGRES_USER} > /opt/lialean/backups/postgres_full_$(date +%F_%H%M).sql
   ```
   Ajuste o nome do banco se já estiver usando `lialean_db`.
2. **Planeje uma janela curta** — se não houver usuários ativos, basta garantir que você tem tempo livre para fazer ajustes.
3. **Replique a stack como teste** no Portainer:
   - Crie uma stack chamada `lialean-test`.
   - Use uma cópia do `lialean-stack.yml` com domínios de teste (ex.: `test-app.seudominio.com`) e, se possível, outra tag de imagem.
   - Valide que todos os containers iniciam e que `https://test-app.../health` e o painel do n8n respondem.
4. **Elimine a stack de teste** após os checks (`Stacks > lialean-test > Remove`).
5. **Atualize a stack principal** seguindo os passos de deploy (item 9), usando a mesma configuração validada.
6. **Retorno rápido se algo falhar**:
   ```bash
   docker compose -f /opt/lialean/stacks/lialean-stack.yml down
   docker compose -f /opt/lialean/stacks/lialean-stack.yml up -d
   ```
   Caso precise voltar ao estado anterior, reimporte os backups criados no passo 1.

---

## 10. Limpeza e melhorias no repositório

### 10.1 Documentação e scripts

- **Atualizar `README.md`** para refletir PostgreSQL, Docker/Portainer e remover referências a MySQL e PM2 (seção "Tecnologias" e "Deploy").
- **Reescrever `scripts/deploy.sh`** focando em Docker:
  - Remover mysqldump/PM2.
  - Adicionar passos para `docker build`, `docker push` e atualização da stack via `docker compose`.
  - Incluir validação que garante que a `.env` contém as variáveis do item 6.
- Criar `docs/deploy-portainer.md` com versão resumida deste guia para equipe.

### 10.2 Backend (`server/`)

- Adicionar middlewares:
  - `helmet` e `cors` configurados com a lista de domínios permitidos.
  - Rate limiting simples (ex.: `express-rate-limit`) para `/api/trpc`.
- Criar módulo `server/_core/env.ts` validando variáveis com `zod` ou `envalid`; lançar erro amigável se algo faltar.
- Substituir logs `console.log` por `pino` ou `winston`, centralizando em `server/_core/logger.ts`.
- Implementar tratador global de erros Express (middleware) que converte exceções em respostas JSON padronizadas.
- Configurar `server/db.ts` para:
  - Utilizar pooling (postgres-js já faz, mas adicione função `shutdown()` para fechar conexões no `process.on('SIGTERM')`).
  - Expor utilitário `runMigrations` para ser chamado no boot (executar SQL pronto ou confirmar que o schema está atualizado).

### 10.3 Frontend (`client/`)

- Criar script `pnpm lint` usando `eslint` + `@tanstack/eslint-plugin-query` (ajuda a evitar chamados duplicados).
- Dividir `client/src/pages/Home.tsx` em seções menores (ex.: `sections/`) para facilitar manutenção.
- Configurar `react-query` `QueryClient` com `retry` customizado e fallback offline.
- Revisar `client/src/lib/translations.ts` e segmentar por domínio (ex.: `hero`, `benefits`, etc.) para evitar um único objeto gigante.
- Adicionar testes básicos com `@testing-library/react` para componentes críticos (hero, formulário de contato).

### 10.4 Compartilhado (`shared/`)

- Garantir que qualquer nova constante ou tipo seja exposto via `shared/index.ts` para evitar imports relativos profundos (`../../../`).
- Criar `shared/config.ts` para parametrizar valores padrão (timeouts, limites) usados tanto no front quanto no back.

### 10.5 Automação e qualidade

- Adicionar workflow GitHub Actions:
  - Jobs: `pnpm install`, `pnpm check`, `pnpm lint`, `pnpm test`, `pnpm build`.
  - Cache do `pnpm store` para acelerar builds.
- Configurar `dependabot.yml` (ou Renovate) para alertar sobre atualizações de dependências, especialmente `n8n` e libs de segurança.
- Criar pipeline opcional que faça build e push automático da imagem Docker quando `main` recebe um merge tagueado.

---

## 11. Observabilidade, segurança e manutenção contínua

- **Logs centralizados**: enviar logs do Traefik, aplicação e N8N para `/opt/lialean/logs` ou para um serviço externo (Papertrail, Loki). Configure `docker compose` com `logging` → `driver`.
- **Backups**:
  - PostgreSQL: cron job diário usando `pg_dump` salvando em `/opt/lialean/backups` e sincronizando com armazenamento seguro (S3/Backblaze).
  - N8N: backup do volume `n8n_data` (pelo menos semanal via `docker run --rm -v n8n_data:/data -v $(pwd):/backup busybox tar czf /backup/n8n_$(date +%F).tar.gz /data`).
- **Monitoramento**:
  - Instalar Uptime Kuma ou Healthchecks.io para validar `https://app.seudominio.com/health` e `https://n8n.seudominio.com/healthz`.
  - Configurar alertas de expiração do certificado (Let’s Encrypt renova automaticamente, mas é bom monitorar).
- **Segurança**:
  - Usar senhas únicas e fortes (já tratado no `.env`).
  - Desabilitar acesso direto ao Postgres e Redis de fora da VPS (não mapear portas públicas, apenas rede interna).
  - Manter o sistema atualizado (`sudo apt upgrade` mensal e `docker image prune` para remover imagens antigas).

---

## 12. Checklist rápido pós-implantação

- [ ] Domínios resolvem para o IP da VPS.
- [ ] Certificados TLS emitidos (Traefik → ACME/Let’s Encrypt).
- [ ] Banco `lialean_db` com tabela `users` criada via Drizzle.
- [ ] N8N acessível, workflows conseguem executar e webhooks respondem (`queue` funcionando).
- [ ] Página `/health` retorna `{"status":"ok"}`.
- [ ] Backups agendados e testados.
- [ ] Documentação interna atualizada (`README.md`, `scripts/deploy.sh`, este guia).

Com esses passos você terá uma base sólida para evoluir o projeto com segurança, mantendo deploys controlados via Portainer e preparando o ambiente para futuras integrações (webhooks, workers e filas no N8N, além das melhorias de código descritas acima).
