
import React from 'react';
import { ExclamationTriangleIcon } from './icons';

interface ErrorDisplayProps {
  message: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message }) => {
  return (
    <div className="mt-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center gap-3">
      <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
      <span className="text-sm">{message}</span>
    </div>
  );
};
