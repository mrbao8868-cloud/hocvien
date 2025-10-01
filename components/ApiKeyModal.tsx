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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Cấu hình API Key</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
              <XIcon className="w-5 h-5"/>
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-4">
            <p className="text-sm text-gray-400 leading-relaxed">
              API Key của bạn được lưu trữ an toàn trong bộ nhớ cục bộ (localStorage) của trình duyệt. Ứng dụng này không lưu trữ hay gửi key của bạn đến bất kỳ nơi nào khác.
            </p>
          <div>
            <label htmlFor="api-key-input" className="block text-sm font-medium text-gray-300 mb-2">Google AI API Key</label>
            <input
              id="api-key-input"
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Nhập API Key của bạn vào đây"
              className="w-full p-2.5 bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white/10 transition-all text-gray-200"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 p-4 bg-black/20 border-t border-white/10 rounded-b-2xl">
          <button onClick={onClose} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors">
              Hủy
          </button>
          <button onClick={handleSave} disabled={!key.trim()} className="px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:bg-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
            Lưu và Sử dụng
          </button>
        </div>
      </div>
    </div>
  );
};