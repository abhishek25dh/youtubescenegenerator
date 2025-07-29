
import React, { useState, useRef, useEffect } from 'react';
import { Scene } from '../types';
import { PlayIcon, PauseIcon, ReplayIcon, BackIcon } from './icons';

interface VideoPlayerProps {
  scenes: Scene[];
  audioUrl: string;
  audioDuration: number;
  onBack: () => void;
}

const CANONICAL_WIDTH = 1280;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ scenes, audioUrl, audioDuration, onBack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const playerContainerRef = useRef<HTMLDivElement>(null);
  const [playerWidth, setPlayerWidth] = useState(0);

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if (entries[0]) {
        setPlayerWidth(entries[0].contentRect.width);
      }
    });
    
    const currentRef = playerContainerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  const scaleFactor = playerWidth > 0 ? playerWidth / CANONICAL_WIDTH : 0;

  // Find the current scene by taking the LAST scene that has already started.
  // This is more robust than the previous logic and prevents flickering of the first scene in gaps.
  const activeScenes = scenes.filter(s => s.startTime <= currentTime);
  const currentScene = activeScenes.length > 0 ? activeScenes[activeScenes.length - 1] : scenes[0];


  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(audioDuration); // Ensure progress bar goes to 100%
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioDuration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
    } else {
      // If playback has ended, replay from the start
      if (audio.ended) {
        replay();
        return;
      }
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const replay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setIsPlaying(true);
  };

  const totalDuration = audioDuration > 0 ? audioDuration : 1;

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      <div
        ref={playerContainerRef}
        className="w-full aspect-video rounded-lg overflow-hidden relative shadow-2xl border-4 border-gray-700"
        style={{ background: currentScene?.background || '#000' }}
      >
        {/* Images */}
        {currentScene?.images.map(image => (
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
                transition: 'opacity 0.3s ease-in-out',
              }}
            />
          )
        ))}

        {/* Text Overlay */}
        {currentScene?.textOverlay && (
          <div
            className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none"
            style={{
              transform: `translateX(${currentScene.textOverlay.transform.x * scaleFactor}px) translateY(${currentScene.textOverlay.transform.y * scaleFactor}px) rotate(${currentScene.textOverlay.transform.rotation}deg) scale(${currentScene.textOverlay.transform.scale})`
            }}
          >
            <p
              className="font-bold text-center"
              style={{
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive, sans-serif',
                fontSize: `calc(3.75rem * ${scaleFactor > 0 ? scaleFactor : 0.5})`, // base 60px (6xl)
                lineHeight: 1.1,
                color: currentScene.textOverlay.color,
                // Apply a robust text shadow unconditionally to ensure visibility
                textShadow: `calc(2px * ${scaleFactor}) calc(2px * ${scaleFactor}) 0 #000, calc(-2px * ${scaleFactor}) calc(-2px * ${scaleFactor}) 0 #000, calc(2px * ${scaleFactor}) calc(-2px * ${scaleFactor}) 0 #000, calc(-2px * ${scaleFactor}) calc(2px * ${scaleFactor}) 0 #000`
              }}
            >
              {currentScene.textOverlay.text}
            </p>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full mt-4">
        <div className="w-full bg-gray-700 rounded-full h-2.5">
          <div
            className="bg-blue-500 h-2.5 rounded-full"
            style={{ width: `${(currentTime / totalDuration) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-6">
        <button onClick={onBack} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"><BackIcon /></button>
        <button onClick={togglePlay} className="p-4 rounded-full bg-blue-600 hover:bg-blue-500 transition-colors">
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button onClick={replay} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"><ReplayIcon /></button>
      </div>

      <audio ref={audioRef} src={audioUrl} className="hidden" />
    </div>
  );
};

export default VideoPlayer;
