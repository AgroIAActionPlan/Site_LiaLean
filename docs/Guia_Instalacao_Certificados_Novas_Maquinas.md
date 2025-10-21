# Guia de Instalação para Novas Máquinas (macOS, Windows, WSL)

Use este checklist sempre que for preparar uma máquina nova para trabalhar no projeto **Site LiaLean**. Ele cobre tudo que você precisa para acessar o repositório GitHub, o servidor (VPS) e executar os fluxos de deploy.

---

## 1. Pré-requisitos
- Acesso ao repositório `git@github.com:AgroIAActionPlan/Site_LiaLean.git`.
- Credenciais do servidor (`deploy@srv1070674`).
- Acesso a um cofre seguro (1Password, Bitwarden etc.) onde as chaves são armazenadas.

---

## 2. Ferramentas básicas

### 2.1 macOS
1. Xcode CLI:
   ```bash
   xcode-select --install
   ```
2. Homebrew:
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Ferramentas:
   ```bash
   brew update
   brew install git pnpm docker docker-compose openssh
   ```
4. Instale/abra o **Docker Desktop** (sign-in se necessário).

### 2.2 Windows + WSL
1. Ative WSL:
   ```powershell
   wsl --install -d Ubuntu
   ```
2. Dentro do WSL:
   ```bash
   sudo apt update && sudo apt upgrade -y
   sudo apt install -y git curl build-essential ca-certificates openssh-client
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   sudo npm install -g pnpm@10
   ```
3. Instale o **Docker Desktop (Windows)** e marque a integração com o WSL.
4. No WSL:
   ```bash
   docker --version
   docker compose version
   ```

### 2.3 Linux (Ubuntu/Debian)
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl build-essential ca-certificates openssh-client
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs docker.io docker-compose-plugin
sudo npm install -g pnpm@10
sudo usermod -aG docker $USER   # faça logout/login
```

---

## 3. Chaves SSH
### 3.1 Verificar/gerar
```bash
ls ~/.ssh/id_ed25519 ~/.ssh/id_ed25519.pub
ssh-keygen -t ed25519 -C "seu_email@dominio.com"
```

### 3.2 Adicionar ao agente
```bash
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
```

### 3.3 Registrar no GitHub
```bash
cat ~/.ssh/id_ed25519.pub
```
Cole em **GitHub → Settings → SSH & GPG keys → New SSH key**.

### 3.4 Registrar no servidor
```bash
ssh-copy-id deploy@srv1070674
```

### 3.5 Testes
```bash
ssh -T git@github.com
ssh deploy@srv1070674
```

### 3.6 (Opcional) `~/.ssh/config`
```plaintext
Host github
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519

Host lialean
  HostName srv1070674
  User deploy
  IdentityFile ~/.ssh/id_ed25519
```

---

## 4. Clonar o repositório
```bash
mkdir -p ~/Documents/GitHub
cd ~/Documents/GitHub
git clone git@github.com:AgroIAActionPlan/Site_LiaLean.git
cd Site_LiaLean
pnpm install
```

---

## 5. Configurações do servidor (via cofre)
- Baixe as credenciais do servidor (se existir um cofre padrão).
- Faça um `git pull` na VPS:
  ```bash
  ssh deploy@srv1070674
  cd ~/Site_LiaLean
  git pull origin main
  ```
- Substitua as stacks oficiais:
  ```bash
  cp ~/Site_LiaLean/lialean-stack.yml /opt/lialean/stacks/lialean-stack.yml
  ```

---

## 6. Acessos a certificados (SSL, Traefik)
- Certifique-se de que o servidor já possui os certificados em `/opt/lialean/stacks/letsencrypt/acme.json` (deve estar com permissão `600`).
- Se precisar ler/testar:
  ```bash
  sudo cat /opt/lialean/stacks/letsencrypt/acme.json
  ```
  (faça backup/restore conforme o procedimento padrão na VPS).

---

## 7. Comandos “slash-and-burn” iniciais
- Verificar status do Docker:
  ```bash
  cd /opt/lialean/stacks
  docker compose --env-file lialean.env -f lialean-stack.yml ps
  ```
- Health check stack:
  ```bash
  docker logs traefik --tail 50
  docker logs lialean-postgres --tail 30
  ```

---

## 8. Check-list rápido (máquina local)
- [ ] Git configurado (`git status` sem erros).
- [ ] SSH testado (GitHub e VPS).
- [ ] Docker rodando e com permissão do usuário.
- [ ] `pnpm install` executado (sem warnings críticos).
- [ ] Alias/`ssh config` configurados (opcional, mas útil).

Pronto! A máquina já pode seguir o fluxo do `Guia_VPS_Atualizado.md` a partir da Fase 9. Guarde este documento e reutilize-o sempre que precisar adicionar uma máquina ao seu ambiente.

