# 🚀 DEPLOY NO VERCEL - SIMPLES E DIRETO

## ✅ O QUE VOCÊ PRECISA FAZER:

### 1️⃣ No Painel da Vercel (CONFIGURAÇÃO COMPLETA!)

1. Importe o projeto do GitHub: `Hevellyntecn/compressor-img`
2. **Configure EXATAMENTE assim:**
   
   **Root Directory**: `client` ⬅️ **CRÍTICO!**
   
   **Framework Preset**: `Next.js` (auto-detectado)
   
   **Build Command**: Deixe vazio ou `npm run build`
   
   **Output Directory**: Deixe vazio ou `.next`
   
   **Install Command**: Deixe vazio ou `npm install`

3. Clique em **Deploy**

### 2️⃣ Pronto! 🎉

O Vercel vai:
- ✅ Detectar automaticamente que é Next.js
- ✅ Instalar as dependências
- ✅ Fazer o build
- ✅ Publicar o site

---

## � PASSO A PASSO VISUAL:

### Na página de Import:

```
Configure Project
─────────────────────────────────

Root Directory
[./]  [Edit] ← CLIQUE AQUI

Framework Preset
Next.js ✓ (auto-detectado)

Build and Output Settings
(deixe tudo padrão, não mexa!)

Environment Variables
(pode pular por enquanto)

                [Deploy] ← CLIQUE AQUI
```

### Ao clicar em "Edit" no Root Directory:

```
Root Directory
──────────────

Your app's source code is located in a 
subdirectory.

[ client ]  ← DIGITE AQUI

[Save] ← CLIQUE AQUI
```

---

## ⚡ SUPER SIMPLES:

1. **Root Directory** = `client`
2. **Deploy**
3. **Fim!**

---

## 🎯 Após Deploy:

Seu site estará em: `https://seu-projeto.vercel.app`

**Testável:**
- ✅ Interface completa funcionando
- ❌ Compressão ainda não (precisa do backend)

---

## 🚨 SE DER ERRO 404 (NOT_FOUND):

### Solução 1: Verificar Root Directory
1. Vá em **Settings** → **General**
2. Procure **Root Directory**
3. Certifique-se que está: `client`
4. Se não estiver, clique em **Edit**, digite `client`, **Save**
5. Vá em **Deployments** e clique em **Redeploy**

### Solução 2: Limpar Cache e Redeploy
1. Vá em **Deployments**
2. Clique nos **"..."** do último deploy
3. Selecione **"Redeploy"**
4. Marque **"Use existing Build Cache"** como **OFF**
5. Clique em **"Redeploy"**

### Solução 3: Verificar Build Settings
1. Vá em **Settings** → **General**
2. Em **Build & Development Settings**, clique em **Edit**
3. Configure:
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`
4. Clique em **Save**
5. Faça **Redeploy**

### Solução 4: Deletar e Reimportar Projeto
Se nada funcionar:
1. Delete o projeto no Vercel
2. Importe novamente do GitHub
3. Configure **Root Directory** = `client` desde o início
4. Deploy

---

## 🔧 Depois que o Backend estiver no ar:

Adicione a variável de ambiente:
- **Name**: `NEXT_PUBLIC_API_URL`  
- **Value**: `https://seu-backend.railway.app`

E faça **Redeploy**.

---

## ✅ CHECKLIST DE VERIFICAÇÃO:

- [ ] Root Directory = `client`
- [ ] Framework = Next.js
- [ ] Build bem-sucedido (sem erros no log)
- [ ] Output Directory = `.next` ou vazio
- [ ] Cache limpo no redeploy

**Se todos estiverem corretos, o site funcionará!** 🚀
