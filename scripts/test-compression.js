/**
 * 🧪 Script de Teste - Image Compressor Premium
 * 
 * Script para testar a funcionalidade de compressão localmente
 * Execute com: node scripts/test-compression.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Configurações de teste
const BASE_URL = 'http://localhost:3000';
const TEST_IMAGES = [
  {
    name: 'small.jpg',
    size: '100KB',
    description: 'Imagem pequena - teste básico'
  },
  {
    name: 'medium.jpg', 
    size: '2MB',
    description: 'Imagem média - teste padrão'
  },
  {
    name: 'large.jpg',
    size: '10MB', 
    description: 'Imagem grande - teste de performance'
  }
];

/**
 * Testa a compressão de uma imagem
 */
async function testImageCompression(imagePath, settings) {
  try {
    console.log(`\n🔄 Testando: ${imagePath}`);
    console.log(`📊 Configurações: ${JSON.stringify(settings)}`);
    
    const form = new FormData();
    form.append('image', fs.createReadStream(imagePath));
    form.append('format', settings.format);
    form.append('targetSize', settings.targetSize);
    form.append('includePDF', settings.includePDF);

    const startTime = Date.now();
    
    const response = await axios.post(`${BASE_URL}/api/compress`, form, {
      headers: form.getHeaders(),
      timeout: 60000 // 60 segundos
    });

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    if (response.data.success) {
      console.log('✅ Sucesso!');
      console.log(`📈 Estatísticas:`);
      console.log(`   Original: ${response.data.stats.originalSizeKB} KB`);
      console.log(`   Comprimida: ${response.data.stats.compressedSizeKB} KB`);
      console.log(`   Redução: ${response.data.stats.compressionRatio}%`);
      console.log(`   Tempo: ${response.data.stats.processingTimeMs}ms`);
      console.log(`   Tempo Total: ${totalTime}ms`);
      
      // Verificar se atingiu o target size
      const targetAchieved = parseFloat(response.data.stats.compressedSizeKB) <= settings.targetSize;
      console.log(`🎯 Target Size (${settings.targetSize}KB): ${targetAchieved ? '✅ Atingido' : '❌ Não atingido'}`);
      
      return {
        success: true,
        stats: response.data.stats,
        targetAchieved,
        totalTime
      };
    } else {
      console.log('❌ Falha na compressão');
      return { success: false, error: 'Compressão falhou' };
    }
    
  } catch (error) {
    console.log('❌ Erro:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Cria uma imagem de teste simples
 */
function createTestImage(filename, width = 800, height = 600) {
  const sharp = require('sharp');
  
  return sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 100, g: 150, b: 200 }
    }
  })
  .jpeg({ quality: 90 })
  .toFile(filename)
  .then(() => {
    const stats = fs.statSync(filename);
    console.log(`📸 Imagem de teste criada: ${filename} (${(stats.size / 1024).toFixed(2)} KB)`);
  });
}

/**
 * Executa todos os testes
 */
async function runTests() {
  console.log('🧪 Iniciando testes do Image Compressor Premium');
  console.log('=' .repeat(50));
  
  // Verificar se o servidor está rodando
  try {
    await axios.get(`${BASE_URL}/api/compress`);
  } catch (error) {
    console.log('❌ Servidor não está rodando!');
    console.log('💡 Execute: npm run dev');
    process.exit(1);
  }
  
  // Criar imagens de teste
  console.log('\n📸 Criando imagens de teste...');
  await createTestImage('test-small.jpg', 400, 300);
  await createTestImage('test-medium.jpg', 1200, 900);
  await createTestImage('test-large.jpg', 2000, 1500);
  
  // Configurações de teste
  const testConfigs = [
    {
      name: 'Teste Básico - JPEG 470KB',
      settings: { format: 'jpeg', targetSize: 470, includePDF: false },
      image: 'test-small.jpg'
    },
    {
      name: 'Teste Médio - PNG 300KB',
      settings: { format: 'png', targetSize: 300, includePDF: false },
      image: 'test-medium.jpg'
    },
    {
      name: 'Teste Grande - WebP 200KB',
      settings: { format: 'webp', targetSize: 200, includePDF: true },
      image: 'test-large.jpg'
    },
    {
      name: 'Teste Extremo - JPEG 100KB',
      settings: { format: 'jpeg', targetSize: 100, includePDF: false },
      image: 'test-large.jpg'
    }
  ];
  
  const results = [];
  
  // Executar testes
  for (const test of testConfigs) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 ${test.name}`);
    console.log(`${'='.repeat(50)}`);
    
    const result = await testImageCompression(test.image, test.settings);
    results.push({
      name: test.name,
      ...result
    });
    
    // Aguardar um pouco entre testes
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Relatório final
  console.log(`\n${'='.repeat(50)}`);
  console.log('📊 RELATÓRIO FINAL DOS TESTES');
  console.log(`${'='.repeat(50)}`);
  
  const successful = results.filter(r => r.success).length;
  const targetAchieved = results.filter(r => r.targetAchieved).length;
  const avgCompression = results
    .filter(r => r.success && r.stats)
    .reduce((sum, r) => sum + r.stats.compressionRatio, 0) / successful;
  const avgTime = results
    .filter(r => r.success && r.stats)
    .reduce((sum, r) => sum + r.stats.processingTimeMs, 0) / successful;
  
  console.log(`✅ Testes bem-sucedidos: ${successful}/${results.length}`);
  console.log(`🎯 Target size atingido: ${targetAchieved}/${results.length}`);
  console.log(`📈 Compressão média: ${avgCompression.toFixed(2)}%`);
  console.log(`⏱️  Tempo médio: ${avgTime.toFixed(0)}ms`);
  
  // Detalhes por teste
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    const target = result.targetAchieved ? '🎯' : '⚠️';
    console.log(`${status} ${target} ${result.name}`);
  });
  
  // Limpeza
  console.log('\n🧹 Limpando arquivos de teste...');
  ['test-small.jpg', 'test-medium.jpg', 'test-large.jpg'].forEach(file => {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      console.log(`🗑️  Removido: ${file}`);
    }
  });
  
  console.log('\n🎉 Testes concluídos!');
  
  // Exit code baseado nos resultados
  process.exit(successful === results.length ? 0 : 1);
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testImageCompression, runTests };
