# ============================================
# Dockerfile de Produção - Site LiaLean
# ============================================
# 
# Este Dockerfile cria uma imagem otimizada para produção
# que serve tanto o frontend (React/Vite) quanto o backend (Express/tRPC)
# em um único container.
#
# Estrutura:
# - Stage 1: Build do frontend e backend
# - Stage 2: Imagem final de produção (apenas runtime)
#
# Porta: 3000
# ============================================

# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

# Instalar pnpm
RUN npm install -g pnpm@10

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./
# pnpm precisa do diretório de patches antes da instalação
COPY patches ./patches

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Build da aplicação
# Isso gera:
# - client/dist/ (frontend estático)
# - dist/ (backend compilado)
RUN pnpm build

# ============================================
# Stage 2: Produção
# ============================================
FROM node:20-alpine AS production

# Instalar pnpm
RUN npm install -g pnpm@10

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e pnpm-lock.yaml
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copiar arquivos buildados do stage anterior
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/client/dist ./client/dist
COPY --from=builder --chown=nodejs:nodejs /app/drizzle ./drizzle
COPY --from=builder --chown=nodejs:nodejs /app/shared ./shared

# Copiar arquivos públicos (se houver)
COPY --from=builder --chown=nodejs:nodejs /app/client/public ./client/public

# Mudar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Variáveis de ambiente padrão (podem ser sobrescritas)
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Comando para iniciar a aplicação
CMD ["node", "dist/index.js"]
