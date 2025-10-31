'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Download, CheckCircle } from 'lucide-react';
import ImageDropzone from './ImageDropzone';
import LoadingSpinner from './LoadingSpinner';

interface WorkflowStepsProps {
  mode: 'compress' | 'extreme' | 'convert';
  onComplete?: (result: any) => void;
  onError?: (error: string) => void;
  // optional external options and callbacks so pages can host the settings
  compressOptions?: { quality: number; targetKb?: number; preserveMetadata?: boolean; [k: string]: any };
  onCompressOptionsChange?: (opts: any) => void;
  extremeOptions?: { quality: number; preserveQuality?: boolean; progressive?: boolean; [k: string]: any };
  onExtremeOptionsChange?: (opts: any) => void;
  convertOptions?: { format: string; dpi?: number; color?: string; [k: string]: any };
  onConvertOptionsChange?: (opts: any) => void;
  onFileSelected?: (file: File | null) => void;
  onFilesSelected?: (files: File[]) => void;
  maxFiles?: number;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  mode,
  onComplete,
  onError,
  compressOptions: compressProps,
  onCompressOptionsChange,
  extremeOptions: extremeProps,
  convertOptions: convertProps,
  onConvertOptionsChange,
  onFileSelected,
  maxFiles,
  onFilesSelected,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  // defaults used when pages don't provide options
  const defaultCompress = { quality: 75, targetKb: 200, preserveMetadata: true, preserveAspect: true, format: 'keep' };
  const defaultExtreme = { quality: 90, preserveQuality: true, progressive: true };
  const defaultConvert = { format: 'png', dpi: 300, color: 'auto' };

  // --- format categories for converter (small copy of page's list) ---
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

  const [formatsInfo, setFormatsInfo] = useState<any>(null);
  const [searchFormats, setSearchFormats] = useState<string>('');
  const [formatsTab, setFormatsTab] = useState<string>('Imagem');
  const [selectedConvertFormat, setSelectedConvertFormat] = useState<string | null>(convertProps?.format ?? null);

  // fetch supported formats for server-side validation (optional)
  useEffect(() => {
    let mounted = true;
    fetch('/api/formats')
      .then((r) => r.json())
      .then((data) => { if (!mounted) return; if (data && data.success && data.data) setFormatsInfo(data.data); })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // compute available outputs based on first selected file
  const availableOutputs = React.useMemo(() => {
    if (!formatsInfo || !selectedFiles || selectedFiles.length === 0) return [];
    const first = selectedFiles[0];
    const name = first.name || '';
    const mime = first.type || '';
    let inputExt = '';
    if (name.includes('.')) inputExt = name.split('.').pop()!.toLowerCase();
    else if (mime) {
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
      if (from.includes(inputExt)) to.forEach((t: string) => outs.add(t.toLowerCase()));
    });

    if (outs.size === 0 && inputExt && ['jpg','jpeg','png','webp','bmp','tiff','gif','svg'].includes(inputExt)) {
      ['jpg','jpeg','png','webp','bmp','tiff','png'].forEach((t) => outs.add(t));
    }
    return Array.from(outs);
  }, [formatsInfo, selectedFiles]);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    setResult(null);
    setProgress(0);
    // notify parent page with first file for preview convenience
    if (typeof onFileSelected === 'function') onFileSelected(files[0] ?? null);
    if (typeof onFilesSelected === 'function') onFilesSelected(files);
  };

  const handleStartProcessing = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const interval = setInterval(() => {
        setProgress((p) => {
          const next = Math.min(100, p + Math.random() * 20);
          if (next >= 100) clearInterval(interval);
          return next;
        });
      }, 400);

      // Simula chamada à API
      await new Promise((res) => setTimeout(res, 1200));

      // Calcular resultado simulado levando em conta o modo e opções (recebidas via props ou defaults)
      // Determine desired output mime and quality
      // Determine desired quality percentage (0-100).
      // Support quality and extreme settings across all modes (compress/convert)
      const getQualityForMode = () => {
        if (mode === 'convert') {
          // For conversion, use convertOptions.quality or extremeQuality if extreme mode
          return convertProps?.extreme 
            ? (convertProps?.extremeQuality ?? convertProps?.quality ?? defaultCompress.quality)
            : (convertProps?.quality ?? defaultCompress.quality);
        }
        // For compress/extreme, use compressOptions
        return compressProps?.extreme
          ? (compressProps?.extremeQuality ?? compressProps?.quality ?? defaultCompress.quality)
          : (compressProps?.quality ?? defaultCompress.quality);
      };
      
      const desiredQualityPercent = getQualityForMode();
      const chosenQuality = Math.max(1, Math.min(100, desiredQualityPercent));

      const getOutputMime = () => {
        if (mode === 'convert') {
          const f = convertProps?.format ?? defaultConvert.format;
          if (f === 'jpg' || f === 'jpeg') return 'image/jpeg';
          if (f === 'png') return 'image/png';
          if (f === 'webp') return 'image/webp';
          return selectedFiles[0]?.type ?? 'image/jpeg';
        }
        // compress or extreme
        const cf = (compressProps as any)?.format || (mode === 'extreme' ? 'jpeg' : null);
        if (cf && cf !== 'keep') {
          if (cf === 'jpg' || cf === 'jpeg') return 'image/jpeg';
          if (cf === 'png') return 'image/png';
          if (cf === 'webp') return 'image/webp';
        }
        return selectedFiles[0]?.type ?? 'image/jpeg';
      };

      const outputMime = getOutputMime();
      const qualityFactor = Math.max(0.05, Math.min(1, chosenQuality / 100));

      // Helper to compress/convert image client-side using canvas
      // Supports optional targetBytes: will try to find a quality that brings the blob <= targetBytes
      const compressImage = async (file: File, mime: string, quality: number, targetBytes?: number): Promise<Blob> => {
        return await new Promise<Blob>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
          reader.onload = async () => {
            const img = new Image();
            img.onload = async () => {
              try {
                const originalSize = file.size;
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject(new Error('Canvas 2D não disponível'));
                ctx.drawImage(img, 0, 0);

                const toBlob = (q: number, outMime: string) => new Promise<Blob | null>((res) => {
                  try {
                    canvas.toBlob((b) => res(b), outMime, q);
                  } catch (e) {
                    res(null);
                  }
                });

                // If no target requested, just produce one blob and return original if it's larger
                if (!targetBytes) {
                  const blob = await toBlob(quality, mime);
                  if (!blob) return reject(new Error('Falha ao criar blob'));
                  if (blob.size >= originalSize) return resolve(file); // don't increase size
                  return resolve(blob);
                }

                // If target requested but it's >= original size, skip compression
                if (targetBytes >= originalSize) {
                  return resolve(file);
                }

                // If target requested but format ignores quality (png), try converting to webp
                let outMime = mime;
                if (mime === 'image/png') {
                  outMime = 'image/webp';
                }

                // If outMime doesn't support quality param effectively, just produce one blob and compare
                const supportsQuality = outMime === 'image/jpeg' || outMime === 'image/webp';
                if (!supportsQuality) {
                  const blob = await toBlob(quality, outMime);
                  if (!blob) return reject(new Error('Falha ao criar blob'));
                  if (blob.size >= originalSize) return resolve(file);
                  return resolve(blob);
                }

                // Binary search for the highest quality that produces <= targetBytes.
                const qualityFactor = Math.max(0.05, Math.min(1, quality));
                let low = 0.05; // lower bound (lowest acceptable quality)
                let high = Math.max(qualityFactor, 0.05); // upper bound (start at desired quality)
                let best: { blob: Blob; q: number } | null = null;
                for (let i = 0; i < 12; i++) {
                  const mid = (low + high) / 2;
                  const b = await toBlob(mid, outMime);
                  if (!b) break;
                  if (b.size <= targetBytes) {
                    // mid quality satisfies the target; keep it and try higher quality
                    // only accept if it improves over original size (i.e., smaller)
                    if (b.size < originalSize) best = { blob: b, q: mid };
                    low = mid; // try to increase quality while staying <= target
                  } else {
                    // too large, decrease quality
                    high = mid;
                  }
                }

                if (best) return resolve(best.blob);
                // If no candidate <= target (or all were >= original), produce blob with the lowest quality tried and compare
                const fallback = await toBlob(0.05, outMime);
                if (!fallback) return reject(new Error('Falha ao criar blob'));
                if (fallback.size >= originalSize) return resolve(file);
                return resolve(fallback);
              } catch (e) { reject(e); }
            };
            img.onerror = () => reject(new Error('Falha ao carregar imagem'));
            img.src = String(reader.result);
          };
          reader.readAsDataURL(file);
        });
      };

      // If convert mode, call server API to handle conversions (supports many formats)
      let results: any[] = [];
      if (mode === 'convert') {
        try {
          const outFormat = (selectedConvertFormat ?? convertProps?.format ?? defaultConvert.format).toLowerCase();
          const form = new FormData();
          // append each file under 'files' field to match server route
          selectedFiles.forEach((f) => form.append('files', f));
          form.append('outputFormat', outFormat);
          if (convertProps?.preserveName || convertProps?.preserveName === true) {
            form.append('preserveName', '1');
          }

          const resp = await fetch('/api/convert-multiple', {
            method: 'POST',
            body: form,
          });

          const data = await resp.json();
          if (!resp.ok || !data.success) {
            throw new Error(data?.error || 'Erro na API durante conversão');
          }

          const converted = data?.data?.converted ?? [];
          // Map API response to result items
          for (const item of converted) {
            results.push({
              originalFile: { name: item.originalFile?.name, size: item.originalFile?.size },
              processedFile: { name: item.convertedFile?.name ?? item.originalFile?.name, size: item.convertedFile?.size ?? 0, downloadUrl: item.convertedFile?.downloadUrl },
              processedBlob: null,
            });
          }
        } catch (e) {
          console.error('Conversion API failed', e);
          // fallback: mark all as failed
          results = selectedFiles.map((f) => ({ originalFile: { name: f.name, size: f.size }, processedFile: { name: f.name, size: f.size }, processedBlob: null }));
        }
      } else {
        const targetBytes = mode === 'compress' ? ((compressProps?.targetKb ?? defaultCompress.targetKb) * 1024) : undefined;
        results = [];
        for (const file of selectedFiles) {
          let processedBlob: Blob | null = null;
          try {
            if (file.type.startsWith('image/')) {
              // If targetBytes is set and outputMime is png, we will attempt webp conversion inside compressImage
              processedBlob = await compressImage(file, outputMime, qualityFactor, targetBytes);
            }
          } catch (e) {
            console.warn('Compression failed for', file.name, e);
            processedBlob = null;
          }

          const processedSize = processedBlob ? processedBlob.size : Math.round(file.size * 0.9);
          results.push({
            originalFile: { name: file.name, size: file.size },
            processedFile: { name: file.name, size: processedSize },
            processedBlob,
          });
        }
      }

      const mockResult = {
        success: true,
        data: {
          items: results,
          configuration: mode === 'compress' ? { ...(compressProps ?? defaultCompress) } : mode === 'extreme' ? { ...(extremeProps ?? defaultExtreme) } : { ...(convertProps ?? defaultConvert) },
          mode,
        },
      };

      setProgress(100);
      setResult(mockResult);
      onComplete?.(mockResult);
    } catch (err) {
      onError?.('Erro durante o processamento');
    } finally {
      setIsProcessing(false);
    }
  };

  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card p-6 relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-semibold text-white">
            {mode === 'extreme' ? 'Compressão Premium' : mode === 'convert' ? 'Conversão' : 'Comprimir Imagem'}
          </h3>
          
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="relative p-2 rounded-full hover:bg-gray-700 transition-colors"
            aria-label="Configurações"
          >
            <svg 
              className="w-6 h-6 text-gray-400"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {/* small badge to indicate formats available when files selected */}
            {selectedFiles && selectedFiles.length > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>

        {showSettings && (
          <div className="mb-4 p-4 bg-gray-800 rounded-lg animate-fade-in">
            {/* If convert mode, show compact format selector and preserveName toggle */}
            {mode === 'convert' ? (
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 font-medium">Formatos de Saída</p>
                    <p className="text-sm text-gray-400">Escolha o formato desejado para o(s) arquivo(s) enviados</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="mb-2">
                    <input
                      placeholder="Buscar formato..."
                      value={searchFormats}
                      onChange={(e) => setSearchFormats(e.target.value)}
                      className="w-full p-2 bg-gray-700 rounded text-white text-sm"
                    />
                  </div>

                  <div className="mb-2 flex gap-2 overflow-auto">
                    {Object.keys(formatCategories).map((t) => (
                      <button key={t} onClick={() => setFormatsTab(t)} className={`px-3 py-1 rounded-md text-xs ${formatsTab === t ? 'bg-gradient-to-r from-gradient-purple to-gradient-pink text-white' : 'bg-gray-800 text-gray-300'}`}>
                        {t}
                      </button>
                    ))}
                  </div>

                  <div className="p-2 bg-gray-900 rounded">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {(formatCategories[formatsTab] ?? [])
                        .filter(f => f.label.toLowerCase().includes(searchFormats.toLowerCase()))
                        .filter(f => {
                          if (availableOutputs && availableOutputs.length > 0) return availableOutputs.includes(f.value.toLowerCase());
                          return true;
                        })
                        .map((fmt) => (
                          <button key={fmt.value} onClick={() => setSelectedConvertFormat(fmt.value)} className={`flex items-center justify-center gap-2 px-2 py-1 rounded-lg border transition-colors text-xs ${selectedConvertFormat === fmt.value ? 'bg-gradient-to-r from-gradient-purple to-gradient-pink text-white border-transparent shadow-glow' : 'bg-gray-800 text-gray-200 border-gray-700 hover:bg-gray-700'}`}>
                            {formatsTab === 'Imagem' ? <svg className="w-4 h-4 text-gray-200" /> : <svg className="w-4 h-4 text-gray-200" />}
                            <span className="font-medium">{fmt.label}</span>
                            {selectedConvertFormat === fmt.value && <CheckCircle className="w-4 h-4 text-white" />}
                          </button>
                        ))}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-gray-300">
                      <input type="checkbox" checked={convertProps?.preserveName ?? true} onChange={(e) => {
                        const next = { ...(convertProps ?? {}), preserveName: e.target.checked };
                        onConvertOptionsChange?.(next);
                      }} />
                      Preservar Nome
                    </label>
                    <div className="text-sm text-gray-400">Selecionado: <span className="text-white font-medium">{selectedConvertFormat ?? defaultConvert.format}</span></div>
                  </div>
                </div>
              </div>
            ) : (
              // existing compress settings
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 mb-2">Tamanho Máximo (KB)</p>
                  <input
                    type="number"
                    className="w-full p-2 bg-white text-black rounded"
                    value={(compressProps?.targetKb ?? defaultCompress.targetKb)}
                    onChange={(e) => {
                      const value = Number(e.target.value || 0);
                      const next = { ...(compressProps ?? defaultCompress), targetKb: value };
                      onFileSelected?.(selectedFiles[0] ?? null);
                      onFilesSelected?.(selectedFiles);
                      onCompressOptionsChange?.(next);
                    }}
                  />
                </div>

                <div>
                  <p className="text-gray-400 mb-2">Qualidade (%)</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={(compressProps?.quality ?? defaultCompress.quality)}
                      onChange={(e) => {
                        const value = Number(e.target.value || 0);
                        const next = { ...(compressProps ?? defaultCompress), quality: value };
                        onCompressOptionsChange?.(next);
                      }}
                      className="w-full"
                    />
                    <div className="w-14 text-right text-white">{compressProps?.quality ?? defaultCompress.quality}%</div>
                  </div>
                </div>

                <div>
                  <p className="text-gray-400 mb-2">Formato de Saída</p>
                  <select
                    className="w-full p-2 bg-white text-black rounded"
                    value={(compressProps?.format ?? defaultCompress.format)}
                    onChange={(e) => {
                      const value = e.target.value;
                      const next = { ...(compressProps ?? defaultCompress), format: value };
                      onCompressOptionsChange?.(next);
                    }}
                  >
                    <option value="keep">Manter</option>
                    <option value="jpeg">JPEG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WEBP</option>
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    id="preserveAspect"
                    type="checkbox"
                    checked={compressProps?.preserveAspect ?? defaultCompress.preserveAspect}
                    onChange={(e) => {
                      const next = { ...(compressProps ?? defaultCompress), preserveAspect: e.target.checked };
                      onCompressOptionsChange?.(next);
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="preserveAspect" className="text-gray-400">Manter proporção</label>
                </div>
              </div>
            )}
          </div>
        )}

        <ImageDropzone onFilesSelected={handleFilesSelected} maxSize={10 * 1024 * 1024} />

        {selectedFiles.length > 0 && !result && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{selectedFiles.length === 1 ? selectedFiles[0].name : `${selectedFiles.length} arquivos selecionados`}</p>
                <p className="text-gray-400 text-sm">Tamanho: {selectedFiles.length === 1 ? formatBytes(selectedFiles[0].size) : formatBytes(selectedFiles.reduce((s, f) => s + f.size, 0))}</p>
              </div>
            </div>

            {/* As opções agora são definidas nas páginas específicas e passadas via props para esse componente. */}

            <div className="flex items-center gap-2">
              <button onClick={handleStartProcessing} className="btn btn-primary" disabled={isProcessing}>
                <Upload className="w-4 h-4 mr-2" />
                <span>{mode === 'convert' ? 'Converter' : 'Comprimir'}</span>
              </button>
              <button onClick={() => { setSelectedFiles([]); setResult(null); setProgress(0); }} className="btn btn-secondary">Cancelar</button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="mt-4">
            <LoadingSpinner message={mode === 'convert' ? 'Convertendo...' : 'Processando...'} progress={progress} stage="optimizing" />
          </div>
        )}

        {result && (
          <div className="mt-6">
            <div className="p-4 bg-gray-800 rounded-lg">
                  <p className="text-white font-medium">Resultado</p>
                  {(() => {
                    const items: any[] = result?.data?.items ?? [];
                    if (items.length === 1) {
                      const it = items[0];
                      return (
                        <>
                          <p className="text-gray-400 text-sm">Arquivo original: {it.originalFile?.name} — {formatBytes(it.originalFile?.size ?? 0)}</p>
                          <p className="text-gray-400 text-sm">Arquivo processado: {it.processedFile?.name} — <strong className="text-white">{formatBytes(it.processedFile?.size ?? 0)}</strong></p>
                        </>
                      );
                    }

                    return (
                      <div>
                        <p className="text-gray-400 text-sm">Arquivos processados: {items.length}</p>
                        <div className="mt-3 grid gap-2">
                          {items.map((it, idx) => (
                            <div key={idx} className="p-2 bg-gray-900 rounded">
                              <div className="text-white font-medium">{it.originalFile?.name}</div>
                              <div className="text-gray-400 text-sm">Original: {formatBytes(it.originalFile?.size ?? 0)} — Processado: <strong className="text-white">{formatBytes(it.processedFile?.size ?? 0)}</strong></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  <div className="mt-3">
                    <p className="text-gray-300 text-sm mb-2">Configurações usadas:</p>
                    <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-lg border border-gray-700 shadow-sm">
                      <div className="grid grid-cols-1 gap-3 text-sm">
                        {Object.entries(result.data.configuration || {}).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between">
                            <div className="text-gray-400">{k}</div>
                            <div className="text-white font-medium">{String(v)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="mt-4 flex gap-3">
                    <button onClick={async () => {
                      // handle download
                      try {
                        // if we have a processed file blob/url in a real app, use it. Here fallback to selectedFile
                        // if multiple items, download them sequentially
                        const items = result?.data?.items ?? [];
                        if (items.length > 0) {
                          for (const it of items) {
                            const b = it.processedBlob instanceof Blob ? it.processedBlob : null;
                            const srcBlob = b ?? null;
                            if (!srcBlob) continue;
                            const url = URL.createObjectURL(srcBlob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = it.processedFile?.name ?? it.originalFile?.name ?? 'download';
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            URL.revokeObjectURL(url);
                          }
                          return;
                        }

                        let blob: Blob | null = null;
                        if (result?.data?.processedBlob instanceof Blob) blob = result.data.processedBlob;
                        else if (selectedFiles.length === 1) blob = selectedFiles[0];
                        if (!blob) return;

                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = result?.data?.processedFile?.name ?? selectedFiles[0]?.name ?? 'download';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error('Erro ao baixar:', err);
                      }
                    }} className="btn btn-primary flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      <span>Baixar Resultado</span>
                    </button>

              <button onClick={() => { setResult(null); setSelectedFiles([]); setProgress(0); }} className="btn btn-secondary">
                Processar Outra Imagem
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowSteps;

