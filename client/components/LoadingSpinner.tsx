'use client';

import React from 'react';
import { Zap, Image, Settings } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  progress?: number;
  stage?: 'uploading' | 'processing' | 'optimizing' | 'finalizing';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Processando imagem...',
  progress,
  stage = 'processing'
}) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'uploading':
        return <Image className="w-6 h-6" />;
      case 'processing':
        return <Settings className="w-6 h-6" />;
      case 'optimizing':
        return <Zap className="w-6 h-6" />;
      case 'finalizing':
        return <Settings className="w-6 h-6" />;
      default:
        return <Settings className="w-6 h-6" />;
    }
  };

  const getStageMessage = (stage: string) => {
    switch (stage) {
      case 'uploading':
        return 'Enviando imagem...';
      case 'processing':
        return 'Analisando imagem...';
      case 'optimizing':
        return 'Otimizando qualidade...';
      case 'finalizing':
        return 'Finalizando compressão...';
      default:
        return 'Processando...';
    }
  };

  const getStageDescription = (stage: string) => {
    switch (stage) {
      case 'uploading':
        return 'Enviando arquivo para o servidor';
      case 'processing':
        return 'Verificando formato e dimensões';
      case 'optimizing':
        return 'Aplicando compressão inteligente';
      case 'finalizing':
        return 'Gerando arquivo final otimizado';
      default:
        return 'Processando sua imagem';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8">
      {/* Spinner principal */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-primary-600"></div>
        
        {/* Ícone do estágio */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="p-2 bg-primary-600 rounded-full text-white animate-pulse">
            {getStageIcon(stage)}
          </div>
        </div>
      </div>

      {/* Mensagem principal */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">
          {getStageMessage(stage)}
        </h3>
        <p className="text-gray-600 text-sm max-w-md">
          {getStageDescription(stage)}
        </p>
      </div>

      {/* Barra de progresso */}
      {progress !== undefined && (
        <div className="w-full max-w-md space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Mensagem customizada */}
      {message && message !== getStageMessage(stage) && (
        <p className="text-gray-500 text-sm text-center max-w-md">
          {message}
        </p>
      )}

      {/* Dicas durante o processamento */}
      <div className="bg-gray-50 rounded-lg p-4 max-w-md">
        <div className="flex items-start space-x-3">
          <div className="p-1 bg-primary-100 rounded-full">
            <Zap className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-1">
              Compressão Inteligente
            </h4>
            <p className="text-xs text-gray-600">
              Estamos otimizando sua imagem para o tamanho alvo de 470KB, 
              mantendo a melhor qualidade possível.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
