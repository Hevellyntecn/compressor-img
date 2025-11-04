# 🚀 Deploy na Vercel

## Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Repositório Git (GitHub, GitLab ou Bitbucket)
3. Node.js 18+ instalado localmente

## 📋 Passos para Deploy

### 1. Preparar o Repositório

```bash
# Inicializar git (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "Preparado para deploy na Vercel"

# Adicionar repositório remoto (substitua pela sua URL)
git remote add origin https://github.com/seu-usuario/seu-repo.git

# Push para o repositório
git push -u origin main
```

### 2. Configurar na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login
2. Clique em "Add New Project"
3. Selecione seu repositório
4. Configure as seguintes opções:

#### Framework Preset
- Selecione: **Next.js**

#### Root Directory
- Defina: `client`

#### Build Command
```bash
npm run build
```

#### Output Directory
```bash
.next
```

#### Install Command
```bash
npm install
```

### 3. Variáveis de Ambiente

Configure as seguintes variáveis de ambiente na Vercel:

```env
NEXT_PUBLIC_API_URL=https://seu-backend-api.com/api
```

**Importante:** Você precisará de um backend separado para:
- Processamento de imagens
- Conversão de formatos
- Upload de arquivos

Opções de backend:
1. **Railway.app** (Recomendado)
2. **Render.com**
3. **Heroku**
4. **DigitalOcean App Platform**

### 4. Deploy do Backend (Railway.app)

1. Acesse [railway.app](https://railway.app)
2. Crie um novo projeto
3. Selecione "Deploy from GitHub repo"
4. Configure:
   - **Root Directory**: `server`
   - **Start Command**: `node index.js`

5. Adicione variáveis de ambiente:
```env
PORT=3002
NODE_ENV=production
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads
OUTPUT_DIR=/tmp/compressed
ALLOWED_FORMATS=jpg,jpeg,png,webp,bmp,tiff,pdf
```

6. Após deploy, copie a URL gerada (ex: `https://seu-app.railway.app`)

### 5. Atualizar Variável na Vercel

Volte para a Vercel e atualize:
```env
NEXT_PUBLIC_API_URL=https://seu-app.railway.app/api
```

### 6. Redeploy

Após configurar as variáveis, faça um redeploy na Vercel para aplicar as mudanças.

## ✅ Verificação

Após o deploy, teste:

1. **Página Principal**: `https://seu-app.vercel.app`
2. **Compressão de Imagens**: Acesse `/` e teste upload
3. **Conversão de Formatos**: Acesse `/converter` e teste
4. **API Health Check**: `https://seu-backend.railway.app/health`

## 🔧 Troubleshooting

### Erro: "API não responde"
- Verifique se o backend está rodando
- Confirme que `NEXT_PUBLIC_API_URL` está correto
- Verifique CORS no backend

### Erro: "File too large"
- Aumente `MAX_FILE_SIZE` no backend
- Verifique limites da plataforma de hosting

### Erro: "Sharp not found"
- O Sharp será instalado automaticamente
- Se persistir, adicione ao `package.json` do servidor

## 📝 Notas Importantes

1. **Limites de Arquivo**: A Vercel tem limite de 4.5MB para uploads. Use o backend separado para processar arquivos maiores.

2. **Timeout**: Funções serverless na Vercel têm timeout de 10s (grátis) ou 60s (pago). Processamento pesado deve ser feito no backend.

3. **Armazenamento**: Arquivos temporários devem ser salvos em `/tmp` e limpos após uso.

4. **Cold Start**: A primeira requisição pode ser lenta devido ao cold start das funções serverless.

## 🎯 Estrutura Recomendada

```
Frontend (Vercel)
  ↓
Backend API (Railway/Render)
  ↓
Processamento (Sharp, Mammoth, etc.)
  ↓
Storage (opcional: AWS S3, Cloudinary)
```

## 🔗 Links Úteis

- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Railway](https://docs.railway.app)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Sharp Documentation](https://sharp.pixelplumbing.com)
