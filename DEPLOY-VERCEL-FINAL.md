# 🚀 GUIA DEFINITIVO - DEPLOY NO VERCEL

## ✅ PROJETO 100% COMPATÍVEL COM VERCEL

Este projeto está configurado e otimizado para deploy no Vercel.

---

## 📋 PASSO A PASSO COMPLETO

### 1️⃣ Preparação (Já está pronto!)

✅ `client/next.config.js` - Configurado corretamente
✅ `client/package.json` - Todas as dependências necessárias
✅ `.vercelignore` - Ignora backend e arquivos desnecessários
✅ Estrutura de pastas otimizada

### 2️⃣ Deploy no Vercel

#### A. Acesse a Vercel
1. Vá em https://vercel.com
2. Faça login com GitHub
3. Clique em **"Add New..."** → **"Project"**

#### B. Importe o Repositório
1. Selecione: `Hevellyntecn/compressor-img`
2. Clique em **"Import"**

#### C. Configure o Projeto (IMPORTANTE!)

Na tela de configuração, defina:

```
Project Name: compressor-img (ou o nome que preferir)

Framework Preset: Next.js ✓ (auto-detectado)

Root Directory: client ⬅️ MUITO IMPORTANTE!
  └─ Clique em "Edit" e digite: client

Build Command: npm run build (padrão)
Output Directory: .next (padrão)
Install Command: npm install (padrão)
```

#### D. Variáveis de Ambiente (Adicionar DEPOIS)

**Por enquanto, PULE esta etapa!** 

Você vai adicionar depois que o backend estiver no ar.

#### E. Deploy!

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. ✅ Site estará no ar!

---

## 🎯 RESULTADO ESPERADO

### ✅ O que vai funcionar:
- Interface completa
- Navegação entre páginas
- Design responsivo
- Todas as páginas estáticas

### ⏳ O que ainda não vai funcionar:
- Compressão de imagens (precisa do backend)
- Conversão de formatos (precisa do backend)

---

## 🔧 PRÓXIMOS PASSOS

### Depois que o Frontend estiver no ar:

1. **Deploy do Backend** (Railway, Render ou outro serviço)
   - Faça deploy da pasta `server/`
   - Anote a URL: `https://seu-backend.railway.app`

2. **Adicionar Variável de Ambiente no Vercel**
   - Vá em **Settings** → **Environment Variables**
   - Adicione:
     - **Name**: `NEXT_PUBLIC_API_URL`
     - **Value**: `https://seu-backend.railway.app`
   - Clique em **"Save"**

3. **Redeploy**
   - Vá em **Deployments**
   - Clique nos **"..."** do último deploy
   - Clique em **"Redeploy"**

4. **Testar**
   - Acesse seu site: `https://seu-projeto.vercel.app`
   - Teste a compressão de imagens
   - Teste a conversão de formatos

---

## 📱 CONFIGURAÇÕES OPCIONAIS

### Custom Domain (Opcional)
1. Settings → Domains
2. Adicione seu domínio personalizado

### Environment Variables por Ambiente
- Production: URL do backend em produção
- Preview: URL de teste (se tiver)
- Development: Pode deixar vazio

---

## 🐛 TROUBLESHOOTING

### ❌ "No Next.js version detected"
**Solução**: Certifique-se de configurar **Root Directory** = `client`

### ❌ "Module not found"
**Solução**: Verifique se todas as dependências estão em `client/package.json`

### ❌ Build falha
**Solução**: 
1. Teste localmente: `cd client && npm run build`
2. Corrija os erros mostrados
3. Commit e push
4. Tente novamente no Vercel

### ❌ Site abre mas não comprime imagens
**Solução**: 
1. Backend não está no ar OU
2. Variável `NEXT_PUBLIC_API_URL` não foi configurada OU
3. URL do backend está incorreta

---

## ✨ CHECKLIST FINAL

Antes de fazer o deploy, confirme:

- [x] ✅ `client/next.config.js` sem `output: 'standalone'`
- [x] ✅ `client/package.json` tem Next.js 14.0.3
- [x] ✅ `.vercelignore` existe na raiz
- [x] ✅ Código está no GitHub
- [x] ✅ Branch principal atualizada

**Durante o deploy na Vercel:**

- [ ] ⚠️ Root Directory = `client`
- [ ] Framework Preset = Next.js
- [ ] Deixar Build/Output/Install no padrão

---

## 🎉 PRONTO!

Seu projeto está **100% pronto** para o Vercel!

Basta seguir o passo a passo acima e em poucos minutos estará no ar! 🚀

---

## 📞 SUPORTE

Se encontrar problemas:
1. Verifique o log de build no Vercel
2. Copie a mensagem de erro
3. Verifique se o Root Directory está configurado como `client`
4. Teste o build localmente: `cd client && npm run build`
