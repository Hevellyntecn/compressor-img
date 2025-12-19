'use client';

import React, { useState } from 'react';
import { Calendar, Plus, Trash2, CheckCircle, Clock } from 'lucide-react';

interface Demanda {
  id: string;
  texto: string;
  tipo: 'sazonal' | 'reativacao' | 'copy';
  dia?: string;
  concluida: boolean;
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

  // Adicionar nova demanda
  const adicionarDemanda = () => {
    if (!novaDemanda.trim()) return;

    // Validações
    const sazonais = demandas.filter(d => d.tipo === 'sazonal').length;
    const reativacoes = demandas.filter(d => d.tipo === 'reativacao').length;

    if (tipoDemanda === 'sazonal' && sazonais >= 7) {
      alert('Máximo de 7 sazonais por semana!');
      return;
    }

    if (tipoDemanda === 'reativacao' && reativacoes >= 3) {
      alert('Máximo de 3 reativações/ativações por semana!');
      return;
    }

    const nova: Demanda = {
      id: Date.now().toString(),
      texto: novaDemanda,
      tipo: tipoDemanda,
      concluida: false
    };

    setDemandas([...demandas, nova]);
    setNovaDemanda('');
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
  };

  const contadores = {
    sazonais: demandas.filter(d => d.tipo === 'sazonal').length,
    reativacoes: demandas.filter(d => d.tipo === 'reativacao').length,
    copys: demandas.filter(d => d.tipo === 'copy').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calendar className="w-10 h-10 text-purple-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Relatório Semanal
            </h1>
          </div>
          <p className="text-gray-600">
            Gerencie suas demandas da semana com organização automática
          </p>
        </div>

        {/* Contadores */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sazonais</p>
                <p className="text-3xl font-bold text-purple-600">
                  {contadores.sazonais}/7
                </p>
              </div>
              <Clock className="w-10 h-10 text-purple-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-pink-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reativações/Ativações</p>
                <p className="text-3xl font-bold text-pink-600">
                  {contadores.reativacoes}/3
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-pink-400" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Copys</p>
                <p className="text-3xl font-bold text-blue-600">
                  {contadores.copys}
                </p>
              </div>
              <Calendar className="w-10 h-10 text-blue-400" />
            </div>
          </div>
        </div>

        {/* Formulário de Adição */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Adicionar Nova Demanda
          </h2>

          <div className="space-y-4">
            {/* Tipo de Demanda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Demanda
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTipoDemanda('sazonal')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    tipoDemanda === 'sazonal'
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Sazonal
                </button>
                <button
                  onClick={() => setTipoDemanda('reativacao')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    tipoDemanda === 'reativacao'
                      ? 'bg-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Reativação/Ativação
                </button>
                <button
                  onClick={() => setTipoDemanda('copy')}
                  className={`py-3 px-4 rounded-lg font-medium transition-all ${
                    tipoDemanda === 'copy'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Texto da Demanda */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição da Demanda
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={novaDemanda}
                  onChange={(e) => setNovaDemanda(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && adicionarDemanda()}
                  placeholder="Digite a demanda aqui..."
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition-colors"
                />
                <button
                  onClick={adicionarDemanda}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
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
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Demandas Cadastradas ({demandas.length})
              </h2>
              <button
                onClick={distribuirDemandas}
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Calendar className="w-5 h-5" />
                Distribuir pela Semana
              </button>
            </div>

            <div className="space-y-3">
              {demandas.map((demanda) => (
                <div
                  key={demanda.id}
                  className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                    demanda.tipo === 'sazonal'
                      ? 'bg-purple-50 border-purple-200'
                      : demanda.tipo === 'reativacao'
                      ? 'bg-pink-50 border-pink-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <button
                      onClick={() => toggleConcluida(demanda.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        demanda.concluida
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {demanda.concluida && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          demanda.concluida ? 'line-through text-gray-400' : 'text-gray-800'
                        }`}
                      >
                        {demanda.texto}
                      </p>
                      <p className="text-sm text-gray-500 capitalize">
                        {demanda.tipo === 'reativacao' ? 'Reativação/Ativação' : demanda.tipo}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removerDemanda(demanda.id)}
                    className="text-red-500 hover:text-red-700 transition-colors p-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Distribuição Semanal */}
        {distribuicao && (
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-purple-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Planejamento Semanal
              </h2>
              <button
                onClick={resetarSemana}
                className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Resetar Semana
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Segunda */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3 text-center">
                  Segunda-feira
                </h3>
                <p className="text-xs text-blue-600 mb-3 text-center">
                  Criação de Copys
                </p>
                <div className="space-y-2">
                  {distribuicao.segunda.map((d) => (
                    <div
                      key={d.id}
                      className="bg-white rounded-lg p-3 text-sm border border-blue-200"
                    >
                      <p className="font-medium text-gray-800">{d.texto}</p>
                    </div>
                  ))}
                  {distribuicao.segunda.length === 0 && (
                    <p className="text-center text-gray-400 text-sm">Nenhuma copy</p>
                  )}
                </div>
              </div>

              {/* Terça */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                <h3 className="font-bold text-purple-800 mb-3 text-center">
                  Terça-feira
                </h3>
                <p className="text-xs text-purple-600 mb-3 text-center">
                  Início das Criações
                </p>
                <div className="space-y-2">
                  {distribuicao.terca.map((d) => (
                    <div
                      key={d.id}
                      className={`bg-white rounded-lg p-3 text-sm border ${
                        d.tipo === 'sazonal' ? 'border-purple-200' : 'border-pink-200'
                      }`}
                    >
                      <p className="font-medium text-gray-800">{d.texto}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {d.tipo === 'reativacao' ? 'Reativação' : d.tipo}
                      </p>
                    </div>
                  ))}
                  {distribuicao.terca.length === 0 && (
                    <p className="text-center text-gray-400 text-sm">Nenhuma demanda</p>
                  )}
                </div>
              </div>

              {/* Quarta */}
              <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4 border-2 border-pink-200">
                <h3 className="font-bold text-pink-800 mb-3 text-center">
                  Quarta-feira
                </h3>
                <p className="text-xs text-pink-600 mb-3 text-center">
                  Continuação
                </p>
                <div className="space-y-2">
                  {distribuicao.quarta.map((d) => (
                    <div
                      key={d.id}
                      className={`bg-white rounded-lg p-3 text-sm border ${
                        d.tipo === 'sazonal' ? 'border-purple-200' : 'border-pink-200'
                      }`}
                    >
                      <p className="font-medium text-gray-800">{d.texto}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {d.tipo === 'reativacao' ? 'Reativação' : d.tipo}
                      </p>
                    </div>
                  ))}
                  {distribuicao.quarta.length === 0 && (
                    <p className="text-center text-gray-400 text-sm">Nenhuma demanda</p>
                  )}
                </div>
              </div>

              {/* Quinta */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
                <h3 className="font-bold text-green-800 mb-3 text-center">
                  Quinta-feira
                </h3>
                <p className="text-xs text-green-600 mb-3 text-center">
                  Continuação
                </p>
                <div className="space-y-2">
                  {distribuicao.quinta.map((d) => (
                    <div
                      key={d.id}
                      className={`bg-white rounded-lg p-3 text-sm border ${
                        d.tipo === 'sazonal' ? 'border-purple-200' : 'border-pink-200'
                      }`}
                    >
                      <p className="font-medium text-gray-800">{d.texto}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {d.tipo === 'reativacao' ? 'Reativação' : d.tipo}
                      </p>
                    </div>
                  ))}
                  {distribuicao.quinta.length === 0 && (
                    <p className="text-center text-gray-400 text-sm">Nenhuma demanda</p>
                  )}
                </div>
              </div>

              {/* Sexta */}
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                <h3 className="font-bold text-orange-800 mb-3 text-center">
                  Sexta-feira
                </h3>
                <p className="text-xs text-orange-600 mb-3 text-center">
                  Finalização
                </p>
                <div className="space-y-2">
                  {distribuicao.sexta.map((d) => (
                    <div
                      key={d.id}
                      className={`bg-white rounded-lg p-3 text-sm border ${
                        d.tipo === 'sazonal' ? 'border-purple-200' : 'border-pink-200'
                      }`}
                    >
                      <p className="font-medium text-gray-800">{d.texto}</p>
                      <p className="text-xs text-gray-500 mt-1 capitalize">
                        {d.tipo === 'reativacao' ? 'Reativação' : d.tipo}
                      </p>
                    </div>
                  ))}
                  {distribuicao.sexta.length === 0 && (
                    <p className="text-center text-gray-400 text-sm">Nenhuma demanda</p>
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
