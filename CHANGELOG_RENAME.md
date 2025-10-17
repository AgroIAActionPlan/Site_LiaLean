# Changelog - Renomeação de Marca

## Data: 17 de Outubro de 2024

### Alteração Principal
**LeanLia → LiaLean**

Todas as referências à marca "LeanLia" foram substituídas por "LiaLean" em todo o projeto.

---

## Arquivos Modificados

### 1. Código Fonte (Frontend)
- `client/src/pages/Home.tsx` - Logo e rodapé
- `client/src/pages/Login.tsx` - Logo no header
- `client/src/lib/translations.ts` - Traduções em PT, EN e ES

### 2. Documentação
- `README.md` - Título e todas as referências
- `DEPLOY.md` - Guia completo de deploy
- `QUICK_START.md` - Guia rápido

### 3. Configuração
- `package.json` - Nome do projeto

### 4. Banco de Dados
- `database/schema.sql` - Comentários e nomes sugeridos

### 5. Scripts
- `scripts/deploy.sh` - Mensagens e variáveis
- `scripts/backup-database.sh` - Logs e mensagens

---

## Mudanças Específicas

### Identidade Visual
- **Nome da empresa**: LeanLia → LiaLean
- **Logo/Marca**: LiaLean

### Contatos
- **Email**: contato@leanlia.com → contato@lialean.com
- **Instagram**: @leanlia → @lialean
- **LinkedIn**: /company/leanlia → /company/lialean

### Técnico
- **Nome do banco**: leanlia_db → lialean_db
- **Usuário do banco**: leanlia_user → lialean_user
- **Processo PM2**: leanlia → lialean
- **Nginx config**: /etc/nginx/sites-available/leanlia → lialean
- **Diretório de backup**: /var/backups/leanlia → /var/backups/lialean
- **Script de backup**: backup-leanlia.sh → backup-lialean.sh
- **Logs**: leanlia-backup.log → lialean-backup.log

### URLs e Domínios (Sugestões no código)
- leanlia.com → lialean.com
- www.leanlia.com → www.lialean.com

---

## Ações Necessárias no Deploy

Ao fazer deploy com o novo nome, você precisará:

1. **Criar novo banco de dados**:
   ```sql
   CREATE DATABASE lialean_db;
   CREATE USER 'lialean_user'@'localhost' IDENTIFIED BY 'senha';
   GRANT ALL PRIVILEGES ON lialean_db.* TO 'lialean_user'@'localhost';
   ```

2. **Atualizar .env**:
   ```env
   DATABASE_URL=mysql://lialean_user:senha@localhost:3306/lialean_db
   ```

3. **Atualizar PM2**:
   ```bash
   pm2 delete leanlia  # Se existir processo antigo
   pm2 start npm --name "lialean" -- start
   pm2 save
   ```

4. **Atualizar Nginx**:
   ```bash
   sudo mv /etc/nginx/sites-available/leanlia /etc/nginx/sites-available/lialean
   # Editar arquivo e atualizar server_name para novo domínio
   sudo ln -sf /etc/nginx/sites-available/lialean /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

5. **Atualizar domínio e SSL**:
   ```bash
   sudo certbot --nginx -d lialean.com -d www.lialean.com
   ```

6. **Atualizar cron de backup**:
   ```bash
   crontab -e
   # Atualizar caminho: /var/www/Site_LiaLean/scripts/backup-database.sh
   ```

---

## Migração de Dados (Se necessário)

Se você já tem dados no banco antigo:

```bash
# Exportar dados antigos
mysqldump -u leanlia_user -p leanlia_db > backup_leanlia.sql

# Importar para novo banco
mysql -u lialean_user -p lialean_db < backup_leanlia.sql
```

---

## Commit no GitHub

```
commit 1de0ad4
Author: LiaLean
Date: 2024-10-17

refactor: Rename brand from LeanLia to LiaLean across entire project

- Updated all occurrences in source code
- Updated documentation
- Updated database schema and scripts
- Changed email and social media references
- Changed technical names (db, pm2, nginx)
```

---

## Verificação

Total de substituições realizadas:
- **LeanLia** → **LiaLean**: 29 ocorrências
- **leanlia** → **lialean**: 56 ocorrências
- **Total**: 85 substituições em 10 arquivos

---

## Status

✅ Código fonte atualizado  
✅ Documentação atualizada  
✅ Scripts atualizados  
✅ Commit realizado  
✅ Push para GitHub concluído  

---

**Projeto pronto para deploy com o novo nome LiaLean!**
