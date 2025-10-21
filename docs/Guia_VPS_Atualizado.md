# Guia VPS Atualizado – Site LiaLean

Plano completo para preparar a VPS Ubuntu 24.04 (2 vCPU, 8 GB RAM, 100 GB NVMe, 8 TB banda) e hospedar todos os serviços via Docker: Traefik, Portainer, PostgreSQL, Redis, N8N (main + webhook + worker) e o aplicativo Site LiaLean. O guia é faseado, com validações ao final de cada etapa e comandos prontos para quem está começando.

---

## Visão geral

- **Sistema operacional**: Ubuntu Server 24.04 LTS (imagem “pura”).
- **Domínios sugeridos**  
  - `app.vps.lialean.cloud` → frontend/backend.  
  - `n8n.vps.lialean.cloud` → painel N8N.  
  - `webhook.vps.lialean.cloud` → webhooks N8N.  
  - `portainer.vps.lialean.cloud` → console Portainer.
- **DNS já existentes**: `vps.lialean.cloud` (A → 72.61.132.113), `portainer.vps.lialean.cloud`, `n8n.vps.lialean.cloud`, `webhook.vps.lialean.cloud`. Ainda falta criar `app.vps.lialean.cloud` (CNAME para `vps.lialean.cloud`).
- **Usuários com acesso SSH**: `deploy` (automação/deploy) e `plinex` (admin). Ambos usarão chaves SSH e terão acesso sudo.
- **Repositório GitHub**: será acessado via chave SSH criada na VPS.
- **Timezone**: `America/Sao_Paulo`.

---

## Fases do processo

1. Preparação inicial (DNS, acesso root).
2. Atualizações do sistema e timezone.
3. Criação dos usuários `deploy` e `plinex` + chaves SSH.
4. Hardening do SSH.
5. Firewall e utilitários básicos.
6. Instalação do Docker + Docker Compose.
7. Estrutura de diretórios e arquivo `.env`.
8. Stack Docker (Traefik, Portainer, PostgreSQL, Redis, N8N, Aplicação).
9. Inicialização da stack e testes.
10. Banco de dados e migrações.
11. Deploy da aplicação e atualização da stack.
12. Backups, monitoramento e manutenção contínua.

Cada fase inclui passos de validação para garantir que tudo esteja funcionando antes de seguir.

---

## Fase 1 – Preparação inicial

### 1.1 Conectar na VPS como root

```bash
ssh root@72.61.132.113
```

> Atualize o IP caso mude futuramente.

### 1.2 Revisar DNS

Na máquina local:

```bash
dig +short app.vps.lialean.cloud
```

- Se não retornar `vps.lialean.cloud`, crie o registro CNAME `app.vps` → `vps.lialean.cloud` no painel DNS.
- Faça o mesmo comando para `portainer.vps`, `n8n.vps` e `webhook.vps` para garantir que apontam corretamente.

**Validação**  
- Confirme que o login root funciona e que os quatro subdomínios resolvem para 72.61.132.113 (via CNAME → `vps.lialean.cloud` → A).

---

## Fase 2 – Atualizar sistema e ajustar timezone

No servidor (ainda como root):

```bash
apt update && apt upgrade -y
apt install -y curl ca-certificates gnupg unzip git software-properties-common ufw
timedatectl set-timezone America/Sao_Paulo
timedatectl status
```

**Validação**  
- `timedatectl` deve exibir `Time zone: America/Sao_Paulo`.
- `apt upgrade` não deve deixar pacotes pendentes.

---

## Fase 3 – Criar usuários de trabalho e chaves SSH

**Objetivo**: criar os usuários `deploy` e `plinex` com acesso sudo e login por chave, garantindo que as chaves sejam geradas, copiadas e testadas sem necessidade de repetir passos.

### 3.1 Criar usuários no servidor (console root)

```bash
adduser --disabled-password --gecos "" deploy
adduser --disabled-password --gecos "" plinex
usermod -aG sudo deploy
usermod -aG sudo plinex
```

### 3.2 Gerar chaves no macOS (cliente)

No seu computador crie as chaves uma vez:

```bash
ssh-keygen -t ed25519 -C "deploy@lialean-cloud" -f ~/.ssh/lialean_deploy_ed25519
ssh-keygen -t ed25519 -C "plinex@lialean-cloud" -f ~/.ssh/lialean_plinex_ed25519
ls -l ~/.ssh/lialean_*_ed25519*
```

> As chaves privadas (`~/.ssh/lialean_*_ed25519`) ficam guardadas no seu Mac; não copie nem compartilhe. Use `pbcopy < ~/.ssh/lialean_deploy_ed25519.pub` quando precisar colar a chave pública.

### 3.3 Instalar as chaves no servidor (ainda no console root)

Para `deploy`:

```bash
mkdir -p /home/deploy/.ssh
chmod 700 /home/deploy /home/deploy/.ssh
cat <<'EOF' > /home/deploy/.ssh/authorized_keys
cole_aqui_a_chave_publica_do_deploy (linha que começa com ssh-ed25519…)
EOF
chown -R deploy:deploy /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys
```

Repita para `plinex` mudando as referências:

```bash
mkdir -p /home/plinex/.ssh
chmod 700 /home/plinex /home/plinex/.ssh
cat <<'EOF' > /home/plinex/.ssh/authorized_keys
cole_aqui_a_chave_publica_do_plinex
EOF
chown -R plinex:plinex /home/plinex/.ssh
chmod 600 /home/plinex/.ssh/authorized_keys
```

### 3.4 Testar acesso e configurar aliases

No macOS:

```bash
ssh -i ~/.ssh/lialean_deploy_ed25519 deploy@vps.lialean.cloud
```

Se conectar corretamente, crie entradas em `~/.ssh/config` para facilitar:

```bash
cat <<'EOF' >> ~/.ssh/config
Host vps.deploy
  HostName vps.lialean.cloud
  User deploy
  IdentityFile ~/.ssh/lialean_deploy_ed25519
  IdentitiesOnly yes

Host vps.plinex
  HostName vps.lialean.cloud
  User plinex
  IdentityFile ~/.ssh/lialean_plinex_ed25519
  IdentitiesOnly yes
EOF
chmod 600 ~/.ssh/config
```

Agora use `ssh vps.deploy` ou `ssh vps.plinex` sem especificar `-i`.

### 3.5 Gerar chave para o GitHub (no servidor, como `deploy`)

```bash
su - deploy
ssh-keygen -t ed25519 -C "deploy@github-lialean" -f ~/.ssh/github_lialean_ed25519
cat ~/.ssh/github_lialean_ed25519.pub
```

Cadastre essa chave em **GitHub → Settings → SSH keys** ou como deploy key no repositório, então teste:

```bash
ssh -T git@github.com
```

**Validação**  
- `ssh vps.deploy` e `ssh vps.plinex` conectam sem pedir senha.  
- `ssh -T git@github.com` (logado como `deploy`) responde com mensagem de sucesso.

---

## Fase 4 – Hardening do SSH

Editar `/etc/ssh/sshd_config`:

```bash
sudo nano /etc/ssh/sshd_config
```

Ajuste (descomente/adicione):

```
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

Salve o arquivo. Reinicie o serviço:

```bash
sudo systemctl restart ssh
```

**Validação**  
- Abra um novo terminal e conecte como `deploy`.  
- Tente `ssh root@vps.lialean.cloud` (deve falhar).  
- Se perder acesso, use o console do provedor para restaurar o arquivo.

---

## Fase 5 – Firewall e utilitários

Ativar UFW mantendo apenas portas essenciais:

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # Traefik HTTP
sudo ufw allow 443/tcp   # Traefik HTTPS
sudo ufw enable
sudo ufw status
```

> Portainer, N8N e demais serviços ficarão atrás do Traefik, então não precisamos expor 9443/5678 externamente.

Instale utilitários adicionais:

```bash
sudo apt install -y htop jq rsync unzip
```

**Validação**  
- `ufw status` deve listar 22, 80, 443 como `ALLOW`.
- `htop` executa normalmente.

---

## Fase 6 – Instalar Docker e Docker Compose

### 6.1 Adicionar repositório oficial do Docker

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
```

### 6.2 Instalar

```bash
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable docker
sudo systemctl start docker
```

### 6.3 Permitir docker sem sudo para `deploy` e `plinex`

```bash
sudo usermod -aG docker deploy
sudo usermod -aG docker plinex
```

> Faça logout/login nos usuários para aplicar o grupo.

**Validação**  
- `docker --version` e `docker compose version` retornam versões sem erro.  
- `newgrp docker && docker info` (executado como `deploy`) deve funcionar.

---

## Fase 7 – Estrutura de diretórios e variáveis

### 7.1 Criar estrutura

```bash
sudo mkdir -p /opt/lialean/{stacks,backups,logs,tmp}
sudo chown -R deploy:deploy /opt/lialean
```

### 7.2 Gerar senhas e segredos (execute uma vez para cada variável)

```bash
openssl rand -base64 32    # Use para POSTGRES_PASSWORD, APP_DB_PASSWORD, N8N_DB_PASSWORD
openssl rand -hex 32       # Use para JWT_SECRET, N8N_ENCRYPTION_KEY
```

Anote os valores de forma segura (1Password, Bitwarden etc.).

### 7.3 Criar arquivo `.env`

Edite `/opt/lialean/stacks/lialean.env` com o conteúdo abaixo (substitua os `CHANGE_ME_*` pelos valores gerados; mantenha comentários como referência):

```
# Domínios
DOMAIN_PORTAINER=portainer.vps.lialean.cloud
DOMAIN_APP=app.vps.lialean.cloud
DOMAIN_N8N=n8n.vps.lialean.cloud
DOMAIN_WEBHOOK=webhook.vps.lialean.cloud

# Certificados Let's Encrypt
TRAEFIK_ACME_EMAIL=wdroit@gmail.com

# Timezone
TIMEZONE=America/Sao_Paulo

# PostgreSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=CHANGE_ME_POSTGRES   # gerado com openssl rand -base64 32
POSTGRES_APP_DB=lialean_db
APP_DB_USER=appuser
APP_DB_PASSWORD=CHANGE_ME_APPUSER      # openssl rand -base64 32
N8N_DB_NAME=n8n_db
N8N_DB_USER=n8nuser
N8N_DB_PASSWORD=CHANGE_ME_N8NUSER      # openssl rand -base64 32

# URLs utilizadas pela aplicação
DATABASE_URL=postgresql://${APP_DB_USER}:${APP_DB_PASSWORD}@postgres:5432/${POSTGRES_APP_DB}
JWT_SECRET=CHANGE_ME_JWT_HEX           # openssl rand -hex 32
VITE_APP_ID=lialean
VITE_APP_TITLE=LiaLean - IA para Agronegócio
VITE_APP_LOGO=/logo.png
OWNER_NAME=Admin LiaLean
OWNER_OPEN_ID=
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# N8N
N8N_BASIC_USER=admin
N8N_BASIC_PASS=CHANGE_ME_N8N_LOGIN     # senha de painel
N8N_ENCRYPTION_KEY=CHANGE_ME_N8N_HEX   # openssl rand -hex 32
N8N_WORKER_CONCURRENCY=5

# Docker
APP_IMAGE=lialean/site:latest
```

Para proteger:

```bash
chmod 640 /opt/lialean/stacks/lialean.env
```

**Validação**  
- `cat /opt/lialean/stacks/lialean.env` (como deploy) deve mostrar todas as variáveis sem linhas faltando.  
- `test -s /opt/lialean/stacks/lialean.env` retorna sucesso.

---

## Fase 8 – Criar a stack Docker

### 8.1 Preparar arquivos auxiliares

```bash
mkdir -p /opt/lialean/stacks/letsencrypt
touch /opt/lialean/stacks/letsencrypt/acme.json
chmod 600 /opt/lialean/stacks/letsencrypt/acme.json
```

### 8.2 Criar `lialean-stack.yml`

Arquivo `/opt/lialean/stacks/lialean-stack.yml` (observe que não usamos mais a chave `version`, pois ela foi descontinuada no Compose v2):

```yaml
services:
  traefik:
    image: traefik:v3.1
    container_name: traefik
    restart: unless-stopped
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.le.acme.email=${TRAEFIK_ACME_EMAIL}
      - --certificatesresolvers.le.acme.storage=/letsencrypt/acme.json
      - --certificatesresolvers.le.acme.httpchallenge=true
      - --certificatesresolvers.le.acme.httpchallenge.entrypoint=web
      - --log.level=INFO
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt/acme.json:/letsencrypt/acme.json
    networks:
      - proxy

  portainer:
    image: portainer/portainer-ce:2.21.5
    container_name: portainer
    restart: unless-stopped
    command:
      - --http-enabled
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:
      - proxy
    labels:
      - traefik.enable=true
      - traefik.http.routers.portainer.rule=Host(`${DOMAIN_PORTAINER}`)
      - traefik.http.routers.portainer.entrypoints=websecure
      - traefik.http.routers.portainer.tls.certresolver=le
      - traefik.http.services.portainer.loadbalancer.server.port=9000

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
    networks:
      - internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s

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
    image: ${APP_IMAGE}
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
      - EXECUTIONS_MODE=queue
      - EXECUTIONS_PROCESS=main
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_DEFAULT_BASIC_AUTH_USER=${N8N_BASIC_USER}
      - N8N_DEFAULT_BASIC_AUTH_PASSWORD=${N8N_BASIC_PASS}
      - N8N_HOST=${DOMAIN_N8N}
      - N8N_PORT=5678
      - WEBHOOK_URL=https://${DOMAIN_WEBHOOK}/
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
      - traefik.http.routers.n8n.rule=Host(`${DOMAIN_N8N}`)
      - traefik.http.routers.n8n.entrypoints=websecure
      - traefik.http.routers.n8n.tls.certresolver=le
      - traefik.http.services.n8n.loadbalancer.server.port=5678

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
      - N8N_HOST=${DOMAIN_WEBHOOK}
      - WEBHOOK_URL=https://${DOMAIN_WEBHOOK}/
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
      redis:
        condition: service_started
      postgres:
        condition: service_healthy
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
    driver: local
  portainer_data:
    driver: local
  postgres_data:
    driver: local
  redis_data:
    driver: local
  n8n_data:
    driver: local
```

**Validação**  
- `docker compose --env-file lialean.env -f lialean-stack.yml config` (dentro de `/opt/lialean/stacks/`) deve imprimir a configuração sem erros.

---

## Fase 9 – Subir a stack (fiz uma atualização) ....

Todos os comandos desta fase devem ser executados como usuário `deploy` dentro de `/opt/lialean/stacks`.

### 9.1 Checagens antes de subir

```bash
cd /opt/lialean/stacks
if grep -n "CHANGE_ME" lialean.env; then echo "↑ Substitua os valores acima no arquivo lialean.env"; else echo "OK: nenhum CHANGE_ME restante"; fi
docker compose --env-file lialean.env -f lialean-stack.yml config >/tmp/lialean-stack.rendered.yml
```

- Se o comando indicar linhas com `CHANGE_ME`, corrija antes de prosseguir.
- Abra `/tmp/lialean-stack.rendered.yml` se quiser confirmar os valores finais que serão aplicados.
- Sempre que atualizar o repositório (`git pull`) copie novamente o arquivo de stack oficial:
  ```bash
  cp ~/Site_LiaLean/lialean-stack.yml /opt/lialean/stacks/lialean-stack.yml
  ```

### 9.2 Baixar as imagens necessárias

```bash
docker compose --env-file lialean.env -f lialean-stack.yml pull traefik portainer postgres redis n8n-main n8n-webhook n8n-worker
APP_IMAGE=$(grep '^APP_IMAGE=' lialean.env | cut -d= -f2)
docker pull "${APP_IMAGE}"
```

- O `pull` garante que todas as imagens base estejam disponíveis localmente antes de subir.
- Se `docker pull "${APP_IMAGE}"` falhar porque a imagem ainda não existe (primeiro deploy), continue com a etapa 9.3 apenas para a infraestrutura. Depois de concluir a Fase 11 (build e push da aplicação), retorne para a etapa 9.4.

### 9.3 Subir infraestrutura (Traefik, Portainer, Postgres, Redis)

```bash
docker compose --env-file lialean.env -f lialean-stack.yml up -d traefik portainer postgres redis
docker compose --env-file lialean.env -f lialean-stack.yml ps
```

- Os containers `traefik`, `portainer`, `lialean-postgres` e `lialean-redis` devem aparecer como `running`.
- Valide logs iniciais:
  ```bash
  docker logs traefik --tail 50
  docker logs lialean-postgres --tail 30
  docker logs lialean-redis --tail 30
  ```
- **Exposição temporária do PostgreSQL:** para executar migrações a partir do host, o serviço precisa estar com `ports: ["5432:5432"]`. O arquivo oficial (`~/Site_LiaLean/lialean-stack.yml`) já traz esse bloco, então após atualizar o stack:
  ```bash
  docker rm -f lialean-postgres
  docker compose --env-file lialean.env -f lialean-stack.yml up -d --force-recreate --no-deps postgres
  docker port lialean-postgres                 # deve mostrar 5432/tcp -> 0.0.0.0:5432
  PGPASSWORD="$POSTGRES_PASSWORD" pg_isready -h 127.0.0.1 -p 5432 -U "$POSTGRES_USER"
  ```
  Quando as migrações terminarem você pode remover o bloco `ports` e recriar o serviço novamente para manter o banco acessível apenas pela rede interna.

### 9.4 Subir serviços da aplicação e automação

Execute **somente quando `APP_IMAGE` estiver disponível** (após publicar a imagem com a Fase 11 ou se já existir no registry):

```bash
docker compose --env-file lialean.env -f lialean-stack.yml up -d app n8n-main n8n-webhook n8n-worker
docker compose --env-file lialean.env -f lialean-stack.yml ps
```

- Os novos containers (`lialean-app`, `n8n-main`, `n8n-webhook`, `n8n-worker`) devem entrar com `State` = `running`.
- Logs úteis:
  ```bash
  docker logs lialean-app --tail 50
  docker logs n8n-main --tail 50
  docker logs n8n-worker --tail 50
  ```

### 9.5 Validação final

- Acesse `https://portainer.vps.lialean.cloud` e finalize a criação do usuário admin na primeira vez.
- Quando o Traefik emitir os certificados (pode levar até 2 minutos), valide:
  - `https://n8n.vps.lialean.cloud` (login `N8N_BASIC_USER` / senha definida no `.env`).
  - `https://app.vps.lialean.cloud/health` (esperado `{"status":"ok",...}`) após iniciar o serviço `app`.
- Se algum domínio não responder, verifique `docker logs traefik --tail 200` em busca de erros ACME ou de routing.

---

## Fase 10 – Preparar o banco de dados

### 10.1 Criar bancos e usuários específicos

```bash
docker exec -it lialean-postgres psql -U ${POSTGRES_USER} <<'SQL'
CREATE USER appuser WITH PASSWORD 'APP_DB_PASSWORD_PLACEHOLDER';
CREATE DATABASE lialean_db WITH OWNER appuser ENCODING 'UTF8';
CREATE USER n8nuser WITH PASSWORD 'N8N_DB_PASSWORD_PLACEHOLDER';
CREATE DATABASE n8n_db WITH OWNER n8nuser ENCODING 'UTF8';
GRANT ALL PRIVILEGES ON DATABASE lialean_db TO appuser;
GRANT ALL PRIVILEGES ON DATABASE n8n_db TO n8nuser;
SQL
```

Substitua os `PASSWORD_PLACEHOLDER` pelos valores do `.env`. (Use a seta para cima e edite no terminal para evitar erros.)

### 10.2 Confirmar conexão

```bash
docker exec -it lialean-postgres psql -U appuser -d lialean_db -c "\dt"
```

Deve mostrar “Did not find any relations” (banco vazio).

**Validação**  
- Comando `\l` dentro do `psql` deve listar `lialean_db` e `n8n_db`.

---

### 10.3 Sincronizar metadados do Drizzle

Antes de rodar qualquer comando do Drizzle no servidor, garanta que os arquivos de metadados estão alinhados com o repositório (evita o erro `data is malformed`):

```bash
cd ~/Site_LiaLean
git checkout -- drizzle/meta/0000_snapshot.json drizzle/meta/_journal.json
git pull origin main
head -5 drizzle/meta/0000_snapshot.json   # confirme "dialect": "postgresql"
```

Se o repositório tiver modificações locais, resolva-as antes de continuar.

---

## Fase 11 – Rodar migrações e deploy da aplicação

### 11.1 Clonar repositório (no servidor, com usuário `deploy`)

```bash
cd ~
git clone git@github.com:AgroIAActionPlan/Site_LiaLean.git
cd Site_LiaLean
pnpm install
```

### 11.2 Aplicar migrações no banco remoto

- **Opção A – Executar do host (requer porta 5432 exposta):**
  ```bash
  cd ~/Site_LiaLean
  set -a
  source /opt/lialean/stacks/lialean.env
  set +a
  ENCODED_PASS=$(python3 -c 'import urllib.parse, os; print(urllib.parse.quote(os.environ["APP_DB_PASSWORD"]))')
  export DATABASE_URL="postgresql://${APP_DB_USER}:${ENCODED_PASS}@localhost:5432/${POSTGRES_APP_DB}"
  PGPASSWORD="$POSTGRES_PASSWORD" pg_isready -h 127.0.0.1 -p 5432 -U "$POSTGRES_USER"
  pnpm db:push
  ```
  - Se o `pg_isready` não responder “accepting connections”, volte à Fase 9.3 e refaça a recriação do container `lialean-postgres`.

- **Opção B – Executar de dentro de um container (sem expor porta):**
  1. Certifique-se de que o serviço `app` já tem imagem gerada (Fase 11.3) ou use a imagem oficial `node:20`.
  2. Execute:
     ```bash
     docker compose --env-file /opt/lialean/stacks/lialean.env \
       run --rm --no-deps \
       -v ~/Site_LiaLean:/workspace -w /workspace \
       node:20-alpine sh -lc "
         npm install -g pnpm@10 &&
         pnpm install &&
         pnpm db:push
       "
     ```
     Como o container usa a rede interna, o host `postgres` funciona sem expor portas.

### 11.3 Gerar e publicar imagem Docker

```bash
./scripts/deploy.sh /opt/lialean/stacks/lialean.env
```

- Informe a nova tag (ex.: `v1`).
- Escolha `s` para `docker push` se usar Docker Hub (configure login prévio `docker login`).
- Escolha `n` para atualização imediata (faremos pelo Portainer).

### 11.4 Atualizar stack no Portainer

1. Acesse `https://portainer.vps.lialean.cloud`.
2. Navegue até **Stacks → lialean-stack**.
3. Clique em **Editor** e atualize `APP_IMAGE` no arquivo `.env` (ou no Portainer → *Env variables*).
4. Marque **Re-pull image** e confirme a atualização. Isso fará o redeploy com a nova imagem e iniciará os serviços `app` e `n8n*` caso ainda não estivessem ativos desde a etapa 9.4.

Se optar por gerenciar via CLI (ou precisar subir os serviços manualmente após manter apenas a infraestrutura na etapa 9.3), execute:

```bash
cd /opt/lialean/stacks
docker compose --env-file lialean.env -f lialean-stack.yml up -d app n8n-main n8n-webhook n8n-worker
```

**Validação**  
- `docker compose ... ps` deve mostrar o container `lialean-app` com a nova tag.  
- `curl -sL https://app.vps.lialean.cloud/health` traz `status":"ok"`.  
- Navegue na aplicação e confirme o funcionamento.

---

## Fase 12 – Backups, monitoramento e manutenção

### 12.1 Backup do banco PostgreSQL

Crie script `/opt/lialean/backups/backup-postgres.sh`:

```bash
#!/bin/bash
set -euo pipefail
STAMP=$(date +%F_%H%M)
docker exec lialean-postgres pg_dump -U ${POSTGRES_USER} -Fc ${POSTGRES_USER} > /opt/lialean/backups/postgres_${STAMP}.dump
find /opt/lialean/backups -type f -name "postgres_*.dump" -mtime +7 -delete
```

Permissões e cron:

```bash
chmod +x /opt/lialean/backups/backup-postgres.sh
crontab -e
```

Adicionar (diário, 02h):

```
0 2 * * * /opt/lialean/backups/backup-postgres.sh >> /opt/lialean/logs/backup.log 2>&1
```

### 12.2 Backup da configuração N8N

Semanal:

```bash
docker run --rm \
  -v n8n_data:/data \
  -v /opt/lialean/backups:/backup \
  busybox tar czf /backup/n8n_$(date +%F).tar.gz /data
```

### 12.3 Monitoramento básico

- Configure Uptime Kuma (pode ser outro container no mesmo stack) monitorando:
  - `https://app.vps.lialean.cloud/health`
  - `https://n8n.vps.lialean.cloud/healthz`
- Use `htop`, `docker stats` e `docker logs` para checar consumo.

### 12.4 Atualizações futuras

1. Acesse o repositório local (`~/Site_LiaLean`) e atualize o código.
2. Rode `./scripts/deploy.sh` para gerar nova imagem.
3. Atualize a stack via Portainer.

**Validação contínua**  
- Verifique diariamente os dashboards do Portainer (saúde) e do N8N.  
- Confirme que os backups estão gerando arquivos recentes.

---

## Referências rápidas

- Reiniciar serviços: `docker compose --env-file lialean.env -f lialean-stack.yml restart <servico>`.
- Ver logs de um serviço: `docker logs nome-do-container -f`.
- Atualizar sistema: `sudo apt update && sudo apt upgrade -y`.
- Ver uso de disco: `df -h /`.
- Validar certificados: `curl -Iv https://app.vps.lialean.cloud`.

Com estas etapas, toda a infraestrutura estará sob gerenciamento Docker, com SSL automático, usuários seguros e um fluxo claro de deploy e manutenção. Siga as fases na ordem, validando cada uma antes de continuar.
