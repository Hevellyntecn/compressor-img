# ⚠️ IMPORTANTE - Configuração da Vercel

## Erro: "No Next.js version detected"

Se você está vendo este erro, siga estes passos:

### ✅ Solução:

Na Vercel, ao importar o projeto, configure:

1. **Root Directory**: `client` ⬅️ **MUITO IMPORTANTE!**
2. **Framework Preset**: Next.js
3. **Build Command**: `npm run build` (deixar padrão)
4. **Output Directory**: `.next` (deixar padrão)
5. **Install Command**: `npm install` (deixar padrão)

### 📝 Passo a Passo:

1. Na página de import da Vercel, clique em **"Configure Project"**
2. Encontre a seção **"Root Directory"**
3. Clique em **"Edit"** 
4. Digite: `client`
5. Clique em **"Continue"**
6. **⚠️ IMPORTANTE**: Sobre a variável de ambiente `NEXT_PUBLIC_API_URL`:

   **OPÇÃO 1 - Sem Backend Deploy ainda (RECOMENDADO):**
   - **PULE** a adição de variáveis por enquanto
   - O frontend vai compilar normalmente
   - Você adicionará depois quando o backend estiver no ar
   
   **OPÇÃO 2 - Se quiser adicionar agora:**
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `http://localhost:3002` ⬅️ Placeholder temporário
   - ⚠️ **Compressão NÃO funcionará** até você colocar a URL real do backend

7. Clique em **"Deploy"**

### 🎯 Após o Deploy do Backend (Railway/Render):

**AGORA SIM você precisa adicionar a variável real:**

1. Vá em **Settings → Environment Variables** na Vercel
2. Adicione ou edite `NEXT_PUBLIC_API_URL` com a URL REAL do backend:
   - Railway: `https://seu-app.up.railway.app`
   - Render: `https://seu-app.onrender.com`
   - Heroku: `https://seu-app.herokuapp.com`
   
   ⚠️ **NÃO adicione `/api` no final** - o código já faz isso automaticamente!

3. Clique em **"Save"**
4. Faça um **Redeploy** do projeto para aplicar as mudanças

### ✅ Verificação:

Após o deploy, teste:
- Frontend: `https://seu-app.vercel.app`
- Compressão: `https://seu-app.vercel.app/`
- Conversão: `https://seu-app.vercel.app/converter`

---

**Nota**: O `vercel.json` na raiz do projeto já está configurado corretamente. Você só precisa definir o **Root Directory** como `client` nas configurações da Vercel.
