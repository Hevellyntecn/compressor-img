const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const DocumentConverter = require('../utils/documentConverter');
const uploadMiddleware = require('../middleware/upload');
const config = require('../config');

const router = express.Router();
const documentConverter = new DocumentConverter();

/**
 * POST /api/convert
 * Converte um documento para outro formato
 */
router.post('/convert', uploadMiddleware, async (req, res) => {
  const startTime = Date.now();
  let tempFiles = [req.file.path];

  try {
    // Extrai formato de saída dos parâmetros
    const outputFormat = req.body.outputFormat || req.query.outputFormat;
    
    if (!outputFormat) {
      return res.status(400).json({
        success: false,
        error: 'Formato de saída não especificado'
      });
    }

    // Valida formato de entrada
    const inputExt = path.extname(req.file.originalname).toLowerCase().slice(1);
    
    if (!documentConverter.isConversionSupported(inputExt, outputFormat)) {
      return res.status(400).json({
        success: false,
        error: `Conversão de ${inputExt} para ${outputFormat} não suportada`
      });
    }

    // Gera caminho de saída
    const originalName = path.basename(req.file.originalname, path.extname(req.file.originalname));
    const outputFileName = `${originalName}.${outputFormat.toLowerCase()}`;
    const outputPath = path.join(config.OUTPUT_DIR, outputFileName);
    tempFiles.push(outputPath);

    // Opções de conversão
    const options = {
      outputDir: config.OUTPUT_DIR,
      quality: parseInt(req.body.quality) || 100,
      width: req.body.width ? parseInt(req.body.width) : undefined,
      height: req.body.height ? parseInt(req.body.height) : undefined,
      fit: req.body.fit || 'inside'
    };

    // Executa conversão
    const result = await documentConverter.convertDocument(
      req.file.path, 
      outputFormat, 
      options
    );
    
    // Calcula tempo de processamento
    const processingTime = Date.now() - startTime;

    // Resposta de sucesso
    res.json({
      success: true,
      data: {
        originalFile: {
          name: req.file.originalname,
          size: (await fs.stat(req.file.path)).size,
          format: inputExt
        },
        convertedFile: {
          name: result.outputName,
          size: result.size,
          format: result.outputFormat,
          path: `/download/${result.outputName}`,
          downloadUrl: `/api/download/${result.outputName}`
        },
        conversion: {
          fromFormat: result.originalFormat,
          toFormat: result.outputFormat,
          originalSize: (await fs.stat(req.file.path)).size,
          convertedSize: result.size,
          savedBytes: (await fs.stat(req.file.path)).size - result.size
        },
        processing: {
          time: processingTime,
          metadata: result.metadata
        }
      }
    });

  } catch (error) {
    console.error('Erro na conversão:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor durante a conversão',
      details: error.message
    });
  } finally {
    // Limpa arquivos temporários
    try {
      await fs.remove(req.file.path);
    } catch (cleanupError) {
      console.warn('Erro ao limpar arquivo temporário:', cleanupError.message);
    }
  }
});

/**
 * POST /api/convert-multiple
 * Converte múltiplos documentos
 */
router.post('/convert-multiple', uploadMiddleware.upload.array('files', 10), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Nenhum arquivo foi enviado'
    });
  }

  const outputFormat = req.body.outputFormat;
  
  console.log('Convert-multiple: outputFormat recebido =', outputFormat);
  
  if (!outputFormat) {
    return res.status(400).json({
      success: false,
      error: 'Formato de saída não especificado'
    });
  }

  const results = [];
  const errors = [];

  // Processa cada arquivo
  for (let i = 0; i < req.files.length; i++) {
    const file = req.files[i];
    try {
      const inputExt = path.extname(file.originalname).toLowerCase().slice(1);
      
      console.log(`Processando arquivo: ${file.originalname}, formato entrada: ${inputExt}, formato saída: ${outputFormat}`);
      
      if (!documentConverter.isConversionSupported(inputExt, outputFormat)) {
        errors.push({
          fileName: file.originalname,
          error: `Conversão de ${inputExt} para ${outputFormat} não suportada`
        });
        await fs.remove(file.path);
        continue;
      }

      // Verifica se há nome personalizado para este arquivo
      const customFileName = req.body[`customFileName_${i}`];
      // Se não houver nome personalizado, usa o nome original do arquivo (sem extensão)
      const baseFileName = customFileName || path.basename(file.originalname, path.extname(file.originalname));
      
      console.log(`Nome base do arquivo: ${baseFileName}${customFileName ? ' (personalizado)' : ' (original)'}`);

      const options = {
        outputDir: config.OUTPUT_DIR,
        quality: parseInt(req.body.quality) || 100,
        customFileName: baseFileName // Passa sempre o nome (personalizado ou original)
      };

      const result = await documentConverter.convertDocument(file.path, outputFormat, options);
      
      console.log(`Conversão bem-sucedida: ${result.outputName}`);
      
      results.push({
        originalFile: {
          name: file.originalname,
          size: file.size,
          format: inputExt
        },
        convertedFile: {
          name: result.outputName,
          size: result.size,
          format: result.outputFormat,
          downloadUrl: `/api/download/${result.outputName}`
        },
        conversion: {
          fromFormat: result.originalFormat,
          toFormat: result.outputFormat
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
      converted: results,
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
 * GET /api/formats
 * Lista formatos suportados
 */
router.get('/formats', (req, res) => {
  const formats = documentConverter.getSupportedFormats();
  
  res.json({
    success: true,
    data: {
      inputFormats: formats.input,
      outputFormats: formats.output,
      conversions: {
        images: {
          from: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'],
          to: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'pdf']
        },
        documents: {
          from: ['docx', 'xlsx'],
          to: ['pdf', 'html']
        },
        pdf: {
          from: ['pdf'],
          to: ['jpg', 'jpeg', 'png']
        }
      }
    }
  });
});

/**
 * GET /api/validate-conversion
 * Valida se uma conversão é suportada
 */
router.get('/validate-conversion', (req, res) => {
  const { inputFormat, outputFormat } = req.query;
  
  if (!inputFormat || !outputFormat) {
    return res.status(400).json({
      success: false,
      error: 'Parâmetros inputFormat e outputFormat são obrigatórios'
    });
  }

  const isSupported = documentConverter.isConversionSupported(inputFormat, outputFormat);
  
  res.json({
    success: true,
    data: {
      inputFormat,
      outputFormat,
      supported: isSupported
    }
  });
});

/**
 * GET /api/download/:filename
 * Download de arquivo convertido
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

module.exports = router;
