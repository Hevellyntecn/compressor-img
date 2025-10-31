const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const ImageProcessor = require('../utils/imageProcessor');
const uploadMiddleware = require('../middleware/upload');
const config = require('../config');

const router = express.Router();
const imageProcessor = new ImageProcessor();

/**
 * POST /api/compress
 * Comprime uma imagem para o tamanho máximo de 470KB
 */
router.post('/compress', uploadMiddleware, async (req, res) => {
  const startTime = Date.now();
  let tempFiles = [req.file.path]; // Lista de arquivos temporários para limpeza

  try {
    // Valida a imagem
    const validation = await imageProcessor.validateImage(req.file.path);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Mantém nome original se solicitado
    const keepOriginalName = req.body.keepOriginalName === 'true';
    let outputFileName;
    
    if (keepOriginalName) {
      outputFileName = req.file.originalname;
    } else {
      const outputFormat = imageProcessor.getOptimalFormat(validation.format);
      outputFileName = imageProcessor.generateFileName(req.file.originalname, outputFormat);
    }
    
    const outputPath = path.join(config.OUTPUT_DIR, outputFileName);
    tempFiles.push(outputPath);

    // Processa a imagem
    const result = await imageProcessor.processImage(req.file.path, outputPath);
    
    // Calcula tempo de processamento
    const processingTime = Date.now() - startTime;

    // Resposta de sucesso
    res.json({
      success: true,
      data: {
        originalFile: {
          name: req.file.originalname,
          size: validation.size,
          format: validation.format,
          dimensions: `${validation.width}x${validation.height}`
        },
        compressedFile: {
          name: outputFileName,
          size: result.compressedSize,
          format: result.format,
          dimensions: result.dimensions,
          path: `/download/${outputFileName}`,
          downloadUrl: `/api/download/${outputFileName}`
        },
        compression: {
          ratio: result.compressionRatio,
          originalSize: validation.size,
          compressedSize: result.compressedSize,
          savedBytes: validation.size - result.compressedSize,
          scaled: result.scaled || false,
          scaleFactor: result.scaleFactor || 1.0
        },
        processing: {
          time: processingTime,
          quality: result.quality || 'otimizada'
        }
      }
    });

  } catch (error) {
    console.error('Erro na compressão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor durante a compressão',
      details: error.message
    });
  } finally {
    // Limpa arquivos temporários (exceto o arquivo de saída)
    try {
      await fs.remove(req.file.path);
    } catch (cleanupError) {
      console.warn('Erro ao limpar arquivo temporário:', cleanupError.message);
    }
  }
});

/**
 * POST /api/compress-multiple
 * Comprime múltiplas imagens (até 5)
 */
router.post('/compress-multiple', uploadMiddleware.upload.array('images', 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Nenhum arquivo foi enviado'
    });
  }

  if (req.files.length > 5) {
    return res.status(400).json({
      success: false,
      error: 'Máximo de 5 arquivos por vez'
    });
  }

  const results = [];
  const errors = [];

  // Processa cada arquivo
  for (const file of req.files) {
    try {
      const validation = await imageProcessor.validateImage(file.path);
      if (!validation.isValid) {
        errors.push({
          fileName: file.originalname,
          error: validation.error
        });
        await fs.remove(file.path);
        continue;
      }

      const outputFormat = imageProcessor.getOptimalFormat(validation.format);
      const outputFileName = imageProcessor.generateFileName(file.originalname, outputFormat);
      const outputPath = path.join(config.OUTPUT_DIR, outputFileName);

      const result = await imageProcessor.processImage(file.path, outputPath);
      
      results.push({
        originalFile: {
          name: file.originalname,
          size: validation.size,
          format: validation.format,
          dimensions: `${validation.width}x${validation.height}`
        },
        compressedFile: {
          name: outputFileName,
          size: result.compressedSize,
          format: result.format,
          dimensions: result.dimensions,
          downloadUrl: `/api/download/${outputFileName}`
        },
        compression: {
          ratio: result.compressionRatio,
          originalSize: validation.size,
          compressedSize: result.compressedSize,
          savedBytes: validation.size - result.compressedSize
        }
      });

      // Remove arquivo temporário
      await fs.remove(file.path);

    } catch (error) {
      errors.push({
        fileName: file.originalname,
        error: error.message
      });
      try {
        await fs.remove(file.path);
      } catch (cleanupError) {
        console.warn('Erro ao limpar arquivo:', cleanupError.message);
      }
    }
  }

  res.json({
    success: errors.length === 0,
    data: {
      processed: results,
      errors: errors,
      summary: {
        total: req.files.length,
        successful: results.length,
        failed: errors.length
      }
    }
  });
});

/**
 * GET /api/download/:filename
 * Download de arquivo comprimido
 */
router.get('/download/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(config.OUTPUT_DIR, filename);

    // Verifica se o arquivo existe
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    // Define headers para download
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/octet-stream');

    // Envia o arquivo
    res.sendFile(path.resolve(filePath));

  } catch (error) {
    console.error('Erro no download:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer download do arquivo'
    });
  }
});

/**
 * GET /api/info/:filename
 * Informações sobre um arquivo comprimido
 */
router.get('/info/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(config.OUTPUT_DIR, filename);

    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({
        success: false,
        error: 'Arquivo não encontrado'
      });
    }

    const stats = await fs.stat(filePath);
    const metadata = await imageProcessor.validateImage(filePath);

    res.json({
      success: true,
      data: {
        filename,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        format: metadata.format,
        dimensions: `${metadata.width}x${metadata.height}`,
        downloadUrl: `/api/download/${filename}`
      }
    });

  } catch (error) {
    console.error('Erro ao obter informações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao obter informações do arquivo'
    });
  }
});

/**
 * DELETE /api/cleanup
 * Limpa arquivos temporários antigos (mais de 1 hora)
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    let cleaned = 0;

    // Limpa arquivos de upload
    const uploadFiles = await fs.readdir(config.UPLOAD_DIR);
    for (const file of uploadFiles) {
      const filePath = path.join(config.UPLOAD_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > oneHour) {
        await fs.remove(filePath);
        cleaned++;
      }
    }

    // Limpa arquivos de saída antigos (mais de 24 horas)
    const outputFiles = await fs.readdir(config.OUTPUT_DIR);
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (const file of outputFiles) {
      const filePath = path.join(config.OUTPUT_DIR, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtime.getTime() > oneDay) {
        await fs.remove(filePath);
        cleaned++;
      }
    }

    res.json({
      success: true,
      message: `${cleaned} arquivos temporários foram removidos`
    });

  } catch (error) {
    console.error('Erro na limpeza:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao limpar arquivos temporários'
    });
  }
});

/**
 * POST /api/compress-extreme
 * Comprime imagem
 */
router.post('/compress-extreme', uploadMiddleware, async (req, res) => {
  const startTime = Date.now();
  let tempFiles = [req.file.path];

  try {
    // Valida a imagem
    const validation = await imageProcessor.validateImage(req.file.path);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Mantém nome original
    const outputFileName = req.file.originalname;
    const outputPath = path.join(config.OUTPUT_DIR, outputFileName);
    tempFiles.push(outputPath);

  // Processa com configurações informadas
    const result = await imageProcessor.compressWithExtremeQuality(req.file.path, outputPath);
    
    // Calcula tempo de processamento
    const processingTime = Date.now() - startTime;

    // Resposta de sucesso
    res.json({
      success: true,
      data: {
        originalFile: {
          name: req.file.originalname,
          size: validation.size,
          format: validation.format,
          dimensions: `${validation.width}x${validation.height}`
        },
        compressedFile: {
          name: result.originalName,
          size: result.compressedSize,
          format: result.format,
          dimensions: result.dimensions,
          path: `/download/${result.originalName}`,
          downloadUrl: `/api/download/${result.originalName}`
        },
        compression: {
          ratio: result.compressionRatio,
          originalSize: validation.size,
          compressedSize: result.compressedSize,
          savedBytes: validation.size - result.compressedSize,
          quality: result.quality
        },
        processing: {
          time: processingTime,
          quality: result.quality
        }
      }
    });

  } catch (error) {
    console.error('Erro na compressão extrema:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor durante a compressão',
      details: error.message
    });
  } finally {
    // Limpa arquivos temporários (exceto o arquivo de saída)
    try {
      await fs.remove(req.file.path);
    } catch (cleanupError) {
      console.warn('Erro ao limpar arquivo temporário:', cleanupError.message);
    }
  }
});

module.exports = router;
