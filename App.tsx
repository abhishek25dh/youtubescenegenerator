import React, { useState, useCallback } from 'react';
import { AppState, Scene, Word, TranscriptionResult, ImageElement, Transform } from './types';
import { getTranscriptionFromAssemblyAI } from './services/assemblyAiService';
import { generateVisualPlan } from './services/geminiService';
import AudioUploader from './components/AudioUploader';
import SceneEditor from './components/SceneEditor';
import VideoPlayer from './components/VideoPlayer';
import Loader from './components/Loader';
import InstructionEditor from './components/InstructionEditor';
import { LogoIcon } from './components/icons';

// Helper to normalize text for robust matching against transcript words
const normalizeText = (text: string) =>
  text.toLowerCase().replace(/[.,'#!?$;:{}=\-_`~()]/g, "").trim();

const calculateSceneTimings = (scenes: Scene[], words: Word[]): Scene[] => {
  if (!words || words.length === 0) return scenes;

  const transcriptWords = words.map(word => ({
    ...word,
    normalizedText: normalizeText(word.text)
  }));

  let lastWordIndex = 0;

  const timedScenes = scenes.map(scene => {
    const sceneTextNormalized = normalizeText(scene.textSection);
    if (!sceneTextNormalized) {
      return { ...scene, startTime: -1, endTime: -1 }; // Mark as unmatchable
    }
    const sceneWordsNormalized = sceneTextNormalized.split(' ').filter(Boolean);
    if (sceneWordsNormalized.length === 0) {
       return { ...scene, startTime: -1, endTime: -1 };
    }

    let matchStartIndex = -1;

    for (let i = lastWordIndex; i <= transcriptWords.length - sceneWordsNormalized.length; i++) {
      let isMatch = true;
      for (let j = 0; j < sceneWordsNormalized.length; j++) {
        if (transcriptWords[i + j].normalizedText !== sceneWordsNormalized[j]) {
          isMatch = false;
          break;
        }
      }
      if (isMatch) {
        matchStartIndex = i;
        break;
      }
    }

    if (matchStartIndex !== -1) {
      const matchEndIndex = matchStartIndex + sceneWordsNormalized.length - 1;
      const startTime = transcriptWords[matchStartIndex].start / 1000;
      const endTime = transcriptWords[matchEndIndex].end / 1000;
      lastWordIndex = matchEndIndex + 1;
      return { ...scene, startTime, endTime };
    } else {
      console.warn(`Could not find timestamp match for scene: "${scene.textSection}". Timing will be estimated.`);
      return { ...scene, startTime: -1, endTime: -1 }; // Mark as unmatched
    }
  });

  // Post-process to handle any scenes that couldn't be matched
  for (let i = 0; i < timedScenes.length; i++) {
    if (timedScenes[i].startTime === -1) {
      const prevSceneEndTime = i > 0 ? timedScenes[i-1].endTime : 0;
      let nextMatchedSceneTime = words[words.length - 1].end / 1000;
      let unmatchedCount = 0;

      for (let j = i; j < timedScenes.length; j++) {
        if (timedScenes[j].startTime !== -1) {
          nextMatchedSceneTime = timedScenes[j].startTime;
          break;
        }
        unmatchedCount++;
      }

      const timeGap = nextMatchedSceneTime - prevSceneEndTime;
      const timePerUnmatchedScene = unmatchedCount > 0 ? timeGap / unmatchedCount : 0;
      
      for (let k = 0; k < unmatchedCount; k++) {
        const currentUnmatchedScene = timedScenes[i+k];
        const startTime = prevSceneEndTime + (k * timePerUnmatchedScene);
        currentUnmatchedScene.startTime = startTime;
        currentUnmatchedScene.endTime = startTime + timePerUnmatchedScene;
      }
      i += unmatchedCount -1; // Skip ahead past the scenes we just timed
    }
  }

  return timedScenes;
};


const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('initial');
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioDuration, setAudioDuration] = useState(0);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [transcriptionResult, setTranscriptionResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const transcribeAudio = useCallback(async (file: File) => {
    if (!file) return;

    try {
      setAppState('uploading');
      const result = await getTranscriptionFromAssemblyAI(file, (status) => {
         if (status === 'uploading') {
            setAppState('uploading');
         } else {
            setAppState('transcribing');
         }
      });
      
      setAudioUrl(URL.createObjectURL(file));
      setAudioDuration(result.audioDuration);
      setTranscriptionResult(result);
      setAppState('awaiting_instructions');

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred during processing.');
      setAppState('initial');
    }
  }, []);

  const handleAudioUpload = useCallback((file: File) => {
    setError(null);
    transcribeAudio(file);
  }, [transcribeAudio]);


  const handleInstructionsSubmit = useCallback(async (instructions: string) => {
    if (!transcriptionResult) return;

    try {
        setAppState('generating_plan');
        const generatedScenes = await generateVisualPlan(transcriptionResult.fullText, instructions);
        const scenesWithTimings = calculateSceneTimings(generatedScenes, transcriptionResult.words);
        setScenes(scenesWithTimings);
        setAppState('editing');
    } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred. Please check your instructions and try again.');
        setAppState('awaiting_instructions');
    }
  }, [transcriptionResult]);

  const handleUpdateScene = (updatedScene: Scene) => {
    setScenes(currentScenes => {
        const sceneIndex = currentScenes.findIndex(s => s.id === updatedScene.id);
        if (sceneIndex === -1) return currentScenes;

        const originalScene = currentScenes[sceneIndex];
        let newScenes = [...currentScenes];
        newScenes[sceneIndex] = updatedScene;

        // --- PROPAGATION LOGIC ---

        // 1. URL Propagation
        for (const updatedImage of updatedScene.images) {
            const originalImage = originalScene.images.find(i => i.id === updatedImage.id);
            // If a URL was added...
            if (originalImage && originalImage.url !== updatedImage.url && updatedImage.url) {
                const imageUrlToPropagate = updatedImage.url;
                const imageQuery = updatedImage.query;
                const imageType = updatedImage.type;
                
                // ...update it in all other scenes.
                // This logic is now safer and modifies scenes in a more targeted way.
                newScenes = newScenes.map(scene => {
                    // Skip the scene we are already updating
                    if (scene.id === updatedScene.id) return scene;

                    const imagesToUpdate = scene.images.filter(img => img.query === imageQuery && img.type === imageType && img.url !== imageUrlToPropagate);

                    if (imagesToUpdate.length > 0) {
                        return {
                            ...scene,
                            images: scene.images.map(image =>
                                (image.query === imageQuery && image.type === imageType)
                                ? { ...image, url: imageUrlToPropagate }
                                : image
                            )
                        };
                    }
                    return scene;
                });
            }
        }

        // 2. Transform Propagation
        for (const updatedImage of updatedScene.images) {
            const originalImage = originalScene.images.find(i => i.id === updatedImage.id);
            if (originalImage && JSON.stringify(originalImage.transform) !== JSON.stringify(updatedImage.transform)) {
                const transformToPropagate = updatedImage.transform;
                const imageQuery = updatedImage.query;
                const imageType = updatedImage.type;

                // Iterate through subsequent scenes to propagate the transform
                for (let i = sceneIndex + 1; i < newScenes.length; i++) {
                    let sceneModified = false;
                    const nextSceneImages = newScenes[i].images.map(image => {
                        if (image.query === imageQuery && image.type === imageType && image.copyFromPrevious) {
                            sceneModified = true;
                            return { ...image, transform: transformToPropagate };
                        }
                        return image;
                    });
                    
                    if (sceneModified) {
                        newScenes[i] = { ...newScenes[i], images: nextSceneImages };
                    } else {
                        // If the image exists but isn't marked for copy, the chain is broken
                        const chainBreaker = newScenes[i].images.find(image => image.query === imageQuery && image.type === imageType);
                        if (chainBreaker) {
                            break; 
                        }
                    }
                }
            }
        }
        
        // This makes sure the currently edited scene has the latest propagated changes too.
        newScenes[sceneIndex] = updatedScene;
        return newScenes;
    });
};


  const handleReset = () => {
    setAppState('initial');
    setAudioUrl('');
    setAudioDuration(0);
    setScenes([]);
    setTranscriptionResult(null);
    setError(null);
  };

  const renderContent = () => {
    switch (appState) {
      case 'uploading':
        return <Loader text="Uploading audio..." />;
      case 'transcribing':
        return <Loader text="Transcribing (this may take a minute)..." />;
      case 'awaiting_instructions':
        return (
            <InstructionEditor
                transcriptionText={transcriptionResult?.fullText || ''}
                onSubmit={handleInstructionsSubmit}
                error={error}
            />
        );
      case 'generating_plan':
        return <Loader text="Generating visual plan with AI..." />;
      case 'editing':
        return (
          <SceneEditor
            scenes={scenes}
            onUpdateScene={handleUpdateScene}
            onFinish={() => setAppState('playing')}
          />
        );
      case 'playing':
        return (
          <VideoPlayer
            scenes={scenes}
            audioUrl={audioUrl}
            audioDuration={audioDuration}
            onBack={() => setAppState('editing')}
          />
        );
      case 'initial':
      default:
        return <AudioUploader onUpload={handleAudioUpload} error={error} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-6xl flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <h1 className="text-2xl sm:text-3xl font-bold text-white">AI Video Scene Generator</h1>
        </div>
        {appState !== 'initial' && (
          <button
            onClick={handleReset}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Start Over
          </button>
        )}
      </header>
      <main className="w-full max-w-6xl flex-grow flex flex-col items-center justify-center">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;