-- ============================================
-- Schema do Banco de Dados - Site LeanLia
-- ============================================
-- 
-- Este arquivo contém o schema completo do banco de dados
-- para o site LeanLia. Execute este script em seu MySQL
-- para criar a estrutura necessária.
--
-- Versão: 1.0
-- Data: 2024-10-17
-- ============================================

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS leanlia_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Usar o banco de dados
USE leanlia_db;

-- ============================================
-- Tabela: users
-- Descrição: Armazena informações dos usuários do sistema
-- ============================================

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY COMMENT 'ID único do usuário',
  name TEXT COMMENT 'Nome completo do usuário',
  email VARCHAR(320) COMMENT 'Email do usuário',
  loginMethod VARCHAR(64) COMMENT 'Método de autenticação utilizado',
  role ENUM('user', 'admin') DEFAULT 'user' NOT NULL COMMENT 'Papel do usuário no sistema',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação do registro',
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Último login do usuário'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tabela de usuários do sistema';

-- ============================================
-- Índices para otimização de consultas
-- ============================================

-- Índice para busca por email
CREATE INDEX idx_users_email ON users(email);

-- Índice para filtro por role
CREATE INDEX idx_users_role ON users(role);

-- Índice para ordenação por data de criação
CREATE INDEX idx_users_created ON users(createdAt);

-- ============================================
-- Tabela: contact_messages (Opcional - para formulário de contato)
-- Descrição: Armazena mensagens enviadas pelo formulário de contato
-- ============================================

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID único da mensagem',
  name VARCHAR(255) NOT NULL COMMENT 'Nome do remetente',
  email VARCHAR(320) NOT NULL COMMENT 'Email do remetente',
  phone VARCHAR(50) COMMENT 'Telefone do remetente',
  message TEXT NOT NULL COMMENT 'Conteúdo da mensagem',
  status ENUM('new', 'read', 'replied', 'archived') DEFAULT 'new' NOT NULL COMMENT 'Status da mensagem',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de recebimento',
  readAt TIMESTAMP NULL COMMENT 'Data de leitura',
  repliedAt TIMESTAMP NULL COMMENT 'Data de resposta'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mensagens do formulário de contato';

-- Índices para contact_messages
CREATE INDEX idx_contact_email ON contact_messages(email);
CREATE INDEX idx_contact_status ON contact_messages(status);
CREATE INDEX idx_contact_created ON contact_messages(createdAt);

-- ============================================
-- Tabela: sessions (Opcional - para gerenciamento de sessões)
-- Descrição: Armazena sessões ativas dos usuários
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(128) PRIMARY KEY COMMENT 'ID da sessão',
  userId VARCHAR(64) NOT NULL COMMENT 'ID do usuário',
  token TEXT NOT NULL COMMENT 'Token JWT da sessão',
  expiresAt TIMESTAMP NOT NULL COMMENT 'Data de expiração',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data de criação',
  lastActivityAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Última atividade',
  ipAddress VARCHAR(45) COMMENT 'Endereço IP',
  userAgent TEXT COMMENT 'User agent do navegador',
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Sessões ativas dos usuários';

-- Índices para sessions
CREATE INDEX idx_sessions_user ON sessions(userId);
CREATE INDEX idx_sessions_expires ON sessions(expiresAt);

-- ============================================
-- Tabela: audit_log (Opcional - para auditoria)
-- Descrição: Registra ações importantes no sistema
-- ============================================

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT 'ID do log',
  userId VARCHAR(64) COMMENT 'ID do usuário que realizou a ação',
  action VARCHAR(100) NOT NULL COMMENT 'Tipo de ação realizada',
  entity VARCHAR(100) COMMENT 'Entidade afetada',
  entityId VARCHAR(64) COMMENT 'ID da entidade afetada',
  details JSON COMMENT 'Detalhes adicionais em JSON',
  ipAddress VARCHAR(45) COMMENT 'Endereço IP',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'Data da ação',
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Log de auditoria do sistema';

-- Índices para audit_log
CREATE INDEX idx_audit_user ON audit_log(userId);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(createdAt);
CREATE INDEX idx_audit_entity ON audit_log(entity, entityId);

-- ============================================
-- Dados Iniciais (Seed Data)
-- ============================================

-- Inserir usuário administrador padrão (ALTERE A SENHA!)
-- Nota: Em produção, você deve criar usuários através da interface
-- ou usar um script de seed apropriado com senhas hasheadas

-- INSERT INTO users (id, name, email, loginMethod, role) VALUES
-- ('admin-001', 'Administrador LeanLia', 'admin@leanlia.com', 'oauth', 'admin');

-- ============================================
-- Procedures e Functions (Opcional)
-- ============================================

-- Procedure para limpar sessões expiradas
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS cleanup_expired_sessions()
BEGIN
  DELETE FROM sessions WHERE expiresAt < NOW();
END //

DELIMITER ;

-- ============================================
-- Event Scheduler (Opcional)
-- Descrição: Limpa sessões expiradas automaticamente
-- ============================================

-- Habilitar event scheduler (se não estiver habilitado)
SET GLOBAL event_scheduler = ON;

-- Criar evento para limpar sessões expiradas diariamente
CREATE EVENT IF NOT EXISTS cleanup_sessions_daily
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO
  CALL cleanup_expired_sessions();

-- ============================================
-- Views (Opcional)
-- ============================================

-- View para estatísticas de usuários
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
  role,
  COUNT(*) as total_users,
  COUNT(CASE WHEN DATE(lastSignedIn) = CURDATE() THEN 1 END) as active_today,
  COUNT(CASE WHEN lastSignedIn >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as active_week,
  COUNT(CASE WHEN lastSignedIn >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as active_month
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
  createdAt
FROM contact_messages
WHERE status = 'new'
ORDER BY createdAt DESC;

-- ============================================
-- Grants e Permissões
-- ============================================

-- Criar usuário da aplicação (se ainda não existir)
-- Nota: Altere 'SUA_SENHA_SEGURA_AQUI' para uma senha forte

-- CREATE USER IF NOT EXISTS 'leanlia_user'@'localhost' IDENTIFIED BY 'SUA_SENHA_SEGURA_AQUI';

-- Conceder permissões necessárias
-- GRANT SELECT, INSERT, UPDATE, DELETE ON leanlia_db.* TO 'leanlia_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE leanlia_db.cleanup_expired_sessions TO 'leanlia_user'@'localhost';

-- Aplicar mudanças
-- FLUSH PRIVILEGES;

-- ============================================
-- Verificação Final
-- ============================================

-- Mostrar todas as tabelas criadas
SHOW TABLES;

-- Mostrar estrutura da tabela users
DESCRIBE users;

-- ============================================
-- Notas Importantes
-- ============================================

/*
1. SEGURANÇA:
   - Altere todas as senhas padrão antes de usar em produção
   - Use senhas fortes e únicas para cada ambiente
   - Nunca commite senhas no Git

2. BACKUP:
   - Configure backups automáticos diários
   - Teste a restauração dos backups regularmente
   - Mantenha backups em local seguro e separado

3. PERFORMANCE:
   - Monitore o uso de índices com EXPLAIN
   - Ajuste índices conforme padrões de uso
   - Configure o MySQL para otimizar performance

4. MANUTENÇÃO:
   - Execute OPTIMIZE TABLE periodicamente
   - Monitore o crescimento das tabelas
   - Limpe logs antigos regularmente

5. DESENVOLVIMENTO:
   - Use migrações (Drizzle) para alterações no schema
   - Documente todas as mudanças no banco
   - Teste em ambiente de staging antes de produção
*/

-- ============================================
-- Fim do Script
-- ============================================

SELECT 'Schema criado com sucesso!' as status;

