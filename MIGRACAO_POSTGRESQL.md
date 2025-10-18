# Migração para PostgreSQL - Site LiaLean

Este documento descreve a migração completa do projeto de MySQL para PostgreSQL.

---

## 📊 Resumo da Migração

**Data**: 17 de outubro de 2024  
**Tipo**: Migração de banco de dados  
**De**: MySQL 8.0  
**Para**: PostgreSQL 15+  
**Status**: ✅ Concluída

---

## 🔄 Alterações Realizadas

### 1. Dependências do Projeto

#### Removido:
```json
"mysql2": "^3.15.0"
```

#### Adicionado:
```json
"postgres": "^3.4.7"
```

**Driver**: Migrado de `mysql2` para `postgres-js` (driver PostgreSQL moderno e performático)

### 2. Schema do Drizzle ORM

**Arquivo**: `drizzle/schema.ts`

#### Antes (MySQL):
```typescript
import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // ...
});
```

#### Depois (PostgreSQL):
```typescript
import { pgEnum, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  role: roleEnum("role").default("user").notNull(),
  // ...
});
```

**Mudanças**:
- `mysqlTable` → `pgTable`
- `mysqlEnum` → `pgEnum` (com definição separada)
- Import de `drizzle-orm/mysql-core` → `drizzle-orm/pg-core`

### 3. Conexão com Banco de Dados

**Arquivo**: `server/db.ts`

#### Antes (MySQL):
```typescript
import { drizzle } from "drizzle-orm/mysql2";

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _db = drizzle(process.env.DATABASE_URL);
  }
  return _db;
}
```

#### Depois (PostgreSQL):
```typescript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

let _client: ReturnType<typeof postgres> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    _client = postgres(process.env.DATABASE_URL);
    _db = drizzle(_client);
  }
  return _db;
}
```

**Mudanças**:
- Import de `drizzle-orm/mysql2` → `drizzle-orm/postgres-js`
- Adicionado import do driver `postgres`
- Criação explícita do cliente PostgreSQL

### 4. Operações de Upsert

**Arquivo**: `server/db.ts`

#### Antes (MySQL):
```typescript
await db.insert(users).values(values).onDuplicateKeyUpdate({
  set: updateSet,
});
```

#### Depois (PostgreSQL):
```typescript
await db.insert(users).values(values).onConflictDoUpdate({
  target: users.id,
  set: updateSet,
});
```

**Mudanças**:
- `onDuplicateKeyUpdate` → `onConflictDoUpdate`
- Adicionado parâmetro `target` especificando a coluna de conflito

### 5. Configuração do Drizzle Kit

**Arquivo**: `drizzle.config.ts`

#### Antes (MySQL):
```typescript
export default defineConfig({
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
```

#### Depois (PostgreSQL):
```typescript
export default defineConfig({
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});
```

**Mudanças**:
- `dialect: "mysql"` → `dialect: "postgresql"`

### 6. Schema SQL

**Novo Arquivo**: `database/schema_postgresql.sql`

Criado schema completo para PostgreSQL com:
- Tipos ENUM nativos
- Tabelas com comentários
- Índices otimizados
- Functions e Triggers
- Views para estatísticas
- Suporte a JSONB
- Sequences (SERIAL, BIGSERIAL)

---

## 📝 Formato da Connection String

### MySQL (Antigo):
```env
DATABASE_URL=mysql://usuario:senha@host:3306/database
```

### PostgreSQL (Novo):
```env
DATABASE_URL=postgresql://usuario:senha@host:5432/database
```

**Mudanças**:
- Protocolo: `mysql://` → `postgresql://`
- Porta padrão: `3306` → `5432`

---

## 🆕 Novos Recursos Disponíveis

### 1. Tipos Nativos PostgreSQL

```sql
-- JSONB para dados estruturados
details JSONB

-- Arrays nativos
tags TEXT[]

-- UUID nativo
id UUID DEFAULT gen_random_uuid()
```

### 2. Enums Nativos

```sql
CREATE TYPE role AS ENUM ('user', 'admin');
CREATE TYPE message_status AS ENUM ('new', 'read', 'replied', 'archived');
```

### 3. Functions e Triggers

```sql
-- Function para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW."lastActivityAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_last_activity
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_last_activity();
```

### 4. Views Materializadas

```sql
-- View para estatísticas (pode ser materializada para performance)
CREATE MATERIALIZED VIEW user_statistics AS
SELECT role, COUNT(*) as total_users
FROM users
GROUP BY role;

-- Refresh
REFRESH MATERIALIZED VIEW user_statistics;
```

---

## 🔧 Comandos de Migração

### Para Novos Projetos:

```bash
# 1. Criar banco e usuário no PostgreSQL
sudo -u postgres psql
CREATE DATABASE lialean_db;
CREATE USER lialean_user WITH PASSWORD 'senha_forte';
GRANT ALL PRIVILEGES ON DATABASE lialean_db TO lialean_user;
\c lialean_db
GRANT ALL ON SCHEMA public TO lialean_user;
\q

# 2. Configurar .env
DATABASE_URL=postgresql://lialean_user:senha_forte@localhost:5432/lialean_db

# 3. Aplicar migrações
pnpm db:push

# 4. Verificar
psql -U lialean_user -d lialean_db -h localhost -c "\dt"
```

### Para Migração de Dados Existentes:

Se você já tem dados no MySQL e quer migrar para PostgreSQL:

```bash
# 1. Exportar dados do MySQL (apenas dados, sem schema)
mysqldump -u lealian_user -p --no-create-info lealian_db > data_mysql.sql

# 2. Converter SQL do MySQL para PostgreSQL
# Use ferramentas como pgloader ou converta manualmente

# 3. Criar schema no PostgreSQL
pnpm db:push

# 4. Importar dados convertidos
psql -U lialean_user -d lialean_db -h localhost < data_postgresql.sql
```

**Recomendação**: Para migração de dados complexa, use [pgloader](https://pgloader.io/):

```bash
# Instalar pgloader
apt install pgloader

# Migrar dados diretamente
pgloader mysql://user:pass@localhost/lealian_db postgresql://user:pass@localhost/lialean_db
```

---

## 📊 Comparação: MySQL vs PostgreSQL

| Aspecto | MySQL | PostgreSQL |
|---------|-------|------------|
| **Tipo** | Relacional | Objeto-Relacional |
| **ACID** | Sim | Sim (mais robusto) |
| **JSON** | JSON | JSON + JSONB (binário, indexável) |
| **Full Text Search** | Limitado | Avançado (tsvector) |
| **Enums** | Via CHECK | Tipo nativo |
| **Arrays** | Não | Sim (nativo) |
| **Window Functions** | Sim | Sim (mais completo) |
| **CTEs Recursivos** | Sim | Sim (mais flexível) |
| **Triggers** | Sim | Sim (mais poderoso) |
| **Extensões** | Limitado | Extensivo (PostGIS, etc) |
| **Performance** | Leitura rápida | Escrita e leitura balanceadas |
| **Licença** | GPL | PostgreSQL License (mais permissiva) |

---

## ✅ Vantagens da Migração

### 1. Performance
- Melhor otimizador de queries
- Índices mais eficientes (GiST, GIN, BRIN)
- Vacuum automático mais inteligente

### 2. Recursos Avançados
- JSONB com índices
- Arrays nativos
- Full-text search integrado
- Tipos customizados
- Extensões (PostGIS, pg_trgm, etc)

### 3. Conformidade
- Mais aderente ao padrão SQL
- Melhor suporte a transações complexas
- Isolamento de transações mais robusto

### 4. Escalabilidade
- Melhor para cargas de trabalho mistas (leitura/escrita)
- Suporte a particionamento nativo
- Replicação mais flexível

### 5. Comunidade e Ecossistema
- Comunidade ativa e crescente
- Ferramentas de administração excelentes (pgAdmin, DBeaver)
- Suporte corporativo disponível

---

## 🔍 Verificação Pós-Migração

### Checklist:

- [ ] Dependências atualizadas (`postgres` instalado, `mysql2` removido)
- [ ] Schema do Drizzle usando `pg-core`
- [ ] Conexão usando `postgres-js`
- [ ] `drizzle.config.ts` com dialect `postgresql`
- [ ] `.env` com connection string PostgreSQL
- [ ] Migrações aplicadas com sucesso
- [ ] Tabelas criadas no PostgreSQL
- [ ] Aplicação conectando ao PostgreSQL
- [ ] Queries funcionando corretamente
- [ ] Testes passando

### Comandos de Verificação:

```bash
# Ver dependências
pnpm list postgres
pnpm list mysql2  # Não deve aparecer

# Ver schema
cat drizzle/schema.ts | grep "from"

# Testar conexão
psql -U lialean_user -d lialean_db -h localhost -c "SELECT version();"

# Ver tabelas
psql -U lialean_user -d lialean_db -h localhost -c "\dt"

# Testar aplicação
pnpm build
pnpm start
```

---

## 📚 Recursos Adicionais

### Documentação:
- [PostgreSQL Official Docs](https://www.postgresql.org/docs/)
- [Drizzle ORM PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [postgres-js GitHub](https://github.com/porsager/postgres)

### Ferramentas:
- **pgAdmin 4**: Interface gráfica para PostgreSQL
- **DBeaver**: Cliente universal de banco de dados
- **pgloader**: Ferramenta de migração de dados
- **pg_dump/pg_restore**: Backup e restore

### Monitoramento:
- **pg_stat_statements**: Estatísticas de queries
- **pg_stat_activity**: Conexões ativas
- **pgBadger**: Análise de logs

---

## 🆘 Troubleshooting

### Erro: "relation does not exist"

```bash
# Aplicar migrações novamente
pnpm db:push

# Verificar schema
psql -U lialean_user -d lialean_db -h localhost -c "\dt"
```

### Erro: "permission denied for schema public"

```sql
-- Conectar como superusuário
sudo -u postgres psql lialean_db

-- Conceder permissões
GRANT ALL ON SCHEMA public TO lialean_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lialean_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lialean_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO lialean_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO lialean_user;
```

### Erro: "could not connect to server"

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar se necessário
sudo systemctl start postgresql

# Ver conexões
psql -U postgres -c "SELECT * FROM pg_stat_activity;"
```

### Performance lenta

```sql
-- Analisar tabelas
VACUUM ANALYZE;

-- Ver queries lentas
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Ver índices não utilizados
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

---

## 🎉 Conclusão

A migração para PostgreSQL foi concluída com sucesso! O projeto agora:

✅ Usa PostgreSQL como banco de dados  
✅ Aproveita recursos avançados (JSONB, enums, triggers)  
✅ Tem melhor performance e escalabilidade  
✅ É compatível com Hostinger VPS Ubuntu 24  
✅ Mantém compatibilidade com código existente  
✅ Está pronto para produção  

---

**Commit**: `4de2b93`  
**Branch**: `main`  
**GitHub**: https://github.com/AgroIAActionPlan/Site_LeanLia

---

**Última atualização**: 17 de outubro de 2024  
**Versão**: 1.0

