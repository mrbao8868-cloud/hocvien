import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput, SceneCharacter, ActiveTab, VideoInputMode } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { generateVeoPromptFromText, generateVeoPromptFromImage, generateImagePrompt, analyzeCharacterFromImage, generateVeoPromptFromFreestyle } from './services/geminiService';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Footer } from './components/Footer';
import { CharacterManager, ProjectCharacter } from './components/CharacterManager';
import { ApiKeyModal } from './components/ApiKeyModal';

type LoadingState = 'none' | 'video' | 'image';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('video');
  const [videoInputMode, setVideoInputMode] = useState<VideoInputMode>('structured');
  
  // Video Prompt (structured) state
  const [mainIdea, setMainIdea] = useState<string>('');
  const [setting, setSetting] = useState<string>('');
  const [videoStyle, setVideoStyle] = useState<string[]>(['Hoạt hình']);
  const [sceneCharacters, setSceneCharacters] = useState<SceneCharacter[]>([]);
  
  // Video Prompt (freestyle) state
  const [freestyleInput, setFreestyleInput] = useState<string>('');

  // Video Prompt (from image) state
  const [uploadedImage, setUploadedImage] = useState<{ mimeType: string; data: string } | null>(null);

  // Image Prompt state
  const [imageIdea, setImageIdea] = useState<string>('');
  const [imageStyle, setImageStyle] = useState<string[]>(['Hoạt hình']);
  const [imageAspectRatio, setImageAspectRatio] = useState<string>('1:1');
  const [imageSceneCharacters, setImageSceneCharacters] = useState<SceneCharacter[]>([]);

  // Shared output state
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>('none');
  const [error, setError] = useState<string | null>(null);

  // Character Library State
  const [projectCharacters, setProjectCharacters] = useState<ProjectCharacter[]>([]);
  const [isCharacterManagerOpen, setIsCharacterManagerOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  
  // Load API key from localStorage on initial render
  useEffect(() => {
    try {
      const storedApiKey = localStorage.getItem('gemini-api-key');
      if (storedApiKey) {
        setApiKey(storedApiKey);
      } else {
        setIsApiKeyModalOpen(true); // Open modal if no key is found
      }
    } catch (e) {
      console.error("Could not load API key from localStorage", e);
      setIsApiKeyModalOpen(true); // Open modal on error
    }
  }, []);

  // Save API key to localStorage whenever it changes
  useEffect(() => {
    try {
      if (apiKey) {
        localStorage.setItem('gemini-api-key', apiKey);
      } else {
        localStorage.removeItem('gemini-api-key');
      }
    } catch (e) {
      console.error("Could not save API key to localStorage", e);
    }
  }, [apiKey]);

  // Load characters from localStorage on initial render
  useEffect(() => {
    try {
      const storedCharacters = localStorage.getItem('veo-project-characters');
      if (storedCharacters) {
        setProjectCharacters(JSON.parse(storedCharacters));
      }
    } catch (e) {
      console.error("Could not load data from localStorage", e);
    }
  }, []);

  // Save characters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('veo-project-characters', JSON.stringify(projectCharacters));
    } catch (e) {
      console.error("Could not save characters to localStorage", e);
    }
  }, [projectCharacters]);

  const handleApiError = (err: any) => {
    console.error(err);
    const message = (err.message || '').toString();
    if (message.includes('API key not valid')) {
        setError('API Key không hợp lệ. Vui lòng kiểm tra lại.');
        setIsApiKeyModalOpen(true);
    } else if (message.includes('quota')) {
        setError('Đã vượt quá hạn ngạch API. Vui lòng thử lại sau hoặc kiểm tra tài khoản Google của bạn.');
    } else {
        setError('Đã xảy ra lỗi khi gọi API. Vui lòng kiểm tra lại hoặc xem console để biết chi tiết.');
    }
  }

  const handleVideoStyleToggle = (styleToToggle: string) => {
    setVideoStyle(prevStyles =>
      prevStyles.includes(styleToToggle)
        ? prevStyles.filter(s => s !== styleToToggle)
        : [...prevStyles, styleToToggle]
    );
  };
  
  const handleImageStyleToggle = (styleToToggle: string) => {
    setImageStyle(prevStyles =>
      prevStyles.includes(styleToToggle)
        ? prevStyles.filter(s => s !== styleToToggle)
        : [...prevStyles, styleToToggle]
    );
  };

  const handleGenerateVideoPrompt = useCallback(async () => {
    if (loadingState !== 'none' || !apiKey) return;

    setLoadingState('video');
    setError(null);
    setGeneratedPrompt('');

    try {
      let prompt = '';
      if (videoInputMode === 'structured') {
        if (!mainIdea.trim()) return;
        const textInput = { mainIdea, setting, style: videoStyle, characters: sceneCharacters };
        prompt = await generateVeoPromptFromText(textInput, apiKey);
      } else { // freestyle
        if (!freestyleInput.trim()) return;
        prompt = await generateVeoPromptFromFreestyle(freestyleInput, apiKey);
      }
      setGeneratedPrompt(prompt);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingState('none');
    }
  }, [apiKey, loadingState, videoInputMode, mainIdea, setting, videoStyle, sceneCharacters, freestyleInput]);

  const handleGenerateVideoPromptFromImage = useCallback(async () => {
    if (loadingState !== 'none' || !uploadedImage || !apiKey) return;

    setLoadingState('video');
    setError(null);
    setGeneratedPrompt('');

    try {
      const prompt = await generateVeoPromptFromImage(mainIdea, uploadedImage, apiKey);
      setGeneratedPrompt(prompt);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingState('none');
    }
  }, [mainIdea, uploadedImage, loadingState, apiKey]);

  const handleGenerateImagePrompt = useCallback(async () => {
    if (loadingState !== 'none' || !imageIdea.trim() || !apiKey) return;

    setLoadingState('image');
    setError(null);
    setGeneratedPrompt('');

    try {
        const input = {
            idea: imageIdea,
            style: imageStyle,
            aspectRatio: imageAspectRatio,
            characters: imageSceneCharacters
        };
        const prompt = await generateImagePrompt(input, apiKey);
        setGeneratedPrompt(prompt);
    } catch (err) {
        handleApiError(err);
    } finally {
        setLoadingState('none');
    }
  }, [imageIdea, imageStyle, imageAspectRatio, imageSceneCharacters, loadingState, apiKey]);
  
  const handleAnalyzeImageForCharacter = useCallback(async (image: { mimeType: string; data: string }): Promise<string> => {
    if (!apiKey) {
        setError("Vui lòng cung cấp API Key trước khi phân tích ảnh.");
        throw new Error("API Key is missing");
    }
    setIsAnalyzing(true);
    setError(null); // Clear previous errors

    try {
      const description = await analyzeCharacterFromImage(image, apiKey);
      return description;
    } catch (err) {
      handleApiError(err);
      throw err; // Re-throw so the component knows it failed
    } finally {
      setIsAnalyzing(false);
    }
  }, [apiKey]);


  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    setIsApiKeyModalOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-black text-gray-200 font-sans flex flex-col">
        <div className="relative flex-grow flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 overflow-hidden">
          <div 
            className="absolute top-0 left-0 w-full h-full bg-black"
          >
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900/80 via-transparent to-black"></div>
          </div>
          <div className="w-full max-w-4xl z-10 space-y-8">
            <Header />
            <main className="bg-gray-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/10 transition-all duration-300">
              <PromptInput
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  setGeneratedPrompt('');
                  setError(null);
                  if (tab !== 'imageToVideo') {
                    setUploadedImage(null);
                  }
                }}
                mainIdea={mainIdea}
                onMainIdeaChange={(e) => setMainIdea(e.target.value)}
                setting={setting}
                onSettingChange={(e) => setSetting(e.target.value)}
                videoStyle={videoStyle}
                onVideoStyleToggle={handleVideoStyleToggle}
                projectCharacters={projectCharacters}
                sceneCharacters={sceneCharacters}
                onSceneCharactersChange={setSceneCharacters}
                onManageCharactersClick={() => setIsCharacterManagerOpen(true)}
                apiKey={apiKey}
                onGenerateVideo={handleGenerateVideoPrompt}
                onGenerateVideoFromImage={handleGenerateVideoPromptFromImage}
                loadingState={loadingState}
                uploadedImage={uploadedImage}
                onUploadedImageChange={setUploadedImage}
                
                // Freestyle video props
                videoInputMode={videoInputMode}
                onVideoInputModeChange={setVideoInputMode}
                freestyleInput={freestyleInput}
                onFreestyleInputChange={(e) => setFreestyleInput(e.target.value)}
                
                // Image Prompt props
                onGenerateImage={handleGenerateImagePrompt}
                imageIdea={imageIdea}
                onImageIdeaChange={(e) => setImageIdea(e.target.value)}
                imageStyle={imageStyle}
                onImageStyleToggle={handleImageStyleToggle}
                imageAspectRatio={imageAspectRatio}
                onImageAspectRatioChange={setImageAspectRatio}
                imageSceneCharacters={imageSceneCharacters}
                onImageSceneCharactersChange={setImageSceneCharacters}
              />
              <div className="px-4 sm:px-8 pb-4 sm:pb-8">
                {error && <ErrorDisplay message={error} />}
                <PromptOutput 
                  prompt={generatedPrompt} 
                  loadingState={loadingState}
                  activeTab={activeTab}
                />
              </div>
            </main>
          </div>
        </div>
        <Footer onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)} />
      </div>
      
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSave={handleSaveApiKey}
        currentApiKey={apiKey}
      />

      <CharacterManager
        isOpen={isCharacterManagerOpen}
        onClose={() => setIsCharacterManagerOpen(false)}
        characters={projectCharacters}
        setCharacters={setProjectCharacters}
        onAnalyzeImage={handleAnalyzeImageForCharacter}
        isAnalyzing={isAnalyzing}
      />
    </>
  );
};

export default App;