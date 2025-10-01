import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from './icons';

type LoadingState = 'none' | 'video';

interface PromptOutputProps {
  prompt: string;
  loadingState: LoadingState;
}

export const PromptOutput: React.FC<PromptOutputProps> = ({ prompt, loadingState }) => {
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
  
  const hasContent = prompt;
  if (loadingState === 'none' && !hasContent) {
    return null;
  }

  return (
    <div className="mt-8 space-y-6">
      {/* Prompt Output */}
      {loadingState !== 'none' || prompt ? (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Prompt video đã tạo:
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