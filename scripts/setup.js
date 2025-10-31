/**
 * 🛠️ Script de Configuração - Image Compressor Premium
 * 
 * Script para configurar o ambiente de desenvolvimento
 * Execute com: node scripts/setup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Configurando Image Compressor Premium...');
console.log('=' .repeat(50));

/**
 * Verifica se uma dependência está instalada
 */
function checkDependency(dep) {
  try {
    require.resolve(dep);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Executa comando com output
 */
function runCommand(command, description) {
  console.log(`\n📦 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} concluído`);
  } catch (error) {
    console.log(`❌ Erro em ${description}:`, error.message);
    return false;
  }
  return true;
}

/**
 * Cria diretórios necessários
 */
function createDirectories() {
  console.log('\n📁 Criando diretórios...');
  
  const dirs = [
    'uploads',
    'processed',
    'client/build',
    'logs'
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ Criado: ${dir}`);
    } else {
      console.log(`📁 Já existe: ${dir}`);
    }
  });
}

/**
 * Cria arquivo de configuração de exemplo
 */
function createConfigFile() {
  console.log('\n⚙️  Criando arquivo de configuração...');
  
  const configContent = `# Configuração do Image Compressor Premium
# Copie este arquivo para .env e ajuste conforme necessário

# Ambiente
NODE_ENV=development
PORT=3000

# Limites
MAX_FILE_SIZE=52428800
MAX_TARGET_SIZE=1000000
MIN_TARGET_SIZE=100000

# Compressão
DEFAULT_QUALITY=90
MAX_ATTEMPTS=10
MAX_DIMENSION=2048

# Logs
LOG_LEVEL=info
LOG_FILE=logs/app.log

# Segurança
CORS_ORIGIN=*
RATE_LIMIT=100
RATE_WINDOW=900000
`;

  if (!fs.existsSync('.env.example')) {
    fs.writeFileSync('.env.example', configContent);
    console.log('✅ Criado: .env.example');
  } else {
    console.log('📄 Já existe: .env.example');
  }
}

/**
 * Verifica dependências do Node.js
 */
function checkNodeVersion() {
  console.log('\n🔍 Verificando versão do Node.js...');
  
  const version = process.version;
  const majorVersion = parseInt(version.slice(1).split('.')[0]);
  
  console.log(`📋 Versão atual: ${version}`);
  
  if (majorVersion < 18) {
    console.log('⚠️  Aviso: Recomenda-se Node.js 18+ para melhor performance');
  } else {
    console.log('✅ Versão do Node.js compatível');
  }
}

/**
 * Verifica dependências instaladas
 */
function checkDependencies() {
  console.log('\n🔍 Verificando dependências...');
  
  const dependencies = [
    'express',
    'sharp',
    'multer',
    'cors',
    'helmet',
    'compression',
    'pdf-lib'
  ];
  
  dependencies.forEach(dep => {
    if (checkDependency(dep)) {
      console.log(`✅ ${dep}`);
    } else {
      console.log(`❌ ${dep} - Execute: npm install`);
    }
  });
}

/**
 * Verifica dependências do cliente
 */
function checkClientDependencies() {
  console.log('\n🔍 Verificando dependências do cliente...');
  
  const clientDeps = [
    'react',
    'react-dom',
    'tailwindcss',
    'axios',
    'react-dropzone'
  ];
  
  // Verificar se está no diretório correto
  if (fs.existsSync('client/package.json')) {
    clientDeps.forEach(dep => {
      const clientPackagePath = path.join('client', 'node_modules', dep);
      if (fs.existsSync(clientPackagePath)) {
        console.log(`✅ client/${dep}`);
      } else {
        console.log(`❌ client/${dep} - Execute: cd client && npm install`);
      }
    });
  } else {
    console.log('⚠️  Diretório client não encontrado');
  }
}

/**
 * Testa a configuração
 */
function testConfiguration() {
  console.log('\n🧪 Testando configuração...');
  
  try {
    // Testar importação do servidor
    const serverPath = path.join(__dirname, '..', 'server.js');
    if (fs.existsSync(serverPath)) {
      console.log('✅ server.js encontrado');
    } else {
      console.log('❌ server.js não encontrado');
    }
    
    // Testar configuração do Vercel
    if (fs.existsSync('vercel.json')) {
      console.log('✅ vercel.json encontrado');
    } else {
      console.log('❌ vercel.json não encontrado');
    }
    
    // Testar Tailwind config
    const tailwindConfig = path.join('client', 'tailwind.config.js');
    if (fs.existsSync(tailwindConfig)) {
      console.log('✅ tailwind.config.js encontrado');
    } else {
      console.log('❌ tailwind.config.js não encontrado');
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar configuração:', error.message);
  }
}

/**
 * Gera relatório de setup
 */
function generateSetupReport() {
  console.log('\n📊 Gerando relatório de setup...');
  
  const report = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    architecture: process.arch,
    directories: {
      uploads: fs.existsSync('uploads'),
      processed: fs.existsSync('processed'),
      clientBuild: fs.existsSync('client/build')
    },
    files: {
      server: fs.existsSync('server.js'),
      vercel: fs.existsSync('vercel.json'),
      package: fs.existsSync('package.json'),
      clientPackage: fs.existsSync('client/package.json')
    }
  };
  
  fs.writeFileSync('setup-report.json', JSON.stringify(report, null, 2));
  console.log('✅ Relatório salvo em: setup-report.json');
}

/**
 * Função principal de setup
 */
async function setup() {
  try {
    checkNodeVersion();
    createDirectories();
    createConfigFile();
    checkDependencies();
    checkClientDependencies();
    testConfiguration();
    generateSetupReport();
    
    console.log('\n🎉 Setup concluído com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('1. Execute: npm install');
    console.log('2. Execute: cd client && npm install');
    console.log('3. Execute: npm run dev');
    console.log('4. Acesse: http://localhost:3000');
    console.log('\n📚 Documentação: README.md');
    console.log('🚀 Deploy: DEPLOYMENT.md');
    
  } catch (error) {
    console.log('\n❌ Erro durante o setup:', error.message);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setup();
}

module.exports = { setup };
