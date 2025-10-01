import React, { useState, useEffect, useRef } from 'react';
import { PlusIcon, TrashIcon, XIcon, UsersIcon, UploadIcon, LoadingSpinnerIcon } from './icons';

export interface ProjectCharacter {
  id: number;
  name: string;
  description: string;
}

interface CharacterManagerProps {
  isOpen: boolean;
  onClose: () => void;
  characters: ProjectCharacter[];
  setCharacters: React.Dispatch<React.SetStateAction<ProjectCharacter[]>>;
  onAnalyzeImage: (image: { mimeType: string; data: string }) => Promise<string>;
  isAnalyzing: boolean;
}

const characterSuggestions = [
  {
    category: 'Ngoại hình',
    items: ['tóc đen dài', 'mắt bồ câu', 'nước da trắng hồng', 'dáng người thon thả', 'khuôn mặt trái xoan', 'nụ cười tỏa nắng', 'vẻ mặt phúc hậu']
  },
  {
    category: 'Trang phục',
    items: ['mặc áo dài truyền thống', 'khoác áo bà ba', 'đội nón lá', 'mặc đồng phục học sinh', 'trang phục công sở thanh lịch', 'mặc áo sơ mi trắng']
  },
  {
    category: 'Tính cách',
    items: ['trầm tư, ít nói', 'vui vẻ, hòa đồng', 'dịu dàng, nhân hậu', 'nghiêm nghị, quyết đoán', 'thông minh, nhanh nhẹn', 'chân thành, giản dị']
  },
  {
    category: 'Hành động',
    items: ['đang ngồi uống trà', 'nhìn ra cửa sổ', 'đi dạo trong vườn', 'cười nói vui vẻ', 'làm việc trên máy tính', 'đọc một cuốn sách']
  }
];

export const CharacterManager: React.FC<CharacterManagerProps> = ({ isOpen, onClose, characters, setCharacters, onAnalyzeImage, isAnalyzing }) => {
  const [editingCharacter, setEditingCharacter] = useState<ProjectCharacter | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEditingCharacter(null);
      setAnalysisError(null);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (editingCharacter && editingCharacter.name.trim()) {
      const isUpdating = characters.some(c => c.id === editingCharacter.id);
      if (isUpdating) {
        setCharacters(characters.map(c => c.id === editingCharacter.id ? editingCharacter : c));
      } else {
        setCharacters([...characters, editingCharacter]);
      }
      setEditingCharacter(null);
    }
  };

  const handleAddNew = () => {
    setEditingCharacter({ id: Date.now(), name: '', description: '' });
  };
  
  const handleEdit = (character: ProjectCharacter) => {
    setEditingCharacter(character);
  };
  
  const handleDelete = (id: number) => {
    setCharacters(characters.filter(c => c.id !== id));
    if (editingCharacter?.id === id) {
      setEditingCharacter(null);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (editingCharacter) {
      setEditingCharacter({
        ...editingCharacter,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!editingCharacter) return;
    
    const currentDescription = editingCharacter.description;
    const separator = currentDescription.length > 0 && !currentDescription.endsWith(', ') && !currentDescription.endsWith(' ') ? ', ' : '';
    const newDescription = currentDescription + separator + suggestion;

    setEditingCharacter({ ...editingCharacter, description: newDescription });
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!editingCharacter) return;
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        setAnalysisError(null);
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const base64String = (reader.result as string).split(',')[1];
                const imageObject = {
                    mimeType: file.type,
                    data: base64String,
                };
                const description = await onAnalyzeImage(imageObject);
                setEditingCharacter(prev => prev ? { ...prev, description } : null);
            } catch (error) {
                console.error("Analysis failed:", error);
                setAnalysisError("Phân tích hình ảnh thất bại. Vui lòng thử lại.");
            }
        };
        reader.readAsDataURL(file);
    }
    if (e.target) {
        e.target.value = '';
    }
  };

  if (!isOpen) return null;

  const commonInputClasses = "w-full p-2.5 bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white/10 transition-all text-gray-200 placeholder-gray-500";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <UsersIcon className="w-6 h-6 text-indigo-400"/>
            <h2 className="text-lg font-semibold text-white">Thư viện nhân vật</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <XIcon className="w-5 h-5"/>
          </button>
        </div>

        <div className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-4">
          {characters.length === 0 && !editingCharacter && (
            <div className="text-center text-gray-400 py-10">
              <p>Thư viện của bạn trống.</p>
              <p className="text-sm mt-1">Nhấn "Thêm nhân vật mới" để bắt đầu.</p>
            </div>
          )}
          {characters.map(char => (
            <div key={char.id} className="p-3 bg-white/5 rounded-lg flex items-center justify-between transition-colors hover:bg-white/10">
              <div>
                <p className="font-semibold text-white">{char.name}</p>
                <p className="text-sm text-gray-400 truncate max-w-md">{char.description || "Chưa có mô tả"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(char)} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium">Sửa</button>
                <button onClick={() => handleDelete(char.id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors">
                  <TrashIcon className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))}

          {editingCharacter && (
            <div className="p-4 bg-black/20 rounded-lg border border-indigo-500/30 mt-4 space-y-4">
              <h3 className="font-semibold text-white">{characters.some(c => c.id === editingCharacter.id) ? "Chỉnh sửa nhân vật" : "Tạo nhân vật mới"}</h3>
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-300">Tên định danh (*)</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="ví dụ: Cô giáo trẻ"
                  value={editingCharacter.name}
                  onChange={handleInputChange}
                  className={`mt-1.5 ${commonInputClasses}`}
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="description" className="text-sm font-medium text-gray-300">Mô tả chi tiết</label>
                    <input
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleFileChange}
                        className="hidden"
                        ref={fileInputRef}
                        disabled={isAnalyzing}
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isAnalyzing}
                        className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold p-1 rounded-md hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-wait"
                    >
                       {isAnalyzing ? <LoadingSpinnerIcon className="w-4 h-4 animate-spin"/> : <UploadIcon className="w-4 h-4" />}
                        {isAnalyzing ? 'Đang phân tích...' : 'Phân tích từ ảnh'}
                    </button>
                </div>
                <div className="relative">
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Mô tả ngoại hình, tính cách, trang phục... hoặc tải ảnh lên để AI phân tích."
                    value={editingCharacter.description}
                    onChange={handleInputChange}
                    rows={4}
                    className={`${commonInputClasses} resize-none disabled:bg-gray-700`}
                    disabled={isAnalyzing}
                  />
                  {isAnalyzing && (
                      <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center rounded-md">
                          <LoadingSpinnerIcon className="w-6 h-6 animate-spin text-indigo-400" />
                      </div>
                  )}
                </div>
                {analysisError && <p className="text-xs text-red-400 mt-1">{analysisError}</p>}
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-sm font-medium text-gray-400">Gợi ý mô tả:</p>
                {characterSuggestions.map(group => (
                  <div key={group.category}>
                    <h4 className="text-xs font-semibold text-indigo-300 mb-2">{group.category}</h4>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map(item => (
                        <button
                          key={item}
                          onClick={() => handleSuggestionClick(item)}
                          className="px-2.5 py-1 bg-white/5 text-gray-300 text-xs rounded-full hover:bg-white/10 hover:text-white transition-colors"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <button onClick={() => setEditingCharacter(null)} className="w-full sm:w-auto px-4 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors">Hủy</button>
                <button onClick={handleSave} disabled={!editingCharacter.name.trim()} className="w-full sm:w-auto px-4 py-2 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:bg-gray-700 disabled:text-gray-400 transition-colors">Lưu</button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-black/20 flex-shrink-0">
          <button onClick={handleAddNew} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600/80 text-white font-semibold rounded-lg hover:bg-indigo-600 disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors" disabled={!!editingCharacter}>
            <PlusIcon className="w-5 h-5"/>
            Thêm nhân vật mới
          </button>
        </div>
      </div>
    </div>
  );
};