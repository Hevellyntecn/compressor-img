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
    preserveAspect?: boolean;
    preserveMetadata?: boolean;
  }

  const [compressOptions, setCompressOptions] = React.useState<CompressOptions>({ 
    quality: 95, 
    format: 'keep', 
    keepName: true, 
    targetKb: 200, 
    extreme: false, 
    extremeQuality: 95,
    preserveAspect: true,
    preserveMetadata: true
  });

  const handleComplete = (result: any) => {
    console.log('Compressão concluída:', result);
  };

  const handleError = (error: string) => {
    console.error('Erro na compressão:', error);
  };

  const handleCompressOptionsChange = (newOptions: CompressOptions) => {
    setCompressOptions(newOptions);
    console.log('Opções de compressão atualizadas:', newOptions);
  };

  return (
    <div className="min-h-screen py-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-full mb-6 shadow-glow">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gradient mb-6">
            Compressor de Imagens
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Reduza o tamanho das suas imagens para até 470KB sem perder qualidade visual.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 justify-center">
          <div className="w-full lg:w-3/4 mx-auto">
            <WorkflowSteps
              mode="compress"
              onComplete={handleComplete}
              onError={handleError}
              compressOptions={compressOptions}
              onCompressOptionsChange={handleCompressOptionsChange}
              onFileSelected={() => {}}
              onFilesSelected={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
