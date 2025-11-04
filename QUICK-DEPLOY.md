# 🚀 Guia Rápido de Deploy

## ✅ Checklist Pré-Deploy

- [ ] Código funcionando localmente
- [ ] Build do Next.js sem erros
- [ ] Backend rodando na porta 3002
- [ ] Variáveis de ambiente configuradas
- [ ] Repositório Git criado

## 📋 Passos para Deploy na Vercel

### 1. Preparar Repositório

```bash
git init
git add .
git commit -m "Initial commit - Ready for deploy"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/SEU-REPO.git
git push -u origin main
```

### 2. Deploy Frontend na Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "New Project"
3. Importe seu repositório
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: `.next`

5. Clique em "Deploy"

### 3. Deploy Backend no Railway

1. Acesse [railway.app](https://railway.app)
2. Crie novo projeto
3. Selecione "Deploy from GitHub"
4. Configure:
   - **Root Directory**: `server`
   - **Start Command**: `node index.js`
   - **Watch Paths**: `server/**`

5. Adicione variáveis de ambiente:
```
PORT=3002
NODE_ENV=production
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads
OUTPUT_DIR=/tmp/compressed
ALLOWED_FORMATS=jpg,jpeg,png,webp,bmp,tiff,pdf
```

6. Deploy!

### 4. Conectar Frontend ao Backend

1. Copie a URL do Railway (ex: `https://seu-app.up.railway.app`)
2. Na Vercel, vá em Settings → Environment Variables
3. Adicione:
```
NEXT_PUBLIC_API_URL=https://seu-app.up.railway.app/api
```

4. Redeploy o frontend na Vercel

## ✅ Verificação

Teste os seguintes endpoints:

- Frontend: `https://seu-app.vercel.app`
- Backend Health: `https://seu-app.up.railway.app/health`
- API Info: `https://seu-app.up.railway.app/api/info`

## 🔧 Alternativas de Backend

### Render.com
```
Build Command: cd server && npm install
Start Command: cd server && node index.js
```

### Heroku
```
Procfile: web: cd server && node index.js
```

## 📝 Variáveis de Ambiente

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://seu-backend.com/api
```

### Backend (.env)
```env
PORT=3002
NODE_ENV=production
MAX_FILE_SIZE=10485760
UPLOAD_DIR=/tmp/uploads
OUTPUT_DIR=/tmp/compressed
ALLOWED_FORMATS=jpg,jpeg,png,webp,bmp,tiff,pdf
```

## 🎉 Pronto!

Seu sistema está no ar! 🚀
