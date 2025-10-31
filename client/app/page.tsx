'use client';

import React from 'react';
import WorkflowSteps from '../components/WorkflowSteps';

interface CompressionState {
  isProcessing: boolean;
  result: any | null;
  error: string | null;
}

export default function Home() {
  interface CompressOptions {
    quality: number;
    format: string;
    keepName?: boolean;
    targetKb?: number;
    extreme?: boolean;
    extremeQuality?: number;
  }

  const [compressOptions, setCompressOptions] = React.useState<CompressOptions>({ quality: 95, format: 'keep', keepName: true, targetKb: 200, extreme: false, extremeQuality: 95 });
  const [maxFilesInput, setMaxFilesInput] = React.useState<number>(10);

  const handleComplete = (result: any) => {
    console.log('Compressão concluída:', result);
  };

  const handleError = (error: string) => {
    console.error('Erro na compressão:', error);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            Compressor de Imagens
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Reduzir o tamanho das suas imagens para até 470KB sem perder qualidade visual.</p>
        </div>
        {/* A seleção múltipla está ativada por padrão; não mostramos controle visível para máximo de arquivos */}

        <div className="mt-6 grid grid-cols-1 gap-6 justify-center">
          <div className="w-full lg:w-3/4 mx-auto">
            <WorkflowSteps
              mode="compress"
              onComplete={handleComplete}
              onError={handleError}
              compressOptions={compressOptions}
              // not setting preview handlers here: page no longer shows a single preview
              onFileSelected={() => {}}
              onFilesSelected={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
