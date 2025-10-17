# Guia Rápido de Deploy - Site LeanLia

Este é um guia resumido para deploy rápido. Para instruções detalhadas, consulte [DEPLOY.md](./DEPLOY.md).

## 🚀 Deploy em 5 Minutos

### 1. Clonar Repositório

```bash
cd /var/www
git clone https://github.com/AgroIAActionPlan/Site_LeanLia.git
cd Site_LeanLia
```

### 2. Configurar Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root -p

# Executar comandos
CREATE DATABASE leanlia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'leanlia_user'@'localhost' IDENTIFIED BY 'SUA_SENHA_FORTE';
GRANT ALL PRIVILEGES ON leanlia_db.* TO 'leanlia_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar template
cp .env.production.example .env

# Editar com suas credenciais
nano .env
```

**Mínimo necessário no .env:**
```env
DATABASE_URL=mysql://leanlia_user:SUA_SENHA@localhost:3306/leanlia_db
JWT_SECRET=gere_uma_chave_segura_com_32_caracteres
NODE_ENV=production
PORT=3000
```

**Gerar JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Instalar e Executar

```bash
# Instalar pnpm (se necessário)
npm install -g pnpm

# Instalar dependências
pnpm install

# Aplicar migrações do banco
pnpm db:push

# Build
pnpm build

# Instalar PM2 (se necessário)
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "leanlia" -- start
pm2 save
pm2 startup
```

### 5. Configurar Nginx

```bash
# Criar arquivo de configuração
sudo nano /etc/nginx/sites-available/leanlia
```

**Conteúdo básico:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/leanlia /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. Configurar SSL (Opcional mas Recomendado)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d seu-dominio.com
```

## ✅ Verificação

```bash
# Verificar se está rodando
pm2 status

# Ver logs
pm2 logs leanlia

# Testar localmente
curl http://localhost:3000
```

## 🔄 Atualizações Futuras

Use o script automatizado:

```bash
./scripts/deploy.sh
```

Ou manualmente:

```bash
git pull origin main
pnpm install
pnpm db:push
pnpm build
pm2 restart leanlia
```

## 💾 Backup Automático

```bash
# Configurar backup diário às 2h
sudo crontab -e

# Adicionar linha:
0 2 * * * /var/www/Site_LeanLia/scripts/backup-database.sh
```

## 🆘 Problemas Comuns

### Aplicação não inicia
```bash
pm2 logs leanlia --lines 50
```

### Erro de conexão com MySQL
```bash
mysql -u leanlia_user -p leanlia_db
```

### Erro 502 no Nginx
```bash
sudo systemctl status nginx
pm2 status
```

## 📚 Documentação Completa

- **Deploy Detalhado**: [DEPLOY.md](./DEPLOY.md)
- **README**: [README.md](./README.md)
- **Schema SQL**: [database/schema.sql](./database/schema.sql)

## 📞 Suporte

- **Email**: contato@leanlia.com
- **GitHub**: https://github.com/AgroIAActionPlan/Site_LeanLia/issues

---

**Tempo estimado de deploy**: 10-15 minutos (primeira vez)

**Tempo estimado de atualização**: 2-3 minutos (com script automatizado)

