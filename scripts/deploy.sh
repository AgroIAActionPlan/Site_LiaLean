#!/bin/bash

# Deploy automatizado da aplicação via Docker.
# Este script gera uma nova imagem, opcionalmente envia para o registry
# e pode atualizar a stack local usando docker compose.

set -euo pipefail

trap 'printf "\n[ERRO] Falha inesperada. Revise as mensagens acima.\n" >&2' ERR

ENV_FILE="${1:-${ENV_FILE:-.env}}"

INFO_COLOR="\033[0;34m"
SUCCESS_COLOR="\033[0;32m"
WARN_COLOR="\033[0;33m"
ERROR_COLOR="\033[0;31m"
RESET_COLOR="\033[0m"

info() {
  printf "\n${INFO_COLOR}[INFO] %s${RESET_COLOR}\n" "$1"
}

success() {
  printf "\n${SUCCESS_COLOR}[OK] %s${RESET_COLOR}\n" "$1"
}

warn() {
  printf "\n${WARN_COLOR}[AVISO] %s${RESET_COLOR}\n" "$1"
}

error() {
  printf "\n${ERROR_COLOR}[ERRO] %s${RESET_COLOR}\n" "$1" >&2
}

REQUIRED_VARS=(
  DOMAIN_APP
  DOMAIN_N8N
  TRAEFIK_ACME_EMAIL
  TIMEZONE
  POSTGRES_USER
  POSTGRES_PASSWORD
  POSTGRES_APP_DB
  APP_DB_USER
  APP_DB_PASSWORD
  N8N_DB_NAME
  N8N_DB_USER
  N8N_DB_PASSWORD
  DATABASE_URL
  JWT_SECRET
  VITE_APP_ID
  VITE_APP_TITLE
  VITE_APP_LOGO
  OWNER_NAME
  OWNER_OPEN_ID
  OAUTH_SERVER_URL
  VITE_OAUTH_PORTAL_URL
  BUILT_IN_FORGE_API_URL
  BUILT_IN_FORGE_API_KEY
  VITE_ANALYTICS_ENDPOINT
  VITE_ANALYTICS_WEBSITE_ID
  N8N_BASIC_USER
  N8N_BASIC_PASS
  N8N_ENCRYPTION_KEY
  N8N_WORKER_CONCURRENCY
  APP_IMAGE
)

NEEDS_VALUE=(
  POSTGRES_PASSWORD
  APP_DB_PASSWORD
  N8N_DB_PASSWORD
  DATABASE_URL
  JWT_SECRET
  N8N_BASIC_PASS
  N8N_ENCRYPTION_KEY
  APP_IMAGE
)

if [ ! -f "package.json" ]; then
  error "Execute este script a partir da raiz do projeto (onde fica package.json)."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  error "Docker não encontrado. Instale o Docker antes de prosseguir."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  error "Docker Compose v2 não encontrado. Atualize o Docker/CLI."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  error "Arquivo de variáveis $ENV_FILE não encontrado."
  exit 1
fi

info "Validando variáveis obrigatórias em $ENV_FILE"

missing_vars=()
empty_vars=()
app_image_raw=""

for var in "${REQUIRED_VARS[@]}"; do
  line=$(grep -E "^${var}=" "$ENV_FILE" | tail -n1 || true)
  if [ -z "$line" ]; then
    missing_vars+=("$var")
    continue
  fi
  value=${line#*=}
  value=${value%$'\r'}
  trimmed=$(printf "%s" "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")

  for must_have in "${NEEDS_VALUE[@]}"; do
    if [ "$var" = "$must_have" ] && [ -z "$trimmed" ]; then
      empty_vars+=("$var")
      break
    fi
  done

  if [ "$var" = "APP_IMAGE" ]; then
    app_image_raw="$trimmed"
  fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
  error "Variáveis ausentes em $ENV_FILE:"
  for var in "${missing_vars[@]}"; do
    printf "  - %s\n" "$var" >&2
  done
  exit 1
fi

if [ ${#empty_vars[@]} -gt 0 ]; then
  warn "As variáveis abaixo estão vazias. Atualize antes do deploy:"
  for var in "${empty_vars[@]}"; do
    printf "  - %s\n" "$var"
  done
fi

if [ -z "$app_image_raw" ]; then
  warn "APP_IMAGE não definido. Usando lialean/site:latest."
  app_image_raw="lialean/site:latest"
fi

if [[ "$app_image_raw" == *:* ]]; then
  base_image="${app_image_raw%:*}"
  default_tag="${app_image_raw##*:}"
else
  base_image="$app_image_raw"
  default_tag="latest"
fi

printf "\nImagem base detectada: %s\n" "$base_image"
read -r -p "Informe a nova tag da imagem (ENTER para ${default_tag}): " chosen_tag
image_tag=${chosen_tag:-$default_tag}
image_name="${base_image}:${image_tag}"

info "Etapa 1/3: Build da imagem Docker (${image_name})"
docker build -t "$image_name" .
success "Imagem gerada localmente."

read -r -p "Deseja enviar a imagem para o registry com docker push? (s/N): " push_choice
if [[ "$push_choice" =~ ^[sS]$ ]]; then
  info "Etapa 2/3: Enviando imagem para o registry"
  docker push "$image_name"
  success "Imagem enviada com sucesso."
else
  info "Envio com docker push pulado a pedido do usuário."
fi

read -r -p "Deseja atualizar a stack local usando docker compose agora? (s/N): " compose_choice
if [[ "$compose_choice" =~ ^[sS]$ ]]; then
  info "Etapa 3/3: Atualizando containers com docker compose"
  docker compose --env-file "$ENV_FILE" up -d --force-recreate app
  docker compose --env-file "$ENV_FILE" ps app
  success "Stack atualizada localmente."
else
  info "Atualização com docker compose não executada."
fi

printf "\nResumo:\n"
printf "  • Arquivo de variáveis: %s\n" "$ENV_FILE"
printf "  • Imagem construída:    %s\n" "$image_name"
printf "  • docker push:          %s\n" "$( [[ "$push_choice" =~ ^[sS]$ ]] && echo 'executado' || echo 'não executado' )"
printf "  • docker compose:       %s\n" "$( [[ "$compose_choice" =~ ^[sS]$ ]] && echo 'executado' || echo 'não executado' )"

printf "\nPróximos passos recomendados:\n"
printf "  1. Caso tenha feito docker push, atualize a stack no Portainer apontando para a tag %s.\n" "$image_tag"
printf "  2. Valide os serviços acessando /health e o painel do n8n.\n"
printf "  3. Mantenha os backups e revisões da documentação em dia.\n"

success "Processo finalizado."
