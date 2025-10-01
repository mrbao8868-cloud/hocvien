import React from 'react';

interface FooterProps {
    onApiKeyChangeClick: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onApiKeyChangeClick }) => {
    return (
        <footer className="w-full text-center p-4 z-10">
            <p className="text-sm text-gray-500 mb-1">
                Trung tâm tin học ứng dụng Bal Digitech. Điện thoại: 0972.300.864
            </p>
            <div className="flex justify-center items-center gap-4">
                 <p className="text-sm text-gray-500">
                    Powered by Google Gemini API.
                </p>
                <button 
                    onClick={onApiKeyChangeClick} 
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline"
                >
                    Đổi API Key
                </button>
            </div>
        </footer>
    );
};