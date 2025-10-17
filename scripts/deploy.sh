#!/bin/bash

# ============================================
# Script de Deploy Automatizado - Site LeanLia
# ============================================
#
# Este script automatiza o processo de deploy
# do site LeanLia em ambiente de produção.
#
# Uso: ./scripts/deploy.sh
#
# ============================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# Banner
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════╗
║                                       ║
║      🚀 Deploy Site LeanLia 🚀       ║
║                                       ║
╚═══════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "Este script deve ser executado na raiz do projeto!"
    exit 1
fi

# Verificar se .env existe
if [ ! -f ".env" ]; then
    print_error "Arquivo .env não encontrado!"
    print_info "Copie .env.production.example para .env e configure as variáveis"
    print_info "Comando: cp .env.production.example .env"
    exit 1
fi

# Confirmar deploy
print_warning "Você está prestes a fazer deploy em PRODUÇÃO!"
read -p "Deseja continuar? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    print_info "Deploy cancelado."
    exit 0
fi

# ============================================
# STEP 1: Backup do .env
# ============================================
print_step "STEP 1: Fazendo backup do arquivo .env"

BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
cp .env "$BACKUP_DIR/.env.backup.$TIMESTAMP"
print_success "Backup criado: $BACKUP_DIR/.env.backup.$TIMESTAMP"

# ============================================
# STEP 2: Atualizar código do repositório
# ============================================
print_step "STEP 2: Atualizando código do repositório"

print_info "Verificando branch atual..."
CURRENT_BRANCH=$(git branch --show-current)
print_info "Branch: $CURRENT_BRANCH"

print_info "Fazendo pull das últimas alterações..."
git pull origin $CURRENT_BRANCH

print_success "Código atualizado!"

# ============================================
# STEP 3: Instalar dependências
# ============================================
print_step "STEP 3: Instalando dependências"

print_info "Verificando pnpm..."
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm não encontrado! Instalando..."
    npm install -g pnpm
fi

print_info "Instalando dependências do projeto..."
pnpm install --frozen-lockfile

print_success "Dependências instaladas!"

# ============================================
# STEP 4: Aplicar migrações do banco de dados
# ============================================
print_step "STEP 4: Aplicando migrações do banco de dados"

print_warning "Fazendo backup do banco antes das migrações..."

# Extrair credenciais do DATABASE_URL
DB_URL=$(grep DATABASE_URL .env | cut -d '=' -f2)

if [[ $DB_URL =~ mysql://([^:]+):([^@]+)@([^:]+):([^/]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASS="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
    
    print_info "Criando backup do banco: $DB_NAME"
    mkdir -p $BACKUP_DIR/database
    mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASS $DB_NAME | gzip > "$BACKUP_DIR/database/backup_$TIMESTAMP.sql.gz"
    print_success "Backup do banco criado!"
else
    print_warning "Não foi possível fazer backup automático do banco"
    print_warning "Faça backup manual antes de continuar!"
    read -p "Pressione ENTER para continuar..."
fi

print_info "Aplicando migrações..."
pnpm db:push

print_success "Migrações aplicadas!"

# ============================================
# STEP 5: Build da aplicação
# ============================================
print_step "STEP 5: Compilando aplicação para produção"

print_info "Limpando builds anteriores..."
rm -rf client/dist server/dist

print_info "Executando build..."
pnpm build

print_success "Build concluído!"

# ============================================
# STEP 6: Reiniciar aplicação
# ============================================
print_step "STEP 6: Reiniciando aplicação"

if command -v pm2 &> /dev/null; then
    print_info "Reiniciando com PM2..."
    
    # Verificar se processo existe
    if pm2 list | grep -q "leanlia"; then
        pm2 restart leanlia
        print_success "Aplicação reiniciada!"
    else
        print_warning "Processo 'leanlia' não encontrado no PM2"
        print_info "Iniciando nova instância..."
        pm2 start npm --name "leanlia" -- start
        pm2 save
        print_success "Aplicação iniciada!"
    fi
    
    # Mostrar status
    pm2 list
    
else
    print_warning "PM2 não encontrado!"
    print_info "Instale PM2 com: npm install -g pm2"
    print_info "Ou inicie manualmente com: pnpm start"
fi

# ============================================
# STEP 7: Verificar saúde da aplicação
# ============================================
print_step "STEP 7: Verificando saúde da aplicação"

print_info "Aguardando aplicação iniciar..."
sleep 5

# Verificar se está respondendo
PORT=$(grep PORT .env | cut -d '=' -f2)
PORT=${PORT:-3000}

if curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT | grep -q "200\|301\|302"; then
    print_success "Aplicação está respondendo na porta $PORT!"
else
    print_warning "Aplicação pode não estar respondendo corretamente"
    print_info "Verifique os logs com: pm2 logs leanlia"
fi

# ============================================
# STEP 8: Limpar arquivos antigos
# ============================================
print_step "STEP 8: Limpeza de arquivos antigos"

print_info "Limpando backups antigos (mantendo últimos 30 dias)..."
find $BACKUP_DIR -name "*.backup.*" -mtime +30 -delete 2>/dev/null || true
find $BACKUP_DIR/database -name "backup_*.sql.gz" -mtime +30 -delete 2>/dev/null || true

print_success "Limpeza concluída!"

# ============================================
# Resumo Final
# ============================================
print_step "✨ Deploy Concluído com Sucesso! ✨"

echo -e "${GREEN}"
cat << EOF
╔═══════════════════════════════════════════════════╗
║                                                   ║
║  ✅ Deploy realizado com sucesso!                ║
║                                                   ║
║  📊 Informações:                                  ║
║     • Branch: $CURRENT_BRANCH
║     • Timestamp: $TIMESTAMP
║     • Porta: $PORT
║                                                   ║
║  📝 Próximos passos:                              ║
║     1. Verifique os logs: pm2 logs leanlia        ║
║     2. Teste o site no navegador                  ║
║     3. Monitore por alguns minutos                ║
║                                                   ║
║  🔗 Links úteis:                                  ║
║     • Logs: pm2 logs leanlia                      ║
║     • Status: pm2 status                          ║
║     • Monit: pm2 monit                            ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

print_info "Backup criado em: $BACKUP_DIR"
print_info "Logs da aplicação: pm2 logs leanlia"

# Mostrar últimas linhas do log
if command -v pm2 &> /dev/null; then
    print_info "Últimas linhas do log:"
    pm2 logs leanlia --lines 10 --nostream
fi

exit 0

