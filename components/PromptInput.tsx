import React, { useRef } from 'react';
import { LoadingSpinnerIcon, XIcon, UsersIcon, FilmIcon, ImageIcon, UploadIcon } from './icons';
import { ProjectCharacter } from './CharacterManager';

export interface SceneCharacter extends ProjectCharacter {
  dialogue: string;
}

type LoadingState = 'none' | 'video' | 'image';
export type ActiveTab = 'video' | 'image' | 'imageToVideo';

const VIDEO_VISUAL_STYLES = [
  {
    category: 'Phong cách video',
    description: 'Giao diện và cảm nhận nghệ thuật cho video.',
    styles: [
      { name: 'Hiện thực', description: 'Tái tạo thế giới thực một cách chân thực, như máy ảnh.' },
      { name: 'Điện ảnh', description: 'Tạo cảm giác như một bộ phim với ánh sáng, góc quay và màu sắc chuyên nghiệp.' },
      { name: 'Hoạt hình', description: 'Hoạt hình 3D hiện đại, mặc định theo phong cách Pixar. Rõ ràng và thân thiện.' }
    ]
  }
];

const IMAGE_STYLES: Array<'3D Hoạt hình' | 'Hiện thực'> = ['3D Hoạt hình', 'Hiện thực'];

interface PromptInputProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  mainIdea: string;
  onMainIdeaChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setting: string;
  onSettingChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  videoStyle: string[];
  onVideoStyleToggle: (style: string) => void;
  imageStyle: '3D Hoạt hình' | 'Hiện thực';
  onImageStyleChange: (style: '3D Hoạt hình' | 'Hiện thực') => void;
  projectCharacters: ProjectCharacter[];
  sceneCharacters: SceneCharacter[];
  onSceneCharactersChange: React.Dispatch<React.SetStateAction<SceneCharacter[]>>;
  onManageCharactersClick: () => void;
  onGenerateVideo: () => void;
  onGenerateImage: () => void;
  onGenerateVideoFromImage: () => void;
  loadingState: LoadingState;
  uploadedImage: { mimeType: string; data: string } | null;
  onUploadedImageChange: (image: { mimeType: string; data: string } | null) => void;
  apiKey: string;
}

const TabButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
}> = ({ onClick, isActive, children, icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 p-4 text-sm font-semibold border-b-2 transition-colors duration-200 ${
      isActive
        ? 'border-indigo-500 text-white'
        : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'
    }`}
  >
    {icon}
    {children}
  </button>
);

const CharacterSelector: React.FC<{
  projectCharacters: ProjectCharacter[];
  sceneCharacters: SceneCharacter[];
  onSceneCharactersChange: React.Dispatch<React.SetStateAction<SceneCharacter[]>>;
  onManageCharactersClick: () => void;
  isLoading: boolean;
  isForVideo: boolean; // Differentiates between video (with dialogue) and image (without)
  label: string;
}> = ({ projectCharacters, sceneCharacters, onSceneCharactersChange, onManageCharactersClick, isLoading, isForVideo, label }) => {
  
  const handleAddCharacterToScene = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const characterId = parseInt(e.target.value, 10);
    const characterToAdd = projectCharacters.find(c => c.id === characterId);
    if (characterToAdd && !sceneCharacters.some(sc => sc.id === characterId)) {
      onSceneCharactersChange([...sceneCharacters, { ...characterToAdd, dialogue: '' }]);
    }
    e.target.value = ""; // Reset select
  };

  const handleRemoveCharacterFromScene = (id: number) => {
    onSceneCharactersChange(sceneCharacters.filter(c => c.id !== id));
  };

  const handleDialogueChange = (id: number, dialogue: string) => {
    onSceneCharactersChange(sceneCharacters.map(c => c.id === id ? { ...c, dialogue } : c));
  };

  const availableCharacters = projectCharacters.filter(pc => !sceneCharacters.some(sc => sc.id === pc.id));
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        <button onClick={onManageCharactersClick} className="flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-semibold p-1 rounded-md hover:bg-indigo-500/10">
          <UsersIcon className="w-4 h-4" />
          Quản lý nhân vật
        </button>
      </div>
      <div className="p-3 bg-gray-900/50 border border-gray-700 rounded-lg space-y-3">
        {sceneCharacters.map((char) => (
          <div key={char.id} className={`p-3 bg-gray-800/60 rounded-md ${!isForVideo && 'flex justify-between items-center'}`}>
            <div className={`flex justify-between items-start ${isForVideo && 'mb-2'}`}>
              <div>
                <p className="font-semibold text-white">{char.name}</p>
                <p className="text-xs text-gray-400">{char.description || "Chưa có mô tả"}</p>
              </div>
              <button onClick={() => handleRemoveCharacterFromScene(char.id)} className="p-1 text-gray-500 hover:text-red-400">
                <XIcon className="w-4 h-4"/>
              </button>
            </div>
            {isForVideo && (
              <textarea
                placeholder={`Lời thoại cho ${char.name}...`}
                value={char.dialogue}
                onChange={(e) => handleDialogueChange(char.id, e.target.value)}
                disabled={isLoading}
                rows={2}
                className="w-full p-2 text-sm bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 resize-none text-gray-200 placeholder-gray-500"
              />
            )}
          </div>
        ))}
        {availableCharacters.length > 0 && (
          <select value="" onChange={handleAddCharacterToScene} disabled={isLoading} className="w-full p-2 text-sm bg-gray-700 border border-gray-600 rounded-md appearance-none focus:ring-1 focus:ring-indigo-500 text-gray-300">
            <option value="" disabled>-- Thêm nhân vật --</option>
            {availableCharacters.map(char => <option key={char.id} value={char.id}>{char.name}</option>)}
          </select>
        )}
        {projectCharacters.length === 0 && (
          <div className="text-center text-sm text-gray-500 py-2">
            Nhấn "Quản lý nhân vật" để tạo nhân vật đầu tiên.
          </div>
        )}
      </div>
    </div>
  );
};


export const PromptInput: React.FC<PromptInputProps> = (props) => {
  const { activeTab, onTabChange, mainIdea, onMainIdeaChange, setting, onSettingChange, 
          videoStyle, onVideoStyleToggle, imageStyle, onImageStyleChange,
          projectCharacters, sceneCharacters, onSceneCharactersChange, onManageCharactersClick,
          onGenerateVideo, onGenerateImage, onGenerateVideoFromImage, loadingState,
          uploadedImage, onUploadedImageChange, apiKey } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoading = loadingState !== 'none';
  const hasApiKey = !!apiKey;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        onUploadedImageChange({
          mimeType: file.type,
          data: base64String,
        });
      };
      reader.readAsDataURL(file);
    } else {
      onUploadedImageChange(null);
    }
  };


  const renderVideoForm = () => (
    <div className="space-y-4">
      {/* 1. Main Idea */}
      <div>
        <label htmlFor="video-idea" className="block text-sm font-medium text-gray-300 mb-1">1. Ý tưởng chính (*)</label>
        <input id="video-idea" type="text" value={mainIdea} onChange={onMainIdeaChange} placeholder="ví dụ: hai cô giáo đang nói chuyện với nhau" className="w-full p-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500" disabled={isLoading}/>
      </div>
      {/* 2. Setting */}
      <div>
        <label htmlFor="video-setting" className="block text-sm font-medium text-gray-300 mb-1">2. Bối cảnh</label>
        <input id="video-setting" type="text" value={setting} onChange={onSettingChange} placeholder="ví dụ: trong một lớp học, sân trường..." className="w-full p-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500" disabled={isLoading}/>
      </div>
      {/* 3. Video Style */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">3. Phong cách video</label>
        {VIDEO_VISUAL_STYLES.map(category => (
          <div key={category.category} className="flex flex-wrap gap-2">
            {category.styles.map(styleItem => (
              <div key={styleItem.name} className="relative group">
                <button onClick={() => onVideoStyleToggle(styleItem.name)} disabled={isLoading} className={`px-3 py-1 text-sm rounded-full transition-colors font-medium ${videoStyle.includes(styleItem.name) ? 'bg-indigo-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>
                  {styleItem.name}
                </button>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs p-2 text-xs text-white bg-gray-900 border border-gray-600 rounded-md shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none z-10">{styleItem.description}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* 4. Characters */}
      <CharacterSelector {...props} isForVideo={true} label="4. Nhân vật & Lời thoại" />
      {/* Submit Button */}
      <div className="pt-4">
        <button onClick={onGenerateVideo} disabled={isLoading || !mainIdea.trim() || !hasApiKey} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 disabled:transform-none">
          {loadingState === 'video' ? <><LoadingSpinnerIcon className="w-5 h-5 animate-spin" />Đang tạo...</> : 
            !hasApiKey ? 'Vui lòng cấu hình API Key' :
            <><FilmIcon className="w-5 h-5" />Tạo Prompt Video</>}
        </button>
      </div>
    </div>
  );

  const renderImageForm = () => (
    <div className="space-y-4">
      {/* 1. Main Idea (Textarea) */}
      <div>
        <label htmlFor="image-idea" className="block text-sm font-medium text-gray-300 mb-1">1. Mô tả ảnh (*)</label>
        <textarea id="image-idea" value={mainIdea} onChange={onMainIdeaChange} placeholder="Mô tả chi tiết về nội dung, hành động, cảm xúc trong ảnh..." rows={4} className="w-full p-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 resize-none" disabled={isLoading}/>
      </div>
      {/* 2. Setting */}
      <div>
        <label htmlFor="image-setting" className="block text-sm font-medium text-gray-300 mb-1">2. Bối cảnh</label>
        <input id="image-setting" type="text" value={setting} onChange={onSettingChange} placeholder="ví dụ: khu rừng huyền ảo, thành phố tương lai..." className="w-full p-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500" disabled={isLoading}/>
      </div>
      {/* 3. Characters */}
      <CharacterSelector {...props} isForVideo={false} label="3. Nhân vật có trong ảnh"/>
      {/* 4. Image Style */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">4. Phong cách ảnh</label>
        <div className="flex gap-2 p-1 bg-gray-900/50 rounded-lg">
          {IMAGE_STYLES.map(style => (
            <button key={style} onClick={() => onImageStyleChange(style)} disabled={isLoading} className={`w-full text-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${imageStyle === style ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}>
              {style}
            </button>
          ))}
        </div>
      </div>
      {/* Submit Button */}
      <div className="pt-4">
        <button onClick={onGenerateImage} disabled={isLoading || !mainIdea.trim() || !hasApiKey} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 disabled:transform-none">
          {loadingState === 'image' ? <><LoadingSpinnerIcon className="w-5 h-5 animate-spin" />Đang tạo...</> : 
            !hasApiKey ? 'Vui lòng cấu hình API Key' :
            <><ImageIcon className="w-5 h-5" />Tạo ảnh</>}
        </button>
      </div>
    </div>
  );

  const renderImageToVideoForm = () => (
    <div className="space-y-4">
        {/* 1. Image Upload */}
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">1. Tải ảnh lên (*)</label>
            <div className="mt-2">
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    ref={fileInputRef}
                    disabled={isLoading}
                />
                {!uploadedImage ? (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="w-full flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-gray-600 rounded-lg text-center hover:border-indigo-500 transition-colors"
                    >
                        <UploadIcon className="w-8 h-8 text-gray-500 mb-2" />
                        <span className="text-sm font-semibold text-indigo-400">Nhấn để chọn ảnh</span>
                        <span className="text-xs text-gray-500">PNG, JPG, WEBP</span>
                    </button>
                ) : (
                    <div className="relative group">
                        <img
                            src={`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`}
                            alt="Preview"
                            className="w-full h-auto max-h-64 object-contain rounded-lg border border-gray-600"
                        />
                        <button
                            onClick={() => onUploadedImageChange(null)}
                            disabled={isLoading}
                            className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
        {/* 2. Main Idea */}
        <div>
            <label htmlFor="image-to-video-idea" className="block text-sm font-medium text-gray-300 mb-1">2. Ý tưởng bổ sung (tùy chọn)</label>
            <textarea id="image-to-video-idea" value={mainIdea} onChange={onMainIdeaChange} placeholder="ví dụ: làm cho nhân vật trong ảnh bắt đầu di chuyển và nói chuyện..." rows={3} className="w-full p-2 bg-gray-900/50 border border-gray-600 rounded-md focus:ring-1 focus:ring-indigo-500 resize-none" disabled={isLoading}/>
        </div>
        {/* Submit Button */}
        <div className="pt-4">
            <button onClick={onGenerateVideoFromImage} disabled={isLoading || !uploadedImage || !hasApiKey} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-lg hover:bg-purple-500 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 disabled:transform-none">
                {loadingState === 'video' ? <><LoadingSpinnerIcon className="w-5 h-5 animate-spin" />Đang tạo...</> : 
                  !hasApiKey ? 'Vui lòng cấu hình API Key' :
                  <><FilmIcon className="w-5 h-5" />Tạo Prompt Video</>}
            </button>
        </div>
    </div>
);


  return (
    <>
      <div className="flex border-b border-gray-700">
        <TabButton onClick={() => onTabChange('video')} isActive={activeTab === 'video'} icon={<FilmIcon className="w-5 h-5"/>}>
          Tạo từ ý tưởng
        </TabButton>
        <TabButton onClick={() => onTabChange('imageToVideo')} isActive={activeTab === 'imageToVideo'} icon={<UploadIcon className="w-5 h-5"/>}>
          Tạo từ ảnh
        </TabButton>
        <TabButton onClick={() => onTabChange('image')} isActive={activeTab === 'image'} icon={<ImageIcon className="w-5 h-5"/>}>
          Tạo ảnh
        </TabButton>
      </div>
      <div className="p-6 sm:p-8">
        {activeTab === 'video' && renderVideoForm()}
        {activeTab === 'image' && renderImageForm()}
        {activeTab === 'imageToVideo' && renderImageToVideoForm()}
      </div>
    </>
  );
};