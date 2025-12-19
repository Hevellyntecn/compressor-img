'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calculator } from 'lucide-react';

interface Jogo {
  codigo: number;
  nome: string;
  ganhoMaximo: string;
  multiplicador: string;
  custoRodada: number;
  dono: string;
  descricao: string;
}

interface LinhaOferta {
  valorBotao: number;
  giros: number;
  oferta: string;
  custo: number;
}

export default function CalculosPage() {
  const [jogoSelecionado, setJogoSelecionado] = useState<Jogo | null>(null);
  const [valorBase, setValorBase] = useState<number>(6);
  const [valoresPersonalizados, setValoresPersonalizados] = useState<number[]>([50, 100, 400, 1000, 2500, 0, 0, 0, 10, 30, 100]);
  const [ofertas, setOfertas] = useState<LinhaOferta[]>([]);
  const [buscaJogo, setBuscaJogo] = useState<string>('');
  const [mostrarLista, setMostrarLista] = useState<boolean>(false);

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

  const calcularTodasOfertas = useCallback(() => {
    if (!jogoSelecionado) return;

    const novasOfertas = valoresPersonalizados.map(valor => {
      if (valor === 0) {
        return {
          valorBotao: 0,
          giros: 0,
          oferta: 'R$0 = 0 Giros Extras',
          custo: 0
        };
      }

      const giros = Math.ceil((valor * (valorBase / 100)) / jogoSelecionado.custoRodada);
      const custoReal = giros * jogoSelecionado.custoRodada;

      return {
        valorBotao: valor,
        giros,
        oferta: `R$${valor} = ${giros} Giros Extras`,
        custo: custoReal
      };
    });

    setOfertas(novasOfertas);
  }, [jogoSelecionado, valoresPersonalizados, valorBase]);

  useEffect(() => {
    if (jogoSelecionado) {
      calcularTodasOfertas();
    }
  }, [jogoSelecionado, calcularTodasOfertas]);

  const atualizarValor = (index: number, novoValor: number) => {
    const novosValores = [...valoresPersonalizados];
    novosValores[index] = novoValor;
    setValoresPersonalizados(novosValores);
  };

  const jogosFiltrados = jogos.filter(jogo => 
    jogo.nome.toLowerCase().includes(buscaJogo.toLowerCase()) ||
    jogo.codigo.toString().includes(buscaJogo) ||
    jogo.dono.toLowerCase().includes(buscaJogo.toLowerCase())
  );

  const selecionarJogo = (jogo: Jogo) => {
    setJogoSelecionado(jogo);
    setBuscaJogo(`${jogo.codigo} - ${jogo.nome} - R$ ${jogo.custoRodada.toFixed(2)} - ${jogo.dono}`);
    setMostrarLista(false);
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Calculator className="w-10 h-10 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Calculadora de Giros
            </h1>
          </div>
          <p className="text-gray-300">
            Calcule quantos giros extras baseado no valor e no custo por rodada
          </p>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-5">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
              <div className="mb-0 relative">
                <label className="block px-4 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-700">
                  <span className="text-sm font-semibold text-purple-300">Código + Jogo + Dono + Custo Rodada</span>
                </label>
                <input
                  type="text"
                  value={buscaJogo}
                  onChange={(e) => {
                    setBuscaJogo(e.target.value);
                    setMostrarLista(true);
                  }}
                  onFocus={() => setMostrarLista(true)}
                  placeholder="Digite para buscar (ex: gates, aviator, 784)..."
                  className="w-full px-3 py-3 bg-gray-700/50 text-white border-0 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-500"
                />
                
                {mostrarLista && buscaJogo && jogosFiltrados.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl max-h-64 overflow-y-auto">
                    {jogosFiltrados.map((jogo) => (
                      <button
                        key={`${jogo.codigo}-${jogo.custoRodada}`}
                        onClick={() => selecionarJogo(jogo)}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-purple-600/30 transition-colors border-b border-gray-700/50 last:border-0"
                      >
                        <span className="font-semibold text-purple-300">{jogo.codigo}</span> - {jogo.nome} - <span className="text-green-400">R$ {jogo.custoRodada.toFixed(2)}</span> - <span className="text-pink-300">{jogo.dono}</span>
                      </button>
                    ))}
                  </div>
                )}
                
                {mostrarLista && buscaJogo && jogosFiltrados.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-2xl p-3">
                    <p className="text-sm text-gray-400">Nenhum jogo encontrado</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block px-4 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-t border-gray-700">
                  <span className="text-sm font-semibold text-purple-300">Valor de Base (%)</span>
                </label>
                <input
                  type="number"
                  value={valorBase}
                  onChange={(e) => setValorBase(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-3 bg-pink-500/20 text-pink-200 font-bold text-center text-lg border-0 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder="6%"
                />
              </div>
            </div>
          </div>

          <div className="col-span-7">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3 border-b border-gray-700">
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4" />
                  Ofertas Calculadas
                </p>
              </div>

              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-b border-purple-500/30">
                    <th className="px-3 py-3 text-xs font-bold text-purple-200 border-r border-gray-600">Valor Botão</th>
                    <th className="px-3 py-3 text-xs font-bold text-purple-200 border-r border-gray-600">Giros</th>
                    <th className="px-3 py-3 text-xs font-bold text-purple-200 border-r border-gray-600">Oferta</th>
                    <th className="px-3 py-3 text-xs font-bold text-purple-200">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {valoresPersonalizados.map((valor, index) => {
                    const oferta = ofertas[index] || { valorBotao: 0, giros: 0, oferta: '', custo: 0 };
                    const isValorAlto = index < 5;

                    return (
                      <tr key={index} className={`border-b border-gray-700/50 hover:bg-purple-900/10 transition-colors ${isValorAlto ? 'bg-purple-900/10' : 'bg-gray-800/20'}`}>
                        <td className="px-2 py-2 border-r border-gray-700/50">
                          <input
                            type="number"
                            value={valor || ''}
                            onChange={(e) => atualizarValor(index, parseFloat(e.target.value) || 0)}
                            className={`w-full px-3 py-2 text-sm text-center border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${isValorAlto ? 'bg-purple-600/20 text-purple-200 font-semibold placeholder-purple-400/50' : 'bg-gray-700/50 text-gray-300 placeholder-gray-500'}`}
                            placeholder="0"
                          />
                        </td>
                        <td className={`px-2 py-2 text-base font-bold text-center border-r border-gray-700/50 ${isValorAlto ? 'text-pink-400' : 'text-purple-300'}`}>
                          {oferta.giros}
                        </td>
                        <td className={`px-2 py-2 text-xs text-center border-r border-gray-700/50 ${isValorAlto ? 'text-pink-300 font-medium' : 'text-gray-400'}`}>
                          {oferta.oferta}
                        </td>
                        <td className={`px-2 py-2 text-sm font-semibold text-center ${isValorAlto ? 'text-green-400' : 'text-green-300'}`}>
                          R$ {oferta.custo.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {!jogoSelecionado && (
          <div className="mt-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-purple-300 flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              Selecione um jogo para começar a calcular os giros extras
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
