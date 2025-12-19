'use client';

import React, { useState, useEffect } from 'react';
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
  useEffect(() => {
    if (jogoSelecionado) {
      calcularTodasOfertas();
    }
  }, [jogoSelecionado, valoresPersonalizados]);

  const calcularTodasOfertas = () => {
    if (!jogoSelecionado) return;

    const novasOfertas = valoresPersonalizados.map(valor => {
      if (valor === 0) {
        return {
          valorBotao: 0,
          giros: 0,
          oferta: 'R$ = 0 Giros Extras',
          custo: 0
        };
      }

      const giros = Math.floor(valor / jogoSelecionado.custoRodada);
      const custoReal = giros * jogoSelecionado.custoRodada;

      return {
        valorBotao: valor,
        giros,
        oferta: `R$${valor} = ${giros} Giros Extras`,
        custo: custoReal
      };
    });

    setOfertas(novasOfertas);
  };white px-4">
      <div className="max-w-7xl mx-auto">
        {/* Guia de cores */}
        <div className="mb-6 border border-gray-300">
          <div className="bg-white border-b border-gray-300 px-4 py-2">
            <p className="text-sm font-semibold text-gray-700">- Guia de cores</p>
          </div>
          <div className="bg-yellow-400 px-4 py-2 border-b border-gray-300">
            <p className="text-sm font-semibold text-gray-900">Valores para alterar</p>
          </div>
          <div className="bg-white px-4 py-2 border-b border-gray-300">
            <p className="text-sm font-semibold text-red-600">Valores para nunca alterar</p>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Coluna Esquerda - Seleção */}
          <div className="col-span-5">
            <div className="border border-gray-300">
              {/* Seletor de Jogo */}
              <div className="mb-4">
                <label className="block px-4 py-2 bg-white border-b border-gray-300">
                  <span className="text-sm font-semibold text-gray-700">Código + Jogo + Dono + Custo Rodada</span>
                </label>
                <select
                  value={jogoSelecionado ? `${jogoSelecionado.codigo}-${jogoSelecionado.custoRodada}` : ''}
                  onChange={(e) => {
                    const [codigo, custo] = e.target.value.split('-');
                    const jogo = jogos.find(j => j.codigo === parseInt(codigo) && j.custoRodada === parseFloat(custo));
                    setJogoSelecionado(jogo || null);
                  }}
                  className="w-full px-3 py-2 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um jogo...</option>
                  {jogos.map((jogo) => (
                    <option key={`${jogo.codigo}-${jogo.custoRodada}`} value={`${jogo.codigo}-${jogo.custoRodada}`}>
                      {jogo.codigo} - {jogo.nome} - R$ {jogo.custoRodada.toFixed(2)} - {jogo.dono}
                    </option>
                  ))}
                </select>
              </div>

              {/* Valor de Base */}
              <div>
                <label className="block px-4 py-2 bg-white border-b border-t border-gray-300">
                  <span className="text-sm font-semibold text-gray-700">Valor de Base (%)</span>
                </label>
                <input
                  type="number"
                  value={valorBase}
                  onChange={(e) => setValorBase(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-yellow-400 text-gray-900 font-semibold text-center border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="6%"
                />
              </div>
            </div>
          </div>

          {/* Coluna Direita - Tabela de Ofertas */}
          <div className="col-span-7">
            <div className="border border-gray-300 overflow-hidden">
              {/* Header Oferta */}
              <div className="bg-orange-500 px-4 py-2 border-b border-gray-300">
                <p className="text-sm font-bold text-white">Oferta</p>
              </div>

              {/* Tabela */}
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-300">
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-300">Valor Botão</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-300">Giros</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700 border-r border-gray-300">Oferta</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-700">Custo</th>
                  </tr>
                </thead>
                <tbody>
                  {valoresPersonalizados.map((valor, index) => {
                    const oferta = ofertas[index] || { valorBotao: 0, giros: 0, oferta: '', custo: 0 };
                    const isValorAlto = index < 5; // Primeiras 5 linhas com fundo amarelo

                    return (
                      <tr key={index} className={`border-b border-gray-300 ${isValorAlto ? 'bg-yellow-400' : 'bg-white'}`}>
                        <td className="px-2 py-1 border-r border-gray-300">
                          <input
                            type="number"
                            value={valor || ''}
                            onChange={(e) => atualizarValor(index, parseFloat(e.target.value) || 0)}
                            className={`w-full px-2 py-1 text-sm text-center border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 ${isValorAlto ? 'bg-yellow-400 font-semibold' : 'bg-white'}`}
                            placeholder="0"
                          />
                        </td>
                        <td className={`px-2 py-1 text-sm text-center border-r border-gray-300 ${isValorAlto ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                          {oferta.giros}
                        </td>
                        <td className={`px-2 py-1 text-xs text-center border-r border-gray-300 ${isValorAlto ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
                          {oferta.oferta}
                        </td>
                        <td className={`px-2 py-1 text-sm text-center ${isValorAlto ? 'text-red-600 font-semibold' : 'text-gray-700'}`}>
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

        {/* Mensagem de Status */}
        {!jogoSelecionado && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <Calculator className="w-4 h-4 inline mr-2" />
              Selecione um jogo para começar a calcular os giros extras
            </p/p>
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
