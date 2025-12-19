'use client';

import React, { useState } from 'react';
import { Calculator, Search, Gamepad2, TrendingUp } from 'lucide-react';

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
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null);
  const [valorBotao, setValorBotao] = useState<number>(0);
  const [ofertas, setOfertas] = useState<Oferta[]>([]);
  const [busca, setBusca] = useState('');

  // Lista completa de jogos
  const jogos: Jogo[] = [
    { codigo: 950, nome: 'AVIATOR', ganhoMaximo: 'R$ 50.000,00', multiplicador: '-', custoRodada: 10.00, dono: 'Spribe', descricao: '950 - AVIATOR - R$ 10,00 - Spribe' },
    { codigo: 951, nome: 'AVIATOR', ganhoMaximo: 'R$ 50.000,00', multiplicador: '-', custoRodada: 50.00, dono: 'Spribe', descricao: '951 - AVIATOR - R$ 50,00 - Spribe' },
    { codigo: 952, nome: 'AVIATOR', ganhoMaximo: 'R$ 50.000,00', multiplicador: '-', custoRodada: 100.00, dono: 'Spribe', descricao: '952 - AVIATOR - R$ 100,00 - Spribe' },
    { codigo: 953, nome: 'AVIATOR', ganhoMaximo: 'R$ 50.000,00', multiplicador: '-', custoRodada: 500.00, dono: 'Spribe', descricao: '953 - AVIATOR - R$ 500,00 - Spribe' },
    { codigo: 781, nome: 'Mines', ganhoMaximo: 'R$ 50.000,00', multiplicador: '5.044.291', custoRodada: 1.00, dono: 'Spribe', descricao: '781 - Mines - R$ 1,00 - Spribe' },
    { codigo: 784, nome: 'Gates of Olympus', ganhoMaximo: 'R$ 1.000,00', multiplicador: '5.000', custoRodada: 0.20, dono: 'Pragmatic Play', descricao: '784 - Gates of Olympus - R$ 0,20 - Pragmatic Play' },
    { codigo: 785, nome: "Joker's Jewels", ganhoMaximo: 'R$ 52,00', multiplicador: '1.040', custoRodada: 0.10, dono: 'Pragmatic Play', descricao: "785 - Joker's Jewels - R$ 0,10 - Pragmatic Play" },
    { codigo: 786, nome: 'Master Joker', ganhoMaximo: 'R$ 100,00', multiplicador: '10.000', custoRodada: 0.01, dono: 'Pragmatic Play', descricao: '786 - Master Joker - R$ 0,01 - Pragmatic Play' },
    { codigo: 789, nome: 'Diamond Strike', ganhoMaximo: 'R$ 186,90', multiplicador: '1.246', custoRodada: 0.15, dono: 'Pragmatic Play', descricao: '789 - Diamond Strike - R$ 0,15 - Pragmatic Play' },
    { codigo: 790, nome: 'Super 7S', ganhoMaximo: 'R$ 50,00', multiplicador: '1.000', custoRodada: 0.05, dono: 'Pragmatic Play', descricao: '790 - Super 7S - R$ 0,05 - Pragmatic Play' },
    { codigo: 787, nome: 'Big Bass Splash', ganhoMaximo: 'R$ 500,00', multiplicador: '5.000', custoRodada: 0.10, dono: 'Pragmatic Play', descricao: '787 - Big Bass Splash - R$ 0,10 - Pragmatic Play' },
    { codigo: 788, nome: 'Big Bass Bonanza', ganhoMaximo: 'R$ 200,00', multiplicador: '2.000', custoRodada: 0.10, dono: 'Pragmatic Play', descricao: '788 - Big Bass Bonanza - R$ 0,10 - Pragmatic Play' },
    { codigo: 827, nome: 'Sweet Bonanza 1000', ganhoMaximo: 'R$ 5.000,00', multiplicador: '25.000', custoRodada: 0.20, dono: 'Pragmatic Play', descricao: '827 - Sweet Bonanza 1000 - R$ 0,20 - Pragmatic Play' },
    { codigo: 828, nome: 'Sugar Rush 1000', ganhoMaximo: 'R$ 5.000,00', multiplicador: '2.500', custoRodada: 0.05, dono: 'Pragmatic Play', descricao: '828 - Sugar Rush 1000 - R$ 0,05 - Pragmatic Play' },
    { codigo: 829, nome: 'Starlight Princess', ganhoMaximo: 'R$ 5.000,00', multiplicador: '2.500', custoRodada: 0.20, dono: 'Pragmatic Play', descricao: '829 - Starlight Princess - R$ 0,20 - Pragmatic Play' },
    { codigo: 832, nome: 'Wild Ape', ganhoMaximo: 'R$ 4.000,00', multiplicador: '10.000', custoRodada: 0.40, dono: 'Pragmatic Play', descricao: '832 - Wild Ape - R$ 0,40 - Pragmatic Play' },
    { codigo: 833, nome: 'Fire Portals', ganhoMaximo: 'R$ 2.000,00', multiplicador: '10.000', custoRodada: 0.20, dono: 'Pragmatic Play', descricao: '833 - Fire Portals - R$ 0,20 - Pragmatic Play' },
    { codigo: 834, nome: 'Gates of Olympus 1000', ganhoMaximo: 'R$ 3.000,00', multiplicador: '15.000', custoRodada: 0.20, dono: 'Pragmatic Play', descricao: '834 - Gates of Olympus 1000 - R$ 0,20 - Pragmatic Play' },
    { codigo: 835, nome: 'Zeus vs Hades - Gods of War', ganhoMaximo: 'R$ 1.500,00', multiplicador: '15.000', custoRodada: 0.10, dono: 'Pragmatic Play', descricao: '835 - Zeus vs Hades - Gods of War - R$ 0,10 - Pragmatic Play' },
    { codigo: 837, nome: 'The Dog House', ganhoMaximo: 'R$ 1.350,00', multiplicador: '6.750', custoRodada: 0.20, dono: 'Pragmatic Play', descricao: '837 - The Dog House - R$ 0,20 - Pragmatic Play' },
    { codigo: 778, nome: 'Fortune Tiger', ganhoMaximo: 'R$ 1.000,00', multiplicador: '2.500', custoRodada: 0.40, dono: 'PG Soft', descricao: '778 - Fortune Tiger - R$ 0,40 - PG Soft' },
    { codigo: 779, nome: 'Fortune Rabbit', ganhoMaximo: 'R$ 1.200,00', multiplicador: '2.500', custoRodada: 0.50, dono: 'PG Soft', descricao: '779 - Fortune Rabbit - R$ 0,50 - PG Soft' },
    { codigo: 821, nome: 'FORTUNE DRAGON', ganhoMaximo: 'R$ 1.000,00', multiplicador: '2.500', custoRodada: 0.40, dono: 'PG Soft', descricao: '821 - FORTUNE DRAGON - R$ 0,40 - PG Soft' },
    { codigo: 820, nome: 'Fortune OX', ganhoMaximo: 'R$ 1.000,00', multiplicador: '2.000', custoRodada: 0.50, dono: 'PG Soft', descricao: '820 - Fortune OX - R$ 0,50 - PG Soft' },
    { codigo: 822, nome: 'TIGRE SORTUDO', ganhoMaximo: 'R$ 125,00', multiplicador: '2.500', custoRodada: 0.05, dono: 'PG Soft', descricao: '822 - TIGRE SORTUDO - R$ 0,05 - PG Soft' },
    { codigo: 908, nome: 'Money Mouse', ganhoMaximo: 'R$ 1.250,00', multiplicador: '5.000', custoRodada: 0.25, dono: 'Pragmatic Play', descricao: '908 - Money Mouse - R$ 0,25 - Pragmatic Play' },
    { codigo: 891, nome: '888 Gold', ganhoMaximo: 'R$ 100,00', multiplicador: '2.000', custoRodada: 0.05, dono: 'Pragmatic Play', descricao: '891 - 888 Gold - R$ 0,05 - Pragmatic Play' },
  ];

  const jogosFiltrados = jogos.filter(jogo => 
    jogo.nome.toLowerCase().includes(busca.toLowerCase()) ||
    jogo.codigo.toString().includes(busca) ||
    jogo.dono.toLowerCase().includes(busca.toLowerCase())
  );

  const calcularGiros = () => {
    if (!jogoSelecionado || valorBotao <= 0) {
      alert('Selecione um jogo e insira um valor válido!');
      return;
    }

    const giros = Math.floor(valorBotao / jogoSelecionado.custoRodada);
    const custoReal = giros * jogoSelecionado.custoRodada;
    
    const novaOferta: Oferta = {
      valorBotao,
      giros,
      oferta: `R$${valorBotao} = ${giros} Giros Extras`,
      custo: custoReal
    };

    setOfertas([...ofertas, novaOferta]);
  };

  const limparOfertas = () => {
    setOfertas([]);
  };

  const valoresSugeridos = [50, 100, 400, 1000, 2500];

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-7xl mx-auto">
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

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700/50">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-purple-400" />
            Selecione o Jogo
          </h2>

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

        {jogoSelecionado && (
          <>
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

            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-700/50">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Calculator className="w-6 h-6 text-green-400" />
                Calcular Giros
              </h2>

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
          </>
        )}

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
