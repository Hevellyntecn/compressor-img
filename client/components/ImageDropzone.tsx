'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, FileImage, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  maxSize?: number; // em bytes
  disabled?: boolean;
  acceptedFormats?: string[];
}

const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onFilesSelected,
  maxFiles = 20,
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/bmp', 'image/tiff']
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const validateFile = (file: File): string | null => {
    // Verifica formato
    if (!acceptedFormats.includes(file.type)) {
      return `Formato não suportado: ${file.type}. Use JPEG, PNG, WEBP, BMP ou TIFF.`;
    }

    // Verifica tamanho
    if (file.size > maxSize) {
      return `Arquivo muito grande: ${formatFileSize(file.size)}. Máximo permitido: ${formatFileSize(maxSize)}.`;
    }

    return null;
  };

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Processa arquivos rejeitados
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        if (error.code === 'file-invalid-type') {
          toast.error(`Formato não suportado: ${file.name}`);
        } else if (error.code === 'file-too-large') {
          toast.error(`Arquivo muito grande: ${file.name}`);
        } else {
          toast.error(`Erro no arquivo ${file.name}: ${error.message}`);
        }
      });
    });

    // Processa arquivos aceitos
    const validFiles: File[] = [];
    
    acceptedFiles.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
      } else {
        validFiles.push(file);
      }
    });

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      onFilesSelected(validFiles);
      
      if (validFiles.length === 1) {
        toast.success(`Arquivo selecionado: ${validFiles[0].name}`);
      } else {
        toast.success(`${validFiles.length} arquivos selecionados`);
      }
    }
  }, [onFilesSelected, maxSize, acceptedFormats]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': acceptedFormats
    },
    // Allow multiple selection by default so the user can pick many files in the OS dialog or drag multiple files.
    // We keep `maxFiles` prop for backward compatibility but the dropzone input always allows multiple selections.
    maxSize,
    disabled,
    multiple: true,
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    onFilesSelected([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      {/* Área de Drop */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
          ${isDragActive || dragActive
            ? 'border-[#8B5CF6] bg-gradient-to-br from-[#8B5CF6]/10 to-[#EC4899]/10 scale-[1.02] shadow-glow'
            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/30'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-6">
          <div className={`
            p-6 rounded-full transition-all duration-300
            ${isDragActive || dragActive
              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] text-white shadow-glow scale-110'
              : 'bg-gray-900 text-gray-400 border-2 border-gray-700'
            }
          `}>
            {isDragActive || dragActive ? (
              <Upload className="w-10 h-10" />
            ) : (
              <Image className="w-10 h-10" />
            )}
          </div>

          <div className="space-y-3">
            <h3 className={`
              text-xl font-bold transition-colors duration-200
              ${isDragActive || dragActive ? 'text-white' : 'text-white'}
            `}>
              {isDragActive || dragActive
                ? 'Solte as imagens aqui'
                : 'Arraste e solte suas imagens'
              }
            </h3>

            <p className="text-gray-400 text-sm">
              ou <span className="text-[#8B5CF6] font-semibold bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">clique para selecionar</span>
            </p>
            <p className="text-xs text-gray-500">Dica: segure Ctrl/Cmd ou Shift para selecionar múltiplos arquivos, ou arraste vários arquivos ao mesmo tempo.</p>
          </div>

          <div className="text-xs text-gray-400 space-y-1 bg-gray-900/50 px-4 py-2 rounded-lg border border-gray-700/50">
            <p>📁 Formatos suportados: <span className="text-white font-medium">JPEG, PNG, WEBP, BMP, TIFF</span></p>
            <p>📏 Tamanho máximo: <span className="text-white font-medium">{formatFileSize(maxSize)}</span></p>
          </div>
        </div>
      </div>

      {/* Lista de arquivos selecionados */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-[#8B5CF6]" />
              Arquivos selecionados ({selectedFiles.length})
            </h4>
            <button
              onClick={clearFiles}
              className="text-xs text-gray-400 hover:text-red-400 transition-colors duration-200 font-medium px-3 py-1.5 rounded-lg hover:bg-red-500/10"
            >
              Limpar todos
            </button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 hover:border-gray-600 hover:bg-gray-900 transition-all duration-200"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="p-2.5 bg-gradient-to-r from-[#8B5CF6]/20 to-[#EC4899]/20 rounded-lg border border-[#8B5CF6]/30">
                    <FileImage className="w-5 h-5 text-[#8B5CF6]" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span className="px-2 py-0.5 bg-gray-800 rounded text-white font-medium">
                        {file.type.split('/')[1].toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <div className="p-1.5 bg-green-500/20 rounded-full border border-green-500/30">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all duration-200"
                    title="Remover arquivo"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDropzone;
