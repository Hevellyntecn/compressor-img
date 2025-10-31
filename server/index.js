const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs-extra');
const config = require('./config');

// Importa rotas
const compressRoutes = require('./routes/compress');
const converterRoutes = require('./routes/converter');

const app = express();

// Middleware de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Middleware de compressão
app.use(compression());

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos
app.use('/download', express.static(config.OUTPUT_DIR));

// Garante que os diretórios existam
fs.ensureDirSync(config.UPLOAD_DIR);
fs.ensureDirSync(config.OUTPUT_DIR);

// Rotas da API
app.use('/api', compressRoutes);
app.use('/api', converterRoutes);

// Rota de health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: config.NODE_ENV
  });
});

// Rota de informações da API
app.get('/api/info', (req, res) => {
  res.json({
    name: 'Image Compressor API',
    version: '1.0.0',
    description: 'API premium para compressão e otimização de imagens',
    endpoints: {
      compress: {
        method: 'POST',
        path: '/api/compress',
        description: 'Comprime uma imagem para máximo 470KB',
        accepts: 'multipart/form-data com campo "image"'
      },
      'compress-multiple': {
        method: 'POST',
        path: '/api/compress-multiple',
        description: 'Comprime múltiplas imagens (até 5)',
        accepts: 'multipart/form-data com campo "images"'
      },
      download: {
        method: 'GET',
        path: '/api/download/:filename',
        description: 'Download de arquivo comprimido'
      },
      info: {
        method: 'GET',
        path: '/api/info/:filename',
        description: 'Informações sobre arquivo comprimido'
      },
      cleanup: {
        method: 'DELETE',
        path: '/api/cleanup',
        description: 'Limpa arquivos temporários antigos'
      }
    },
    limits: {
      maxFileSize: config.MAX_FILE_SIZE,
      maxFiles: 5,
      targetSize: config.TARGET_SIZE,
      supportedFormats: config.ALLOWED_FORMATS
    }
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Erro interno do servidor' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado',
    availableEndpoints: [
      'GET /health',
      'GET /api/info',
      'POST /api/compress',
      'POST /api/compress-multiple',
      'GET /api/download/:filename',
      'GET /api/info/:filename',
      'DELETE /api/cleanup'
    ]
  });
});

// Inicia o servidor somente quando executado diretamente (não ao importar como módulo/serverless)
if (require.main === module) {
  const PORT = config.PORT;
  app.listen(PORT, () => {
    console.log(`
🚀 Servidor Image Compressor iniciado!
📍 Porta: ${PORT}
🌍 Ambiente: ${config.NODE_ENV}
📁 Upload dir: ${config.UPLOAD_DIR}
📁 Output dir: ${config.OUTPUT_DIR}
🎯 Tamanho alvo: ${config.TARGET_SIZE / 1024}KB
📋 Formatos suportados: ${config.ALLOWED_FORMATS.join(', ')}
🔗 Health check: http://localhost:${PORT}/health
📚 API info: http://localhost:${PORT}/api/info
    `);
  });
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  process.exit(0);
});

module.exports = app;
