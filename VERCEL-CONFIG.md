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
6. Adicione a variável de ambiente:
   - Name: `NEXT_PUBLIC_API_URL`
   - Value: `http://localhost:3002/api` (temporário, você mudará depois)
7. Clique em **"Deploy"**

### 🎯 Após o Deploy do Backend:

1. Vá em **Settings → Environment Variables** na Vercel
2. Edite `NEXT_PUBLIC_API_URL` para a URL do seu backend:
   - Railway: `https://seu-app.up.railway.app/api`
   - Render: `https://seu-app.onrender.com/api`
   - Heroku: `https://seu-app.herokuapp.com/api`
3. Faça um **Redeploy** do projeto

### ✅ Verificação:

Após o deploy, teste:
- Frontend: `https://seu-app.vercel.app`
- Compressão: `https://seu-app.vercel.app/`
- Conversão: `https://seu-app.vercel.app/converter`

---

**Nota**: O `vercel.json` na raiz do projeto já está configurado corretamente. Você só precisa definir o **Root Directory** como `client` nas configurações da Vercel.
