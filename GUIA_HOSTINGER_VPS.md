# Guia de Instalação - Hostinger VPS Ubuntu 24 + PostgreSQL

Este guia fornece instruções específicas para instalar o site LiaLean em uma VPS da Hostinger com Ubuntu 24 e PostgreSQL.

---

## 📋 Índice

1. [Informações da VPS Hostinger](#informações-da-vps-hostinger)
2. [Acesso Inicial à VPS](#acesso-inicial-à-vps)
3. [Preparação do Ambiente](#preparação-do-ambiente)
4. [Instalação do Node.js e pnpm](#instalação-do-nodejs-e-pnpm)
5. [Configuração do PostgreSQL](#configuração-do-postgresql)
6. [Clonagem do Projeto do GitHub](#clonagem-do-projeto-do-github)
7. [Configuração da Aplicação](#configuração-da-aplicação)
8. [Deploy e Persistência](#deploy-e-persistência)
9. [Configuração de Domínio](#configuração-de-domínio)
10. [SSL/HTTPS](#sslhttps)
11. [Backup Automático](#backup-automático)
12. [Manutenção](#manutenção)

---

## 🖥️ Informações da VPS Hostinger

### Especificações Típicas
- **OS**: Ubuntu 24.04 LTS
- **Acesso**: SSH via root ou usuário com sudo
- **Painel**: hPanel da Hostinger
- **PostgreSQL**: Já instalado

### Recursos Necessários
- Mínimo 1GB RAM (recomendado 2GB+)
- 10GB+ espaço em disco
- Portas 80 e 443 abertas

---

## 🔑 Acesso Inicial à VPS

### 1. Obter Credenciais SSH

No hPanel da Hostinger:
1. Acesse **VPS** → Seu servidor
2. Clique em **SSH Access**
3. Anote:
   - IP do servidor
   - Porta SSH (geralmente 22)
   - Usuário (geralmente `root`)
   - Senha ou chave SSH

### 2. Conectar via SSH

**No Windows** (use PowerShell ou PuTTY):
```powershell
ssh root@SEU_IP_VPS
```

**No Linux/Mac**:
```bash
ssh root@SEU_IP_VPS
```

Digite a senha quando solicitado.

### 3. Primeira Configuração

```bash
# Atualizar sistema
apt update && apt upgrade -y

# Criar usuário não-root (recomendado)
adduser lialean
usermod -aG sudo lialean

# Configurar firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
ufw status
```

---

## 🔧 Preparação do Ambiente

### 1. Instalar Dependências Básicas

```bash
# Ferramentas essenciais
apt install -y curl wget git build-essential

# Verificar instalações
curl --version
git --version
```

### 2. Configurar Timezone (Opcional)

```bash
# Listar timezones disponíveis
timedatectl list-timezones | grep Sao_Paulo

# Configurar para São Paulo
timedatectl set-timezone America/Sao_Paulo

# Verificar
timedatectl
```

### 3. Configurar Hostname (Opcional)

```bash
# Definir hostname
hostnamectl set-hostname lialean

# Editar /etc/hosts
nano /etc/hosts
# Adicionar: 127.0.0.1 lialean
```

---

## 📦 Instalação do Node.js e pnpm

### 1. Instalar Node.js 20.x

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Instalar Node.js
apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

### 2. Instalar pnpm

```bash
# Instalar pnpm globalmente
npm install -g pnpm

# Verificar instalação
pnpm --version
```

### 3. Instalar PM2

```bash
# Instalar PM2 (gerenciador de processos)
npm install -g pm2

# Verificar instalação
pm2 --version

# Configurar PM2 para iniciar no boot
pm2 startup systemd
# Execute o comando que aparecer
```

---

## 🐘 Configuração do PostgreSQL

### 1. Verificar Instalação do PostgreSQL

```bash
# Verificar versão
psql --version

# Se não estiver instalado:
apt install -y postgresql postgresql-contrib

# Verificar status
systemctl status postgresql

# Iniciar se necessário
systemctl start postgresql
systemctl enable postgresql
```

### 2. Configurar PostgreSQL

```bash
# Entrar como usuário postgres
sudo -u postgres psql
```

Dentro do PostgreSQL:

```sql
-- Criar banco de dados
CREATE DATABASE lialean_db;

-- Criar usuário
CREATE USER lialean_user WITH PASSWORD 'SUA_SENHA_FORTE_AQUI';

-- Conceder privilégios
GRANT ALL PRIVILEGES ON DATABASE lialean_db TO lialean_user;

-- PostgreSQL 15+ requer permissões adicionais no schema
\c lialean_db
GRANT ALL ON SCHEMA public TO lialean_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lialean_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lialean_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lialean_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lialean_user;

-- Verificar
\l
\du

-- Sair
\q
```

### 3. Testar Conexão

```bash
# Testar conexão com novo usuário
psql -U lialean_user -d lialean_db -h localhost

# Dentro do psql:
SELECT version();
\q
```

### 4. Configurar Acesso Remoto (Opcional)

Se precisar acessar o PostgreSQL de fora da VPS:

```bash
# Editar postgresql.conf
nano /etc/postgresql/*/main/postgresql.conf
# Descomentar e alterar: listen_addresses = '*'

# Editar pg_hba.conf
nano /etc/postgresql/*/main/pg_hba.conf
# Adicionar: host all all 0.0.0.0/0 md5

# Reiniciar PostgreSQL
systemctl restart postgresql

# Abrir porta no firewall (CUIDADO: apenas se necessário)
ufw allow 5432/tcp
```

---

## 📥 Clonagem do Projeto do GitHub

### 1. Criar Diretório de Aplicações

```bash
# Criar diretório
mkdir -p /var/www
cd /var/www
```

### 2. Clonar Repositório

```bash
# Clonar projeto
git clone https://github.com/AgroIAActionPlan/Site_LeanLia.git
cd Site_LeanLia

# Verificar branch
git branch

# Verificar estrutura
ls -la
```

### 3. Configurar Permissões

```bash
# Dar permissões ao usuário (se não for root)
chown -R lialean:lialean /var/www/Site_LeanLia

# Ou se estiver usando root:
chmod -R 755 /var/www/Site_LeanLia
```

---

## ⚙️ Configuração da Aplicação

### 1. Instalar Dependências

```bash
cd /var/www/Site_LeanLia

# Instalar dependências
pnpm install
```

**Tempo estimado**: 2-5 minutos

### 2. Gerar JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado (64 caracteres).

### 3. Criar Arquivo .env

```bash
nano .env
```

**Conteúdo do .env** (ajuste conforme necessário):

```env
# ============================================
# Database Configuration (PostgreSQL)
# ============================================
DATABASE_URL=postgresql://lialean_user:SUA_SENHA@localhost:5432/lialean_db

# ============================================
# JWT & Security
# ============================================
JWT_SECRET=cole_aqui_o_jwt_secret_gerado

# ============================================
# Application Configuration
# ============================================
NODE_ENV=production
PORT=3000
HOST=localhost

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
# OAuth (Opcional)
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

**Importante**: 
- Substitua `SUA_SENHA` pela senha do PostgreSQL
- Substitua `cole_aqui_o_jwt_secret_gerado` pelo JWT secret

Salvar: `Ctrl+X`, depois `Y`, depois `Enter`

### 4. Proteger .env

```bash
chmod 600 .env
```

### 5. Aplicar Migrações do Banco

```bash
pnpm db:push
```

**Saída esperada**:
```
✓ Pushing schema changes to database
✓ Schema pushed successfully
```

### 6. Verificar Tabelas Criadas

```bash
psql -U lialean_user -d lialean_db -h localhost -c "\dt"
```

Você deve ver a tabela `users`.

---

## 🚀 Deploy e Persistência

### 1. Build da Aplicação

```bash
cd /var/www/Site_LeanLia

# Build para produção
pnpm build
```

**Tempo estimado**: 1-3 minutos

### 2. Testar Localmente

```bash
# Iniciar aplicação
pnpm start &

# Aguardar alguns segundos
sleep 5

# Testar
curl http://localhost:3000

# Se funcionar, parar processo de teste
pkill -f "node.*start"
```

### 3. Configurar PM2 para Persistência

```bash
# Iniciar aplicação com PM2
pm2 start npm --name "lialean" -- start

# Verificar status
pm2 status

# Ver logs
pm2 logs lialean --lines 20

# Salvar configuração do PM2
pm2 save

# Configurar PM2 para iniciar no boot (se ainda não fez)
pm2 startup systemd
# Execute o comando que aparecer

# Verificar se está configurado
systemctl status pm2-root  # ou pm2-lialean se criou usuário
```

### 4. Verificar Persistência

```bash
# Reiniciar servidor para testar
reboot

# Após reiniciar, conectar novamente via SSH
ssh root@SEU_IP_VPS

# Verificar se aplicação iniciou automaticamente
pm2 status

# Ver logs
pm2 logs lialean --lines 20
```

---

## 🌐 Configuração de Domínio

### 1. Configurar DNS no Hostinger

No hPanel:
1. Acesse **Domínios** → Seu domínio
2. Clique em **DNS / Nameservers**
3. Adicione/edite registros:

**Registro A**:
- Type: `A`
- Name: `@`
- Points to: `IP_DA_SUA_VPS`
- TTL: `14400`

**Registro A (www)**:
- Type: `A`
- Name: `www`
- Points to: `IP_DA_SUA_VPS`
- TTL: `14400`

Aguarde propagação DNS (5 minutos a 48 horas).

### 2. Instalar Nginx

```bash
# Instalar Nginx
apt install -y nginx

# Verificar instalação
nginx -v

# Iniciar Nginx
systemctl start nginx
systemctl enable nginx

# Verificar status
systemctl status nginx
```

### 3. Configurar Nginx

```bash
# Criar arquivo de configuração
nano /etc/nginx/sites-available/lialean
```

**Conteúdo** (substitua `seu-dominio.com`):

```nginx
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    # Logs
    access_log /var/log/nginx/lialean_access.log;
    error_log /var/log/nginx/lialean_error.log;

    # Proxy para aplicação Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Cache para assets estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://localhost:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Segurança
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Tamanho máximo de upload
    client_max_body_size 10M;
}
```

Salvar e sair.

### 4. Ativar Site

```bash
# Criar link simbólico
ln -s /etc/nginx/sites-available/lialean /etc/nginx/sites-enabled/

# Remover site padrão
rm /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Reiniciar Nginx
systemctl restart nginx
```

### 5. Testar Acesso

```bash
# Testar localmente
curl -I http://seu-dominio.com

# Ou abrir no navegador
# http://seu-dominio.com
```

---

## 🔒 SSL/HTTPS

### 1. Instalar Certbot

```bash
# Instalar Certbot
apt install -y certbot python3-certbot-nginx
```

### 2. Obter Certificado SSL

```bash
# Obter certificado (substitua seu-dominio.com)
certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Responda:
- **Email**: seu-email@exemplo.com
- **Terms**: A (agree)
- **Share email**: N (no)
- **Redirect HTTP to HTTPS**: 2 (yes)

### 3. Verificar Certificado

```bash
certbot certificates
```

### 4. Testar HTTPS

```bash
curl -I https://seu-dominio.com
```

Ou abra no navegador: `https://seu-dominio.com`

### 5. Renovação Automática

```bash
# Testar renovação
certbot renew --dry-run

# Verificar timer de renovação automática
systemctl list-timers | grep certbot
```

---

## 💾 Backup Automático

### 1. Adaptar Script para PostgreSQL

```bash
nano /var/www/Site_LeanLia/scripts/backup-database.sh
```

Procure pela linha com `mysqldump` e substitua por:

```bash
# Fazer backup (PostgreSQL)
if PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    -F c \
    -f "$BACKUP_FILE" 2>/dev/null; then
```

Salvar e sair.

### 2. Testar Backup

```bash
cd /var/www/Site_LeanLia
./scripts/backup-database.sh
```

### 3. Configurar Cron

```bash
crontab -e
```

Adicionar:
```cron
0 2 * * * /var/www/Site_LeanLia/scripts/backup-database.sh >> /var/log/lialean-backup.log 2>&1
```

Salvar e sair.

### 4. Criar Log

```bash
touch /var/log/lialean-backup.log
chmod 644 /var/log/lialean-backup.log
```

---

## 🔄 Manutenção

### Atualizar Aplicação

```bash
cd /var/www/Site_LeanLia

# Puxar alterações do GitHub
git pull origin main

# Instalar novas dependências
pnpm install

# Aplicar migrações
pnpm db:push

# Rebuild
pnpm build

# Reiniciar
pm2 restart lialean

# Verificar logs
pm2 logs lialean --lines 20
```

### Ou usar script automatizado:

```bash
./scripts/deploy.sh
```

### Comandos Úteis

```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs lialean

# Reiniciar aplicação
pm2 restart lialean

# Reiniciar Nginx
systemctl restart nginx

# Ver logs do Nginx
tail -f /var/log/nginx/lialean_access.log
tail -f /var/log/nginx/lialean_error.log

# Status do PostgreSQL
systemctl status postgresql

# Conectar ao PostgreSQL
psql -U lialean_user -d lialean_db -h localhost

# Ver tabelas
psql -U lialean_user -d lialean_db -h localhost -c "\dt"

# Backup manual
./scripts/backup-database.sh

# Ver uso de recursos
htop  # ou top
```

---

## ✅ Checklist Final

- [ ] VPS acessível via SSH
- [ ] Node.js 20.x instalado
- [ ] pnpm instalado
- [ ] PM2 instalado e configurado para boot
- [ ] PostgreSQL configurado
- [ ] Banco `lialean_db` criado
- [ ] Usuário `lialean_user` criado
- [ ] Projeto clonado do GitHub
- [ ] Dependências instaladas
- [ ] Arquivo `.env` configurado
- [ ] Migrações aplicadas
- [ ] Build realizado
- [ ] Aplicação rodando no PM2
- [ ] Nginx instalado e configurado
- [ ] Domínio apontando para VPS
- [ ] Site acessível via HTTP
- [ ] SSL/HTTPS configurado
- [ ] Site acessível via HTTPS
- [ ] Backup automático configurado
- [ ] Aplicação persiste após reboot

---

## 🎉 Conclusão

Seu site LiaLean está agora:

✅ Instalado na VPS Hostinger  
✅ Rodando com PostgreSQL  
✅ Carregando código do GitHub  
✅ Com persistência automática (PM2)  
✅ Com SSL/HTTPS configurado  
✅ Com backup automático diário  
✅ Pronto para produção!

---

## 📞 Suporte

- **GitHub**: https://github.com/AgroIAActionPlan/Site_LeanLia
- **Email**: contato@lialean.com
- **Hostinger Support**: https://www.hostinger.com.br/contato

---

**Última atualização**: 17 de outubro de 2024  
**Versão**: 1.0 - Hostinger VPS + PostgreSQL

