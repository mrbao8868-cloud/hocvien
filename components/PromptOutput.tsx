import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from './icons';

type LoadingState = 'none' | 'video' | 'image';

interface PromptOutputProps {
  prompt: string;
  images: string[];
  loadingState: LoadingState;
}

export const PromptOutput: React.FC<PromptOutputProps> = ({ prompt, images, loadingState }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!prompt) {
      setCopied(false);
    }
  }, [prompt]);

  const handleCopy = () => {
    if (prompt) {
      navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const hasContent = prompt || images.length > 0;
  if (loadingState === 'none' && !hasContent) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Image Output */}
      {loadingState === 'image' || images.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">Ảnh đã tạo:</h3>
          <div className="grid grid-cols-1 gap-4">
            {loadingState === 'image' && images.length === 0 ? (
              <div className="w-full aspect-video bg-gray-700 rounded-lg animate-pulse"></div>
            ) : (
              images.map((imgData, index) => (
                <img
                  key={index}
                  src={`data:image/jpeg;base64,${imgData}`}
                  alt={`Generated image ${index + 1}`}
                  className="w-full h-auto rounded-lg border border-gray-700"
                />
              ))
            )}
          </div>
        </div>
      ) : null}

      {/* Prompt Output */}
      {loadingState !== 'none' || prompt ? (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            {loadingState === 'image' || images.length > 0 ? 'Prompt đã dùng để tạo ảnh:' : 'Prompt video đã tạo:'}
          </h3>
          <div className="relative w-full min-h-[120px] p-4 bg-gray-900/70 border border-gray-700 rounded-lg text-gray-300 font-mono text-sm whitespace-pre-wrap transition-opacity duration-500">
            {loadingState !== 'none' && !prompt && (
              <div className="flex items-center justify-center h-full">
                <div className="space-y-3 w-full">
                  <div className="h-4 bg-gray-700 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
                </div>
              </div>
            )}
            {prompt && <p>{prompt}</p>}
            {prompt && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 p-2 bg-gray-700/50 hover:bg-gray-600 rounded-md transition-colors"
                title="Sao chép prompt"
              >
                {copied ? (
                  <CheckIcon className="w-5 h-5 text-green-400" />
                ) : (
                  <ClipboardIcon className="w-5 h-5 text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};