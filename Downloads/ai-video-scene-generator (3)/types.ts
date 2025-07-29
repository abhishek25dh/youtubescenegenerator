export interface Sentence {
  text: string;
  start: number;
  end: number;
}

export interface Word {
  text: string;
  start: number;
  end: number;
}

export interface TranscriptionResult {
  sentences: Sentence[];
  words: Word[];
  fullText: string;
  audioDuration: number;
}

export interface Transform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
}

export interface TextOverlay {
  text: string;
  color: string;
  style: string;
  transform: Transform;
}

export interface ImageElement {
  id: string;
  type: 'AI_GENERATED' | 'SEARCH';
  query: string;
  initialPosition: 'center' | 'left' | 'right' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  url: string;
  transform: Transform;
  copyFromPrevious?: boolean;
}

export interface Scene {
  id: string;
  textSection: string;
  background: string;
  textOverlay?: TextOverlay;
  images: ImageElement[];
  startTime: number;
  endTime: number;
}

export type AppState =
  | 'initial'
  | 'uploading'
  | 'transcribing'
  | 'awaiting_instructions'
  | 'generating_plan'
  | 'editing'
  | 'playing';