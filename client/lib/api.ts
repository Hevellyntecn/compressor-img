import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Configuração do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 segundos para uploads grandes
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Interceptor para adicionar token se necessário
api.interceptors.request.use(
  (config) => {
    // Aqui você pode adicionar autenticação se necessário
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 413) {
      throw new Error('Arquivo muito grande. Tamanho máximo: 10MB');
    }
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Timeout: O arquivo está demorando muito para ser processado');
    }
    
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    
    throw new Error('Erro na comunicação com o servidor');
  }
);

export interface CompressionResult {
  success: boolean;
  data: {
    originalFile: {
      name: string;
      size: number;
      format: string;
      dimensions: string;
    };
    compressedFile: {
      name: string;
      size: number;
      format: string;
      dimensions: string;
      path: string;
      downloadUrl: string;
    };
    compression: {
      ratio: string;
      originalSize: number;
      compressedSize: number;
      savedBytes: number;
      scaled: boolean;
      scaleFactor: number;
    };
    processing: {
      time: number;
      quality: string;
    };
  };
}

export interface MultipleCompressionResult {
  success: boolean;
  data: {
    processed: Array<{
      originalFile: {
        name: string;
        size: number;
        format: string;
        dimensions: string;
      };
      compressedFile: {
        name: string;
        size: number;
        format: string;
        dimensions: string;
        downloadUrl: string;
      };
      compression: {
        ratio: string;
        originalSize: number;
        compressedSize: number;
        savedBytes: number;
      };
    }>;
    errors: Array<{
      fileName: string;
      error: string;
    }>;
    summary: {
      total: number;
      successful: number;
      failed: number;
    };
  };
}

export interface FileInfo {
  success: boolean;
  data: {
    filename: string;
    size: number;
    created: string;
    modified: string;
    format: string;
    dimensions: string;
    downloadUrl: string;
  };
}

export interface HealthCheck {
  status: string;
  timestamp: string;
  uptime: number;
  version: string;
  environment: string;
}

export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  endpoints: Record<string, any>;
  limits: {
    maxFileSize: number;
    maxFiles: number;
    targetSize: number;
    supportedFormats: string[];
  };
}

// Função para comprimir uma única imagem
export const compressImage = async (file: File, keepOriginalName: boolean = false): Promise<CompressionResult> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('keepOriginalName', keepOriginalName.toString());

  const response = await api.post('/compress', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / (progressEvent.total || 1)
      );
      // Você pode emitir eventos de progresso aqui se necessário
    },
  });

  return response.data;
};

// Função para compressão (API client)
export const compressImageExtreme = async (file: File): Promise<CompressionResult> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await api.post('/compress-extreme', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Função para comprimir múltiplas imagens
export const compressMultipleImages = async (files: File[]): Promise<MultipleCompressionResult> => {
  const formData = new FormData();
  
  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await api.post('/compress-multiple', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Função para obter informações de um arquivo
export const getFileInfo = async (filename: string): Promise<FileInfo> => {
  const response = await api.get(`/info/${filename}`);
  return response.data;
};

// Função para fazer download de um arquivo
export const downloadFile = async (filename: string): Promise<Blob> => {
  const response = await api.get(`/download/${filename}`, {
    responseType: 'blob',
  });
  return response.data;
};

// Função para verificar saúde da API
export const checkHealth = async (): Promise<HealthCheck> => {
  const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/health`);
  return response.data;
};

// Função para obter informações da API
export const getApiInfo = async (): Promise<ApiInfo> => {
  const response = await api.get('/info');
  return response.data;
};

// Função para limpar arquivos temporários
export const cleanupFiles = async (): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete('/cleanup');
  return response.data;
};

// Função para converter documento
export const convertDocument = async (file: File, outputFormat: string, options: any = {}): Promise<any> => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('outputFormat', outputFormat);
  
  // Adiciona opções se fornecidas
  Object.keys(options).forEach(key => {
    formData.append(key, options[key]);
  });

  const response = await api.post('/convert', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Função para obter formatos suportados
export const getSupportedFormats = async (): Promise<any> => {
  const response = await api.get('/formats');
  return response.data;
};

// Utilitários para formatação
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const formatDuration = (milliseconds: number): string => {
  if (milliseconds < 1000) {
    return `${milliseconds}ms`;
  }
  
  const seconds = Math.round(milliseconds / 1000);
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}m ${remainingSeconds}s`;
};

export const getCompressionColor = (ratio: string): string => {
  const ratioNum = parseFloat(ratio);
  
  if (ratioNum >= 70) return 'text-success-600';
  if (ratioNum >= 50) return 'text-warning-600';
  return 'text-error-600';
};

export const getCompressionIcon = (ratio: string): string => {
  const ratioNum = parseFloat(ratio);
  
  if (ratioNum >= 70) return '🎉';
  if (ratioNum >= 50) return '✅';
  return '⚠️';
};

export default api;
