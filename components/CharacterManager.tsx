import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, XIcon, UsersIcon } from './icons';

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
}

// Data for suggestions, with a Vietnamese context
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

export const CharacterManager: React.FC<CharacterManagerProps> = ({ isOpen, onClose, characters, setCharacters }) => {
  const [editingCharacter, setEditingCharacter] = useState<ProjectCharacter | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setEditingCharacter(null);
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
    // Add a space if the description is not empty and doesn't already end with a space.
    const separator = currentDescription.length > 0 && !currentDescription.endsWith(' ') ? ' ' : '';
    const newDescription = currentDescription + separator + suggestion;

    setEditingCharacter({ ...editingCharacter, description: newDescription });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="relative w-full max-w-2xl bg-gray-800 border border-gray-700 rounded-2xl shadow-xl flex flex-col max-h-[90vh]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            <UsersIcon className="w-6 h-6 text-indigo-400"/>
            <h2 className="text-lg font-semibold text-white">Thư viện nhân vật</h2>
          </div>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-white">
            <XIcon className="w-5 h-5"/>
          </button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto space-y-4">
          {characters.length === 0 && !editingCharacter && (
            <div className="text-center text-gray-400 py-10">
              <p>Thư viện của bạn trống.</p>
              <p>Nhấn "Thêm nhân vật mới" để bắt đầu.</p>
            </div>
          )}
          {characters.map(char => (
            <div key={char.id} className="p-3 bg-gray-900/50 rounded-lg flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">{char.name}</p>
                <p className="text-sm text-gray-400 truncate max-w-md">{char.description || "Chưa có mô tả"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(char)} className="text-sm text-indigo-400 hover:text-indigo-300">Sửa</button>
                <button onClick={() => handleDelete(char.id)} className="p-1 text-gray-500 hover:text-red-400">
                  <TrashIcon className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))}

          {editingCharacter && (
            <div className="p-4 bg-gray-900 rounded-lg border border-indigo-500/50 mt-4 space-y-3">
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
                  className="mt-1 w-full p-2 text-sm bg-gray-800/60 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium text-gray-300">Mô tả chi tiết</label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Mô tả ngoại hình, tính cách, trang phục..."
                  value={editingCharacter.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 w-full p-2 text-sm bg-gray-800/60 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              {/* Suggestions Section */}
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
                          className="px-2.5 py-1 bg-gray-700 text-gray-300 text-xs rounded-full hover:bg-gray-600 hover:text-white transition-colors"
                        >
                          + {item}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button onClick={() => setEditingCharacter(null)} className="px-3 py-1 text-sm bg-gray-600 hover:bg-gray-500 rounded-md">Hủy</button>
                <button onClick={handleSave} disabled={!editingCharacter.name.trim()} className="px-3 py-1 text-sm bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:bg-indigo-800">Lưu</button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700">
          <button onClick={handleAddNew} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600/80 text-white font-semibold rounded-lg hover:bg-indigo-600 disabled:bg-indigo-900 transition-colors" disabled={!!editingCharacter}>
            <PlusIcon className="w-5 h-5"/>
            Thêm nhân vật mới
          </button>
        </div>
      </div>
    </div>
  );
};
