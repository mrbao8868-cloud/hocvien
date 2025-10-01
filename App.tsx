import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput, SceneCharacter, ActiveTab } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { generateVeoPromptFromText, generateVeoPromptFromImage } from './services/geminiService';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Footer } from './components/Footer';
import { CharacterManager, ProjectCharacter } from './components/CharacterManager';
import { ApiKeyModal } from './components/ApiKeyModal';

type LoadingState = 'none' | 'video';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('video');
  
  // Unified state for all inputs. Persists when switching tabs.
  const [mainIdea, setMainIdea] = useState<string>('');
  const [setting, setSetting] = useState<string>('');
  const [videoStyle, setVideoStyle] = useState<string[]>(['Hoạt hình']);
  const [sceneCharacters, setSceneCharacters] = useState<SceneCharacter[]>([]);
  const [uploadedImage, setUploadedImage] = useState<{ mimeType: string; data: string } | null>(null);


  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [loadingState, setLoadingState] = useState<LoadingState>('none');
  const [error, setError] = useState<string | null>(null);

  // Character Library State
  const [projectCharacters, setProjectCharacters] = useState<ProjectCharacter[]>([]);
  const [isCharacterManagerOpen, setIsCharacterManagerOpen] = useState(false);
  
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
        // If the key is empty, remove it
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
  
  const handleGenerateVideoPrompt = useCallback(async () => {
    if (loadingState !== 'none' || !mainIdea.trim() || !apiKey) return;

    setLoadingState('video');
    setError(null);
    setGeneratedPrompt('');

    try {
      const textInput = { mainIdea, setting, style: videoStyle, characters: sceneCharacters };
      const prompt = await generateVeoPromptFromText(textInput, apiKey);
      setGeneratedPrompt(prompt);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingState('none');
    }
  }, [mainIdea, setting, videoStyle, sceneCharacters, loadingState, apiKey]);

  const handleGenerateVideoPromptFromImage = useCallback(async () => {
    if (loadingState !== 'none' || !uploadedImage || !apiKey) return;

    setLoadingState('video'); // It generates a video prompt
    setError(null);
    setGeneratedPrompt('');

    try {
      const prompt = await generateVeoPromptFromImage(mainIdea, uploadedImage, apiKey);
      setGeneratedPrompt(prompt);
    } catch (err)
 {
      handleApiError(err);
    } finally {
      setLoadingState('none');
    }
  }, [mainIdea, uploadedImage, loadingState, apiKey]);

  const handleSaveApiKey = (newApiKey: string) => {
    setApiKey(newApiKey);
    setIsApiKeyModalOpen(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-900 text-gray-100 font-sans flex flex-col">
        <div className="relative flex-grow flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          <div 
            className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-10" 
            style={{backgroundImage: 'url(https://picsum.photos/seed/veobg/1920/1080)'}}
          ></div>
          <div className="w-full max-w-3xl z-10 space-y-8">
            <Header />
            <main className="bg-gray-800/50 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-700">
              <PromptInput
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab);
                  // Clear results and specific inputs when switching tabs
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
              />
              <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                {error && <ErrorDisplay message={error} />}
                <PromptOutput 
                  prompt={generatedPrompt} 
                  loadingState={loadingState} 
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
      />
    </>
  );
};

export default App;