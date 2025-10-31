'use client';

import React from 'react';
import { CheckCircle, Loader2, Clock } from 'lucide-react';

interface ProgressStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  icon?: React.ReactNode;
}

interface ProgressBarProps {
  steps: ProgressStep[];
  currentStep?: string;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ 
  steps, 
  currentStep, 
  className = '' 
}) => {
  const getStepIcon = (step: ProgressStep) => {
    if (step.status === 'completed') {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    } else if (step.status === 'active') {
      return <Loader2 className="w-5 h-5 text-gradient-pink animate-spin" />;
    } else {
      return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStepClasses = (step: ProgressStep, index: number) => {
    const baseClasses = "flex items-center space-x-3 p-4 rounded-lg transition-all duration-300";
    
    if (step.status === 'completed') {
      return `${baseClasses} bg-green-500/10 border border-green-500/20`;
    } else if (step.status === 'active') {
      return `${baseClasses} bg-gradient-to-r from-gradient-purple/10 to-gradient-pink/10 border border-gradient-purple/30 shadow-glow`;
    } else {
      return `${baseClasses} bg-gray-800/30 border border-gray-700/50`;
    }
  };

  const getTextClasses = (step: ProgressStep) => {
    if (step.status === 'completed') {
      return "text-green-400";
    } else if (step.status === 'active') {
      return "text-white";
    } else {
      return "text-gray-400";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className={getStepClasses(step, index)}>
          {/* Ícone do passo */}
          <div className="flex-shrink-0">
            {step.icon || getStepIcon(step)}
          </div>

          {/* Conteúdo do passo */}
          <div className="flex-1 min-w-0">
            <h3 className={`text-sm font-semibold ${getTextClasses(step)}`}>
              {step.title}
            </h3>
            <p className={`text-xs mt-1 ${getTextClasses(step)} opacity-80`}>
              {step.description}
            </p>
          </div>

          {/* Indicador de progresso */}
          {step.status === 'active' && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gradient-purple to-gradient-pink flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
            </div>
          )}

          {step.status === 'completed' && (
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            </div>
          )}

          {/* Conector para próximo passo */}
          {index < steps.length - 1 && (
            <div className="absolute left-6 top-full w-0.5 h-4 bg-gradient-to-b from-gray-600 to-transparent"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressBar;
