import React, { useState, useEffect } from 'react';
import { ClipboardIcon, CheckIcon } from './icons';
import { ActiveTab } from './PromptInput';

type LoadingState = 'none' | 'video' | 'image';

interface PromptOutputProps {
  prompt: string;
  loadingState: LoadingState;
  activeTab: ActiveTab;
}

export const PromptOutput: React.FC<PromptOutputProps> = ({ prompt, loadingState, activeTab }) => {
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

  const title = activeTab === 'image' ? 'Prompt ảnh đã tạo:' : 'Prompt video đã tạo:';

  return (
    <div className="mt-8 space-y-6">
      {/* Prompt Output */}
      {loadingState !== 'none' || prompt ? (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            {title}
          </h3>
          <div className="relative w-full min-h-[140px] p-4 bg-black/30 border border-white/10 rounded-xl text-gray-300 font-mono text-sm whitespace-pre-wrap transition-opacity duration-500">
            {loadingState !== 'none' && !prompt && (
              <div className="flex items-center justify-center h-full">
                <div className="space-y-3 w-full">
                  <div className="h-4 bg-white/10 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-white/10 rounded w-5/6 animate-pulse"></div>
                </div>
              </div>
            )}
            {prompt && <p>{prompt}</p>}
            {prompt && (
              <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                title="Sao chép prompt"
              >
                {copied ? (
                  <CheckIcon className="w-5 h-5 text-green-400" />
                ) : (
                  <ClipboardIcon className="w-5 h-5 text-gray-300" />
                )}
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};