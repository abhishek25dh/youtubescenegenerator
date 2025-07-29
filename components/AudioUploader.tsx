import React, { useCallback, useState } from 'react';
import { UploadIcon } from './icons';

interface AudioUploaderProps {
  onUpload: (file: File) => void;
  error: string | null;
}

const AudioUploader: React.FC<AudioUploaderProps> = ({ onUpload, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if(e.dataTransfer.files[0].type.startsWith('audio/')) {
        onUpload(e.dataTransfer.files[0]);
      } else {
        alert("Please drop an audio file.");
      }
    }
  }, [onUpload]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div className="w-full max-w-2xl text-center">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`relative block w-full rounded-lg border-2 border-dashed border-gray-600 p-12 text-center hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 ${isDragging ? 'bg-gray-800 border-blue-500' : 'bg-gray-900'}`}
      >
        <UploadIcon />
        <span className="mt-2 block text-sm font-semibold text-gray-100">
          Upload an audio file
        </span>
        <span className="mt-1 block text-xs text-gray-400">
          or drag and drop
        </span>
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept="audio/*"
          onChange={handleFileChange}
        />
      </div>
      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
       <p className="mt-6 text-sm text-gray-400 max-w-lg mx-auto">
          <strong>Note:</strong> This demo uses the AssemblyAI API directly in your browser. For a production application, API keys should always be kept secret and managed on a secure backend server to prevent misuse.
      </p>
    </div>
  );
};

export default AudioUploader;