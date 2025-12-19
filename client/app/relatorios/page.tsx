'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Trash2, CheckCircle, Clock, FileText, Download } from 'lucide-react';

interface Demanda {
  id: string;
  texto: string;
  tipo: 'sazonal' | 'reativacao' | 'copy';
  dia?: string;
  concluida: boolean;
  cliente?: string;
  jogos?: { principal: string; downsell: string };
  jogosSeparados?: boolean; // true = 2 campanhas, false = 1 campanha com 2 jogos
}

interface DistribuicaoSemanal {
  segunda: Demanda[];
  terca: Demanda[];
  quarta: Demanda[];
  quinta: Demanda[];
  sexta: Demanda[];
}

export default function RelatoriosPage() {
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [novaDemanda, setNovaDemanda] = useState('');
  const [tipoDemanda, setTipoDemanda] = useState<'sazonal' | 'reativacao' | 'copy'>('sazonal');
  const [distribuicao, setDistribuicao] = useState<DistribuicaoSemanal | null>(null);
  const [cliente, setCliente] = useState('');
  const [jogoPrincipal, setJogoPrincipal] = useState('');
  const [jogoDownsell, setJogoDownsell] = useState('');
  const [jogosSeparados, setJogosSeparados] = useState(false);
  const [mensagemGerada, setMensagemGerada] = useState('');

  // Adicionar nova demanda
  const adicionarDemanda = () => {
    if (!novaDemanda.trim()) return;

    // Validações
    const sazonais = demandas.filter(d => d.tipo === 'sazonal');
    const totalCampanhasSazonais = sazonais.reduce((total, d) => {
      // Se são jogos separados, conta como 2 campanhas, senão conta como 1
      return total + (d.jogosSeparados ? 2 : 1);
    }, 0);

    const reativacoes = demandas.filter(d => d.tipo === 'reativacao').length;

    // Para sazonais, verificar se adicionar essa demanda ultrapassa 7 campanhas
    if (tipoDemanda === 'sazonal') {
      const novasCampanhas = jogosSeparados ? 2 : 1;
      if (totalCampanhasSazonais + novasCampanhas > 7) {
        alert(`Máximo de 7 campanhas sazonais por semana! (Você teria ${totalCampanhasSazonais + novasCampanhas})`);
        return;
      }
    }

    if (tipoDemanda === 'reativacao' && reativacoes >= 3) {
      alert('Máximo de 3 reativações/ativações por semana!');
      return;
    }

    const nova: Demanda = {
      id: Date.now().toString(),
      texto: novaDemanda,
      tipo: tipoDemanda,
      concluida: false,
      cliente: cliente.trim() || undefined,
      jogos: (jogoPrincipal && jogoDownsell) ? {
        principal: jogoPrincipal,
        downsell: jogoDownsell
      } : undefined,
      jogosSeparados: tipoDemanda === 'sazonal' ? jogosSeparados : undefined
    };

    setDemandas([...demandas, nova]);
    setNovaDemanda('');
    setCliente('');
    setJogoPrincipal('');
    setJogoDownsell('');
  };

  // Remover demanda
  const removerDemanda = (id: string) => {
    setDemandas(demandas.filter(d => d.id !== id));
  };

  // Marcar como concluída
  const toggleConcluida = (id: string) => {
    setDemandas(demandas.map(d => 
      d.id === id ? { ...d, concluida: !d.concluida } : d
    ));
  };

  // Distribuir demandas pela semana
  const distribuirDemandas = () => {
    const dist: DistribuicaoSemanal = {
      segunda: [],
      terca: [],
      quarta: [],
      quinta: [],
      sexta: []
    };

    // Segunda: Todas as copys
    const copys = demandas.filter(d => d.tipo === 'copy');
    dist.segunda = copys.map(d => ({ ...d, dia: 'segunda' }));

    // Terça a Sexta: Distribuir sazonais e reativações
    const sazonais = demandas.filter(d => d.tipo === 'sazonal');
    const reativacoes = demandas.filter(d => d.tipo === 'reativacao');

    // Combinar sazonais e reativações
    const trabalhos = [...sazonais, ...reativacoes];
    
    // Distribuir igualmente de terça a sexta (4 dias)
    const diasDisponiveis = ['terca', 'quarta', 'quinta', 'sexta'] as const;
    const porDia = Math.ceil(trabalhos.length / 4);

    trabalhos.forEach((demanda, index) => {
      const diaIndex = Math.floor(index / porDia);
      const dia = diasDisponiveis[Math.min(diaIndex, 3)];
      dist[dia].push({ ...demanda, dia });
    });

    setDistribuicao(dist);
  };

  // Resetar semana
  const resetarSemana = () => {
    setDemandas([]);
    setDistribuicao(null);
    setMensagemGerada('');
  };

  // Gerar mensagem para cliente
  const gerarMensagem = () => {
    const hoje = new Date();
    const dataFormatada = hoje.toLocaleDateString('pt-BR');
    const horaFormatada = hoje.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    let mensagem = `[${horaFormatada}, ${dataFormatada}] Bom dia! Muito obrigada\n`;
    mensagem += `[${horaFormatada}, ${dataFormatada}] Pessoal, segue nossa programação para hoje:\n\n`;

    // Campanhas Sazonais
    const sazonais = demandas.filter(d => d.tipo === 'sazonal' && !d.concluida);
    if (sazonais.length > 0) {
      mensagem += 'Campanhas Sazonais:\n';
      sazonais.forEach(sazonal => {
        if (sazonal.jogos) {
          if (sazonal.jogosSeparados) {
            // 2 campanhas separadas (1 dia = 2 jogos)
            mensagem += `- ${sazonal.jogos.principal}\n`;
            mensagem += `- ${sazonal.jogos.downsell}\n`;
          } else {
            // 1 campanha com 2 jogos
            mensagem += `- (Principal) ${sazonal.jogos.principal} | (Downsell) ${sazonal.jogos.downsell}\n`;
          }
        } else {
          mensagem += `- ${sazonal.texto}\n`;
        }
      });
      mensagem += '\n';
    }

    // Campanhas de Reativação
    const reativacoes = demandas.filter(d => d.tipo === 'reativacao' && !d.concluida);
    if (reativacoes.length > 0) {
      mensagem += 'Campanhas de Reativação:\n';
      reativacoes.forEach(reativacao => {
        mensagem += `- ${reativacao.texto}\n`;
      });
      mensagem += '\n';
    }

    // Campanhas enviadas para QA (concluídas)
    const concluidas = demandas.filter(d => d.concluida);
    if (concluidas.length > 0) {
      mensagem += 'Campanhas enviadas para QA:\n';
      concluidas.forEach(campanha => {
        if (campanha.jogos) {
          mensagem += `- ${dataFormatada} - ${campanha.jogos.principal} + ${campanha.jogos.downsell}\n`;
        } else {
          mensagem += `- ${dataFormatada} - ${campanha.texto}\n`;
        }
      });
    }

    setMensagemGerada(mensagem);
  };

  // Copiar mensagem
  const copiarMensagem = () => {
    navigator.clipboard.writeText(mensagemGerada);
    alert('Mensagem copiada para a área de transferência!');
  };

  const contadores = {
    sazonais: demandas.filter(d => d.tipo === 'sazonal').reduce((total, d) => {
      // Se são jogos separados, conta como 2 campanhas, senão conta como 1
      return total + (d.jogosSeparados ? 2 : 1);
    }, 0),
    reativacoes: demandas.filter(d => d.tipo === 'reativacao').length,
    copys: demandas.filter(d => d.tipo === 'copy').length
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calendar className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Relatório Semanal
            </h1>
          </div>
          <p className="text-gray-300">
            Gerencie suas demandas da semana com organização automática
          </p>
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sazonais</p>
                <p className="text-3xl font-bold text-purple-400">
                  {contadores.sazonais}/7
                </p>
              </div>
              <Clock className="w-10 h-10 text-purple-400/50" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-pink-500/30 hover:border-pink-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Reativações/Ativações</p>
                <p className="text-3xl font-bold text-pink-400">
                  {contadores.reativacoes}/3
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-pink-400/50" />
            </div>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-blue-500/30 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Copys</p>
                <p className="text-3xl font-bold text-blue-400">
                  {contadores.copys}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-400/50" />
            </div>
          </div>
        </div>

        {/* Formulário de Adição */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-6">
            Adicionar Nova Demanda
          </h2>

          <div className="space-y-4">
            {/* Tipo de Demanda */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Demanda
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTipoDemanda('sazonal')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    tipoDemanda === 'sazonal'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/50'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  Sazonal
                </button>
                <button
                  onClick={() => setTipoDemanda('reativacao')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    tipoDemanda === 'reativacao'
                      ? 'bg-gradient-to-r from-pink-600 to-pink-500 text-white shadow-lg shadow-pink-500/50'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  Reativação/Ativação
                </button>
                <button
                  onClick={() => setTipoDemanda('copy')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    tipoDemanda === 'copy'
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 border border-gray-600'
                  }`}
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Cliente (opcional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cliente (opcional)
              </label>
              <input
                type="text"
                value={cliente}
                onChange={(e) => setCliente(e.target.value)}
                placeholder="Nome do cliente..."
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-400"
              />
            </div>

            {/* Jogos (para sazonais) */}
            {tipoDemanda === 'sazonal' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Jogo Principal
                  </label>
                  <input
                    type="text"
                    value={jogoPrincipal}
                    onChange={(e) => setJogoPrincipal(e.target.value)}
                    placeholder="Ex: Money Mouse"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Jogo Downsell
                  </label>
                  <input
                    type="text"
                    value={jogoDownsell}
                    onChange={(e) => setJogoDownsell(e.target.value)}
                    placeholder="Ex: 888 Gold"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-400"
                  />
                </div>
              </div>
            )}

            {/* Jogos Separados ou Juntos */}
            {tipoDemanda === 'sazonal' && jogoPrincipal && jogoDownsell && (
              <div className="flex items-center gap-3 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                <input
                  type="checkbox"
                  id="jogosSeparados"
                  checked={jogosSeparados}
                  onChange={(e) => setJogosSeparados(e.target.checked)}
                  className="w-5 h-5 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                />
                <label htmlFor="jogosSeparados" className="text-sm text-gray-300">
                  <span className="font-medium">Jogos separados</span> (conta como 2 campanhas de 1 dia cada)
                  <br />
                  <span className="text-xs text-gray-400">
                    Desmarcado: 1 campanha com 2 jogos (Principal + Downsell)
                  </span>
                </label>
              </div>
            )}

            {/* Texto da Demanda */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Descrição da Demanda
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={novaDemanda}
                  onChange={(e) => setNovaDemanda(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && adicionarDemanda()}
                  placeholder="Digite a demanda aqui..."
                  className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 text-white rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all placeholder-gray-400"
                />
                <button
                  onClick={adicionarDemanda}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Demandas Adicionadas */}
        {demandas.length > 0 && !distribuicao && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Demandas Cadastradas ({demandas.length})
              </h2>
              <button
                onClick={distribuirDemandas}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Distribuir pela Semana
              </button>
            </div>

            <div className="space-y-3">
              {demandas.map((demanda) => (
                <div
                  key={demanda.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                    demanda.tipo === 'sazonal'
                      ? 'bg-purple-900/20 border-purple-500/30'
                      : demanda.tipo === 'reativacao'
                      ? 'bg-pink-900/20 border-pink-500/30'
                      : 'bg-blue-900/20 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleConcluida(demanda.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        demanda.concluida
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-500 hover:border-gray-400'
                      }`}
                    >
                      {demanda.concluida && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          demanda.concluida ? 'line-through text-gray-500' : 'text-white'
                        }`}
                      >
                        {demanda.texto}
                      </p>
                      {demanda.jogos && (
                        <p className="text-sm text-gray-300 mt-1">
                          {demanda.jogosSeparados ? (
                            <>🎮 {demanda.jogos.principal} + {demanda.jogos.downsell} (2 campanhas)</>
                          ) : (
                            <>🎮 Principal: {demanda.jogos.principal} | Downsell: {demanda.jogos.downsell}</>
                          )}
                        </p>
                      )}
                      {demanda.cliente && (
                        <p className="text-xs text-gray-400 mt-1">
                          👤 Cliente: {demanda.cliente}
                        </p>
                      )}
                      <p className="text-sm text-gray-400 capitalize mt-1">
                        📋 {demanda.tipo === 'reativacao' ? 'Reativação/Ativação' : demanda.tipo}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removerDemanda(demanda.id)}
                    className="text-red-400 hover:text-red-300 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gerador de Mensagens */}
        {demandas.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Mensagem para Cliente
              </h2>
              <button
                onClick={gerarMensagem}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-blue-500/50 transition-all flex items-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Gerar Mensagem
              </button>
            </div>

            {mensagemGerada && (
              <div className="space-y-4">
                <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4">
                  <pre className="text-gray-200 text-sm whitespace-pre-wrap font-mono">
                    {mensagemGerada}
                  </pre>
                </div>
                <button
                  onClick={copiarMensagem}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Copiar Mensagem
                </button>
              </div>
            )}
          </div>
        )}

        {/* Distribuição Semanal */}
        {distribuicao && (
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-700/50">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Planejamento Semanal
              </h2>
              <button
                onClick={resetarSemana}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all"
              >
                Resetar Semana
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Segunda */}
              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl p-4 border border-blue-500/30">
                <h3 className="font-bold text-blue-300 mb-3 text-center">
                  Segunda-feira
                </h3>
                <p className="text-xs text-blue-400 mb-3 text-center">
                  Criação de Copys
                </p>
                <div className="space-y-2">
                  {distribuicao.segunda.map((d) => (
                    <div
                      key={d.id}
                      className="bg-gray-700/50 rounded-lg p-3 text-sm border border-blue-500/20"
                    >
                      <p className="font-medium text-gray-200">{d.texto}</p>
                    </div>
                  ))}
                  {distribuicao.segunda.length === 0 && (
                    <p className="text-center text-gray-500 text-sm">Nenhuma copy</p>
                  )}
                </div>
              </div>

              {/* Terça */}
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl p-4 border border-purple-500/30">
                <h3 className="font-bold text-purple-300 mb-3 text-center">
                  Terça-feira
                </h3>
                <p className="text-xs text-purple-400 mb-3 text-center">
                  Início das Criações
                </p>
                <div className="space-y-2">
                  {distribuicao.terca.map((d) => (
                    <div
                      key={d.id}
                      className={`bg-gray-700/50 rounded-lg p-3 text-sm border ${
                        d.tipo === 'sazonal' ? 'border-purple-500/20' : 'border-pink-500/20'
                      }`}
                    >
                      <p className="font-medium text-gray-200">{d.texto}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {d.tipo === 'reativacao' ? 'Reativação' : d.tipo}
                      </p>
                    </div>
                  ))}
                  {distribuicao.terca.length === 0 && (
                    <p className="text-center text-gray-500 text-sm">Nenhuma demanda</p>
                  )}
                </div>
              </div>

              {/* Quarta */}
              <div className="bg-gradient-to-br from-pink-900/40 to-pink-800/40 rounded-xl p-4 border border-pink-500/30">
                <h3 className="font-bold text-pink-300 mb-3 text-center">
                  Quarta-feira
                </h3>
                <p className="text-xs text-pink-400 mb-3 text-center">
                  Continuação
                </p>
                <div className="space-y-2">
                  {distribuicao.quarta.map((d) => (
                    <div
                      key={d.id}
                      className={`bg-gray-700/50 rounded-lg p-3 text-sm border ${
                        d.tipo === 'sazonal' ? 'border-purple-500/20' : 'border-pink-500/20'
                      }`}
                    >
                      <p className="font-medium text-gray-200">{d.texto}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {d.tipo === 'reativacao' ? 'Reativação' : d.tipo}
                      </p>
                    </div>
                  ))}
                  {distribuicao.quarta.length === 0 && (
                    <p className="text-center text-gray-500 text-sm">Nenhuma demanda</p>
                  )}
                </div>
              </div>

              {/* Quinta */}
              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-xl p-4 border border-green-500/30">
                <h3 className="font-bold text-green-300 mb-3 text-center">
                  Quinta-feira
                </h3>
                <p className="text-xs text-green-400 mb-3 text-center">
                  Continuação
                </p>
                <div className="space-y-2">
                  {distribuicao.quinta.map((d) => (
                    <div
                      key={d.id}
                      className={`bg-gray-700/50 rounded-lg p-3 text-sm border ${
                        d.tipo === 'sazonal' ? 'border-purple-500/20' : 'border-pink-500/20'
                      }`}
                    >
                      <p className="font-medium text-gray-200">{d.texto}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {d.tipo === 'reativacao' ? 'Reativação' : d.tipo}
                      </p>
                    </div>
                  ))}
                  {distribuicao.quinta.length === 0 && (
                    <p className="text-center text-gray-500 text-sm">Nenhuma demanda</p>
                  )}
                </div>
              </div>

              {/* Sexta */}
              <div className="bg-gradient-to-br from-orange-900/40 to-orange-800/40 rounded-xl p-4 border border-orange-500/30">
                <h3 className="font-bold text-orange-300 mb-3 text-center">
                  Sexta-feira
                </h3>
                <p className="text-xs text-orange-400 mb-3 text-center">
                  Finalização
                </p>
                <div className="space-y-2">
                  {distribuicao.sexta.map((d) => (
                    <div
                      key={d.id}
                      className={`bg-gray-700/50 rounded-lg p-3 text-sm border ${
                        d.tipo === 'sazonal' ? 'border-purple-500/20' : 'border-pink-500/20'
                      }`}
                    >
                      <p className="font-medium text-gray-200">{d.texto}</p>
                      <p className="text-xs text-gray-400 mt-1 capitalize">
                        {d.tipo === 'reativacao' ? 'Reativação' : d.tipo}
                      </p>
                    </div>
                  ))}
                  {distribuicao.sexta.length === 0 && (
                    <p className="text-center text-gray-500 text-sm">Nenhuma demanda</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
