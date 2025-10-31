/**
 * 🧠 Sistema de Compressão e Conversão de Imagens Premium
 * 
 * Servidor principal que gerencia upload, compressão inteligente e conversão de formatos
 * Otimizado para funcionar no Vercel com limite de 470KB por imagem
 */

const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs').promises;
const { PDFDocument } = require('pdf-lib');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de segurança e performance
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'client/build')));

// Configuração do Multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB máximo
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos!'));
    }
  }
});

// Criar diretório de uploads se não existir
async function ensureUploadsDir() {
  try {
    await fs.mkdir('uploads', { recursive: true });
    await fs.mkdir('processed', { recursive: true });
  } catch (error) {
    console.error('Erro ao criar diretórios:', error);
  }
}

/**
 * 🎯 Função principal de compressão inteligente
 * Utiliza algoritmo adaptativo para manter qualidade máxima dentro do limite de 470KB
 */
async function compressImage(inputPath, outputPath, targetSizeKB = 470, targetFormat = 'jpeg') {
  const startTime = Date.now();
  
  try {
    // Obter metadados da imagem original
    const metadata = await sharp(inputPath).metadata();
    const originalSize = (await fs.stat(inputPath)).size;
    
    console.log(`📊 Imagem original: ${(originalSize / 1024).toFixed(2)}KB, ${metadata.width}x${metadata.height}`);
    
    let sharpInstance = sharp(inputPath);
    let quality = 90; // Começar com alta qualidade
    let scale = 1;
    
    // Se a imagem for muito grande, reduzir proporcionalmente
    const maxDimension = 2048;
    if (metadata.width > maxDimension || metadata.height > maxDimension) {
      scale = Math.min(maxDimension / metadata.width, maxDimension / metadata.height);
      sharpInstance = sharpInstance.resize({
        width: Math.round(metadata.width * scale),
        height: Math.round(metadata.height * scale),
        fit: 'inside',
        withoutEnlargement: true
      });
      console.log(`🔄 Redimensionando para: ${Math.round(metadata.width * scale)}x${Math.round(metadata.height * scale)}`);
    }
    
    // Configurar formato de saída
    if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
      sharpInstance = sharpInstance.jpeg({
        quality: quality,
        progressive: true,
        mozjpeg: true,
        optimizeScans: true
      });
    } else if (targetFormat === 'png') {
      sharpInstance = sharpInstance.png({
        quality: quality,
        progressive: true,
        compressionLevel: 9,
        adaptiveFiltering: true
      });
    } else if (targetFormat === 'webp') {
      sharpInstance = sharpInstance.webp({
        quality: quality,
        effort: 6,
        smartSubsample: true
      });
    }
    
    // Algoritmo de compressão adaptativa
    let outputSize = 0;
    let attempts = 0;
    const maxAttempts = 10;
    
    while (outputSize > targetSizeKB * 1024 && attempts < maxAttempts) {
      attempts++;
      
      // Calcular novo valor de qualidade baseado no tamanho atual
      if (outputSize > 0) {
        const compressionRatio = (targetSizeKB * 1024) / outputSize;
        quality = Math.max(10, Math.min(95, Math.round(quality * compressionRatio * 0.9)));
      }
      
      // Ajustar configurações baseado no formato
      if (targetFormat === 'jpeg' || targetFormat === 'jpg') {
        sharpInstance = sharp(inputPath)
          .resize(scale < 1 ? { width: Math.round(metadata.width * scale), height: Math.round(metadata.height * scale), fit: 'inside' } : undefined)
          .jpeg({
            quality: quality,
            progressive: true,
            mozjpeg: true,
            optimizeScans: true
          });
      } else if (targetFormat === 'png') {
        sharpInstance = sharp(inputPath)
          .resize(scale < 1 ? { width: Math.round(metadata.width * scale), height: Math.round(metadata.height * scale), fit: 'inside' } : undefined)
          .png({
            quality: quality,
            progressive: true,
            compressionLevel: Math.min(9, Math.round(quality / 10)),
            adaptiveFiltering: true
          });
      } else if (targetFormat === 'webp') {
        sharpInstance = sharp(inputPath)
          .resize(scale < 1 ? { width: Math.round(metadata.width * scale), height: Math.round(metadata.height * scale), fit: 'inside' } : undefined)
          .webp({
            quality: quality,
            effort: Math.min(6, Math.round(quality / 15)),
            smartSubsample: true
          });
      }
      
      // Processar e verificar tamanho
      const buffer = await sharpInstance.toBuffer();
      outputSize = buffer.length;
      
      console.log(`🎯 Tentativa ${attempts}: Qualidade ${quality}%, Tamanho: ${(outputSize / 1024).toFixed(2)}KB`);
      
      // Se atingiu o tamanho desejado, salvar
      if (outputSize <= targetSizeKB * 1024) {
        await fs.writeFile(outputPath, buffer);
        break;
      }
    }
    
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    const finalStats = await fs.stat(outputPath);
    const compressionRatio = ((originalSize - finalStats.size) / originalSize * 100).toFixed(2);
    
    console.log(`✅ Compressão concluída em ${processingTime}ms`);
    console.log(`📈 Redução: ${compressionRatio}% (${(originalSize/1024).toFixed(2)}KB → ${(finalStats.size/1024).toFixed(2)}KB)`);
    
    return {
      originalSize: originalSize,
      compressedSize: finalStats.size,
      compressionRatio: parseFloat(compressionRatio),
      processingTime: processingTime,
      dimensions: {
        original: { width: metadata.width, height: metadata.height },
        compressed: await sharp(outputPath).metadata().then(m => ({ width: m.width, height: m.height }))
      }
    };
    
  } catch (error) {
    console.error('❌ Erro na compressão:', error);
    throw error;
  }
}

/**
 * 📄 Função para converter imagem para PDF
 */
async function convertToPDF(imagePath, outputPath) {
  try {
    const pdfDoc = await PDFDocument.create();
    const imageBuffer = await fs.readFile(imagePath);
    const image = await pdfDoc.embedJpg(imageBuffer);
    
    const page = pdfDoc.addPage([image.width, image.height]);
    page.drawImage(image, {
      x: 0,
      y: 0,
      width: image.width,
      height: image.height,
    });
    
    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);
    
    return {
      success: true,
      size: pdfBytes.length
    };
  } catch (error) {
    console.error('Erro ao converter para PDF:', error);
    throw error;
  }
}

/**
 * 🚀 Rota principal de compressão
 */
app.post('/api/compress', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }
    
    const { format = 'jpeg', targetSize = 470 } = req.body;
    const inputPath = req.file.path;
    const timestamp = Date.now();
    const outputPath = `processed/compressed-${timestamp}.${format}`;
    
    console.log(`🔄 Processando: ${req.file.originalname}`);
    
    // Comprimir a imagem
    const result = await compressImage(inputPath, outputPath, parseInt(targetSize), format);
    
    // Se solicitado PDF, converter
    let pdfPath = null;
    if (req.body.includePDF === 'true') {
      pdfPath = `processed/converted-${timestamp}.pdf`;
      await convertToPDF(outputPath, pdfPath);
    }
    
    // Limpar arquivo temporário
    await fs.unlink(inputPath);
    
    res.json({
      success: true,
      originalName: req.file.originalname,
      compressedFile: `/api/download/${path.basename(outputPath)}`,
      pdfFile: pdfPath ? `/api/download/${path.basename(pdfPath)}` : null,
      stats: {
        originalSizeKB: (result.originalSize / 1024).toFixed(2),
        compressedSizeKB: (result.compressedSize / 1024).toFixed(2),
        compressionRatio: result.compressionRatio,
        processingTimeMs: result.processingTime,
        dimensions: result.dimensions
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
});

/**
 * 📥 Rota para download de arquivos processados
 */
app.get('/api/download/:filename', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'processed', req.params.filename);
    const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
    
    if (!fileExists) {
      return res.status(404).json({ error: 'Arquivo não encontrado' });
    }
    
    res.download(filePath);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao baixar arquivo' });
  }
});

/**
 * 🏠 Rota principal - servir interface React
 */
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

// Inicializar servidor
async function startServer() {
  await ensureUploadsDir();
  
  app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Acesse: http://localhost:${PORT}`);
    console.log(`📊 Sistema de compressão premium ativo!`);
  });
}

startServer().catch(console.error);

// Exportar para Vercel
module.exports = app;
