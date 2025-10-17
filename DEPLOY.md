# Guia de Deploy - Site LeanLia

Este documento fornece instruções completas para publicar o site LeanLia em seu servidor de produção com banco de dados MySQL próprio.

## 📋 Pré-requisitos

Antes de iniciar, certifique-se de que seu servidor possui:

- **Node.js** versão 18 ou superior
- **pnpm** (gerenciador de pacotes)
- **MySQL** versão 8.0 ou superior
- **Git** instalado
- **Acesso SSH** ao servidor
- **Domínio configurado** (ex: leanlia.com)

## 🚀 Passo a Passo de Deploy

### 1. Preparar o Servidor

Conecte-se ao seu servidor via SSH:

```bash
ssh usuario@seu-servidor.com
```

Instale as dependências necessárias (se ainda não estiverem instaladas):

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Verificar instalações
node --version
pnpm --version
```

### 2. Clonar o Repositório

```bash
# Navegar para o diretório de aplicações
cd /var/www  # ou outro diretório de sua preferência

# Clonar o repositório
git clone https://github.com/AgroIAActionPlan/Site_LeanLia.git

# Entrar no diretório
cd Site_LeanLia
```

### 3. Configurar o Banco de Dados MySQL

#### 3.1. Criar Banco de Dados

Conecte-se ao MySQL:

```bash
mysql -u root -p
```

Execute os seguintes comandos SQL:

```sql
-- Criar banco de dados
CREATE DATABASE leanlia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário dedicado (recomendado)
CREATE USER 'leanlia_user'@'localhost' IDENTIFIED BY 'SUA_SENHA_SEGURA_AQUI';

-- Conceder permissões
GRANT ALL PRIVILEGES ON leanlia_db.* TO 'leanlia_user'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Sair
EXIT;
```

#### 3.2. Exportar Schema do Banco de Dados

O schema está definido em `drizzle/schema.ts`. Para criar as tabelas, você usará o Drizzle ORM após configurar as variáveis de ambiente.

**Schema atual:**

```sql
-- Tabela de usuários (criada automaticamente pelo Drizzle)
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices recomendados
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 4. Configurar Variáveis de Ambiente

Crie o arquivo `.env` na raiz do projeto:

```bash
nano .env
```

Adicione as seguintes variáveis (ajuste conforme necessário):

```env
# Database Configuration
DATABASE_URL=mysql://leanlia_user:SUA_SENHA_SEGURA_AQUI@localhost:3306/leanlia_db

# JWT Secret (gere uma chave segura)
JWT_SECRET=sua_chave_jwt_super_secreta_aqui_minimo_32_caracteres

# OAuth Configuration (se usar Manus OAuth, caso contrário pode remover)
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Application Configuration
VITE_APP_ID=leanlia
VITE_APP_TITLE=LeanLia - IA para Agronegócio
VITE_APP_LOGO=/logo.png

# Owner Configuration (opcional)
OWNER_OPEN_ID=seu_id_aqui
OWNER_NAME=Admin LeanLia

# Production Settings
NODE_ENV=production
PORT=3000

# Built-in APIs (se não usar Manus, pode remover)
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=sua_chave_api_aqui

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

**Importante:** Proteja o arquivo `.env`:

```bash
chmod 600 .env
```

### 5. Instalar Dependências

```bash
pnpm install
```

### 6. Executar Migrações do Banco de Dados

```bash
# Gerar e aplicar migrações
pnpm db:push
```

Este comando irá:
- Ler o schema em `drizzle/schema.ts`
- Criar as tabelas no MySQL
- Aplicar todas as alterações necessárias

### 7. Build da Aplicação

```bash
# Compilar para produção
pnpm build
```

Isso irá gerar os arquivos otimizados em:
- `client/dist/` - Frontend compilado
- `server/` - Backend compilado

### 8. Configurar PM2 (Process Manager)

PM2 mantém sua aplicação rodando em background e reinicia automaticamente em caso de falhas.

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação com PM2
pm2 start npm --name "leanlia" -- start

# Configurar PM2 para iniciar no boot
pm2 startup
pm2 save

# Verificar status
pm2 status

# Ver logs
pm2 logs leanlia
```

### 9. Configurar Nginx como Reverse Proxy

Instale o Nginx:

```bash
sudo apt install nginx -y
```

Crie o arquivo de configuração:

```bash
sudo nano /etc/nginx/sites-available/leanlia
```

Adicione a seguinte configuração:

```nginx
server {
    listen 80;
    server_name leanlia.com www.leanlia.com;  # Substitua pelo seu domínio

    # Logs
    access_log /var/log/nginx/leanlia_access.log;
    error_log /var/log/nginx/leanlia_error.log;

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

Ative o site:

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/leanlia /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 10. Configurar SSL com Let's Encrypt (HTTPS)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d leanlia.com -d www.leanlia.com

# Renovação automática (já configurada pelo certbot)
sudo certbot renew --dry-run
```

### 11. Configurar Firewall

```bash
# Permitir HTTP e HTTPS
sudo ufw allow 'Nginx Full'

# Permitir SSH (se ainda não permitido)
sudo ufw allow OpenSSH

# Ativar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

## 🔄 Sincronização e Atualizações

### Atualizar o Site com Novas Versões

```bash
# Navegar para o diretório
cd /var/www/Site_LeanLia

# Fazer backup do .env
cp .env .env.backup

# Puxar últimas alterações
git pull origin main

# Instalar novas dependências (se houver)
pnpm install

# Aplicar migrações do banco (se houver)
pnpm db:push

# Rebuild da aplicação
pnpm build

# Reiniciar aplicação
pm2 restart leanlia
```

### Script de Deploy Automatizado

Crie um script para facilitar deploys futuros:

```bash
nano deploy.sh
```

Conteúdo do script:

```bash
#!/bin/bash

echo "🚀 Iniciando deploy do Site LeanLia..."

# Backup do .env
cp .env .env.backup

# Puxar alterações
echo "📥 Baixando últimas alterações..."
git pull origin main

# Instalar dependências
echo "📦 Instalando dependências..."
pnpm install

# Aplicar migrações
echo "🗄️  Aplicando migrações do banco..."
pnpm db:push

# Build
echo "🔨 Compilando aplicação..."
pnpm build

# Reiniciar
echo "♻️  Reiniciando aplicação..."
pm2 restart leanlia

echo "✅ Deploy concluído com sucesso!"
echo "🌐 Site disponível em: https://leanlia.com"
```

Tornar executável:

```bash
chmod +x deploy.sh
```

Usar:

```bash
./deploy.sh
```

## 🗄️ Backup do Banco de Dados

### Backup Manual

```bash
# Criar backup
mysqldump -u leanlia_user -p leanlia_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Compactar backup
gzip backup_*.sql
```

### Restaurar Backup

```bash
# Descompactar (se necessário)
gunzip backup_20241017_120000.sql.gz

# Restaurar
mysql -u leanlia_user -p leanlia_db < backup_20241017_120000.sql
```

### Backup Automático Diário

Crie um script de backup:

```bash
sudo nano /usr/local/bin/backup-leanlia.sh
```

Conteúdo:

```bash
#!/bin/bash

# Configurações
DB_USER="leanlia_user"
DB_PASS="SUA_SENHA_AQUI"
DB_NAME="leanlia_db"
BACKUP_DIR="/var/backups/leanlia"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Fazer backup
mysqldump -u $DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup concluído: backup_$DATE.sql.gz"
```

Tornar executável:

```bash
sudo chmod +x /usr/local/bin/backup-leanlia.sh
```

Adicionar ao cron (executar diariamente às 2h):

```bash
sudo crontab -e
```

Adicionar linha:

```
0 2 * * * /usr/local/bin/backup-leanlia.sh >> /var/log/leanlia-backup.log 2>&1
```

## 📊 Monitoramento

### Logs da Aplicação

```bash
# Ver logs em tempo real
pm2 logs leanlia

# Ver logs do Nginx
sudo tail -f /var/log/nginx/leanlia_access.log
sudo tail -f /var/log/nginx/leanlia_error.log
```

### Status da Aplicação

```bash
# Status do PM2
pm2 status

# Informações detalhadas
pm2 info leanlia

# Monitoramento em tempo real
pm2 monit
```

### Verificar Uso de Recursos

```bash
# CPU e Memória
htop

# Espaço em disco
df -h

# Conexões MySQL
mysql -u root -p -e "SHOW PROCESSLIST;"
```

## 🔒 Segurança

### Recomendações de Segurança

1. **Nunca commitar o arquivo `.env`** no Git
2. **Usar senhas fortes** para MySQL e JWT_SECRET
3. **Manter sistema atualizado**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```
4. **Configurar fail2ban** para proteger contra ataques:
   ```bash
   sudo apt install fail2ban -y
   sudo systemctl enable fail2ban
   ```
5. **Limitar acesso SSH** apenas por chave pública
6. **Monitorar logs** regularmente

### Gerar JWT Secret Seguro

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 🆘 Troubleshooting

### Aplicação não inicia

```bash
# Verificar logs
pm2 logs leanlia --lines 100

# Verificar se porta 3000 está em uso
sudo lsof -i :3000

# Reiniciar aplicação
pm2 restart leanlia
```

### Erro de conexão com MySQL

```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Testar conexão
mysql -u leanlia_user -p leanlia_db

# Verificar permissões
mysql -u root -p -e "SHOW GRANTS FOR 'leanlia_user'@'localhost';"
```

### Erro 502 Bad Gateway (Nginx)

```bash
# Verificar se aplicação está rodando
pm2 status

# Verificar logs do Nginx
sudo tail -f /var/log/nginx/error.log

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Problemas com SSL

```bash
# Renovar certificado
sudo certbot renew

# Verificar validade
sudo certbot certificates
```

## 📞 Suporte

Para problemas ou dúvidas:

- **Email**: contato@leanlia.com
- **GitHub Issues**: https://github.com/AgroIAActionPlan/Site_LeanLia/issues

## 📝 Checklist de Deploy

- [ ] Servidor com Node.js e MySQL instalados
- [ ] Repositório clonado
- [ ] Banco de dados criado
- [ ] Arquivo `.env` configurado
- [ ] Dependências instaladas (`pnpm install`)
- [ ] Migrações aplicadas (`pnpm db:push`)
- [ ] Build realizado (`pnpm build`)
- [ ] PM2 configurado e rodando
- [ ] Nginx configurado como reverse proxy
- [ ] SSL/HTTPS configurado com Let's Encrypt
- [ ] Firewall configurado
- [ ] Backup automático configurado
- [ ] DNS apontando para o servidor
- [ ] Site acessível via domínio

---

**Última atualização:** 17 de outubro de 2024

