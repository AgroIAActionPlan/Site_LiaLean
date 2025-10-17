#!/bin/bash

# ============================================
# Script de Backup do Banco de Dados - LiaLean
# ============================================
#
# Este script cria backups automáticos do banco
# de dados MySQL do site LiaLean.
#
# Uso: ./scripts/backup-database.sh
# Cron: 0 2 * * * /caminho/para/backup-database.sh
#
# ============================================

set -e

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups/database"
RETENTION_DAYS=30
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_READABLE=$(date '+%Y-%m-%d %H:%M:%S')

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funções
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Backup do Banco de Dados - LiaLean${NC}"
echo -e "${BLUE}  $DATE_READABLE${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Verificar se arquivo .env existe
if [ ! -f "$PROJECT_DIR/.env" ]; then
    log_error "Arquivo .env não encontrado em $PROJECT_DIR"
    exit 1
fi

# Carregar variáveis do .env
log_info "Carregando configurações do .env..."
source <(grep DATABASE_URL "$PROJECT_DIR/.env" | sed 's/ *= */=/g')

# Extrair credenciais do DATABASE_URL
if [[ $DATABASE_URL =~ mysql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
    
    log_success "Configurações carregadas:"
    log_info "  Host: $DB_HOST:$DB_PORT"
    log_info "  Database: $DB_NAME"
    log_info "  User: $DB_USER"
else
    log_error "Formato inválido de DATABASE_URL"
    log_error "Esperado: mysql://user:pass@host:port/database"
    exit 1
fi

# Criar diretório de backup se não existir
mkdir -p "$BACKUP_DIR"

# Nome do arquivo de backup
BACKUP_FILE="$BACKUP_DIR/backup_${DB_NAME}_${TIMESTAMP}.sql"
BACKUP_FILE_GZ="${BACKUP_FILE}.gz"

# Verificar se mysqldump está disponível
if ! command -v mysqldump &> /dev/null; then
    log_error "mysqldump não encontrado! Instale o MySQL client."
    exit 1
fi

# Fazer backup
log_info "Iniciando backup do banco $DB_NAME..."

# Executar mysqldump
if mysqldump \
    -h "$DB_HOST" \
    -P "$DB_PORT" \
    -u "$DB_USER" \
    -p"$DB_PASS" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    --routines \
    --triggers \
    --events \
    "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
    
    log_success "Backup criado: $BACKUP_FILE"
    
    # Compactar backup
    log_info "Compactando backup..."
    gzip -f "$BACKUP_FILE"
    
    # Verificar tamanho
    BACKUP_SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    log_success "Backup compactado: $BACKUP_FILE_GZ ($BACKUP_SIZE)"
    
else
    log_error "Falha ao criar backup!"
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Limpar backups antigos
log_info "Limpando backups antigos (mantendo últimos $RETENTION_DAYS dias)..."
DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    log_success "Removidos $DELETED_COUNT backup(s) antigo(s)"
else
    log_info "Nenhum backup antigo para remover"
fi

# Listar backups existentes
log_info "Backups disponíveis:"
ls -lh "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'

# Estatísticas
TOTAL_BACKUPS=$(ls -1 "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Backup concluído com sucesso!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  📁 Arquivo: $(basename "$BACKUP_FILE_GZ")"
echo -e "  📊 Tamanho: $BACKUP_SIZE"
echo -e "  📦 Total de backups: $TOTAL_BACKUPS"
echo -e "  💾 Espaço usado: $TOTAL_SIZE"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

# Log para arquivo
LOG_FILE="$PROJECT_DIR/backups/backup.log"
echo "[$DATE_READABLE] Backup criado: $(basename "$BACKUP_FILE_GZ") ($BACKUP_SIZE)" >> "$LOG_FILE"

exit 0

