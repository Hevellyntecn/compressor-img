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
          relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200
          ${isDragActive || dragActive
            ? 'border-primary-400 bg-primary-50 scale-[1.02]'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
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

        <div className="flex flex-col items-center space-y-4">
          <div className={`
            p-4 rounded-full transition-colors duration-200
            ${isDragActive || dragActive
              ? 'bg-primary-100 text-primary-600'
              : 'bg-gray-100 text-gray-400'
            }
          `}>
            {isDragActive || dragActive ? (
              <Upload className="w-8 h-8" />
            ) : (
              <Image className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-2">
            <h3 className={`
              text-lg font-semibold transition-colors duration-200
              ${isDragActive || dragActive ? 'text-primary-600' : 'text-gray-700'}
            `}>
              {isDragActive || dragActive
                ? 'Solte as imagens aqui'
                : 'Arraste e solte suas imagens'
              }
            </h3>

            <p className="text-gray-500 text-sm">
              ou <span className="text-primary-600 font-medium">clique para selecionar</span>
            </p>
            <p className="text-xs text-gray-400">Dica: segure Ctrl/Cmd ou Shift para selecionar múltiplos arquivos, ou arraste vários arquivos ao mesmo tempo.</p>
          </div>

          <div className="text-xs text-gray-400 space-y-1">
            <p>Formatos suportados: JPEG, PNG, WEBP, BMP, TIFF</p>
            <p>Tamanho máximo: {formatFileSize(maxSize)}</p>
          </div>
        </div>
      </div>

      {/* Lista de arquivos selecionados */}
      {selectedFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Arquivos selecionados ({selectedFiles.length})
            </h4>
            <button
              onClick={clearFiles}
              className="text-xs text-gray-500 hover:text-error-600 transition-colors duration-200"
            >
              Limpar todos
            </button>
          </div>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <FileImage className="w-4 h-4 text-primary-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{file.type.split('/')[1].toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="p-1 bg-success-100 rounded-full">
                    <CheckCircle className="w-4 h-4 text-success-600" />
                  </div>
                  
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 text-gray-400 hover:text-error-600 transition-colors duration-200"
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
