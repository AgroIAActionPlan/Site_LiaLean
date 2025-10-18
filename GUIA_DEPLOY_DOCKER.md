# Guia de Deploy com Docker + Traefik - Site LiaLean

Este guia fornece instruções completas para fazer deploy do site LiaLean usando Docker, Docker Compose e Traefik na VPS Hostinger.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Preparação da VPS](#preparação-da-vps)
3. [Configuração do Traefik](#configuração-do-traefik)
4. [Deploy da Aplicação](#deploy-da-aplicação)
5. [Verificação e Testes](#verificação-e-testes)
6. [Manutenção e Atualizações](#manutenção-e-atualizações)
7. [Backup e Restore](#backup-e-restore)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

### Na VPS Hostinger:
- ✅ Ubuntu 24.04 LTS
- ✅ Acesso root ou sudo
- ✅ Mínimo 2GB RAM, 20GB disco
- ✅ Portas 80 e 443 abertas

### Ferramentas necessárias:
- ✅ Docker Engine
- ✅ Docker Compose
- ✅ Git

### DNS configurado:
- ✅ `app.vps.lialean.cloud` → IP da VPS

---

## 🔧 Preparação da VPS

### 1. Conectar via SSH

```bash
ssh root@SEU_IP_VPS
```

### 2. Atualizar Sistema

```bash
apt update && apt upgrade -y
```

### 3. Instalar Docker

```bash
# Remover versões antigas (se houver)
apt remove docker docker-engine docker.io containerd runc

# Instalar dependências
apt install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Adicionar chave GPG oficial do Docker
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Adicionar repositório
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verificar instalação
docker --version
docker compose version
```

### 4. Configurar Docker

```bash
# Iniciar Docker
systemctl start docker
systemctl enable docker

# Testar
docker run hello-world
```

### 5. Criar Rede Proxy

```bash
# Criar rede para Traefik
docker network create proxy

# Verificar
docker network ls | grep proxy
```

---

## 🌐 Configuração do Traefik

### 1. Criar Diretório do Traefik

```bash
mkdir -p /opt/traefik
cd /opt/traefik
```

### 2. Criar Configuração do Traefik

```bash
nano traefik.yml
```

**Conteúdo**:

```yaml
# ============================================
# Traefik Configuration
# ============================================

# API e Dashboard
api:
  dashboard: true
  insecure: false

# Entry Points
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true
  
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: le

# Providers
providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: proxy
  
  file:
    directory: /etc/traefik/dynamic
    watch: true

# Certificate Resolvers (Let's Encrypt)
certificatesResolvers:
  le:
    acme:
      email: contato@lialean.com  # ALTERE PARA SEU EMAIL
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

# Logs
log:
  level: INFO
  filePath: /var/log/traefik/traefik.log

# Access Logs
accessLog:
  filePath: /var/log/traefik/access.log
```

### 3. Criar docker-compose.yml do Traefik

```bash
nano docker-compose.yml
```

**Conteúdo**:

```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.10
    container_name: traefik
    restart: unless-stopped
    
    ports:
      - "80:80"
      - "443:443"
      # - "8080:8080"  # Dashboard (descomentar se quiser acessar)
    
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - ./letsencrypt:/letsencrypt
      - ./logs:/var/log/traefik
    
    networks:
      - proxy
    
    labels:
      - "traefik.enable=true"
      
      # Dashboard (opcional - proteger com autenticação)
      # - "traefik.http.routers.dashboard.rule=Host(`traefik.vps.lialean.cloud`)"
      # - "traefik.http.routers.dashboard.service=api@internal"
      # - "traefik.http.routers.dashboard.entrypoints=websecure"
      # - "traefik.http.routers.dashboard.tls.certresolver=le"

networks:
  proxy:
    external: true
```

### 4. Iniciar Traefik

```bash
# Criar diretórios
mkdir -p letsencrypt logs

# Permissões
chmod 600 letsencrypt

# Iniciar
docker compose up -d

# Verificar logs
docker compose logs -f
```

---

## 🚀 Deploy da Aplicação

### 1. Clonar Repositório

```bash
# Criar diretório
mkdir -p /opt/site
cd /opt/site

# Clonar projeto
git clone https://github.com/AgroIAActionPlan/Site_LeanLia.git .

# Verificar
ls -la
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.production.docker .env

# Editar
nano .env
```

**Preencher**:

```env
# PostgreSQL
POSTGRES_USER=appuser
POSTGRES_PASSWORD=SUA_SENHA_FORTE_AQUI  # ALTERAR!
POSTGRES_DB=lialean_db

# DATABASE_URL (será montada automaticamente)
DATABASE_URL=postgresql://appuser:SUA_SENHA_FORTE_AQUI@db:5432/lialean_db

# JWT Secret (gerar com comando abaixo)
JWT_SECRET=COLE_JWT_SECRET_AQUI  # ALTERAR!

# Application
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# App Info
VITE_APP_ID=lialean
VITE_APP_TITLE=LiaLean - IA para Agronegócio
VITE_APP_LOGO=/logo.png

# Owner
OWNER_NAME=Admin LiaLean
OWNER_OPEN_ID=

# OAuth (deixar vazio se não usar)
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# Analytics (deixar vazio se não usar)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=

# Domain
DOMAIN=app.vps.lialean.cloud
APP_URL=https://app.vps.lialean.cloud
```

**Gerar JWT Secret**:

```bash
# Gerar secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copiar resultado e colar no .env
```

**Gerar senha forte para PostgreSQL**:

```bash
# Gerar senha
openssl rand -base64 32

# Copiar resultado e colar no .env
```

**Proteger arquivo**:

```bash
chmod 600 .env
```

### 3. Build da Imagem

```bash
# Build
docker compose build

# Verificar
docker images | grep lialean
```

### 4. Iniciar Aplicação

```bash
# Iniciar com PostgreSQL
docker compose --profile pg up -d

# Verificar containers
docker compose ps

# Ver logs
docker compose logs -f app
docker compose logs -f db
```

### 5. Aplicar Migrações do Banco

```bash
# Entrar no container
docker compose exec app sh

# Dentro do container, aplicar migrações
pnpm db:push

# Sair
exit
```

**Ou executar diretamente**:

```bash
docker compose exec app pnpm db:push
```

---

## ✅ Verificação e Testes

### 1. Verificar Containers

```bash
# Status
docker compose ps

# Logs da aplicação
docker compose logs app --tail 50

# Logs do banco
docker compose logs db --tail 50

# Logs do Traefik
cd /opt/traefik
docker compose logs --tail 50
```

### 2. Testar Health Check

```bash
# Dentro da VPS
curl http://localhost:3000/health

# Deve retornar:
# {"status":"ok","timestamp":"2024-10-17T..."}
```

### 3. Testar Acesso Externo

```bash
# HTTPS
curl -I https://app.vps.lialean.cloud

# Deve retornar HTTP/2 200
```

### 4. Abrir no Navegador

Acesse: `https://app.vps.lialean.cloud`

Você deve ver o site LiaLean carregando!

### 5. Verificar Certificado SSL

```bash
# Ver certificados
cd /opt/traefik
cat letsencrypt/acme.json | jq

# Ou no navegador, clicar no cadeado e ver detalhes
```

### 6. Verificar Banco de Dados

```bash
# Conectar ao PostgreSQL
docker compose exec db psql -U appuser -d lialean_db

# Dentro do psql:
\dt              # Ver tabelas
SELECT * FROM users LIMIT 5;
\q               # Sair
```

---

## 🔄 Manutenção e Atualizações

### Atualizar Aplicação

```bash
cd /opt/site

# Parar containers
docker compose down

# Puxar alterações do GitHub
git pull origin main

# Rebuild
docker compose build

# Iniciar novamente
docker compose --profile pg up -d

# Aplicar migrações (se houver)
docker compose exec app pnpm db:push

# Verificar logs
docker compose logs -f app
```

### Reiniciar Serviços

```bash
# Reiniciar aplicação
docker compose restart app

# Reiniciar banco
docker compose restart db

# Reiniciar tudo
docker compose restart
```

### Ver Logs

```bash
# Logs em tempo real
docker compose logs -f

# Apenas app
docker compose logs -f app

# Últimas 100 linhas
docker compose logs --tail 100 app
```

### Limpar Recursos

```bash
# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -a -f

# Remover volumes não utilizados (CUIDADO!)
docker volume prune -f

# Limpar tudo (CUIDADO!)
docker system prune -a --volumes -f
```

---

## 💾 Backup e Restore

### Backup do Banco de Dados

```bash
# Criar diretório de backups
mkdir -p /opt/backups

# Backup manual
docker compose exec db pg_dump -U appuser -d lialean_db -F c -f /tmp/backup.dump
docker compose cp db:/tmp/backup.dump /opt/backups/lialean_$(date +%Y%m%d_%H%M%S).dump

# Ou em um comando
docker compose exec db pg_dump -U appuser -d lialean_db > /opt/backups/lialean_$(date +%Y%m%d_%H%M%S).sql
```

### Backup Automático (Cron)

```bash
# Criar script de backup
nano /opt/backups/backup.sh
```

**Conteúdo**:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/lialean_$DATE.sql"

cd /opt/site
docker compose exec -T db pg_dump -U appuser -d lialean_db > "$BACKUP_FILE"

# Comprimir
gzip "$BACKUP_FILE"

# Manter apenas últimos 30 dias
find "$BACKUP_DIR" -name "lialean_*.sql.gz" -mtime +30 -delete

echo "Backup concluído: $BACKUP_FILE.gz"
```

**Tornar executável**:

```bash
chmod +x /opt/backups/backup.sh
```

**Adicionar ao cron**:

```bash
crontab -e
```

Adicionar:

```cron
0 2 * * * /opt/backups/backup.sh >> /var/log/lialean-backup.log 2>&1
```

### Restore do Banco

```bash
# Parar aplicação
cd /opt/site
docker compose stop app

# Restaurar backup
docker compose exec -T db psql -U appuser -d lialean_db < /opt/backups/lialean_20241017_120000.sql

# Ou se for .dump
docker compose cp /opt/backups/lialean_20241017_120000.dump db:/tmp/restore.dump
docker compose exec db pg_restore -U appuser -d lialean_db -c /tmp/restore.dump

# Reiniciar aplicação
docker compose start app
```

---

## 🆘 Troubleshooting

### Container não inicia

```bash
# Ver logs detalhados
docker compose logs app

# Ver status
docker compose ps

# Reiniciar
docker compose restart app

# Recriar container
docker compose up -d --force-recreate app
```

### Erro de conexão com banco

```bash
# Verificar se banco está rodando
docker compose ps db

# Ver logs do banco
docker compose logs db

# Testar conexão
docker compose exec db pg_isready -U appuser

# Verificar variáveis de ambiente
docker compose exec app env | grep DATABASE
```

### Erro 502 Bad Gateway

```bash
# Verificar se app está rodando
docker compose ps app

# Ver logs
docker compose logs app --tail 50

# Verificar health check
curl http://localhost:3000/health

# Reiniciar
docker compose restart app
```

### Certificado SSL não gerado

```bash
# Ver logs do Traefik
cd /opt/traefik
docker compose logs | grep acme

# Verificar DNS
nslookup app.vps.lialean.cloud

# Verificar portas
netstat -tlnp | grep -E '80|443'

# Forçar renovação (remover acme.json)
docker compose down
rm letsencrypt/acme.json
docker compose up -d
```

### Performance lenta

```bash
# Ver uso de recursos
docker stats

# Ver logs de erro
docker compose logs app | grep -i error

# Otimizar banco
docker compose exec db psql -U appuser -d lialean_db -c "VACUUM ANALYZE;"

# Reiniciar tudo
docker compose restart
```

---

## 📊 Comandos Úteis

### Docker

```bash
# Ver todos os containers
docker ps -a

# Ver imagens
docker images

# Ver volumes
docker volume ls

# Ver redes
docker network ls

# Ver uso de disco
docker system df

# Entrar em container
docker compose exec app sh
docker compose exec db psql -U appuser -d lialean_db
```

### Logs

```bash
# Logs do Traefik
tail -f /opt/traefik/logs/traefik.log
tail -f /opt/traefik/logs/access.log

# Logs do Docker
journalctl -u docker -f

# Logs da aplicação
docker compose logs -f app
```

### Monitoramento

```bash
# Uso de recursos
docker stats

# Processos no container
docker compose top app

# Inspecionar container
docker compose exec app ps aux
```

---

## ✅ Checklist Final

- [ ] Docker e Docker Compose instalados
- [ ] Rede `proxy` criada
- [ ] Traefik rodando e configurado
- [ ] DNS apontando para VPS
- [ ] Repositório clonado em `/opt/site`
- [ ] Arquivo `.env` configurado e protegido
- [ ] JWT_SECRET gerado
- [ ] Senha forte do PostgreSQL definida
- [ ] Imagem Docker buildada
- [ ] Containers iniciados (`docker compose --profile pg up -d`)
- [ ] Migrações aplicadas (`pnpm db:push`)
- [ ] Health check funcionando (`/health`)
- [ ] Site acessível via HTTPS
- [ ] Certificado SSL válido
- [ ] Backup automático configurado

---

## 🎉 Conclusão

Seu site LiaLean está agora:

✅ Rodando em containers Docker  
✅ Com PostgreSQL persistente  
✅ Atrás do Traefik (reverse proxy)  
✅ Com SSL/HTTPS automático  
✅ Com health checks  
✅ Com backup automático  
✅ Pronto para produção!  

---

## 📞 Suporte

- **GitHub**: https://github.com/AgroIAActionPlan/Site_LeanLia
- **Email**: contato@lialean.com
- **Documentação Docker**: https://docs.docker.com
- **Documentação Traefik**: https://doc.traefik.io/traefik/

---

**Última atualização**: 17 de outubro de 2024  
**Versão**: 1.0 - Docker + Traefik

