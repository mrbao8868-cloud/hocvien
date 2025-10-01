import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptInput, SceneCharacter, ActiveTab } from './components/PromptInput';
import { PromptOutput } from './components/PromptOutput';
import { generateVeoPromptFromText, generateImageFromText, generateVeoPromptFromImage, initializeGemini } from './services/geminiService';
import { ErrorDisplay } from './components/ErrorDisplay';
import { Footer } from './components/Footer';
import { CharacterManager, ProjectCharacter } from './components/CharacterManager';
import { ApiKeyModal } from './components/ApiKeyModal';

type LoadingState = 'none' | 'video' | 'image';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('video');
  const [apiKey, setApiKey] = useState<string>('');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  
  // Unified state for all inputs. Persists when switching tabs.
  const [mainIdea, setMainIdea] = useState<string>('');
  const [setting, setSetting] = useState<string>('');
  const [videoStyle, setVideoStyle] = useState<string[]>(['Hoạt hình']);
  const [imageStyle, setImageStyle] = useState<'3D Hoạt hình' | 'Hiện thực'>('3D Hoạt hình');
  const [sceneCharacters, setSceneCharacters] = useState<SceneCharacter[]>([]);
  const [uploadedImage, setUploadedImage] = useState<{ mimeType: string; data: string } | null>(null);


  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>('none');
  const [error, setError] = useState<string | null>(null);

  // Character Library State
  const [projectCharacters, setProjectCharacters] = useState<ProjectCharacter[]>([]);
  const [isCharacterManagerOpen, setIsCharacterManagerOpen] = useState(false);

  // Load API key and characters from localStorage on initial render
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('gemini-api-key');
      if (storedKey) {
        setApiKey(storedKey);
        initializeGemini(storedKey);
      } else {
        setIsApiModalOpen(true); // Open modal if no key is found
      }

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

  const handleSaveApiKey = (newKey: string) => {
    const trimmedKey = newKey.trim();
    if (trimmedKey) {
        setApiKey(trimmedKey);
        localStorage.setItem('gemini-api-key', trimmedKey);
        initializeGemini(trimmedKey);
        setIsApiModalOpen(false);
        setError(null); // Clear any previous API key errors
    }
  };

  const handleApiError = (err: any) => {
    console.error(err);
    // A simple check for common API key-related errors
    if (err instanceof Error && (err.message.includes('API Key') || err.message.includes('400'))) {
        setError('API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.');
        setIsApiModalOpen(true);
    } else {
        setError('Đã xảy ra lỗi. Vui lòng thử lại.');
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
    setGeneratedImages([]);

    try {
      const textInput = { mainIdea, setting, style: videoStyle, characters: sceneCharacters };
      const prompt = await generateVeoPromptFromText(textInput);
      setGeneratedPrompt(prompt);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingState('none');
    }
  }, [mainIdea, setting, videoStyle, sceneCharacters, loadingState, apiKey]);

  const handleGenerateImage = useCallback(async () => {
    if (loadingState !== 'none' || !mainIdea.trim() || !apiKey) return;

    setLoadingState('image');
    setError(null);
    setGeneratedPrompt('');
    setGeneratedImages([]);

    try {
        const imageInput = { mainIdea, setting, style: imageStyle, characters: sceneCharacters };
        const { prompt, images } = await generateImageFromText(imageInput);
        setGeneratedPrompt(prompt);
        setGeneratedImages(images);
    } catch (err) {
        handleApiError(err);
    } finally {
        setLoadingState('none');
    }
  }, [mainIdea, setting, imageStyle, sceneCharacters, loadingState, apiKey]);

  const handleGenerateVideoPromptFromImage = useCallback(async () => {
    if (loadingState !== 'none' || !uploadedImage || !apiKey) return;

    setLoadingState('video'); // It generates a video prompt
    setError(null);
    setGeneratedPrompt('');
    setGeneratedImages([]);

    try {
      const prompt = await generateVeoPromptFromImage(mainIdea, uploadedImage);
      setGeneratedPrompt(prompt);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoadingState('none');
    }
  }, [mainIdea, uploadedImage, loadingState, apiKey]);


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
                  setGeneratedImages([]);
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
                imageStyle={imageStyle}
                onImageStyleChange={setImageStyle}
                projectCharacters={projectCharacters}
                sceneCharacters={sceneCharacters}
                onSceneCharactersChange={setSceneCharacters}
                onManageCharactersClick={() => setIsCharacterManagerOpen(true)}
                onGenerateVideo={handleGenerateVideoPrompt}
                onGenerateImage={handleGenerateImage}
                onGenerateVideoFromImage={handleGenerateVideoPromptFromImage}
                loadingState={loadingState}
                uploadedImage={uploadedImage}
                onUploadedImageChange={setUploadedImage}
                apiKey={apiKey}
              />
              <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                {error && <ErrorDisplay message={error} />}
                <PromptOutput 
                  prompt={generatedPrompt} 
                  images={generatedImages}
                  loadingState={loadingState} 
                />
              </div>
            </main>
          </div>
        </div>
        <Footer onApiKeyChangeClick={() => setIsApiModalOpen(true)} />
      </div>

      <CharacterManager
        isOpen={isCharacterManagerOpen}
        onClose={() => setIsCharacterManagerOpen(false)}
        characters={projectCharacters}
        setCharacters={setProjectCharacters}
      />

      <ApiKeyModal
        isOpen={isApiModalOpen}
        onClose={() => {
            // Only allow closing if an API key is already set
            if (apiKey) {
                setIsApiModalOpen(false);
            }
        }}
        onSave={handleSaveApiKey}
        currentApiKey={apiKey}
      />
    </>
  );
};

export default App;