import React from 'react';
import { FilmIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-flex items-center justify-center bg-gradient-to-br from-purple-600/20 to-indigo-600/20 text-indigo-300 p-3 rounded-full mb-4 ring-1 ring-white/10">
        <FilmIcon className="w-8 h-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-purple-400 to-indigo-500 drop-shadow-[0_0_15px_rgba(192,132,252,0.3)]">
        ỨNG DỤNG TẠO PROMPT
      </h1>
      <div className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-400 max-w-4xl mx-auto leading-relaxed space-y-3">
        <p className="font-semibold text-gray-200 text-base sm:text-lg">
          Trung tâm tin học ứng dụng Bal Digitech
        </p>
        <div className="text-sm sm:text-base space-y-1.5 pt-1">
          <p>
              <span className="font-semibold text-yellow-400">Cung cấp:</span> Tài khoản Canva, các ứng dụng hỗ trợ giáo viên.
          </p>
          <p>
              <span className="font-semibold text-cyan-400">Đào tạo:</span> Trí tuệ nhân tạo, E-learning, ứng dụng AI trong giáo dục.
          </p>
          <p className="font-semibold text-green-400">
            Nhận đào tạo tại nhà trường và đào tạo Online.
          </p>
        </div>
        <p className="pt-2 text-sm sm:text-base font-semibold text-indigo-300 tracking-wider">
            Điện thoại: 0972.300.864 - Thầy Giới
        </p>
      </div>
    </header>
  );
};