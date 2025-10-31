# 🚀 Guia de Deploy - Compressor de Imagens Premium

Este guia contém instruções detalhadas para fazer deploy do sistema em diferentes plataformas.

## 📋 Pré-requisitos

- Node.js 18+
- Conta na plataforma escolhida
- Repositório Git configurado

## 🌐 Deploy no Vercel (Recomendado)

### 1. Preparação
```bash
# Clone o repositório
git clone <seu-repositorio>
cd compressor-imagens

# Instale dependências
npm run install-all
```

### 2. Deploy do Backend
```bash
cd server
vercel --prod
```

### 3. Deploy do Frontend
```bash
cd ../client
vercel --prod
```

### 4. Configuração de Variáveis de Ambiente

No painel do Vercel, configure:

**Backend:**
- `NODE_ENV`: `production`
- `PORT`: `5000`
- `MAX_FILE_SIZE`: `10485760`
- `UPLOAD_DIR`: `/tmp/uploads`
- `OUTPUT_DIR`: `/tmp/compressed`

**Frontend:**
- `NEXT_PUBLIC_API_URL`: `https://seu-backend.vercel.app/api`

## 🚂 Deploy no Railway

### 1. Conectar Repositório
1. Acesse [Railway.app](https://railway.app)
2. Conecte seu repositório GitHub
3. Selecione o projeto

### 2. Configurar Serviços
Crie dois serviços:

**Serviço 1 - Backend:**
- **Root Directory**: `server`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Serviço 2 - Frontend:**
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Start Command**: `npm start`

### 3. Variáveis de Ambiente
Configure as mesmas variáveis do Vercel.

## 🐳 Deploy com Docker

### 1. Build das Imagens
```bash
# Build do servidor
docker build -t compressor-server .

# Build do cliente
docker build -t compressor-client ./client
```

### 2. Executar com Docker Compose
```bash
docker-compose up -d
```

### 3. Verificar Status
```bash
docker-compose ps
docker-compose logs -f
```

## ☁️ Deploy no Render

### 1. Backend Service
1. Conecte repositório no Render
2. Configure:
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
   - **Environment**: `Node`

### 2. Frontend Service
1. Crie novo serviço
2. Configure:
   - **Build Command**: `cd client && npm run build`
   - **Start Command**: `cd client && npm start`
   - **Environment**: `Node`

## 🔧 Configurações Específicas por Plataforma

### Vercel
```json
// vercel.json
{
  "functions": {
    "server/index.js": {
      "maxDuration": 30
    }
  }
}
```

### Railway
```bash
# railway.toml
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
```

### Render
```yaml
# render.yaml
services:
  - type: web
    name: compressor-backend
    env: node
    buildCommand: cd server && npm install
    startCommand: cd server && npm start
```

## 🌍 Configuração de Domínio

### 1. Domínio Personalizado
Configure DNS:
```
# Para o frontend
www.seusite.com → frontend.vercel.app

# Para o backend  
api.seusite.com → backend.vercel.app
```

### 2. CORS
Atualize configuração CORS no servidor:
```javascript
app.use(cors({
  origin: [
    'https://seusite.com',
    'https://www.seusite.com'
  ]
}));
```

## 📊 Monitoramento

### 1. Health Checks
Configure endpoints de monitoramento:
- `GET /health` - Status do servidor
- `GET /api/info` - Informações da API

### 2. Logs
```bash
# Vercel
vercel logs

# Railway
railway logs

# Docker
docker-compose logs -f
```

## 🔒 Configurações de Segurança

### 1. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // máximo 100 requests por IP
});
```

### 2. File Validation
```javascript
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'), false);
  }
};
```

## 🚨 Troubleshooting

### Erro: "Sharp não encontrado"
```bash
# No servidor
npm rebuild sharp

# No Docker
RUN npm rebuild sharp
```

### Erro: "Porta já em uso"
```bash
# Mude a porta
export PORT=5001
```

### Erro: "Arquivo muito grande"
- Verifique `MAX_FILE_SIZE` nas variáveis de ambiente
- Configure limites da plataforma (Vercel: 50MB, Railway: 1GB)

### Erro: "Timeout"
- Aumente `maxDuration` no Vercel
- Configure timeout adequado na plataforma

## 📈 Otimizações de Performance

### 1. CDN
Configure CDN para arquivos estáticos:
```javascript
app.use('/static', express.static('public', {
  maxAge: '1y'
}));
```

### 2. Cache
```javascript
app.use(compression());
app.use(express.static('public', {
  maxAge: '1d'
}));
```

### 3. Database (Opcional)
Para logs persistentes:
```javascript
// Adicione MongoDB ou PostgreSQL
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL);
```

## 🔄 CI/CD

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm run install-all
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 📞 Suporte

- 📧 **Email**: suporte@compressor-imagens.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/seu-repo/issues)
- 📚 **Docs**: [Documentação](https://docs.compressor-imagens.com)

---

**Deploy realizado com sucesso! 🎉**
