import React from 'react';

interface FooterProps {
  onOpenApiKeyModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenApiKeyModal }) => {
    return (
        <footer className="w-full text-center p-6 z-10 space-y-2">
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                <p className="text-sm text-gray-500">
                    Trung tâm tin học ứng dụng Bal Digitech. ĐT: 0972.300.864
                </p>
                <button onClick={onOpenApiKeyModal} className="text-sm text-gray-500 hover:text-indigo-400 transition-colors">
                    Cấu hình API Key
                </button>
            </div>
             <p className="text-sm text-white font-medium">
                Ứng dụng được phát triển bởi Thầy Giới.
            </p>
        </footer>
    );
};