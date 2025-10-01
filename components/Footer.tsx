import React from 'react';

interface FooterProps {
  onOpenApiKeyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenApiKeyModal }) => {
    return (
        <footer className="w-full text-center p-4 z-10">
            <p className="text-sm text-gray-500 mb-1">
                Trung tâm tin học ứng dụng Bal Digitech. Điện thoại: 0972.300.864
            </p>
            <div className="flex justify-center items-center gap-4">
                 <p className="text-sm text-gray-500">
                    Powered by Google Gemini API.
                </p>
                <span className="text-gray-600">|</span>
                <button onClick={onOpenApiKeyModal} className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
                    Cấu hình API Key
                </button>
            </div>
        </footer>
    );
};