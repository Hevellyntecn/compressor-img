'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Selecione uma opção',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`w-full p-3 bg-gray-900 text-white rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
          isOpen 
            ? 'border-[#8B5CF6] shadow-glow' 
            : 'border-gray-700 hover:border-gray-600'
        }`}
      >
        <div className="flex flex-col items-start flex-1 min-w-0">
          <span className="text-white font-medium truncate w-full">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.description && (
            <span className="text-xs text-gray-400 mt-0.5">
              {selectedOption.description}
            </span>
          )}
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 ml-2 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute z-[100] w-full mt-2 bg-gray-900 border-2 border-gray-700 rounded-lg shadow-xl overflow-hidden animate-fade-in"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="max-h-64 overflow-y-auto scrollbar-hide">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-4 py-3 text-left transition-all duration-150 flex items-center justify-between ${
                  value === option.value
                    ? 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#EC4899]/20 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-gray-400 mt-0.5">
                      {option.description}
                    </span>
                  )}
                </div>
                {value === option.value && (
                  <Check className="w-5 h-5 text-[#8B5CF6] ml-2 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;

