const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');
const config = require('../config');

class ImageProcessor {
  constructor() {
    this.targetSize = config.TARGET_SIZE;
    this.qualitySteps = config.QUALITY_STEPS;
    this.webpQualitySteps = config.WEBP_QUALITY_STEPS;
  }

  /**
   * Processa uma imagem para atingir o tamanho alvo de 470KB
   * @param {string} inputPath - Caminho da imagem original
   * @param {string} outputPath - Caminho onde salvar a imagem comprimida
   * @param {Object} options - Opções de processamento
   * @returns {Promise<Object>} Resultado do processamento
   */
  async processImage(inputPath, outputPath, options = {}) {
    try {
      const metadata = await sharp(inputPath).metadata();
      const originalSize = (await fs.stat(inputPath)).size;
      
      // Se já está dentro do limite, apenas otimiza
      if (originalSize <= this.targetSize) {
        return await this.optimizeImage(inputPath, outputPath, metadata, originalSize, options.format);
      }

      // Caso contrário, aplica compressão inteligente
      return await this.intelligentCompression(inputPath, outputPath, metadata, originalSize, options.format);
    } catch (error) {
      throw new Error(`Erro ao processar imagem: ${error.message}`);
    }
  }

  /**
  * Comprime imagem (algoritmo principal)
   * @param {string} inputPath - Caminho da imagem original
   * @param {string} outputPath - Caminho onde salvar a imagem comprimida
   * @param {Object} options - Opções de processamento
   * @returns {Promise<Object>} Resultado do processamento
   */
  async compressWithExtremeQuality(inputPath, outputPath, options = {}) {
    try {
      const metadata = await sharp(inputPath).metadata();
      const originalSize = (await fs.stat(inputPath)).size;
      
      // Mantém o nome original do arquivo
      const originalName = path.basename(inputPath);
      const outputPathWithOriginalName = path.join(path.dirname(outputPath), originalName);
      
      let pipeline = sharp(inputPath);

  // Configurações de qualidade para compressão
      if (metadata.format === 'jpeg') {
        pipeline = pipeline.jpeg({
          quality: 98, // Qualidade máxima
          progressive: true,
          mozjpeg: true,
          optimizeScans: true,
          optimizeCoding: true
        });
      } else if (metadata.format === 'png') {
        pipeline = pipeline.png({
          quality: 98,
          compressionLevel: 1, // Compressão mínima para máxima qualidade
          adaptiveFiltering: true,
          force: false
        });
      } else if (metadata.format === 'webp') {
        pipeline = pipeline.webp({
          quality: 98,
          effort: 6,
          lossless: false, // Usa lossy mas com qualidade máxima
          nearLossless: true
        });
      }

      await pipeline.toFile(outputPathWithOriginalName);
      
      const newSize = (await fs.stat(outputPathWithOriginalName)).size;
      
      return {
        success: true,
        originalSize,
        compressedSize: newSize,
        compressionRatio: ((originalSize - newSize) / originalSize * 100).toFixed(2),
        format: metadata.format,
        dimensions: `${metadata.width}x${metadata.height}`,
        path: outputPathWithOriginalName,
        quality: 'extrema',
        originalName: originalName
      };

    } catch (error) {
      throw new Error(`Erro na compressão de alta qualidade: ${error.message}`);
    }
  }

  /**
   * Otimiza uma imagem que já está dentro do limite de tamanho
   */
  async optimizeImage(inputPath, outputPath, metadata, originalSize, userFormat = null) {
    // Usa o formato especificado pelo usuário ou determina o ótimo
    const format = userFormat || this.getOptimalFormat(metadata.format);
    
    let pipeline = sharp(inputPath);
    
    if (format === 'jpeg' || format === 'jpg') {
      pipeline = pipeline.jpeg({ 
        quality: 100, 
        progressive: true,
        mozjpeg: true 
      });
    } else if (format === 'png') {
      pipeline = pipeline.png({ 
        quality: 100,
        compressionLevel: 9,
        adaptiveFiltering: true,
        force: true
      });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ 
        quality: 100,
        effort: 6
      });
    }

    await pipeline.toFile(outputPath);
    
    const newSize = (await fs.stat(outputPath)).size;
    
    return {
      success: true,
      originalSize,
      compressedSize: newSize,
      compressionRatio: ((originalSize - newSize) / originalSize * 100).toFixed(2),
      format: format === 'jpg' ? 'jpeg' : format,
      dimensions: `${metadata.width}x${metadata.height}`,
      path: outputPath
    };
  }

  /**
   * Aplica compressão inteligente para atingir o tamanho alvo
   */
  async intelligentCompression(inputPath, outputPath, metadata, originalSize, userFormat = null) {
    // Usa o formato especificado pelo usuário ou determina o ótimo
    const format = userFormat || this.getOptimalFormat(metadata.format);
    const qualitySteps = format === 'webp' ? this.webpQualitySteps : this.qualitySteps;
    
    let bestResult = null;
    let scaleFactor = 1.0;
    
    // Primeiro tenta com qualidade variável mantendo dimensões
    for (const quality of qualitySteps) {
      const result = await this.compressWithQuality(inputPath, outputPath, quality, format, scaleFactor);
      
      if (result.compressedSize <= this.targetSize) {
        bestResult = result;
        break;
      }
    }
    
    // Se ainda não atingiu o alvo, aplica redimensionamento progressivo
    if (!bestResult || bestResult.compressedSize > this.targetSize) {
      const scaleSteps = [0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.25];
      
      for (const scale of scaleSteps) {
        scaleFactor = scale;
        
        for (const quality of qualitySteps.slice(0, 5)) { // Usa apenas as primeiras 5 qualidades
          const result = await this.compressWithQuality(inputPath, outputPath, quality, format, scaleFactor);
          
          if (result.compressedSize <= this.targetSize) {
            if (!bestResult || result.compressedSize < bestResult.compressedSize) {
              bestResult = result;
            }
          }
        }
        
        if (bestResult && bestResult.compressedSize <= this.targetSize) {
          break;
        }
      }
    }
    
    if (!bestResult) {
      // Fallback: usa a menor escala possível
      scaleFactor = 0.2;
      bestResult = await this.compressWithQuality(inputPath, outputPath, 20, format, scaleFactor);
    }
    
    return {
      ...bestResult,
      success: true,
      scaled: scaleFactor < 1.0,
      scaleFactor: scaleFactor
    };
  }

  /**
   * Comprime imagem com qualidade e escala específicas
   */
  async compressWithQuality(inputPath, outputPath, quality, format, scaleFactor = 1.0) {
    let pipeline = sharp(inputPath);
    
    // Aplica redimensionamento se necessário
    if (scaleFactor < 1.0) {
      pipeline = pipeline.resize({
        width: Math.round(await this.getWidth(inputPath) * scaleFactor),
        height: Math.round(await this.getHeight(inputPath) * scaleFactor),
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Aplica formatação específica
    if (format === 'jpeg') {
      pipeline = pipeline.jpeg({ 
        quality, 
        progressive: true,
        mozjpeg: true,
        optimizeScans: true
      });
    } else if (format === 'png') {
      pipeline = pipeline.png({ 
        quality,
        compressionLevel: 9,
        adaptiveFiltering: true,
        force: true
      });
    } else if (format === 'webp') {
      pipeline = pipeline.webp({ 
        quality,
        effort: 6,
        lossless: quality >= 95
      });
    }

    await pipeline.toFile(outputPath);
    
    const newSize = (await fs.stat(outputPath)).size;
    const metadata = await sharp(outputPath).metadata();
    
    return {
      compressedSize: newSize,
      dimensions: `${metadata.width}x${metadata.height}`,
      quality,
      format
    };
  }

  /**
   * Determina o formato ótimo baseado no formato original
   */
  getOptimalFormat(originalFormat) {
    const formatMap = {
      'jpeg': 'jpeg',
      'jpg': 'jpeg',
      'png': 'png',
      'webp': 'webp',
      'bmp': 'jpeg',
      'tiff': 'jpeg'
    };
    
    return formatMap[originalFormat] || 'jpeg';
  }

  /**
   * Obtém largura da imagem
   */
  async getWidth(inputPath) {
    const metadata = await sharp(inputPath).metadata();
    return metadata.width;
  }

  /**
   * Obtém altura da imagem
   */
  async getHeight(inputPath) {
    const metadata = await sharp(inputPath).metadata();
    return metadata.height;
  }

  /**
   * Gera nome único para arquivo
   */
  generateFileName(originalName, format) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const ext = format === 'jpeg' ? 'jpg' : format;
    return `compressed_${timestamp}_${random}.${ext}`;
  }

  /**
   * Valida se o arquivo é uma imagem suportada
   */
  async validateImage(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      const supportedFormats = ['jpeg', 'jpg', 'png', 'webp', 'bmp', 'tiff'];
      
      if (!supportedFormats.includes(metadata.format)) {
        throw new Error(`Formato não suportado: ${metadata.format}`);
      }
      
      return {
        isValid: true,
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        size: (await fs.stat(filePath)).size
      };
    } catch (error) {
      return {
        isValid: false,
        error: error.message
      };
    }
  }
}

module.exports = ImageProcessor;
