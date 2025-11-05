# 🚀 DEPLOY NO VERCEL - SIMPLES E DIRETO

## ✅ O QUE VOCÊ PRECISA FAZER:

### 1️⃣ No Painel da Vercel (ÚNICO PASSO IMPORTANTE!)

1. Importe o projeto do GitHub: `Hevellyntecn/compressor-img`
2. **Configure apenas UMA coisa:**
   - **Root Directory**: `client` ⬅️ **SÓ ISSO!**
3. Deixe todo o resto no padrão
4. Clique em **Deploy**

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

## 🔧 Depois que o Backend estiver no ar:

Adicione a variável de ambiente:
- **Name**: `NEXT_PUBLIC_API_URL`  
- **Value**: `https://seu-backend.railway.app`

E faça **Redeploy**.

---

**SIMPLES ASSIM!** Não precisa de `vercel.json` complicado, não precisa de configurações especiais. **Só Root Directory = `client`** e pronto! 🚀
