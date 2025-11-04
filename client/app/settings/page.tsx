"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Image, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [selectedFormat, setSelectedFormat] = useState<string>('png');
  const [formatsInfo, setFormatsInfo] = useState<any>(null);

  const formatCategories: Record<string, Array<{ value: string; label: string }>> = {
    Imagem: [
      { value: 'svg', label: 'SVG' },
      { value: 'ico', label: 'ICO' },
      { value: 'jpg', label: 'JPG' },
      { value: 'webp', label: 'WEBP' },
      { value: 'jpeg', label: 'JPEG' },
      { value: 'gif', label: 'GIF' },
      { value: 'bmp', label: 'BMP' },
      { value: 'tiff', label: 'TIFF' },
      { value: 'png', label: 'PNG' }
    ],
    Documento: [
      { value: 'pdf', label: 'PDF' },
      { value: 'docx', label: 'DOCX' },
      { value: 'html', label: 'HTML' },
      { value: 'txt', label: 'TXT' }
    ],
    EBook: [
      { value: 'epub', label: 'EPUB' },
      { value: 'mobi', label: 'MOBI' }
    ],
    Fonte: [
      { value: 'ttf', label: 'TTF' },
      { value: 'otf', label: 'OTF' }
    ],
    Vetor: [
      { value: 'ai', label: 'AI' },
      { value: 'eps', label: 'EPS' }
    ],
    CAD: [
      { value: 'dwg', label: 'DWG' },
      { value: 'dxf', label: 'DXF' }
    ]
  };

  const tabs = Object.keys(formatCategories);
  const [activeTab, setActiveTab] = useState<string>('Imagem');
  const [search, setSearch] = useState<string>('');

  // Fetch supported formats from server
  useEffect(() => {
    let mounted = true;
    fetch('/api/formats')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        if (data && data.success && data.data) setFormatsInfo(data.data);
      })
      .catch(() => {
        // ignore
      });
    return () => { mounted = false; };
  }, []);

  const handleFormatSelect = (format: string) => {
    setSelectedFormat(format);
    toast.success(`Formato de saída definido: ${format.toUpperCase()}`);
    // Salva no localStorage para persistir
    localStorage.setItem('defaultOutputFormat', format);
  };

  // Carrega formato salvo do localStorage
  useEffect(() => {
    const savedFormat = localStorage.getItem('defaultOutputFormat');
    if (savedFormat) {
      setSelectedFormat(savedFormat);
    }
  }, []);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-full mb-6 shadow-glow">
            <Settings className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
            Configurações
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Configure o formato de saída padrão para conversões e compressões.
          </p>
        </div>

        {/* Settings Card */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Formato de Saída Padrão
          </h2>

          <div className="mb-4">
            <input
              placeholder="Buscar formato..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-[#8B5CF6] focus:outline-none"
            />
          </div>

          <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="p-4 bg-gray-900 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {(formatCategories[activeTab] ?? [])
                .filter(f => f.label.toLowerCase().includes(search.toLowerCase()) || f.value.toLowerCase().includes(search.toLowerCase()))
                .map((fmt) => (
                  <button
                    key={fmt.value}
                    onClick={() => handleFormatSelect(fmt.value)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                      selectedFormat === fmt.value
                        ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white border-transparent shadow-glow scale-105'
                        : 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {activeTab === 'Imagem' ? (
                      <Image className="w-6 h-6" />
                    ) : (
                      <FileText className="w-6 h-6" />
                    )}
                    <span className="font-medium text-sm">{fmt.label}</span>
                    {selectedFormat === fmt.value && (
                      <div className="text-xs mt-1">✓ Selecionado</div>
                    )}
                  </button>
                ))}
            </div>
          </div>

          {selectedFormat && (
            <div className="mt-6 p-4 bg-gradient-to-r from-[#8B5CF6]/20 to-[#EC4899]/20 rounded-lg border border-[#8B5CF6]/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-lg">
                  <Download className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-medium">Formato de Saída Atual</p>
                  <p className="text-gray-300 text-sm">
                    {formatCategories[activeTab]?.find(f => f.value === selectedFormat)?.label || selectedFormat.toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            Sobre os Formatos
          </h3>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">Imagens:</strong> Use JPG/JPEG para fotos, PNG para imagens com transparência, 
              WEBP para menor tamanho com boa qualidade, e SVG para gráficos vetoriais.
            </p>
            <p>
              <strong className="text-white">Documentos:</strong> PDF é ideal para documentos finais, 
              DOCX para edição, HTML para web, e TXT para texto simples.
            </p>
            <p>
              <strong className="text-white">EBooks:</strong> EPUB é amplamente suportado, 
              MOBI é específico para Kindle.
            </p>
            <p className="text-sm text-gray-400 mt-4">
              Esta configuração será usada como padrão em todas as conversões e compressões.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
