# Guia Completo de Publicação e Integração com MySQL - Site LiaLean

Este guia consolidado fornece todas as informações necessárias para publicar o site LiaLean em seu servidor com banco de dados MySQL próprio.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do Ambiente](#instalação-do-ambiente)
3. [Configuração do MySQL](#configuração-do-mysql)
4. [Clonagem e Configuração do Projeto](#clonagem-e-configuração-do-projeto)
5. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
6. [Build e Deploy da Aplicação](#build-e-deploy-da-aplicação)
7. [Configuração do Nginx](#configuração-do-nginx)
8. [Configuração de SSL/HTTPS](#configuração-de-sslhttps)
9. [Backup Automático](#backup-automático)
10. [Manutenção e Atualizações](#manutenção-e-atualizações)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Pré-requisitos

Antes de iniciar, certifique-se de ter:

- ✅ Servidor Linux (Ubuntu 20.04+ ou similar)
- ✅ Acesso root ou sudo
- ✅ Domínio configurado apontando para o servidor
- ✅ Portas 80 e 443 abertas no firewall
- ✅ Mínimo 2GB RAM e 10GB disco

---

## 🔧 Instalação do Ambiente

### 1. Atualizar Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Instalar Node.js 20.x

```bash
# Adicionar repositório NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar Node.js
sudo apt install -y nodejs

# Verificar instalação
node --version  # Deve mostrar v20.x.x
npm --version
```

### 3. Instalar pnpm

```bash
npm install -g pnpm

# Verificar instalação
pnpm --version
```

### 4. Instalar MySQL 8.0

```bash
# Instalar MySQL Server
sudo apt install -y mysql-server

# Verificar instalação
mysql --version

# Iniciar MySQL
sudo systemctl start mysql
sudo systemctl enable mysql
```

### 5. Instalar Git

```bash
sudo apt install -y git
git --version
```

### 6. Instalar PM2 (Process Manager)

```bash
npm install -g pm2

# Verificar instalação
pm2 --version
```

### 7. Instalar Nginx

```bash
sudo apt install -y nginx

# Verificar instalação
nginx -v

# Iniciar Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## 🗄️ Configuração do MySQL

### 1. Executar Configuração Segura

```bash
sudo mysql_secure_installation
```

Responda às perguntas:
- **VALIDATE PASSWORD COMPONENT**: Y (sim)
- **Password validation policy**: 2 (STRONG)
- **New password**: [Digite uma senha forte]
- **Remove anonymous users**: Y
- **Disallow root login remotely**: Y
- **Remove test database**: Y
- **Reload privilege tables**: Y

### 2. Criar Banco de Dados e Usuário

Conecte-se ao MySQL:

```bash
sudo mysql -u root -p
```

Execute os seguintes comandos SQL:

```sql
-- Criar banco de dados
CREATE DATABASE lialean_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Criar usuário dedicado
CREATE USER 'lialean_user'@'localhost' IDENTIFIED BY 'SUA_SENHA_FORTE_AQUI';

-- Conceder permissões
GRANT ALL PRIVILEGES ON lialean_db.* TO 'lialean_user'@'localhost';

-- Aplicar mudanças
FLUSH PRIVILEGES;

-- Verificar banco criado
SHOW DATABASES;

-- Verificar usuário criado
SELECT User, Host FROM mysql.user WHERE User = 'lialean_user';

-- Sair
EXIT;
```

### 3. Testar Conexão

```bash
mysql -u lialean_user -p lialean_db
```

Digite a senha criada. Se conectar com sucesso, está tudo certo!

```sql
-- Dentro do MySQL, teste:
SHOW TABLES;
EXIT;
```

### 4. Importar Schema (Opcional - será feito automaticamente)

O schema será criado automaticamente pelo Drizzle ORM, mas se preferir criar manualmente:

```bash
cd /var/www/Site_LiaLean
mysql -u lialean_user -p lialean_db < database/schema.sql
```

---

## 📦 Clonagem e Configuração do Projeto

### 1. Criar Diretório de Aplicações

```bash
sudo mkdir -p /var/www
cd /var/www
```

### 2. Clonar Repositório

```bash
sudo git clone https://github.com/AgroIAActionPlan/Site_LeanLia.git Site_LiaLean
cd Site_LiaLean

# Dar permissões ao usuário atual
sudo chown -R $USER:$USER /var/www/Site_LiaLean
```

### 3. Verificar Estrutura

```bash
ls -la
```

Você deve ver:
- `client/` - Frontend
- `server/` - Backend
- `database/` - Schema SQL
- `scripts/` - Scripts de automação
- `package.json`
- `README.md`
- `DEPLOY.md`

---

## ⚙️ Configuração de Variáveis de Ambiente

### 1. Copiar Template

```bash
cp .env.production.example .env
```

### 2. Gerar JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado gerado (64 caracteres hexadecimais).

### 3. Editar .env

```bash
nano .env
```

**Configuração Mínima Necessária:**

```env
# ============================================
# Database Configuration
# ============================================
DATABASE_URL=mysql://lialean_user:SUA_SENHA_MYSQL@localhost:3306/lialean_db

# ============================================
# JWT & Security
# ============================================
JWT_SECRET=cole_aqui_o_jwt_secret_gerado_acima

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

# ============================================
# OAuth (Opcional - se não usar Manus, pode deixar vazio)
# ============================================
OAUTH_SERVER_URL=
VITE_OAUTH_PORTAL_URL=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=
```

**Importante**: Substitua:
- `SUA_SENHA_MYSQL` pela senha do usuário `lialean_user`
- `cole_aqui_o_jwt_secret_gerado_acima` pelo JWT secret gerado

### 4. Proteger .env

```bash
chmod 600 .env
```

### 5. Verificar Configuração

```bash
# Testar conexão com banco
node -e "const url = require('fs').readFileSync('.env', 'utf8').match(/DATABASE_URL=(.*)/)[1]; console.log('Database URL:', url.replace(/:[^:@]+@/, ':****@'));"
```

---

## 🚀 Build e Deploy da Aplicação

### 1. Instalar Dependências

```bash
pnpm install
```

Isso pode levar alguns minutos na primeira vez.

### 2. Aplicar Migrações do Banco

```bash
pnpm db:push
```

Este comando irá:
- Ler o schema em `drizzle/schema.ts`
- Criar todas as tabelas no MySQL
- Aplicar índices e constraints

**Saída esperada:**
```
✓ Pushing schema changes to database
✓ Schema pushed successfully
```

### 3. Verificar Tabelas Criadas

```bash
mysql -u lialean_user -p lialean_db -e "SHOW TABLES;"
```

Você deve ver:
```
+----------------------+
| Tables_in_lialean_db |
+----------------------+
| users                |
+----------------------+
```

### 4. Build da Aplicação

```bash
pnpm build
```

Isso irá:
- Compilar TypeScript
- Otimizar frontend (Vite)
- Gerar arquivos em `client/dist/` e `server/dist/`

**Tempo estimado**: 1-3 minutos

### 5. Testar Localmente (Opcional)

```bash
# Iniciar em modo produção
pnpm start
```

Em outro terminal:
```bash
curl http://localhost:3000
```

Se retornar HTML, está funcionando! Pressione `Ctrl+C` para parar.

### 6. Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start npm --name "lialean" -- start

# Verificar status
pm2 status

# Ver logs
pm2 logs lialean --lines 20

# Configurar para iniciar no boot
pm2 startup
# Copie e execute o comando que aparecer

# Salvar configuração
pm2 save
```

### 7. Verificar Aplicação Rodando

```bash
# Ver status detalhado
pm2 info lialean

# Monitorar em tempo real
pm2 monit
```

Pressione `q` para sair do monitor.

---

## 🌐 Configuração do Nginx

### 1. Criar Arquivo de Configuração

```bash
sudo nano /etc/nginx/sites-available/lialean
```

### 2. Adicionar Configuração Básica

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

**Importante**: Substitua `seu-dominio.com` pelo seu domínio real.

### 3. Ativar Site

```bash
# Criar link simbólico
sudo ln -s /etc/nginx/sites-available/lialean /etc/nginx/sites-enabled/

# Remover site padrão (opcional)
sudo rm /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t
```

**Saída esperada:**
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 4. Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

### 5. Testar Acesso

```bash
curl -I http://seu-dominio.com
```

Você deve ver `HTTP/1.1 200 OK` ou redirecionamento.

---

## 🔒 Configuração de SSL/HTTPS

### 1. Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-nginx
```

### 2. Obter Certificado SSL

```bash
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com
```

Responda às perguntas:
- **Email**: seu-email@exemplo.com
- **Terms of Service**: A (agree)
- **Share email**: N (no)
- **Redirect HTTP to HTTPS**: 2 (yes)

### 3. Verificar Certificado

```bash
sudo certbot certificates
```

### 4. Testar HTTPS

```bash
curl -I https://seu-dominio.com
```

Você deve ver `HTTP/2 200` ou `HTTP/1.1 200`.

### 5. Renovação Automática

O Certbot configura renovação automática. Testar:

```bash
sudo certbot renew --dry-run
```

**Saída esperada:**
```
Congratulations, all simulated renewals succeeded
```

---

## 💾 Backup Automático

### 1. Testar Script de Backup

```bash
./scripts/backup-database.sh
```

Verifique se o backup foi criado:

```bash
ls -lh backups/database/
```

### 2. Configurar Backup Diário

```bash
# Editar crontab
crontab -e
```

Adicionar linha (executar às 2h da manhã):

```cron
0 2 * * * /var/www/Site_LiaLean/scripts/backup-database.sh >> /var/log/lialean-backup.log 2>&1
```

Salvar e sair (`Ctrl+X`, depois `Y`, depois `Enter`).

### 3. Verificar Cron Configurado

```bash
crontab -l
```

### 4. Criar Diretório de Log

```bash
sudo touch /var/log/lialean-backup.log
sudo chown $USER:$USER /var/log/lialean-backup.log
```

### 5. Testar Backup Manual

```bash
# Criar backup
./scripts/backup-database.sh

# Ver log
tail -20 /var/log/lialean-backup.log

# Listar backups
ls -lh backups/database/
```

---

## 🔄 Manutenção e Atualizações

### Atualização Manual

```bash
cd /var/www/Site_LiaLean

# Backup do .env
cp .env .env.backup

# Puxar alterações
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

### Atualização Automatizada

Use o script fornecido:

```bash
./scripts/deploy.sh
```

Este script faz:
1. ✅ Backup do .env
2. ✅ Backup do banco de dados
3. ✅ Pull do código
4. ✅ Instalação de dependências
5. ✅ Migrações do banco
6. ✅ Build da aplicação
7. ✅ Reinício do PM2
8. ✅ Verificação de saúde

### Monitoramento

```bash
# Status da aplicação
pm2 status

# Logs em tempo real
pm2 logs lialean

# Informações detalhadas
pm2 info lialean

# Monitor interativo
pm2 monit

# Logs do Nginx
sudo tail -f /var/log/nginx/lialean_access.log
sudo tail -f /var/log/nginx/lialean_error.log
```

### Comandos Úteis

```bash
# Reiniciar aplicação
pm2 restart lialean

# Parar aplicação
pm2 stop lialean

# Iniciar aplicação
pm2 start lialean

# Remover do PM2
pm2 delete lialean

# Limpar logs do PM2
pm2 flush

# Reiniciar Nginx
sudo systemctl restart nginx

# Recarregar Nginx (sem downtime)
sudo systemctl reload nginx

# Status do MySQL
sudo systemctl status mysql

# Reiniciar MySQL
sudo systemctl restart mysql
```

---

## 🆘 Troubleshooting

### Problema: Aplicação não inicia

**Sintomas**: PM2 mostra status "errored" ou "stopped"

**Solução**:

```bash
# Ver logs de erro
pm2 logs lialean --lines 50 --err

# Verificar se porta 3000 está em uso
sudo lsof -i :3000

# Se estiver em uso por outro processo, matar:
sudo kill -9 $(sudo lsof -t -i:3000)

# Reiniciar aplicação
pm2 restart lialean
```

### Problema: Erro de conexão com MySQL

**Sintomas**: Erro "ECONNREFUSED" ou "Access denied"

**Solução**:

```bash
# Verificar se MySQL está rodando
sudo systemctl status mysql

# Se não estiver, iniciar:
sudo systemctl start mysql

# Testar conexão manualmente
mysql -u lialean_user -p lialean_db

# Verificar credenciais no .env
grep DATABASE_URL .env

# Verificar permissões do usuário
sudo mysql -u root -p -e "SHOW GRANTS FOR 'lialean_user'@'localhost';"
```

### Problema: Erro 502 Bad Gateway (Nginx)

**Sintomas**: Navegador mostra "502 Bad Gateway"

**Solução**:

```bash
# Verificar se aplicação está rodando
pm2 status

# Se não estiver, iniciar:
pm2 start lialean

# Verificar logs do Nginx
sudo tail -50 /var/log/nginx/lialean_error.log

# Verificar configuração do Nginx
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Problema: Erro de migrações do banco

**Sintomas**: Erro ao executar `pnpm db:push`

**Solução**:

```bash
# Verificar conexão com banco
mysql -u lialean_user -p lialean_db -e "SELECT 1;"

# Ver tabelas existentes
mysql -u lialean_user -p lialean_db -e "SHOW TABLES;"

# Se necessário, recriar banco (CUIDADO: apaga dados!)
mysql -u root -p -e "DROP DATABASE lialean_db; CREATE DATABASE lialean_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Aplicar migrações novamente
pnpm db:push
```

### Problema: Certificado SSL expirado

**Sintomas**: Navegador mostra aviso de certificado inválido

**Solução**:

```bash
# Verificar status dos certificados
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Reiniciar Nginx
sudo systemctl restart nginx

# Testar renovação automática
sudo certbot renew --dry-run
```

### Problema: Aplicação lenta ou travando

**Sintomas**: Site demora para carregar ou não responde

**Solução**:

```bash
# Verificar uso de recursos
htop  # ou top

# Ver uso de memória do PM2
pm2 list

# Ver logs para identificar problema
pm2 logs lialean --lines 100

# Reiniciar aplicação
pm2 restart lialean

# Se necessário, aumentar memória do Node.js
pm2 delete lialean
pm2 start npm --name "lialean" --node-args="--max-old-space-size=2048" -- start
pm2 save
```

### Problema: Backup não está funcionando

**Sintomas**: Nenhum arquivo em `backups/database/`

**Solução**:

```bash
# Executar backup manualmente
./scripts/backup-database.sh

# Verificar permissões
ls -la scripts/backup-database.sh
chmod +x scripts/backup-database.sh

# Verificar cron
crontab -l

# Ver log de backup
tail -50 /var/log/lialean-backup.log

# Testar mysqldump manualmente
mysqldump -u lialean_user -p lialean_db > test_backup.sql
```

---

## 📊 Checklist Final de Verificação

Use este checklist para garantir que tudo está funcionando:

### Ambiente
- [ ] Node.js 20.x instalado
- [ ] pnpm instalado
- [ ] MySQL 8.0 instalado e rodando
- [ ] Nginx instalado e rodando
- [ ] PM2 instalado

### Banco de Dados
- [ ] Banco `lialean_db` criado
- [ ] Usuário `lialean_user` criado com permissões
- [ ] Conexão testada com sucesso
- [ ] Tabelas criadas (executar `SHOW TABLES;`)

### Aplicação
- [ ] Repositório clonado
- [ ] Arquivo `.env` configurado e protegido
- [ ] Dependências instaladas (`node_modules/` existe)
- [ ] Build realizado com sucesso
- [ ] Aplicação rodando no PM2
- [ ] PM2 configurado para iniciar no boot

### Nginx
- [ ] Arquivo de configuração criado
- [ ] Site ativado (link simbólico criado)
- [ ] Configuração testada (`nginx -t` OK)
- [ ] Nginx reiniciado

### SSL/HTTPS
- [ ] Certbot instalado
- [ ] Certificado SSL obtido
- [ ] HTTPS funcionando
- [ ] Renovação automática configurada

### Backup
- [ ] Script de backup testado
- [ ] Cron configurado para backup diário
- [ ] Backups sendo criados em `backups/database/`

### Acesso
- [ ] Site acessível via HTTP
- [ ] Site acessível via HTTPS
- [ ] Redirecionamento HTTP → HTTPS funcionando
- [ ] Todas as páginas carregando corretamente

---

## 🎉 Conclusão

Parabéns! Se você seguiu todos os passos, seu site LiaLean está:

✅ **Publicado** em seu servidor  
✅ **Integrado** com MySQL próprio  
✅ **Protegido** com SSL/HTTPS  
✅ **Monitorado** pelo PM2  
✅ **Com backup** automático diário  
✅ **Pronto** para produção!

---

## 📞 Suporte e Recursos

### Documentação Adicional
- [README.md](./README.md) - Visão geral do projeto
- [DEPLOY.md](./DEPLOY.md) - Guia detalhado de deploy
- [QUICK_START.md](./QUICK_START.md) - Guia rápido de 5 minutos
- [CHANGELOG_RENAME.md](./CHANGELOG_RENAME.md) - Histórico de renomeação

### Scripts Úteis
- `scripts/deploy.sh` - Deploy automatizado
- `scripts/backup-database.sh` - Backup do banco

### Links
- **GitHub**: https://github.com/AgroIAActionPlan/Site_LeanLia
- **Email**: contato@lialean.com

---

**Última atualização**: 17 de outubro de 2024  
**Versão do guia**: 1.0

