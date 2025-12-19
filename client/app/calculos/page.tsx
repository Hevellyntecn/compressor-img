'use client';

import React, { useState } from 'react';
import { Calculator, Search, DollarSign, Gamepad2, TrendingUp } from 'lucide-react';

interface Jogo {
  codigo: number;
  nome: string;
  ganhoMaximo: string;
  multiplicador: string;
  custoRodada: number;
  dono: string;
  descricao: string;
}

interface Oferta {
  valorBotao: number;
  giros: number;
  oferta: string;
  custo: number;
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
            <Gamepad2 className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Calculadora de Giros
            </h1>
          </div>
          <p className="text-gray-300">
            Calcule quantos giros você recebe baseado no valor e no jogo selecionado
          </p>
        </div>

        {/* Seleção de Jogo */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-purple-400" />
            Selecione o Jogo
          </h2>

          {/* Busca */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, código ou provedor..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
            </div>
          </div>

          {/* Lista de Jogos */}
          <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
            {jogosFiltrados.map((jogo) => (
              <button
                key={`${jogo.codigo}-${jogo.custoRodada}`}
                onClick={() => setJogoSelecionado(jogo)}
                className={`text-left p-4 rounded-lg border transition-all ${
                  jogoSelecionado?.codigo === jogo.codigo && jogoSelecionado?.custoRodada === jogo.custoRodada
                    ? 'bg-purple-900/40 border-purple-500'
                    : 'bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{jogo.nome}</p>
                    <p className="text-sm text-gray-400">
                      Código: {jogo.codigo} | {jogo.dono} | Custo: R$ {jogo.custoRodada.toFixed(2)}/rodada
                    </p>
                  </div>
                  {jogoSelecionado?.codigo === jogo.codigo && jogoSelecionado?.custoRodada === jogo.custoRodada && (
                    <div className="bg-purple-500 w-6 h-6 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {jogosFiltrados.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhum jogo encontrado</p>
            </div>
          )}
        </div>

        {/* Informações do Jogo Selecionado */}
        {jogoSelecionado && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-purple-500/30">
            <h2 className="text-2xl font-bold text-white mb-4">
              {jogoSelecionado.nome}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Código</p>
                <p className="text-white font-medium">{jogoSelecionado.codigo}</p>
              </div>
              <div>
                <p className="text-gray-400">Provedor</p>
                <p className="text-white font-medium">{jogoSelecionado.dono}</p>
              </div>
              <div>
                <p className="text-gray-400">Custo/Rodada</p>
                <p className="text-purple-400 font-medium">R$ {jogoSelecionado.custoRodada.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">Ganho Máximo</p>
                <p className="text-green-400 font-medium">{jogoSelecionado.ganhoMaximo}</p>
              </div>
            </div>
          </div>
        )}

        {/* Cálculo de Giros */}
        {jogoSelecionado && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-green-400" />
              Calcular Giros
            </h2>

            {/* Valor do Botão */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Valor do Botão (R$)
              </label>
              <input
                type="number"
                value={valorBotao || ''}
                onChange={(e) => setValorBotao(parseFloat(e.target.value) || 0)}
                min="0"
                step="1"
                placeholder="Digite o valor"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all text-lg"
              />
            </div>

            {/* Valores Sugeridos */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Valores Sugeridos
              </label>
              <div className="grid grid-cols-5 gap-2">
                {valoresSugeridos.map((valor) => (
                  <button
                    key={valor}
                    onClick={() => setValorBotao(valor)}
                    className={`py-2 px-4 rounded-lg font-medium transition-all ${
                      valorBotao === valor
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    R$ {valor}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview do Cálculo */}
            {valorBotao > 0 && (
              <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-400 text-sm">Valor do Botão</p>
                    <p className="text-white font-bold text-xl">R$ {valorBotao.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Giros</p>
                    <p className="text-purple-400 font-bold text-xl">
                      {Math.floor(valorBotao / jogoSelecionado.custoRodada)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Custo Real</p>
                    <p className="text-green-400 font-bold text-xl">
                      R$ {(Math.floor(valorBotao / jogoSelecionado.custoRodada) * jogoSelecionado.custoRodada).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botão Calcular */}
            <div className="flex gap-4">
              <button
                onClick={calcularGiros}
                disabled={!jogoSelecionado || valorBotao <= 0}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Calculator className="w-5 h-5" />
                Adicionar Oferta
              </button>
              {ofertas.length > 0 && (
                <button
                  onClick={limparOfertas}
                  className="bg-gray-700 text-white px-6 py-4 rounded-lg font-medium hover:bg-gray-600 transition-all"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        )}

        {/* Tabela de Ofertas */}
        {ofertas.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-700/50">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              Ofertas Calculadas
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-yellow-500">
                  <tr className="border-b border-gray-700">
                    <th className="text-center py-3 px-4 text-gray-900 font-bold">Oferta</th>
                    <th className="text-center py-3 px-4 text-gray-900 font-bold">Valor Botão</th>
                    <th className="text-center py-3 px-4 text-gray-900 font-bold">Giros</th>
                    <th className="text-center py-3 px-4 text-gray-900 font-bold">Oferta</th>
                    <th className="text-center py-3 px-4 text-gray-900 font-bold">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {ofertas.map((oferta, index) => (
                    <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20 transition-colors">
                      <td className="py-4 px-4 text-center text-white font-medium">
                        Oferta {index + 1}
                      </td>
                      <td className="py-4 px-4 text-center text-blue-400 font-medium">
                        {oferta.valorBotao}
                      </td>
                      <td className="py-4 px-4 text-center text-purple-400 font-bold text-lg">
                        {oferta.giros}
                      </td>
                      <td className="py-4 px-4 text-center text-white">
                        {oferta.oferta}
                      </td>
                      <td className="py-4 px-4 text-center text-green-400 font-medium">
                        R$ {oferta.custo.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumo */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total de Ofertas</p>
                <p className="text-white font-bold text-2xl">{ofertas.length}</p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total de Giros</p>
                <p className="text-purple-400 font-bold text-2xl">
                  {ofertas.reduce((sum, o) => sum + o.giros, 0)}
                </p>
              </div>
              <div className="bg-gray-700/30 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Custo Total</p>
                <p className="text-green-400 font-bold text-2xl">
                  R$ {ofertas.reduce((sum, o) => sum + o.custo, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}
