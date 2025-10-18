-- ============================================
-- Schema do Banco de Dados PostgreSQL - Site LiaLean
-- ============================================
-- 
-- Este arquivo contém o schema completo do banco de dados PostgreSQL
-- para o site LiaLean. Execute este script em seu PostgreSQL
-- para criar a estrutura necessária.
--
-- Versão: 1.0
-- Data: 2024-10-17
-- Database: PostgreSQL
-- ============================================

-- Criar banco de dados (executar como superusuário)
-- CREATE DATABASE lialean_db WITH ENCODING 'UTF8' LC_COLLATE='pt_BR.UTF-8' LC_CTYPE='pt_BR.UTF-8';

-- Conectar ao banco
\c lialean_db

-- ============================================
-- Enum Types
-- ============================================

-- Enum para roles de usuário
CREATE TYPE role AS ENUM ('user', 'admin');

-- ============================================
-- Tabela: users
-- Descrição: Armazena informações dos usuários do sistema
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT,
  email VARCHAR(320),
  "loginMethod" VARCHAR(64),
  role role DEFAULT 'user' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "lastSignedIn" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentários nas colunas
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON COLUMN users.id IS 'ID único do usuário';
COMMENT ON COLUMN users.name IS 'Nome completo do usuário';
COMMENT ON COLUMN users.email IS 'Email do usuário';
COMMENT ON COLUMN users."loginMethod" IS 'Método de autenticação utilizado';
COMMENT ON COLUMN users.role IS 'Papel do usuário no sistema';
COMMENT ON COLUMN users."createdAt" IS 'Data de criação do registro';
COMMENT ON COLUMN users."lastSignedIn" IS 'Último login do usuário';

-- ============================================
-- Índices para otimização de consultas
-- ============================================

-- Índice para busca por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Índice para filtro por role
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Índice para ordenação por data de criação
CREATE INDEX IF NOT EXISTS idx_users_created ON users("createdAt");

-- ============================================
-- Tabela: contact_messages (Opcional - para formulário de contato)
-- Descrição: Armazena mensagens enviadas pelo formulário de contato
-- ============================================

CREATE TYPE message_status AS ENUM ('new', 'read', 'replied', 'archived');

CREATE TABLE IF NOT EXISTS contact_messages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(320) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  status message_status DEFAULT 'new' NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "readAt" TIMESTAMP NULL,
  "repliedAt" TIMESTAMP NULL
);

COMMENT ON TABLE contact_messages IS 'Mensagens do formulário de contato';
COMMENT ON COLUMN contact_messages.id IS 'ID único da mensagem';
COMMENT ON COLUMN contact_messages.name IS 'Nome do remetente';
COMMENT ON COLUMN contact_messages.email IS 'Email do remetente';
COMMENT ON COLUMN contact_messages.phone IS 'Telefone do remetente';
COMMENT ON COLUMN contact_messages.message IS 'Conteúdo da mensagem';
COMMENT ON COLUMN contact_messages.status IS 'Status da mensagem';
COMMENT ON COLUMN contact_messages."createdAt" IS 'Data de recebimento';
COMMENT ON COLUMN contact_messages."readAt" IS 'Data de leitura';
COMMENT ON COLUMN contact_messages."repliedAt" IS 'Data de resposta';

-- Índices para contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_messages("createdAt");

-- ============================================
-- Tabela: sessions (Opcional - para gerenciamento de sessões)
-- Descrição: Armazena sessões ativas dos usuários
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) PRIMARY KEY,
  "userId" VARCHAR(64) NOT NULL,
  token TEXT NOT NULL,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "lastActivityAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE
);

COMMENT ON TABLE sessions IS 'Sessões ativas dos usuários';
COMMENT ON COLUMN sessions.id IS 'ID da sessão';
COMMENT ON COLUMN sessions."userId" IS 'ID do usuário';
COMMENT ON COLUMN sessions.token IS 'Token JWT da sessão';
COMMENT ON COLUMN sessions."expiresAt" IS 'Data de expiração';
COMMENT ON COLUMN sessions."createdAt" IS 'Data de criação';
COMMENT ON COLUMN sessions."lastActivityAt" IS 'Última atividade';
COMMENT ON COLUMN sessions."ipAddress" IS 'Endereço IP';
COMMENT ON COLUMN sessions."userAgent" IS 'User agent do navegador';

-- Índices para sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions("userId");
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions("expiresAt");

-- ============================================
-- Tabela: audit_log (Opcional - para auditoria)
-- Descrição: Registra ações importantes no sistema
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  "userId" VARCHAR(64),
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100),
  "entityId" VARCHAR(64),
  details JSONB,
  "ipAddress" VARCHAR(45),
  "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE SET NULL
);

COMMENT ON TABLE audit_log IS 'Log de auditoria do sistema';
COMMENT ON COLUMN audit_log.id IS 'ID do log';
COMMENT ON COLUMN audit_log."userId" IS 'ID do usuário que realizou a ação';
COMMENT ON COLUMN audit_log.action IS 'Tipo de ação realizada';
COMMENT ON COLUMN audit_log.entity IS 'Entidade afetada';
COMMENT ON COLUMN audit_log."entityId" IS 'ID da entidade afetada';
COMMENT ON COLUMN audit_log.details IS 'Detalhes adicionais em JSON';
COMMENT ON COLUMN audit_log."ipAddress" IS 'Endereço IP';
COMMENT ON COLUMN audit_log."createdAt" IS 'Data da ação';

-- Índices para audit_log
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_log("userId");
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log("createdAt");
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity, "entityId");

-- ============================================
-- Functions e Triggers
-- ============================================

-- Function para atualizar lastActivityAt automaticamente
CREATE OR REPLACE FUNCTION update_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  NEW."lastActivityAt" = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para sessions
CREATE TRIGGER trigger_update_last_activity
BEFORE UPDATE ON sessions
FOR EACH ROW
EXECUTE FUNCTION update_last_activity();

-- ============================================
-- Function para limpar sessões expiradas
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE "expiresAt" < NOW();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Views (Opcional)
-- ============================================

-- View para estatísticas de usuários
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  role,
  COUNT(*) as total_users,
  COUNT(CASE WHEN DATE("lastSignedIn") = CURRENT_DATE THEN 1 END) as active_today,
  COUNT(CASE WHEN "lastSignedIn" >= NOW() - INTERVAL '7 days' THEN 1 END) as active_week,
  COUNT(CASE WHEN "lastSignedIn" >= NOW() - INTERVAL '30 days' THEN 1 END) as active_month
FROM users
GROUP BY role;

-- View para mensagens de contato pendentes
CREATE OR REPLACE VIEW pending_contact_messages AS
SELECT 
  id,
  name,
  email,
  phone,
  LEFT(message, 100) as message_preview,
  status,
  "createdAt"
FROM contact_messages
WHERE status = 'new'
ORDER BY "createdAt" DESC;

-- ============================================
-- Grants e Permissões
-- ============================================

-- Conceder permissões ao usuário da aplicação
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO lialean_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO lialean_user;
-- GRANT EXECUTE ON FUNCTION cleanup_expired_sessions() TO lialean_user;
-- GRANT EXECUTE ON FUNCTION update_last_activity() TO lialean_user;

-- ============================================
-- Verificação Final
-- ============================================

-- Mostrar todas as tabelas criadas
\dt

-- Mostrar estrutura da tabela users
\d users

-- Mostrar enums criados
\dT

-- ============================================
-- Notas Importantes
-- ============================================

/*
1. SEGURANÇA:
   - Use senhas fortes e únicas para cada ambiente
   - Configure pg_hba.conf adequadamente
   - Nunca commite senhas no Git

2. BACKUP:
   - Use pg_dump para backups regulares
   - Configure backups automáticos diários
   - Teste a restauração dos backups regularmente

3. PERFORMANCE:
   - Monitore o uso de índices com EXPLAIN ANALYZE
   - Ajuste índices conforme padrões de uso
   - Configure PostgreSQL para otimizar performance
   - Use VACUUM e ANALYZE periodicamente

4. MANUTENÇÃO:
   - Execute VACUUM ANALYZE periodicamente
   - Monitore o crescimento das tabelas
   - Limpe logs antigos regularmente
   - Monitore conexões ativas

5. DESENVOLVIMENTO:
   - Use migrações (Drizzle) para alterações no schema
   - Documente todas as mudanças no banco
   - Teste em ambiente de staging antes de produção

6. POSTGRESQL ESPECÍFICO:
   - Aproveite tipos nativos (JSONB, ARRAY, etc)
   - Use enums para valores fixos
   - Configure connection pooling adequadamente
   - Monitore locks e deadlocks
*/

-- ============================================
-- Comandos Úteis PostgreSQL
-- ============================================

-- Ver conexões ativas
-- SELECT * FROM pg_stat_activity;

-- Ver tamanho das tabelas
-- SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver índices
-- SELECT * FROM pg_indexes WHERE schemaname = 'public';

-- Limpar sessões expiradas manualmente
-- SELECT cleanup_expired_sessions();

-- Vacuum e Analyze
-- VACUUM ANALYZE;

-- ============================================
-- Fim do Script
-- ============================================

SELECT 'Schema PostgreSQL criado com sucesso!' as status;

