
import React, { useState, useEffect, useRef } from 'react';
import { Scene, ImageElement, Transform, TextOverlay } from '../types';
import { EditIcon, CheckIcon, AIGeneratedIcon, SearchIcon, FlipIcon, RotateIcon, ScaleIcon, MoveIcon, TextIcon } from './icons';

interface SceneEditorProps {
  scenes: Scene[];
  onUpdateScene: (scene: Scene) => void;
  onFinish: () => void;
}

const CANONICAL_WIDTH = 1280;
const CANONICAL_HEIGHT = 720;

const SceneEditor: React.FC<SceneEditorProps> = ({ scenes, onUpdateScene, onFinish }) => {
  const [activeSceneId, setActiveSceneId] = useState<string | null>(scenes[0]?.id || null);
  const [activeControlId, setActiveControlId] = useState<string | null>(null);
  
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewWidth, setPreviewWidth] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setPreviewWidth(entries[0].contentRect.width);
      }
    });

    const currentRef = previewContainerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const scaleFactor = previewWidth > 0 ? previewWidth / CANONICAL_WIDTH : 0;

  const activeScene = scenes.find(s => s.id === activeSceneId);

  // Effect to update the active control (image or text) when the scene changes
  useEffect(() => {
    if (activeScene) {
      const isControlStillValid =
        activeScene.images.some(img => img.id === activeControlId) ||
        (activeScene.textOverlay && activeControlId === 'text-overlay');

      if (!isControlStillValid) {
        if (activeScene.images.length > 0) {
          setActiveControlId(activeScene.images[0].id);
        } else if (activeScene.textOverlay) {
          setActiveControlId('text-overlay');
        } else {
          setActiveControlId(null);
        }
      }
    }
  }, [activeScene, activeControlId]);

  const activeImage = activeScene?.images.find(img => img.id === activeControlId);
  const isTextActive = activeControlId === 'text-overlay' && !!activeScene?.textOverlay;
  const activeText = isTextActive ? activeScene.textOverlay : null;

  const handleImageUpdate = (updatedImage: ImageElement) => {
    if (!activeScene) return;
    const updatedImages = activeScene.images.map(img =>
      img.id === updatedImage.id ? updatedImage : img
    );
    onUpdateScene({ ...activeScene, images: updatedImages });
  };

  const handleImageTransformChange = (key: keyof Transform, value: number | boolean) => {
    if (!activeImage) return;
    handleImageUpdate({
      ...activeImage,
      transform: { ...activeImage.transform, [key]: value },
    });
  };

  const handleTextTransformChange = (key: keyof Transform, value: number) => {
    if (!activeText || !activeScene) return;
    const updatedTextOverlay: TextOverlay = {
      ...activeText,
      transform: { ...activeText.transform, [key]: value },
    };
    onUpdateScene({ ...activeScene, textOverlay: updatedTextOverlay });
  };

  const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeText || !activeScene) return;
    const newColor = e.target.value;
    const updatedTextOverlay: TextOverlay = {
      ...activeText,
      color: newColor,
    };
    onUpdateScene({ ...activeScene, textOverlay: updatedTextOverlay });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeImage) return;
    handleImageUpdate({ ...activeImage, url: e.target.value });
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6">
      {/* Scene List */}
      <div className="w-full lg:w-1/3 xl:w-1/4 flex-shrink-0 bg-gray-800 rounded-lg p-4 overflow-y-auto max-h-[80vh]">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <EditIcon />
          Edit Scenes
        </h2>
        <div className="space-y-2">
          {scenes.map((scene, index) => (
            <button
              key={scene.id}
              onClick={() => setActiveSceneId(scene.id)}
              className={`w-full text-left p-3 rounded-md transition-colors duration-200 ${
                activeSceneId === scene.id ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              <p className="font-semibold text-white">Scene {index + 1}</p>
              <p className="text-sm text-gray-300 truncate">"{scene.textSection}"</p>
            </button>
          ))}
        </div>
      </div>

      {/* Active Scene Editor */}
      <div className="w-full lg:w-2/3 xl:w-3/4 bg-gray-800 rounded-lg p-6 overflow-y-auto max-h-[80vh]">
        {activeScene ? (
          <>
            <h3 className="text-2xl font-bold mb-2">Scene {scenes.findIndex(s => s.id === activeSceneId) + 1}</h3>
            <p className="text-lg text-gray-300 mb-4 italic">"{activeScene.textSection}"</p>

            <div className="mb-6">
              <h4 className="font-semibold text-white mb-2">Live Scene Preview</h4>
              <div
                ref={previewContainerRef}
                className="w-full aspect-video rounded-lg overflow-hidden relative shadow-inner border-2 border-gray-700"
                style={{ background: activeScene.background || '#000' }}
              >
                {activeScene.images.map(image => (
                  image.url && (
                    <img
                      key={image.id}
                      src={image.url}
                      alt={image.query}
                      className="absolute max-h-full max-w-full"
                      style={{
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) translateX(${image.transform.x * scaleFactor}px) translateY(${image.transform.y * scaleFactor}px) rotate(${image.transform.rotation}deg) scale(${image.transform.scale}) scaleX(${image.transform.flipX ? -1 : 1}) scaleY(${image.transform.flipY ? -1 : 1})`,
                      }}
                    />
                  )
                ))}
                {activeScene.textOverlay && (
                  <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none"
                    style={{
                      transform: `translateX(${activeScene.textOverlay.transform.x * scaleFactor}px) translateY(${activeScene.textOverlay.transform.y * scaleFactor}px) rotate(${activeScene.textOverlay.transform.rotation}deg) scale(${activeScene.textOverlay.transform.scale})`
                    }}
                  >
                    <p
                      className="font-bold text-center"
                      style={{
                        fontFamily: '"Comic Sans MS", "Comic Sans", cursive, sans-serif',
                        fontSize: `calc(3.75rem * ${scaleFactor > 0 ? scaleFactor : 0.5})`, // base 60px (6xl)
                        lineHeight: 1.1,
                        color: activeScene.textOverlay.color,
                        // Apply a robust text shadow unconditionally to ensure visibility
                        textShadow: `calc(2px * ${scaleFactor}) calc(2px * ${scaleFactor}) 0 #000, calc(-2px * ${scaleFactor}) calc(-2px * ${scaleFactor}) 0 #000, calc(2px * ${scaleFactor}) calc(-2px * ${scaleFactor}) 0 #000, calc(-2px * ${scaleFactor}) calc(2px * ${scaleFactor}) 0 #000`
                      }}
                    >
                      {activeScene.textOverlay.text}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Controls Section */}
            {(activeScene.images.length > 0 || activeScene.textOverlay) ? (
              <div className="border-t border-gray-700 pt-6">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <h4 className="font-semibold text-white mr-2">Edit:</h4>
                  {activeScene.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setActiveControlId(image.id)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeControlId === image.id ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      Image {index + 1}
                    </button>
                  ))}
                  {activeScene.textOverlay && (
                    <button
                      onClick={() => setActiveControlId('text-overlay')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        activeControlId === 'text-overlay' ? 'bg-green-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      }`}
                    >
                      Text Overlay
                    </button>
                  )}
                </div>

                {activeImage && (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-1"><ScaleIcon />Scale: {activeImage.transform.scale}</label>
                          <input type="range" min="0.1" max="3" step="0.05" value={activeImage.transform.scale} onChange={(e) => handleImageTransformChange('scale', parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-1"><RotateIcon />Rotation: {activeImage.transform.rotation}°</label>
                          <input type="range" min="-180" max="180" step="1" value={activeImage.transform.rotation} onChange={(e) => handleImageTransformChange('rotation', parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-1"><MoveIcon />Position X: {activeImage.transform.x}px</label>
                          <input type="range" min={-CANONICAL_WIDTH / 2} max={CANONICAL_WIDTH / 2} step="1" value={activeImage.transform.x} onChange={(e) => handleImageTransformChange('x', parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-1"><MoveIcon className="opacity-0" />Position Y: {activeImage.transform.y}px</label>
                          <input type="range" min={-CANONICAL_HEIGHT / 2} max={CANONICAL_HEIGHT / 2} step="1" value={activeImage.transform.y} onChange={(e) => handleImageTransformChange('y', parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-2 md:col-span-2">
                        <FlipIcon />
                        <span className="text-sm font-medium text-gray-300">Flip:</span>
                        <button onClick={() => handleImageTransformChange('flipX', !activeImage.transform.flipX)} className={`px-3 py-1 rounded text-sm ${activeImage.transform.flipX ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-500`}>Horizontal</button>
                        <button onClick={() => handleImageTransformChange('flipY', !activeImage.transform.flipY)} className={`px-3 py-1 rounded text-sm ${activeImage.transform.flipY ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-blue-500`}>Vertical</button>
                      </div>
                    </div>

                    <div className="bg-gray-700 p-4 rounded-lg mt-6">
                      <div className="flex items-start gap-3 mb-3">
                        {activeImage.type === 'AI_GENERATED' ? <AIGeneratedIcon /> : <SearchIcon />}
                        <div>
                          <h5 className="font-bold text-lg text-white">
                            {activeImage.type === 'AI_GENERATED' ? 'AI Generated Image' : 'Web Search Image'}
                          </h5>
                          <p className="text-xs text-gray-400">Initial Position: {activeImage.initialPosition}</p>
                        </div>
                      </div>
                      <div className="bg-gray-800 p-3 rounded-md mb-3">
                        <p className="text-sm text-gray-300 font-mono">{activeImage.query}</p>
                      </div>
                      <input type="text" placeholder="Paste Image URL here" value={activeImage.url} onChange={handleUrlChange} className="w-full p-2 rounded-md bg-gray-800 border border-gray-600 focus:border-blue-500 focus:ring-blue-500 text-white" />
                    </div>
                  </div>
                )}

                {isTextActive && activeText && (
                  <div>
                    <div className="flex items-center gap-3 mb-4 p-4 bg-gray-700 rounded-lg">
                      <TextIcon />
                      <div>
                        <h5 className="font-bold text-lg text-white">Text Overlay</h5>
                        <p className="text-sm text-gray-300 font-mono">"{activeText.text}"</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      <div className="space-y-4 md:col-span-2">
                          <label htmlFor="textColor" className="block text-sm font-medium text-gray-300 mb-1">Text Color</label>
                          <div className="flex items-center gap-3">
                              <input 
                                  id="textColor"
                                  type="text" 
                                  value={activeText.color} 
                                  onChange={handleTextColorChange} 
                                  className="w-full p-2 rounded-md bg-gray-600 border border-gray-500 focus:border-blue-500 focus:ring-blue-500 text-white" 
                                  placeholder="e.g., yellow or #FFFF00"
                              />
                              <div className="w-8 h-8 rounded-md border-2 border-gray-500" style={{ backgroundColor: activeText.color }}></div>
                          </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-1"><ScaleIcon />Scale: {activeText.transform.scale}</label>
                          <input type="range" min="0.1" max="3" step="0.05" value={activeText.transform.scale} onChange={(e) => handleTextTransformChange('scale', parseFloat(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-1"><RotateIcon />Rotation: {activeText.transform.rotation}°</label>
                          <input type="range" min="-180" max="180" step="1" value={activeText.transform.rotation} onChange={(e) => handleTextTransformChange('rotation', parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-1"><MoveIcon />Position X: {activeText.transform.x}px</label>
                          <input type="range" min={-CANONICAL_WIDTH / 2} max={CANONICAL_WIDTH / 2} step="1" value={activeText.transform.x} onChange={(e) => handleTextTransformChange('x', parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 flex items-center gap-2 mb-1"><MoveIcon className="opacity-0" />Position Y: {activeText.transform.y}px</label>
                          <input type="range" min={-CANONICAL_HEIGHT / 2} max={CANONICAL_HEIGHT / 2} step="1" value={activeText.transform.y} onChange={(e) => handleTextTransformChange('y', parseInt(e.target.value))} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-700 rounded-lg mt-6 border-t border-gray-700">
                <p className="text-gray-400">No images or text planned for this scene.</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400">Select a scene from the left to begin editing.</p>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-10">
        <button
          onClick={onFinish}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-transform transform hover:scale-105"
        >
          <CheckIcon />
          Generate Video
        </button>
      </div>
    </div>
  );
};

export default SceneEditor;
