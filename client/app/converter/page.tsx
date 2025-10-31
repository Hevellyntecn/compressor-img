'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Upload, 
  Settings, 
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Image,
  File,
  FileImage
} from 'lucide-react';
import WorkflowSteps from '../../components/WorkflowSteps';
import ProgressBar from '../../components/ProgressBar';
import toast from 'react-hot-toast';

export default function ConverterPage() {
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  // convert trigger handled inside WorkflowSteps; we show the uploader first
  const [activeTab, setActiveTab] = useState<string>('Imagem');
  const [search, setSearch] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
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

  const handleComplete = (result: any) => {
    toast.success('Conversão concluída com sucesso!');
    console.log('Conversão concluída:', result);
  };

  const handleError = (error: string) => {
    toast.error(`Erro na conversão: ${error}`);
    console.error('Erro na conversão:', error);
  };

  const [preserveName, setPreserveName] = useState<boolean>(true);

  // Fetch supported formats from server
  React.useEffect(() => {
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

  const handleFilesSelectedFromWorkflow = (files: File[]) => {
    setUploadedFiles(files || []);
  };

  // Determine available output formats based on the first uploaded file
  const availableOutputs = React.useMemo(() => {
    if (!formatsInfo || !uploadedFiles || uploadedFiles.length === 0) return [];
    const first = uploadedFiles[0];
    const name = first.name || '';
    const mime = first.type || '';
    let inputExt = '';
    if (name.includes('.')) inputExt = name.split('.').pop()!.toLowerCase();
    else if (mime) {
      // basic mime to extension mapping
      if (mime.includes('jpeg')) inputExt = 'jpg';
      else if (mime.includes('png')) inputExt = 'png';
      else if (mime.includes('webp')) inputExt = 'webp';
      else if (mime.includes('pdf')) inputExt = 'pdf';
    }

    const outs = new Set<string>();
    const conv = formatsInfo.conversions || {};
    Object.keys(conv).forEach((k) => {
      const grp = conv[k];
      const from = grp.from || [];
      const to = grp.to || [];
      if (from.includes(inputExt)) {
        to.forEach((t: string) => outs.add(t.toLowerCase()));
      }
    });

    // Fallback: if none found and input is an image, allow image outputs
    if (outs.size === 0 && inputExt && ['jpg','jpeg','png','webp','bmp','tiff','gif','svg'].includes(inputExt)) {
      ['jpg','jpeg','png','webp','bmp','tiff','png'].forEach((t) => outs.add(t));
    }

    return Array.from(outs);
  }, [formatsInfo, uploadedFiles]);

  // When available outputs change (after upload), pick a sensible default format
  React.useEffect(() => {
    if (availableOutputs && availableOutputs.length > 0) {
      if (!selectedFormat || !availableOutputs.includes(selectedFormat.toLowerCase())) {
        setSelectedFormat(availableOutputs[0]);
      }
    }
  }, [availableOutputs]);

  const [showFormatSelector, setShowFormatSelector] = useState(false);

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gradient-purple to-gradient-pink rounded-full mb-6 shadow-glow">
            <FileText className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
            Conversor de Documentos
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Converter diferentes formatos de arquivo com qualidade preservada.</p>
        </div>

        {/* Upload card only — formats are available inside the settings (gear) of the uploader */}
        <div className="card p-6 mb-8">
          <WorkflowSteps
            mode="convert"
            onComplete={handleComplete}
            onError={handleError}
            convertOptions={{ format: selectedFormat, preserveName }}
            onFilesSelected={handleFilesSelectedFromWorkflow}
          />

          <div className="mt-4 text-gray-300">
            Envie um arquivo acima. Para escolher o formato de saída, clique no ícone de configurações (⚙) no canto do card de conversão — todas as opções de formato estarão lá.
          </div>
        </div>

        {/* Conversion workflow is shown above (uploader). */}

        {/* Features removed as requested */}
      </div>
    </div>
  );
}
