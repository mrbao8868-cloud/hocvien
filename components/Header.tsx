import React from 'react';
import { FilmIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-flex items-center justify-center bg-indigo-500/10 text-indigo-400 p-3 rounded-full mb-4">
        <FilmIcon className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-500">
        ỨNG DỤNG HỖ TRỢ HỌC VIÊN
      </h1>
      <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
        Trung tâm tin học ứng dụng Bal Digitech. Điện thoại: 0972.300.864
      </p>
    </header>
  );
};