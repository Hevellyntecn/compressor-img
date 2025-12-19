'use client';

import React, { useState } from 'react';
import { Calculator, Upload, Download, FileSpreadsheet, TrendingUp, DollarSign } from 'lucide-react';
import * as XLSX from 'xlsx';

interface JogoCalculo {
  nome: string;
  rtp: number;
  volatilidade: string;
  apostaMinimaRecomendada: number;
  multiplicadorMaximo: number;
  frequenciaBonusEstimada: number;
}

interface ResultadoCalculo {
  jogo: string;
  investimentoSugerido: number;
  retornoEstimado: number;
  lucroEstimado: number;
  numeroRodadasRecomendadas: number;
  tempoJogoEstimado: number;
  risco: 'Baixo' | 'Médio' | 'Alto';
}

export default function CalculosPage() {
  const [jogos, setJogos] = useState<JogoCalculo[]>([]);
  const [resultados, setResultados] = useState<ResultadoCalculo[]>([]);
  const [saldoInicial, setSaldoInicial] = useState<number>(100);
  const [tempoDisponivel, setTempoDisponivel] = useState<number>(60); // minutos
  const [perfilRisco, setPerfilRisco] = useState<'conservador' | 'moderado' | 'agressivo'>('moderado');
  const [carregando, setCarregando] = useState(false);

  // Dados padrão de jogos da Cactus Gaming
  const jogosDefault: JogoCalculo[] = [
    {
      nome: 'Money Mouse',
      rtp: 96.5,
      volatilidade: 'Média',
      apostaMinimaRecomendada: 0.20,
      multiplicadorMaximo: 5000,
      frequenciaBonusEstimada: 180
    },
    {
      nome: '888 Gold',
      rtp: 96.0,
      volatilidade: 'Baixa',
      apostaMinimaRecomendada: 0.10,
      multiplicadorMaximo: 1000,
      frequenciaBonusEstimada: 250
    },
    {
      nome: 'Gates of Olympus',
      rtp: 96.5,
      volatilidade: 'Alta',
      apostaMinimaRecomendada: 0.50,
      multiplicadorMaximo: 5000,
      frequenciaBonusEstimada: 150
    },
    {
      nome: 'Fortune Tiger',
      rtp: 96.8,
      volatilidade: 'Média-Alta',
      apostaMinimaRecomendada: 0.30,
      multiplicadorMaximo: 2500,
      frequenciaBonusEstimada: 200
    },
    {
      nome: 'Tigre Sortudo 1000',
      rtp: 96.2,
      volatilidade: 'Média',
      apostaMinimaRecomendada: 0.25,
      multiplicadorMaximo: 1000,
      frequenciaBonusEstimada: 220
    }
  ];

  // Carregar arquivo XLSX
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setCarregando(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet) as any[];

        const jogosImportados: JogoCalculo[] = json.map((row) => ({
          nome: row.nome || row.Nome || row.jogo || row.Jogo,
          rtp: parseFloat(row.rtp || row.RTP || 96),
          volatilidade: row.volatilidade || row.Volatilidade || 'Média',
          apostaMinimaRecomendada: parseFloat(row.apostaMinima || row.aposta_minima || 0.20),
          multiplicadorMaximo: parseInt(row.multiplicadorMaximo || row.multiplicador_maximo || 1000),
          frequenciaBonusEstimada: parseInt(row.frequenciaBonus || row.frequencia_bonus || 200)
        }));

        setJogos(jogosImportados);
        alert(`${jogosImportados.length} jogos importados com sucesso!`);
      } catch (error) {
        console.error('Erro ao ler arquivo:', error);
        alert('Erro ao importar arquivo. Verifique o formato.');
      } finally {
        setCarregando(false);
      }
    };

    reader.readAsBinaryString(file);
  };

  // Usar jogos padrão
  const usarJogosPadrao = () => {
    setJogos(jogosDefault);
    alert('Jogos padrão carregados!');
  };

  // Calcular investimentos e retornos
  const calcularInvestimentos = () => {
    if (jogos.length === 0) {
      alert('Carregue jogos antes de calcular!');
      return;
    }

    const resultadosCalculados: ResultadoCalculo[] = jogos.map((jogo) => {
      // Ajuste baseado no perfil de risco
      const multiplicadorRisco = perfilRisco === 'conservador' ? 0.7 : perfilRisco === 'moderado' ? 1.0 : 1.3;
      
      // Investimento sugerido baseado no saldo e número de jogos
      const investimentoPorJogo = (saldoInicial / jogos.length) * multiplicadorRisco;
      
      // Número de rodadas baseado no tempo disponível (estimativa: 10 rodadas/minuto)
      const numeroRodadas = Math.floor((tempoDisponivel / jogos.length) * 10);
      
      // Retorno estimado baseado no RTP
      const retornoEstimado = investimentoPorJogo * (jogo.rtp / 100);
      
      // Lucro estimado
      const lucroEstimado = retornoEstimado - investimentoPorJogo;
      
      // Tempo de jogo estimado
      const tempoJogo = numeroRodadas / 10; // minutos
      
      // Classificação de risco baseada na volatilidade
      let risco: 'Baixo' | 'Médio' | 'Alto';
      if (jogo.volatilidade.toLowerCase().includes('baixa')) {
        risco = 'Baixo';
      } else if (jogo.volatilidade.toLowerCase().includes('alta')) {
        risco = 'Alto';
      } else {
        risco = 'Médio';
      }

      return {
        jogo: jogo.nome,
        investimentoSugerido: investimentoPorJogo,
        retornoEstimado,
        lucroEstimado,
        numeroRodadasRecomendadas: numeroRodadas,
        tempoJogoEstimado: tempoJogo,
        risco
      };
    });

    setResultados(resultadosCalculados);
  };

  // Exportar resultados para XLSX
  const exportarResultados = () => {
    if (resultados.length === 0) {
      alert('Nenhum resultado para exportar!');
      return;
    }

    const dados = resultados.map((r) => ({
      'Jogo': r.jogo,
      'Investimento Sugerido (R$)': r.investimentoSugerido.toFixed(2),
      'Retorno Estimado (R$)': r.retornoEstimado.toFixed(2),
      'Lucro Estimado (R$)': r.lucroEstimado.toFixed(2),
      'Rodadas Recomendadas': r.numeroRodadasRecomendadas,
      'Tempo de Jogo (min)': r.tempoJogoEstimado.toFixed(0),
      'Nível de Risco': r.risco
    }));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cálculos');
    XLSX.writeFile(workbook, `calculos-cactus-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalInvestimento = resultados.reduce((sum, r) => sum + r.investimentoSugerido, 0);
  const totalRetorno = resultados.reduce((sum, r) => sum + r.retornoEstimado, 0);
  const totalLucro = resultados.reduce((sum, r) => sum + r.lucroEstimado, 0);

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calculator className="w-10 h-10 text-green-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              Cálculos Cactus Gaming
            </h1>
          </div>
          <p className="text-gray-300">
            Sistema inteligente de cálculo de investimento e retorno para jogos
          </p>
        </div>

        {/* Configurações */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-400" />
            Configurações de Cálculo
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Saldo Inicial */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Saldo Inicial (R$)
              </label>
              <input
                type="number"
                value={saldoInicial}
                onChange={(e) => setSaldoInicial(parseFloat(e.target.value) || 0)}
                min="0"
                step="10"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>

            {/* Tempo Disponível */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tempo Disponível (min)
              </label>
              <input
                type="number"
                value={tempoDisponivel}
                onChange={(e) => setTempoDisponivel(parseFloat(e.target.value) || 0)}
                min="0"
                step="5"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              />
            </div>

            {/* Perfil de Risco */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Perfil de Risco
              </label>
              <select
                value={perfilRisco}
                onChange={(e) => setPerfilRisco(e.target.value as any)}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
              >
                <option value="conservador">Conservador</option>
                <option value="moderado">Moderado</option>
                <option value="agressivo">Agressivo</option>
              </select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" />
                Importar XLSX
              </div>
            </label>

            <button
              onClick={usarJogosPadrao}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
            >
              <FileSpreadsheet className="w-5 h-5" />
              Usar Jogos Padrão
            </button>

            <button
              onClick={calcularInvestimentos}
              disabled={jogos.length === 0}
              className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="w-5 h-5" />
              Calcular
            </button>
          </div>

          {jogos.length > 0 && (
            <div className="mt-4 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm">
                ✓ {jogos.length} jogos carregados
              </p>
            </div>
          )}
        </div>

        {/* Resumo dos Resultados */}
        {resultados.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Investimento Total</p>
                    <p className="text-3xl font-bold text-blue-400">
                      R$ {totalInvestimento.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-10 h-10 text-blue-400/50" />
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-green-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Retorno Estimado</p>
                    <p className="text-3xl font-bold text-green-400">
                      R$ {totalRetorno.toFixed(2)}
                    </p>
                  </div>
                  <TrendingUp className="w-10 h-10 text-green-400/50" />
                </div>
              </div>

              <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border ${totalLucro >= 0 ? 'border-green-500/30' : 'border-red-500/30'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Lucro Estimado</p>
                    <p className={`text-3xl font-bold ${totalLucro >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      R$ {totalLucro.toFixed(2)}
                    </p>
                  </div>
                  <Calculator className={`w-10 h-10 ${totalLucro >= 0 ? 'text-green-400/50' : 'text-red-400/50'}`} />
                </div>
              </div>
            </div>

            {/* Tabela de Resultados */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-700/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  Resultados Detalhados
                </h2>
                <button
                  onClick={exportarResultados}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Exportar XLSX
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-300 font-medium">Jogo</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">Investimento</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">Retorno Est.</th>
                      <th className="text-right py-3 px-4 text-gray-300 font-medium">Lucro Est.</th>
                      <th className="text-center py-3 px-4 text-gray-300 font-medium">Rodadas</th>
                      <th className="text-center py-3 px-4 text-gray-300 font-medium">Tempo (min)</th>
                      <th className="text-center py-3 px-4 text-gray-300 font-medium">Risco</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultados.map((resultado, index) => (
                      <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                        <td className="py-4 px-4 text-white font-medium">{resultado.jogo}</td>
                        <td className="py-4 px-4 text-right text-blue-400">
                          R$ {resultado.investimentoSugerido.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-right text-green-400">
                          R$ {resultado.retornoEstimado.toFixed(2)}
                        </td>
                        <td className={`py-4 px-4 text-right font-medium ${resultado.lucroEstimado >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          R$ {resultado.lucroEstimado.toFixed(2)}
                        </td>
                        <td className="py-4 px-4 text-center text-gray-300">
                          {resultado.numeroRodadasRecomendadas}
                        </td>
                        <td className="py-4 px-4 text-center text-gray-300">
                          {resultado.tempoJogoEstimado.toFixed(0)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            resultado.risco === 'Baixo' ? 'bg-green-900/40 text-green-300 border border-green-500/30' :
                            resultado.risco === 'Médio' ? 'bg-yellow-900/40 text-yellow-300 border border-yellow-500/30' :
                            'bg-red-900/40 text-red-300 border border-red-500/30'
                          }`}>
                            {resultado.risco}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Estado vazio */}
        {jogos.length === 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-12 border border-gray-700/50 text-center">
            <FileSpreadsheet className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Nenhum jogo carregado
            </h3>
            <p className="text-gray-400 mb-6">
              Importe um arquivo XLSX ou use os jogos padrão para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
