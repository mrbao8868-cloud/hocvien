import React, { useState, useEffect } from 'react';
import { XIcon } from './icons';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (apiKey: string) => void;
  currentApiKey: string;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose, onSave, currentApiKey }) => {
  const [key, setKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      setKey(currentApiKey);
    }
  }, [isOpen, currentApiKey]);

  const handleSave = () => {
    if (key.trim()) {
      onSave(key.trim());
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg bg-gray-800 border border-gray-700 rounded-2xl shadow-xl flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Cấu hình API Key</h2>
          {currentApiKey && (
            <button onClick={onClose} className="p-1 text-gray-500 hover:text-white">
                <XIcon className="w-5 h-5"/>
            </button>
          )}
        </div>
        <div className="p-6">
          <div>
            <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">API Key</label>
            <input
              id="api-key-input"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Nhập API Key của bạn vào đây"
              className="w-full p-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-4 bg-gray-900/50 border-t border-gray-700 rounded-b-xl">
          {currentApiKey && (
            <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded-md transition-colors">
                Hủy
            </button>
           )}
          <button onClick={handleSave} disabled={!key.trim()} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:bg-indigo-800 disabled:cursor-not-allowed transition-colors">
            Lưu và Sử dụng
          </button>
        </div>
      </div>
    </div>
  );
};