const fs = require('fs-extra');
const path = require('path');
const sharp = require('sharp');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const { PDFDocument } = require('pdf-lib');
const Jimp = require('jimp');
const officegen = require('officegen');
const archiver = require('archiver');

class DocumentConverter {
  constructor() {
    this.supportedFormats = {
      input: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'gif', 'svg', 'pdf', 'docx', 'xlsx', 'xml', 'html'],
      output: ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'gif', 'svg', 'pdf', 'docx', 'xlsx', 'xml', 'html']
    };
  }

  /**
   * Converte um documento para o formato especificado
   * @param {string} inputPath - Caminho do arquivo de entrada
   * @param {string} outputFormat - Formato de saída desejado
   * @param {Object} options - Opções de conversão (pode incluir customFileName)
   * @returns {Promise<Object>} Resultado da conversão
   */
  async convertDocument(inputPath, outputFormat, options = {}) {
    try {
      const inputExt = path.extname(inputPath).toLowerCase().slice(1);
      const defaultName = path.basename(inputPath, path.extname(inputPath));
      // Usa nome personalizado se fornecido, caso contrário usa o nome original
      const originalName = options.customFileName || defaultName;
      
      // Valida formato de entrada
      if (!this.supportedFormats.input.includes(inputExt)) {
        throw new Error(`Formato de entrada não suportado: ${inputExt}`);
      }

      // Normaliza formato de saída (jpg e jpeg são iguais)
      let normalizedOutputFormat = outputFormat.toLowerCase();
      if (normalizedOutputFormat === 'jpg') {
        normalizedOutputFormat = 'jpeg';
      }
      
      console.log(`ConvertDocument: input=${inputExt}, output=${outputFormat}, normalized=${normalizedOutputFormat}`);
      
      // Valida formato de saída
      if (!this.supportedFormats.output.includes(normalizedOutputFormat) && !this.supportedFormats.output.includes(outputFormat.toLowerCase())) {
        throw new Error(`Formato de saída não suportado: ${outputFormat}`);
      }

      // Se entrada e saída são iguais, apenas otimiza
      if (inputExt === normalizedOutputFormat || (inputExt === 'jpg' && normalizedOutputFormat === 'jpeg') || (inputExt === 'jpeg' && normalizedOutputFormat === 'jpg')) {
        return await this.optimizeSameFormat(inputPath, normalizedOutputFormat, options);
      }

      // Chama conversor específico baseado no tipo
      const result = await this.performConversion(inputPath, normalizedOutputFormat, options);
      
      // Use o formato original do usuário para a extensão do arquivo (webp, jpg, png, etc.)
      const outputExtension = outputFormat.toLowerCase();
      
      return {
        success: true,
        originalFormat: inputExt,
        outputFormat: outputExtension,
        originalName: `${originalName}.${inputExt}`,
        outputName: `${originalName}.${outputExtension}`,
        outputPath: result.path,
        size: result.size,
        metadata: result.metadata
      };

    } catch (error) {
      throw new Error(`Erro na conversão: ${error.message}`);
    }
  }

  /**
   * Otimiza arquivo mantendo o mesmo formato
   */
  async optimizeSameFormat(inputPath, format, options) {
    const originalName = path.basename(inputPath, path.extname(inputPath));
    const outputPath = path.join(options.outputDir, `${originalName}_optimized.${format}`);
    
    if (['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(format)) {
      return await this.optimizeImage(inputPath, outputPath, options);
    } else if (format === 'pdf') {
      return await this.optimizePDF(inputPath, outputPath, options);
    }
    
    // Para outros formatos, apenas copia
    await fs.copy(inputPath, outputPath);
    const stats = await fs.stat(outputPath);
    
    return {
      path: outputPath,
      size: stats.size,
      metadata: { optimized: true }
    };
  }

  /**
   * Executa conversão específica baseada nos formatos
   */
  async performConversion(inputPath, outputFormat, options) {
    const inputExt = path.extname(inputPath).toLowerCase().slice(1);
    const defaultName = path.basename(inputPath, path.extname(inputPath));
    // Usa nome personalizado se fornecido, caso contrário usa o nome original
    const originalName = options.customFileName || defaultName;
    
    // Normaliza o formato de saída (jpg e jpeg são iguais para sharp)
    let normalizedOutputFormat = outputFormat.toLowerCase();
    if (normalizedOutputFormat === 'jpg') {
      normalizedOutputFormat = 'jpeg';
    }
    
    // Usa o formato original para a extensão do arquivo
    const fileExtension = outputFormat.toLowerCase();
    const outputPath = path.join(options.outputDir, `${originalName}.${fileExtension}`);
    
    console.log(`PerformConversion: outputPath=${outputPath}, format=${normalizedOutputFormat}`);

    // Conversões de imagem
    const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'gif', 'svg'];
    const normalizedOutput = normalizedOutputFormat;
    
    if (imageFormats.includes(inputExt)) {
      if (imageFormats.includes(normalizedOutput) || (normalizedOutput === 'jpeg' && imageFormats.includes('jpg')) || (normalizedOutput === 'jpg' && imageFormats.includes('jpeg'))) {
        return await this.convertImage(inputPath, outputPath, normalizedOutput, options);
      } else if (normalizedOutput === 'pdf') {
        return await this.imageToPDF(inputPath, outputPath, options);
      }
    }

    // Conversões de PDF
    if (inputExt === 'pdf') {
      if (['jpg', 'jpeg', 'png'].includes(outputFormat)) {
        return await this.pdfToImage(inputPath, outputPath, outputFormat, options);
      }
    }

    // Conversões de documentos
    if (inputExt === 'docx') {
      if (outputFormat === 'pdf') {
        return await this.docxToPDF(inputPath, outputPath, options);
      } else if (outputFormat === 'html') {
        return await this.docxToHTML(inputPath, outputPath, options);
      }
    }

    if (inputExt === 'xlsx') {
      if (outputFormat === 'pdf') {
        return await this.xlsxToPDF(inputPath, outputPath, options);
      } else if (outputFormat === 'html') {
        return await this.xlsxToHTML(inputPath, outputPath, options);
      }
    }

    throw new Error(`Conversão de ${inputExt} para ${outputFormat} não implementada`);
  }

  /**
   * Converte imagem para outro formato
   */
  async convertImage(inputPath, outputPath, outputFormat, options) {
    const inputExt = path.extname(inputPath).toLowerCase().slice(1);
    
    // SVG não pode ser convertido diretamente com sharp
    if (inputExt === 'svg' || outputFormat === 'svg') {
      if (inputExt === 'svg' && outputFormat !== 'svg') {
        throw new Error('Conversão de SVG para outros formatos requer tratamento especial');
      }
      if (outputFormat === 'svg' && inputExt !== 'svg') {
        throw new Error('Conversão para SVG não é suportada diretamente');
      }
      // Se ambos são SVG, apenas copia
      await fs.copy(inputPath, outputPath);
      const stats = await fs.stat(outputPath);
      return {
        path: outputPath,
        size: stats.size,
        metadata: { format: 'svg' }
      };
    }
    
    let pipeline = sharp(inputPath);

    // Normaliza jpg para jpeg para processamento interno do sharp
    const normalizedFormat = outputFormat === 'jpg' ? 'jpeg' : outputFormat;
    
    console.log(`Convertendo imagem: entrada=${inputExt}, saída=${outputFormat}, normalizado=${normalizedFormat}`);

    // Configurações específicas por formato
    switch (normalizedFormat) {
      case 'jpeg':
        pipeline = pipeline.jpeg({ 
          quality: options.quality || 100,
          progressive: true,
          mozjpeg: true
        });
        break;
      case 'png':
        pipeline = pipeline.png({ 
          quality: options.quality || 100,
          compressionLevel: 9
        });
        break;
      case 'webp':
        pipeline = pipeline.webp({ 
          quality: options.quality || 100,
          effort: 6
        });
        break;
      case 'bmp':
        pipeline = pipeline.bmp();
        break;
      case 'tiff':
        pipeline = pipeline.tiff({ 
          quality: options.quality || 100,
          compression: 'lzw'
        });
        break;
      case 'gif':
        // GIF não suporta qualidade, apenas converte
        pipeline = pipeline.gif();
        break;
      default:
        throw new Error(`Formato de saída não suportado: ${outputFormat}`);
    }

    // Aplica redimensionamento se especificado
    if (options.width || options.height) {
      pipeline = pipeline.resize({
        width: options.width,
        height: options.height,
        fit: options.fit || 'inside',
        withoutEnlargement: true
      });
    }

    await pipeline.toFile(outputPath);
    
    const stats = await fs.stat(outputPath);
    const metadata = await sharp(outputPath).metadata();

    return {
      path: outputPath,
      size: stats.size,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      }
    };
  }

  /**
   * Otimiza imagem mantendo alta qualidade
   */
  async optimizeImage(inputPath, outputPath, options) {
    const metadata = await sharp(inputPath).metadata();
    
    let pipeline = sharp(inputPath);

    // Configurações de alta qualidade
    if (metadata.format === 'jpeg') {
      pipeline = pipeline.jpeg({
        quality: 98,
        progressive: true,
        mozjpeg: true,
        optimizeScans: true
      });
    } else if (metadata.format === 'png') {
      pipeline = pipeline.png({
        quality: 98,
        compressionLevel: 6, // Balance entre qualidade e tamanho
        adaptiveFiltering: true,
        force: false
      });
    } else if (metadata.format === 'webp') {
      pipeline = pipeline.webp({
        quality: 95,
        effort: 6,
        lossless: false
      });
    }

    await pipeline.toFile(outputPath);
    
    const stats = await fs.stat(outputPath);
    const outputMetadata = await sharp(outputPath).metadata();

    return {
      path: outputPath,
      size: stats.size,
      metadata: {
        width: outputMetadata.width,
        height: outputMetadata.height,
        format: outputMetadata.format,
        optimized: true
      }
    };
  }

  /**
   * Converte imagem para PDF
   */
  async imageToPDF(inputPath, outputPath, options) {
    const pdfDoc = await PDFDocument.create();
    const imageBytes = await fs.readFile(inputPath);
    
    let image;
    const ext = path.extname(inputPath).toLowerCase();
    
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        image = await pdfDoc.embedJpg(imageBytes);
        break;
      case '.png':
        image = await pdfDoc.embedPng(imageBytes);
        break;
      default:
        throw new Error(`Formato de imagem não suportado para PDF: ${ext}`);
    }

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    // Calcula dimensões mantendo proporção
    const imgDims = image.scale(1);
    const scale = Math.min(width / imgDims.width, height / imgDims.height);
    const scaledWidth = imgDims.width * scale;
    const scaledHeight = imgDims.height * scale;
    
    // Centraliza a imagem
    const x = (width - scaledWidth) / 2;
    const y = (height - scaledHeight) / 2;

    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    });

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);

    const stats = await fs.stat(outputPath);
    
    return {
      path: outputPath,
      size: stats.size,
      metadata: {
        pages: 1,
        format: 'pdf'
      }
    };
  }

  /**
   * Converte PDF para imagem
   */
  async pdfToImage(inputPath, outputPath, outputFormat, options) {
    // Esta funcionalidade requer pdf2pic ou similar
    // Por simplicidade, vamos usar uma implementação básica
    throw new Error('Conversão PDF para imagem requer configuração adicional');
  }

  /**
   * Converte DOCX para PDF
   */
  async docxToPDF(inputPath, outputPath, options) {
    // Lê o conteúdo do DOCX
    const result = await mammoth.convertToHtml({ path: inputPath });
    
    // Por simplicidade, vamos salvar como HTML primeiro
    const htmlPath = outputPath.replace('.pdf', '.html');
    await fs.writeFile(htmlPath, result.value);
    
    // Aqui você poderia usar puppeteer ou similar para converter HTML para PDF
    // Por agora, vamos retornar o HTML
    const stats = await fs.stat(htmlPath);
    
    return {
      path: htmlPath,
      size: stats.size,
      metadata: {
        format: 'html',
        note: 'Conversão DOCX para PDF via HTML'
      }
    };
  }

  /**
   * Converte DOCX para HTML
   */
  async docxToHTML(inputPath, outputPath, options) {
    const result = await mammoth.convertToHtml({ path: inputPath });
    
    // Adiciona CSS básico
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Documento Convertido</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1, h2, h3 { color: #333; }
        p { margin-bottom: 1em; }
      </style>
    </head>
    <body>
      ${result.value}
    </body>
    </html>
    `;
    
    await fs.writeFile(outputPath, htmlContent);
    const stats = await fs.stat(outputPath);
    
    return {
      path: outputPath,
      size: stats.size,
      metadata: {
        format: 'html',
        warnings: result.messages
      }
    };
  }

  /**
   * Converte XLSX para HTML
   */
  async xlsxToHTML(inputPath, outputPath, options) {
    const workbook = XLSX.readFile(inputPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    const htmlContent = XLSX.utils.sheet_to_html(worksheet, {
      header: '',
      footer: ''
    });
    
    // Adiciona CSS para melhor apresentação
    const styledHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Planilha Convertida</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
    `;
    
    await fs.writeFile(outputPath, styledHtml);
    const stats = await fs.stat(outputPath);
    
    return {
      path: outputPath,
      size: stats.size,
      metadata: {
        format: 'html',
        sheets: workbook.SheetNames.length
      }
    };
  }

  /**
   * Converte XLSX para PDF
   */
  async xlsxToPDF(inputPath, outputPath, options) {
    // Converte primeiro para HTML
    const htmlResult = await this.xlsxToHTML(inputPath, outputPath.replace('.pdf', '.html'), options);
    
    return {
      ...htmlResult,
      metadata: {
        ...htmlResult.metadata,
        note: 'Conversão XLSX para PDF via HTML'
      }
    };
  }

  /**
   * Otimiza PDF
   */
  async optimizePDF(inputPath, outputPath, options) {
    const existingPdfBytes = await fs.readFile(inputPath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    
    // Remove metadados desnecessários para reduzir tamanho
    pdfDoc.setTitle('');
    pdfDoc.setAuthor('');
    pdfDoc.setSubject('');
    pdfDoc.setKeywords([]);
    pdfDoc.setProducer('');
    pdfDoc.setCreator('');

    const pdfBytes = await pdfDoc.save();
    await fs.writeFile(outputPath, pdfBytes);

    const stats = await fs.stat(outputPath);
    
    return {
      path: outputPath,
      size: stats.size,
      metadata: {
        pages: pdfDoc.getPageCount(),
        format: 'pdf',
        optimized: true
      }
    };
  }

  /**
   * Valida se a conversão é suportada
   */
  isConversionSupported(inputFormat, outputFormat) {
    return this.supportedFormats.input.includes(inputFormat.toLowerCase()) &&
           this.supportedFormats.output.includes(outputFormat.toLowerCase());
  }

  /**
   * Obtém formatos suportados
   */
  getSupportedFormats() {
    return this.supportedFormats;
  }
}

module.exports = DocumentConverter;
