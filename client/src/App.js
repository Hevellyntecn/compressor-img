import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Download, Image as ImageIcon, FileText, Zap, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import './App.css';

function App() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [settings, setSettings] = useState({
    format: 'jpeg',
    targetSize: 470,
    includePDF: false
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.tiff', '.webp']
    },
    multiple: false
  });

  const handleCompress = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', uploadedFile);
      formData.append('format', settings.format);
      formData.append('targetSize', settings.targetSize);
      formData.append('includePDF', settings.includePDF);

      const response = await axios.post('/api/compress', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao processar imagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadFile = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024).toFixed(2) + ' KB';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="glass-effect border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">Image Compressor Premium</h1>
                <p className="text-sm text-gray-600">Compressão inteligente até 470KB</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Powered by Sharp & AI
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-blue-600" />
                Upload da Imagem
              </h2>
              
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-50'
                    : uploadedFile
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}
              >
                <input {...getInputProps()} />
                <div className="space-y-4">
                  {uploadedFile ? (
                    <>
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-green-700">{uploadedFile.name}</p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          {isDragActive ? 'Solte a imagem aqui' : 'Clique ou arraste uma imagem'}
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, JPEG, GIF, BMP, TIFF, WEBP (máx. 50MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Configurações</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato de Saída
                  </label>
                  <select
                    value={settings.format}
                    onChange={(e) => setSettings({...settings, format: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="jpeg">JPEG (Recomendado)</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamanho Máximo: {settings.targetSize} KB
                  </label>
                  <input
                    type="range"
                    min="100"
                    max="1000"
                    value={settings.targetSize}
                    onChange={(e) => setSettings({...settings, targetSize: parseInt(e.target.value)})}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>100KB</span>
                    <span>1000KB</span>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="includePDF"
                    checked={settings.includePDF}
                    onChange={(e) => setSettings({...settings, includePDF: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="includePDF" className="ml-2 block text-sm text-gray-700">
                    Gerar PDF adicional
                  </label>
                </div>
              </div>

              <button
                onClick={handleCompress}
                disabled={!uploadedFile || isProcessing}
                className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Comprimir Imagem
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {error && (
              <div className="card border-red-200 bg-red-50">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700 font-medium">Erro no processamento</p>
                </div>
                <p className="text-red-600 text-sm mt-2">{error}</p>
              </div>
            )}

            {isProcessing && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Processando...</h3>
                <div className="space-y-4">
                  <div className="progress-bar">
                    <div className="progress-fill animate-pulse" style={{width: '100%'}}></div>
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Aplicando compressão inteligente e otimização...
                  </p>
                </div>
              </div>
            )}

            {result && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Resultado da Compressão
                </h3>
                
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-blue-600 font-medium">Tamanho Original</p>
                      <p className="text-lg font-bold text-blue-800">{result.stats.originalSizeKB} KB</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-green-600 font-medium">Tamanho Final</p>
                      <p className="text-lg font-bold text-green-800">{result.stats.compressedSizeKB} KB</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Redução de Tamanho</p>
                    <p className="text-2xl font-bold text-purple-800">{result.stats.compressionRatio}%</p>
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Dimensões Originais</p>
                      <p className="font-medium">
                        {result.stats.dimensions.original.width} × {result.stats.dimensions.original.height}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Dimensões Finais</p>
                      <p className="font-medium">
                        {result.stats.dimensions.compressed.width} × {result.stats.dimensions.compressed.height}
                      </p>
                    </div>
                  </div>

                  {/* Processing Time */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">Tempo de Processamento</p>
                    <p className="font-medium">{result.stats.processingTimeMs}ms</p>
                  </div>

                  {/* Download Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => downloadFile(result.compressedFile, `compressed-${result.originalName}`)}
                      className="w-full btn-primary"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Baixar Imagem Comprimida
                    </button>

                    {result.pdfFile && (
                      <button
                        onClick={() => downloadFile(result.pdfFile, `converted-${result.originalName.replace(/\.[^/.]+$/, '')}.pdf`)}
                        className="w-full btn-secondary"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Baixar PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recursos Premium</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Compressão inteligente com preservação de qualidade
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Redimensionamento automático proporcional
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Múltiplos formatos de saída (JPEG, PNG, WebP)
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Conversão para PDF
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Processamento em tempo real
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
