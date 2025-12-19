const XLSX = require('xlsx');
const path = require('path');

const jogos = [
  {
    nome: 'Money Mouse',
    rtp: 96.5,
    volatilidade: 'Média',
    apostaMinima: 0.20,
    multiplicadorMaximo: 5000,
    frequenciaBonus: 180
  },
  {
    nome: '888 Gold',
    rtp: 96.0,
    volatilidade: 'Baixa',
    apostaMinima: 0.10,
    multiplicadorMaximo: 1000,
    frequenciaBonus: 250
  },
  {
    nome: 'Gates of Olympus',
    rtp: 96.5,
    volatilidade: 'Alta',
    apostaMinima: 0.50,
    multiplicadorMaximo: 5000,
    frequenciaBonus: 150
  },
  {
    nome: 'Fortune Tiger',
    rtp: 96.8,
    volatilidade: 'Média-Alta',
    apostaMinima: 0.30,
    multiplicadorMaximo: 2500,
    frequenciaBonus: 200
  },
  {
    nome: 'Tigre Sortudo 1000',
    rtp: 96.2,
    volatilidade: 'Média',
    apostaMinima: 0.25,
    multiplicadorMaximo: 1000,
    frequenciaBonus: 220
  },
  {
    nome: 'Sweet Bonanza',
    rtp: 96.5,
    volatilidade: 'Média-Alta',
    apostaMinima: 0.40,
    multiplicadorMaximo: 21000,
    frequenciaBonus: 170
  },
  {
    nome: 'Book of Dead',
    rtp: 96.2,
    volatilidade: 'Alta',
    apostaMinima: 0.50,
    multiplicadorMaximo: 5000,
    frequenciaBonus: 160
  },
  {
    nome: 'Big Bass Bonanza',
    rtp: 96.7,
    volatilidade: 'Alta',
    apostaMinima: 0.60,
    multiplicadorMaximo: 2100,
    frequenciaBonus: 140
  },
  {
    nome: 'Starburst',
    rtp: 96.1,
    volatilidade: 'Baixa',
    apostaMinima: 0.10,
    multiplicadorMaximo: 500,
    frequenciaBonus: 300
  },
  {
    nome: 'Reactoonz',
    rtp: 96.5,
    volatilidade: 'Alta',
    apostaMinima: 0.40,
    multiplicadorMaximo: 4570,
    frequenciaBonus: 175
  }
];

// Criar worksheet
const worksheet = XLSX.utils.json_to_sheet(jogos);

// Criar workbook
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Jogos Cactus');

// Salvar arquivo
const outputPath = path.join(__dirname, '..', 'client', 'public', 'jogos-cactus-exemplo.xlsx');
XLSX.writeFile(workbook, outputPath);

console.log('✓ Arquivo criado com sucesso:', outputPath);
console.log('✓', jogos.length, 'jogos incluídos');
