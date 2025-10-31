# 🔌 Documentação da API - Image Compressor Premium

Documentação completa da API REST do Image Compressor Premium.

## 🌐 Base URL

```
Produção: https://seu-app.vercel.app
Desenvolvimento: http://localhost:3000
```

## 📋 Endpoints

### 1. Comprimir Imagem

**POST** `/api/compress`

Comprime uma imagem enviada via multipart/form-data com algoritmos inteligentes.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `image` | File | ✅ | Arquivo de imagem (JPEG, PNG, GIF, BMP, TIFF, WebP) |
| `format` | String | ❌ | Formato de saída: `jpeg`, `png`, `webp` (padrão: `jpeg`) |
| `targetSize` | Number | ❌ | Tamanho máximo em KB (padrão: `470`) |
| `includePDF` | Boolean | ❌ | Gerar PDF adicional (padrão: `false`) |

#### Exemplo de Requisição

```bash
curl -X POST \
  -F "image=@foto.jpg" \
  -F "format=jpeg" \
  -F "targetSize=300" \
  -F "includePDF=true" \
  https://seu-app.vercel.app/api/compress
```

#### Resposta de Sucesso (200)

```json
{
  "success": true,
  "originalName": "foto.jpg",
  "compressedFile": "/api/download/compressed-1234567890.jpg",
  "pdfFile": "/api/download/converted-1234567890.pdf",
  "stats": {
    "originalSizeKB": "2048.50",
    "compressedSizeKB": "299.80",
    "compressionRatio": 85.37,
    "processingTimeMs": 1250,
    "dimensions": {
      "original": {
        "width": 1920,
        "height": 1080
      },
      "compressed": {
        "width": 1920,
        "height": 1080
      }
    }
  }
}
```

#### Resposta de Erro (400/500)

```json
{
  "error": "Nenhuma imagem enviada",
  "details": "Detalhes específicos do erro"
}
```

#### Códigos de Status

| Código | Descrição |
|--------|-----------|
| `200` | Sucesso - Imagem comprimida |
| `400` | Erro na requisição - Arquivo inválido |
| `413` | Arquivo muito grande - Máximo 50MB |
| `415` | Tipo de arquivo não suportado |
| `500` | Erro interno do servidor |

### 2. Download de Arquivo

**GET** `/api/download/:filename`

Baixa um arquivo processado (imagem comprimida ou PDF).

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `filename` | String | ✅ | Nome do arquivo para download |

#### Exemplo de Requisição

```bash
curl -O https://seu-app.vercel.app/api/download/compressed-1234567890.jpg
```

#### Resposta

- **200**: Arquivo binário para download
- **404**: Arquivo não encontrado

## 🎯 Exemplos de Uso

### JavaScript (Frontend)

```javascript
// Upload e compressão
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('format', 'jpeg');
formData.append('targetSize', 300);
formData.append('includePDF', true);

const response = await fetch('/api/compress', {
  method: 'POST',
  body: formData
});

const result = await response.json();

if (result.success) {
  // Download da imagem comprimida
  const link = document.createElement('a');
  link.href = result.compressedFile;
  link.download = `compressed-${result.originalName}`;
  link.click();
  
  // Download do PDF (se solicitado)
  if (result.pdfFile) {
    const pdfLink = document.createElement('a');
    pdfLink.href = result.pdfFile;
    pdfLink.download = `converted-${result.originalName}.pdf`;
    pdfLink.click();
  }
}
```

### Python

```python
import requests

# Upload e compressão
files = {'image': open('foto.jpg', 'rb')}
data = {
    'format': 'jpeg',
    'targetSize': 300,
    'includePDF': True
}

response = requests.post(
    'https://seu-app.vercel.app/api/compress',
    files=files,
    data=data
)

result = response.json()

if result['success']:
    # Download da imagem comprimida
    img_response = requests.get(
        f"https://seu-app.vercel.app{result['compressedFile']}"
    )
    with open('compressed.jpg', 'wb') as f:
        f.write(img_response.content)
    
    # Download do PDF
    if result['pdfFile']:
        pdf_response = requests.get(
            f"https://seu-app.vercel.app{result['pdfFile']}"
        )
        with open('converted.pdf', 'wb') as f:
            f.write(pdf_response.content)
```

### Node.js

```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

// Upload e compressão
const form = new FormData();
form.append('image', fs.createReadStream('foto.jpg'));
form.append('format', 'jpeg');
form.append('targetSize', 300);
form.append('includePDF', true);

const response = await axios.post(
  'https://seu-app.vercel.app/api/compress',
  form,
  {
    headers: form.getHeaders()
  }
);

const result = response.data;

if (result.success) {
  // Download da imagem comprimida
  const imgResponse = await axios.get(
    `https://seu-app.vercel.app${result.compressedFile}`,
    { responseType: 'stream' }
  );
  imgResponse.data.pipe(fs.createWriteStream('compressed.jpg'));
  
  // Download do PDF
  if (result.pdfFile) {
    const pdfResponse = await axios.get(
      `https://seu-app.vercel.app${result.pdfFile}`,
      { responseType: 'stream' }
    );
    pdfResponse.data.pipe(fs.createWriteStream('converted.pdf'));
  }
}
```

## 📊 Formato de Resposta Detalhado

### Campo `stats`

```json
{
  "stats": {
    "originalSizeKB": "2048.50",        // Tamanho original em KB
    "compressedSizeKB": "299.80",       // Tamanho final em KB
    "compressionRatio": 85.37,          // Percentual de redução
    "processingTimeMs": 1250,           // Tempo de processamento em ms
    "dimensions": {
      "original": {
        "width": 1920,                  // Largura original
        "height": 1080                  // Altura original
      },
      "compressed": {
        "width": 1920,                  // Largura final
        "height": 1080                  // Altura final
      }
    }
  }
}
```

## 🔧 Configurações Avançadas

### Formatos Suportados

| Formato | Extensão | Descrição | Melhor Para |
|---------|----------|-----------|-------------|
| `jpeg` | .jpg, .jpeg | Compressão lossy | Fotos, imagens complexas |
| `png` | .png | Compressão lossless | Imagens com transparência |
| `webp` | .webp | Formato moderno | Web, alta compressão |

### Limites e Restrições

| Parâmetro | Limite | Descrição |
|-----------|--------|-----------|
| Tamanho do arquivo | 50MB | Máximo por upload |
| Target Size | 100KB - 1000KB | Tamanho final desejado |
| Dimensões | 2048px | Máximo por lado (redimensionamento automático) |
| Tentativas | 10 | Máximo de tentativas de compressão |

### Estratégias de Compressão

1. **Análise Inicial**: Verifica tamanho e dimensões
2. **Redimensionamento**: Se necessário, reduz proporcionalmente
3. **Compressão Adaptativa**: Ajusta qualidade baseado no resultado
4. **Iteração**: Até 10 tentativas para atingir o tamanho desejado
5. **Otimização**: Parâmetros específicos por formato

## 🚨 Tratamento de Erros

### Erros Comuns

```json
// Arquivo muito grande
{
  "error": "Arquivo muito grande",
  "details": "Tamanho máximo permitido: 50MB"
}

// Formato não suportado
{
  "error": "Formato de arquivo não suportado",
  "details": "Formatos aceitos: JPEG, PNG, GIF, BMP, TIFF, WebP"
}

// Erro de processamento
{
  "error": "Erro ao processar imagem",
  "details": "Falha na compressão - arquivo pode estar corrompido"
}

// Target size muito pequeno
{
  "error": "Target size muito pequeno",
  "details": "Tamanho mínimo: 100KB"
}
```

### Códigos de Erro HTTP

| Código | Erro | Ação Recomendada |
|--------|------|------------------|
| `400` | Bad Request | Verificar parâmetros da requisição |
| `413` | Payload Too Large | Reduzir tamanho do arquivo |
| `415` | Unsupported Media Type | Usar formato de imagem válido |
| `429` | Too Many Requests | Aguardar e tentar novamente |
| `500` | Internal Server Error | Tentar novamente ou contatar suporte |

## 🔐 Autenticação e Segurança

### Headers de Segurança

A API inclui automaticamente:
- CORS configurado
- Helmet.js para headers de segurança
- Rate limiting implícito
- Validação de tipos de arquivo

### Melhores Práticas

1. **Sempre verificar** o campo `success` na resposta
2. **Tratar erros** adequadamente no frontend
3. **Validar arquivos** antes do upload
4. **Usar HTTPS** em produção
5. **Implementar retry** para falhas temporárias

## 📈 Monitoramento e Logs

### Logs Disponíveis

```javascript
// Logs do servidor
console.log('📊 Imagem original:', originalSize, 'KB');
console.log('🎯 Tentativa:', attempts, 'Qualidade:', quality, '%');
console.log('✅ Compressão concluída em', processingTime, 'ms');
```

### Métricas Importantes

- Tempo de processamento médio
- Taxa de sucesso da compressão
- Distribuição de formatos
- Tamanhos de arquivo processados

---

**📚 Para mais informações, consulte o [README.md](README.md) ou abra uma issue no GitHub.**
