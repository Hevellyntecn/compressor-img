'use client';

import React from 'react';
import { Download, Image, Clock, Zap, TrendingDown, CheckCircle, AlertTriangle } from 'lucide-react';
import { CompressionResult } from '../lib/api';

interface CompressionResultsProps {
  result: CompressionResult;
  onDownload: (url: string, filename: string) => void;
  onCompressAnother: () => void;
}

const CompressionResults: React.FC<CompressionResultsProps> = ({
  result,
  onDownload,
  onCompressAnother
}) => {
  const { data } = result;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (milliseconds: number): string => {
    if (milliseconds < 1000) {
      return `${milliseconds}ms`;
    }
    const seconds = Math.round(milliseconds / 1000);
    return `${seconds}s`;
  };

  const getCompressionColor = (ratio: string): string => {
    const ratioNum = parseFloat(ratio);
    if (ratioNum >= 70) return 'text-success-600';
    if (ratioNum >= 50) return 'text-warning-600';
    return 'text-error-600';
  };

  const getCompressionIcon = (ratio: string): string => {
    const ratioNum = parseFloat(ratio);
    if (ratioNum >= 70) return '🎉';
    if (ratioNum >= 50) return '✅';
    return '⚠️';
  };

  const compressionRatio = parseFloat(data.compression.ratio);
  const isSuccessful = compressionRatio >= 50;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header com resultado */}
      <div className="text-center">
        <div className={`
          inline-flex items-center justify-center w-16 h-16 rounded-full mb-4
          ${isSuccessful ? 'bg-success-100' : 'bg-warning-100'}
        `}>
          {isSuccessful ? (
            <CheckCircle className="w-8 h-8 text-success-600" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-warning-600" />
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isSuccessful ? 'Compressão Concluída!' : 'Compressão Aplicada'}
        </h2>
        
        <p className="text-gray-600">
          {isSuccessful 
            ? 'Sua imagem foi comprimida com sucesso mantendo a qualidade'
            : 'A imagem foi comprimida, mas pode ter perdido alguma qualidade'
          }
        </p>
      </div>

      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tamanho original */}
        <div className="card p-6 text-center">
          <div className="p-3 bg-gray-100 rounded-full w-12 h-12 mx-auto mb-3">
            <Image className="w-6 h-6 text-gray-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Tamanho Original</h3>
          <p className="text-xl font-bold text-gray-900">
            {formatFileSize(data.originalFile.size)}
          </p>
        </div>

        {/* Tamanho comprimido */}
        <div className="card p-6 text-center">
          <div className="p-3 bg-primary-100 rounded-full w-12 h-12 mx-auto mb-3">
            <TrendingDown className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Tamanho Final</h3>
          <p className="text-xl font-bold text-primary-600">
            {formatFileSize(data.compressedFile.size)}
          </p>
        </div>

        {/* Taxa de compressão */}
        <div className="card p-6 text-center">
          <div className="p-3 bg-success-100 rounded-full w-12 h-12 mx-auto mb-3">
            <Zap className="w-6 h-6 text-success-600" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Compressão</h3>
          <p className={`text-xl font-bold ${getCompressionColor(data.compression.ratio)}`}>
            {data.compression.ratio}%
          </p>
        </div>
      </div>

      {/* Detalhes da compressão */}
      <div className="card p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="mr-2">{getCompressionIcon(data.compression.ratio)}</span>
          Detalhes da Compressão
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Arquivo original */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Arquivo Original</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nome:</span>
                <span className="font-medium text-gray-900 truncate ml-2">
                  {data.originalFile.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Formato:</span>
                <span className="font-medium text-gray-900">
                  {data.originalFile.format.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dimensões:</span>
                <span className="font-medium text-gray-900">
                  {data.originalFile.dimensions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tamanho:</span>
                <span className="font-medium text-gray-900">
                  {formatFileSize(data.originalFile.size)}
                </span>
              </div>
            </div>
          </div>

          {/* Arquivo comprimido */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Arquivo Comprimido</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Nome:</span>
                <span className="font-medium text-gray-900 truncate ml-2">
                  {data.compressedFile.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Formato:</span>
                <span className="font-medium text-gray-900">
                  {data.compressedFile.format.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dimensões:</span>
                <span className="font-medium text-gray-900">
                  {data.compressedFile.dimensions}
                  {data.compression.scaled && (
                    <span className="text-warning-600 text-xs ml-1">
                      (redimensionado)
                    </span>
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tamanho:</span>
                <span className="font-medium text-primary-600">
                  {formatFileSize(data.compressedFile.size)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas de economia */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-success-600">
                {formatFileSize(data.compression.savedBytes)}
              </p>
              <p className="text-sm text-gray-500">Economia de espaço</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-600">
                {data.compression.ratio}%
              </p>
              <p className="text-sm text-gray-500">Redução de tamanho</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {formatDuration(data.processing.time)}
              </p>
              <p className="text-sm text-gray-500">Tempo de processamento</p>
            </div>
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => onDownload(data.compressedFile.downloadUrl, data.compressedFile.name)}
          className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Baixar Imagem Comprimida</span>
        </button>
        
        <button
          onClick={onCompressAnother}
          className="btn btn-secondary flex-1 flex items-center justify-center space-x-2"
        >
          <Image className="w-5 h-5" />
          <span>Comprimir Outra Imagem</span>
        </button>
      </div>

      {/* Informações adicionais */}
      {data.compression.scaled && (
        <div className="bg-warning-50 border border-warning-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-warning-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-warning-800">
                Imagem Redimensionada
              </h4>
              <p className="text-sm text-warning-700 mt-1">
                A imagem foi redimensionada em {Math.round((1 - data.compression.scaleFactor) * 100)}% 
                para atingir o tamanho alvo de 470KB, mantendo as proporções originais.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompressionResults;
