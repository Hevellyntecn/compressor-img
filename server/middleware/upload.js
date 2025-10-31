const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const config = require('../config');

// Garante que os diretórios existam
fs.ensureDirSync(config.UPLOAD_DIR);
fs.ensureDirSync(config.OUTPUT_DIR);

// Configuração do multer para upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = path.extname(file.originalname);
    cb(null, `upload_${timestamp}_${random}${ext}`);
  }
});

// Filtro de arquivos
const fileFilter = (req, file, cb) => {
  // Permitir imagens e formatos de documentos comuns usados pelo conversor
  const allowedMimes = [
    // imagens
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/svg+xml',
    // pdf
    'application/pdf',
    // Word
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    // Excel
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    // texto/html/plain
    'text/plain',
    'text/html',
    // ebooks
    'application/epub+zip',
    'application/x-mobipocket-ebook',
    // fontes
    'font/ttf',
    'font/otf',
    'application/font-sfnt',
    // vetores e postscript
    'application/postscript',
    'application/eps',
    // CAD (variante, aceitar genericamente)
    'application/acad',
    'application/dwg'
  ];

  // Se for um tipo conhecido, aceita. Caso contrário, rejeita com mensagem genérica.
  if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não suportado. Envie imagens, PDF, DOCX, XLSX, TXT, HTML ou formatos de ebook/ fontes/vetores.'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 10
  }
});

// Middleware para upload único
const uploadSingle = upload.single('file');

// Middleware wrapper com tratamento de erros
const uploadMiddleware = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'Arquivo muito grande. Tamanho máximo permitido: 10MB'
        });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({
          success: false,
          error: 'Muitos arquivos. Apenas 1 arquivo por vez é permitido'
        });
      }
      return res.status(400).json({
        success: false,
        error: `Erro no upload: ${err.message}`
      });
    } else if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhum arquivo foi enviado'
      });
    }
    
    next();
  });
};

// Exporta o middleware wrapper como valor default e também anexamos a instância do multer
module.exports = uploadMiddleware;
module.exports.upload = upload;
