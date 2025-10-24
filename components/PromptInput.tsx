import React, { useRef } from 'react';
import { LoadingSpinnerIcon, XIcon, UsersIcon, FilmIcon, ImageIcon, UploadIcon, HelpCircleIcon, PlusIcon } from './icons';
import { ProjectCharacter } from './CharacterManager';

export interface SceneCharacter extends ProjectCharacter {
  dialogue: string;
}

type LoadingState = 'none' | 'video' | 'image';
export type ActiveTab = 'video' | 'imageToVideo' | 'image' | 'guide';
export type VideoInputMode = 'structured' | 'freestyle';

const VIDEO_VISUAL_STYLES = [
  {
    category: 'Phong cách video',
    description: 'Giao diện và cảm nhận nghệ thuật cho video.',
    styles: [
      { name: 'Hoạt hình', description: 'Hoạt hình 3D hiện đại, mặc định theo phong cách Pixar. Rõ ràng và thân thiện.' },
      { name: 'Hiện thực', description: 'Tái tạo thế giới thực một cách chân thực, như máy ảnh.' },
      { name: 'Điện ảnh', description: 'Tạo cảm giác như một bộ phim với ánh sáng, góc quay và màu sắc chuyên nghiệp.' },
    ]
  }
];

const IMAGE_VISUAL_STYLES = [
  'Hoạt hình', 'Hiện thực'
];

const ASPECT_RATIOS = [
  { label: 'Vuông', value: '1:1' },
  { label: 'Ngang', value: '16:9' },
  { label: 'Dọc', value: '9:16' },
  { label: 'Ảnh rộng', value: '4:3' },
];

interface PromptInputProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  apiKey: string;
  loadingState: LoadingState;
  
  // Video (Text-to-Video) Props
  videoInputMode: VideoInputMode;
  onVideoInputModeChange: (mode: VideoInputMode) => void;
  freestyleInput: string;
  onFreestyleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  mainIdea: string;
  onMainIdeaChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  setting: string;
  onSettingChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  videoStyle: string[];
  onVideoStyleToggle: (style: string) => void;
  sceneCharacters: SceneCharacter[];
  onSceneCharactersChange: React.Dispatch<React.SetStateAction<SceneCharacter[]>>;
  onGenerateVideo: () => void;
  
  // Video (Image-to-Video) Props
  onGenerateVideoFromImage: () => void;
  uploadedImage: { mimeType: string; data: string } | null;
  onUploadedImageChange: (image: { mimeType: string; data: string } | null) => void;
  isGeneratingDialogue: boolean;
  imageToVideoDialogues: {id: number, dialogue: string}[];
  onImageToVideoDialoguesChange: React.Dispatch<React.SetStateAction<{id: number, dialogue: string}[]>>;
  
  // Image Prompt Props
  onGenerateImage: () => void;
  imageIdea: string;
  onImageIdeaChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  imageStyle: string[];
  onImageStyleToggle: (style: string) => void;
  imageAspectRatio: string;
  onImageAspectRatioChange: (ratio: string) => void;
  imageSceneCharacters: SceneCharacter[];
  onImageSceneCharactersChange: React.Dispatch<React.SetStateAction<SceneCharacter[]>>;
  
  // Common Props
  projectCharacters: ProjectCharacter[];
  onManageCharactersClick: () => void;
}

const TabButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  icon: React.ReactNode;
}> = ({ onClick, isActive, children, icon }) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2.5 p-3 sm:p-4 text-sm font-semibold transition-all duration-300 rounded-t-lg ${
      isActive
        ? 'bg-gray-900/50 text-white'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
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
  isForVideo: boolean;
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
      <div className="p-3 bg-black/20 border border-white/10 rounded-lg space-y-3">
        {sceneCharacters.map((char) => (
          <div key={char.id} className={`p-3 bg-white/5 rounded-md ${!isForVideo && 'flex justify-between items-center'}`}>
            <div className={`flex justify-between items-start ${isForVideo && 'mb-2'}`}>
              <div>
                <p className="font-semibold text-white">{char.name}</p>
                <p className="text-xs text-gray-400">{char.description || "Chưa có mô tả"}</p>
              </div>
              <button onClick={() => handleRemoveCharacterFromScene(char.id)} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
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
                className="w-full p-2 text-sm bg-black/20 border border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-200 placeholder-gray-500"
              />
            )}
          </div>
        ))}
        {availableCharacters.length > 0 && (
          <select value="" onChange={handleAddCharacterToScene} disabled={isLoading} className="w-full p-2.5 text-sm bg-gray-800 border border-white/10 rounded-md appearance-none focus:ring-2 focus:ring-indigo-500 text-gray-300">
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
          videoStyle, onVideoStyleToggle,
          sceneCharacters, onSceneCharactersChange, onManageCharactersClick,
          apiKey, onGenerateVideo, onGenerateVideoFromImage, loadingState,
          uploadedImage, onUploadedImageChange, isGeneratingDialogue, imageToVideoDialogues, onImageToVideoDialoguesChange,
          onGenerateImage, imageIdea, onImageIdeaChange, imageStyle, onImageStyleToggle,
          imageAspectRatio, onImageAspectRatioChange, imageSceneCharacters, onImageSceneCharactersChange,
          videoInputMode, onVideoInputModeChange, freestyleInput, onFreestyleInputChange
        } = props;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoading = loadingState !== 'none' || isGeneratingDialogue;

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

  const handleAddDialogue = () => {
    onImageToVideoDialoguesChange(prev => [...prev, { id: Date.now(), dialogue: '' }]);
  };
  
  const handleRemoveDialogue = (id: number) => {
    onImageToVideoDialoguesChange(prev => prev.filter(item => item.id !== id));
  };
  
  const handleDialogueTextChange = (id: number, text: string) => {
    onImageToVideoDialoguesChange(prev => 
      prev.map(item => item.id === id ? { ...item, dialogue: text } : item)
    );
  };

  const commonInputClasses = "w-full p-2.5 bg-white/5 border border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white/10 transition-all text-gray-200 placeholder-gray-500";
  const primaryButtonClasses = "w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg shadow-indigo-600/20 hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:shadow-none";

  const renderVideoForm = () => {
    const isStructured = videoInputMode === 'structured';
    const isFreestyle = videoInputMode === 'freestyle';

    return (
      <div className="space-y-5">
        <div className="flex bg-black/20 p-1 rounded-lg border border-white/10 w-full max-w-sm mx-auto">
          <button 
            onClick={() => onVideoInputModeChange('structured')} 
            className={`flex-1 p-2 text-sm font-semibold rounded-md transition-colors ${isStructured ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Soạn theo cấu trúc
          </button>
          <button 
            onClick={() => onVideoInputModeChange('freestyle')} 
            className={`flex-1 p-2 text-sm font-semibold rounded-md transition-colors ${isFreestyle ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}
          >
            Soạn tự do
          </button>
        </div>

        {isStructured && (
          <div className="space-y-5 animate-fade-in">
            {/* 1. Main Idea */}
            <div>
              <label htmlFor="video-idea" className="block text-sm font-medium text-gray-300 mb-1.5">1. Ý tưởng chính (*)</label>
              <input id="video-idea" type="text" value={mainIdea} onChange={onMainIdeaChange} placeholder="ví dụ: hai cô giáo đang nói chuyện với nhau" className={commonInputClasses} disabled={isLoading}/>
            </div>
            {/* 2. Setting */}
            <div>
              <label htmlFor="video-setting" className="block text-sm font-medium text-gray-300 mb-1.5">2. Bối cảnh</label>
              <input id="video-setting" type="text" value={setting} onChange={onSettingChange} placeholder="ví dụ: trong một lớp học, sân trường..." className={commonInputClasses} disabled={isLoading}/>
            </div>
            {/* 3. Video Style */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">3. Phong cách video</label>
              {VIDEO_VISUAL_STYLES.map(category => (
                <div key={category.category} className="flex flex-wrap gap-2">
                  {category.styles.map(styleItem => (
                    <div key={styleItem.name} className="relative group">
                      <button onClick={() => onVideoStyleToggle(styleItem.name)} disabled={isLoading} className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 font-medium border ${videoStyle.includes(styleItem.name) ? 'bg-indigo-500/80 text-white border-indigo-400' : 'bg-white/5 text-gray-300 hover:bg-white/10 border-transparent'}`}>
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
          </div>
        )}

        {isFreestyle && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <label htmlFor="freestyle-input" className="block text-sm font-medium text-gray-300 mb-1.5">Nội dung kịch bản hoặc ý tưởng (*)</label>
              <textarea
                id="freestyle-input"
                value={freestyleInput}
                onChange={onFreestyleInputChange}
                placeholder="Nhập ý tưởng, mô tả cảnh, hoặc lời thoại tại đây. AI sẽ tự động chuyển thành prompt hoàn chỉnh..."
                rows={8}
                className={`${commonInputClasses} resize-y`}
                disabled={isLoading}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <button onClick={onGenerateVideo} disabled={isLoading || (isStructured && !mainIdea.trim()) || (isFreestyle && !freestyleInput.trim()) || !apiKey} className={primaryButtonClasses}>
            {loadingState === 'video' ? <><LoadingSpinnerIcon className="w-5 h-5 animate-spin" />Đang tạo...</> : 
              <><FilmIcon className="w-5 h-5" />Tạo Prompt Video</>}
          </button>
          {!apiKey && <p className="text-xs text-center text-yellow-500 mt-3">Vui lòng cung cấp API Key để sử dụng chức năng này.</p>}
        </div>
      </div>
    );
  };

  const renderImageToVideoForm = () => (
    <div className="space-y-5">
        {/* 1. Image Upload */}
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">1. Tải ảnh lên (*)</label>
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
                        className="w-full flex flex-col items-center justify-center px-6 py-8 sm:py-10 border border-white/10 bg-white/5 rounded-lg text-center hover:border-indigo-500 hover:bg-indigo-500/10 transition-all duration-300 group"
                    >
                        <UploadIcon className="w-8 h-8 text-gray-500 mb-3 group-hover:text-indigo-400 transition-colors" />
                        <span className="text-sm font-semibold text-indigo-400">Nhấn để chọn ảnh</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP</span>
                    </button>
                ) : (
                    <div className="relative group">
                        <img
                            src={`data:${uploadedImage.mimeType};base64,${uploadedImage.data}`}
                            alt="Preview"
                            className="w-full h-auto max-h-64 object-contain rounded-lg border border-white/10"
                        />
                        <button
                            onClick={() => onUploadedImageChange(null)}
                            disabled={isLoading}
                            className="absolute top-2 right-2 p-1.5 bg-black/60 backdrop-blur-sm text-white rounded-full hover:bg-black/80 transition-opacity opacity-0 group-hover:opacity-100"
                        >
                            <XIcon className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
        {/* 2. Main Idea */}
        <div>
            <label htmlFor="image-to-video-idea" className="block text-sm font-medium text-gray-300 mb-1.5">2. Ý tưởng bổ sung (tùy chọn)</label>
            <textarea id="image-to-video-idea" value={mainIdea} onChange={onMainIdeaChange} placeholder={`Gợi ý: 'làm cho nhân vật di chuyển', 'thêm hiệu ứng tuyết rơi', hoặc thêm lời thoại tiếng Việt như: Người đàn ông nói: "Chúng ta đi thôi."`} rows={3} className={`${commonInputClasses} resize-none`} disabled={isLoading}/>
        </div>
        
        {/* 3. Dialogue Section */}
        {uploadedImage && (
          <div className="animate-fade-in">
            <label className="block text-sm font-medium text-gray-300 mb-2">3. Lời thoại (AI gợi ý)</label>
            <div className="p-3 bg-black/20 border border-white/10 rounded-lg space-y-3">
              {isGeneratingDialogue && (
                  <div className="flex items-center justify-center gap-3 text-gray-400 p-4">
                      <LoadingSpinnerIcon className="w-5 h-5 animate-spin" />
                      <span>Đang phân tích ảnh và tạo lời thoại...</span>
                  </div>
              )}
              {!isGeneratingDialogue && imageToVideoDialogues.map((item, index) => (
                <div key={item.id} className="flex items-start gap-2">
                  <div className="flex-grow">
                    <label className="text-xs text-gray-400 font-medium mb-1 block">{`Lời thoại nhân vật ${index + 1}`}</label>
                    <textarea
                      placeholder={`Nhập lời thoại...`}
                      value={item.dialogue}
                      onChange={(e) => handleDialogueTextChange(item.id, e.target.value)}
                      disabled={isLoading}
                      rows={2}
                      className="w-full p-2 text-sm bg-black/20 border border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none text-gray-200 placeholder-gray-500"
                    />
                  </div>
                  <button 
                    onClick={() => handleRemoveDialogue(item.id)} 
                    className="p-2 text-gray-500 hover:text-red-400 mt-6"
                    title="Xóa lời thoại"
                  >
                    <XIcon className="w-4 h-4"/>
                  </button>
                </div>
              ))}
              {!isGeneratingDialogue && (
                 <button 
                    onClick={handleAddDialogue}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 text-sm font-semibold p-2 bg-white/5 text-indigo-400 hover:bg-white/10 hover:text-indigo-300 rounded-md transition-colors disabled:opacity-50"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Thêm lời thoại
                  </button>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-4">
            <button onClick={onGenerateVideoFromImage} disabled={isLoading || !uploadedImage || !apiKey} className={primaryButtonClasses}>
                {loadingState === 'video' ? <><LoadingSpinnerIcon className="w-5 h-5 animate-spin" />Đang tạo...</> : 
                  <><FilmIcon className="w-5 h-5" />Tạo Prompt Video</>}
            </button>
            {!apiKey && <p className="text-xs text-center text-yellow-500 mt-3">Vui lòng cung cấp API Key để sử dụng chức năng này.</p>}
        </div>
    </div>
);

  const renderImageForm = () => (
    <div className="space-y-5">
      {/* 1. Main Idea */}
      <div>
        <label htmlFor="image-idea" className="block text-sm font-medium text-gray-300 mb-1.5">1. Ý tưởng chính (*)</label>
        <textarea
          id="image-idea"
          value={imageIdea}
          onChange={onImageIdeaChange}
          placeholder="ví dụ: một cô gái đang ngồi đọc sách dưới gốc cây cổ thụ"
          rows={3}
          className={`${commonInputClasses} resize-none`}
          disabled={isLoading}
        />
      </div>

      {/* 2. Characters */}
       <CharacterSelector
        projectCharacters={props.projectCharacters}
        sceneCharacters={imageSceneCharacters}
        onSceneCharactersChange={onImageSceneCharactersChange}
        onManageCharactersClick={onManageCharactersClick}
        isLoading={isLoading}
        isForVideo={false}
        label="2. Nhân vật (tùy chọn)"
      />

      {/* 3. Visual Style */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">3. Phong cách hình ảnh</label>
        <div className="flex flex-wrap gap-2">
          {IMAGE_VISUAL_STYLES.map(style => (
            <button
              key={style}
              onClick={() => onImageStyleToggle(style)}
              disabled={isLoading}
              className={`px-4 py-1.5 text-sm rounded-full transition-all duration-200 font-medium border ${imageStyle.includes(style) ? 'bg-indigo-500/80 text-white border-indigo-400' : 'bg-white/5 text-gray-300 hover:bg-white/10 border-transparent'}`}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">4. Tỷ lệ khung hình</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ASPECT_RATIOS.map(ratio => (
            <button
              key={ratio.value}
              onClick={() => onImageAspectRatioChange(ratio.value)}
              disabled={isLoading}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium border ${imageAspectRatio === ratio.value ? 'bg-indigo-500/80 text-white border-indigo-400' : 'bg-white/5 text-gray-300 hover:bg-white/10 border-transparent'}`}
            >
              <span className="block font-semibold">{ratio.label}</span>
              <span className="block text-xs opacity-70">{ratio.value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          onClick={onGenerateImage}
          disabled={isLoading || !imageIdea.trim() || !apiKey}
          className={primaryButtonClasses}
        >
          {loadingState === 'image' ? (
            <><LoadingSpinnerIcon className="w-5 h-5 animate-spin" />Đang tạo...</>
          ) : (
            <><ImageIcon className="w-5 h-5" />Tạo Prompt Ảnh</>
          )}
        </button>
        {!apiKey && <p className="text-xs text-center text-yellow-500 mt-3">Vui lòng cung cấp API Key để sử dụng chức năng này.</p>}
      </div>
    </div>
  );
  
  const renderGuide = () => (
    <div className="space-y-6 text-gray-300 leading-relaxed animate-fade-in p-2 sm:p-0">
      <h2 className="text-2xl font-bold text-white text-center">Hướng dẫn & Công cụ</h2>
      <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
        <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-100 mb-2">Sử dụng VEO 3</h3>
          <p className="text-sm mb-3">Tạo video từ prompt bạn đã tạo.</p>
          <a 
            href="https://labs.google/fx/tools/flow" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Truy cập VEO 3
          </a>
        </div>

        <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-100 mb-2">Hướng dẫn đăng nhập VEO 3</h3>
          <p className="text-sm mb-3">Xem tài liệu chi tiết về cách đăng nhập và bắt đầu với VEO 3.</p>
          <a 
            href="https://docs.google.com/document/d/1obHQB1nFtuWLwkz2SeibKyfnjNnKG9Dx/edit?usp=sharing&ouid=112798182608207183162&rtpof=true&sd=true" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-5 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-500 transition-colors"
          >
            Xem Hướng dẫn
          </a>
        </div>

        <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-100 mb-2">Tạo ảnh AI (Dreamina)</h3>
          <p className="text-sm mb-3">Sử dụng công cụ từ CapCut để tạo ảnh nền hoặc nhân vật.</p>
          <a 
            href="https://dreamina.capcut.com/ai-tool/generate/?type=image" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors"
          >
            Tạo ảnh với Dreamina
          </a>
        </div>
         <div className="p-4 bg-black/20 border border-white/10 rounded-lg">
          <h3 className="font-semibold text-lg text-gray-100 mb-2">Chuyển văn bản thành giọng nói</h3>
          <p className="text-sm mb-3">Sử dụng Google AI Studio để tạo giọng nói từ văn bản.</p>
          <a 
            href="https://aistudio.google.com/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-5 py-2 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-500 transition-colors"
          >
            Mở AI Studio
          </a>
        </div>
        <div className="p-4 bg-black/20 border border-white/10 rounded-lg md:col-span-2">
          <h3 className="font-semibold text-lg text-gray-100 mb-2">Lấy API Key (Google AI)</h3>
          <p className="text-sm mb-3">Tạo và quản lý API Key của bạn tại Google AI Studio để sử dụng ứng dụng này.</p>
          <a 
            href="https://aistudio.google.com/app/apikey" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-5 py-2 text-sm font-semibold text-white bg-teal-600 rounded-lg hover:bg-teal-500 transition-colors"
          >
            Lấy API Key
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex border-b border-white/10 px-1 sm:px-4 pt-2">
        <TabButton onClick={() => onTabChange('video')} isActive={activeTab === 'video'} icon={<FilmIcon className="w-5 h-5"/>}>
          <span className="sm:hidden">Video (Ý tưởng)</span>
          <div className="hidden sm:flex sm:flex-col sm:items-start leading-tight">
            <span className="font-normal opacity-90">Prompt</span>
            <span>Video (Ý tưởng)</span>
          </div>
        </TabButton>
        <TabButton onClick={() => onTabChange('imageToVideo')} isActive={activeTab === 'imageToVideo'} icon={<UploadIcon className="w-5 h-5"/>}>
          <span className="sm:hidden">Video (Từ ảnh)</span>
          <div className="hidden sm:flex sm:flex-col sm:items-start leading-tight">
            <span className="font-normal opacity-90">Prompt</span>
            <span>Video (Từ ảnh)</span>
          </div>
        </TabButton>
         <TabButton onClick={() => onTabChange('image')} isActive={activeTab === 'image'} icon={<ImageIcon className="w-5 h-5"/>}>
          <span className="sm:hidden">Ảnh</span>
          <div className="hidden sm:flex sm:flex-col sm:items-start leading-tight">
              <span className="font-normal opacity-90">Prompt</span>
              <span>Ảnh</span>
          </div>
        </TabButton>
        <TabButton onClick={() => onTabChange('guide')} isActive={activeTab === 'guide'} icon={<HelpCircleIcon className="w-5 h-5"/>}>
            <span className="sm:hidden">Hướng dẫn</span>
            <div className="hidden sm:flex sm:flex-col sm:items-start leading-tight">
                <span className="font-normal opacity-90">Tài nguyên</span>
                <span>Hướng dẫn</span>
            </div>
        </TabButton>
      </div>
      <div className="p-4 sm:p-8">
        {activeTab === 'video' && renderVideoForm()}
        {activeTab === 'imageToVideo' && renderImageToVideoForm()}
        {activeTab === 'image' && renderImageForm()}
        {activeTab === 'guide' && renderGuide()}
      </div>
    </>
  );
};