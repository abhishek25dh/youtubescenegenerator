
import React, { useState } from 'react';
import { GenerateIcon } from './icons';

interface InstructionEditorProps {
  transcriptionText: string;
  onSubmit: (instructions: string) => void;
  error: string | null;
}

const InstructionEditor: React.FC<InstructionEditorProps> = ({ transcriptionText, onSubmit, error }) => {
  const [instructions, setInstructions] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (instructions.trim()) {
      onSubmit(instructions);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 animate-fade-in">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold">Provide Editing Instructions</h2>
        <p className="text-gray-400 mt-1">Your transcript is ready. Now, tell the AI how to build your video.</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left: Transcript */}
        <div className="lg:w-1/2 flex flex-col">
          <h3 className="text-lg font-semibold mb-2 text-gray-200">Full Audio Transcript</h3>
          <div className="bg-gray-800 p-4 rounded-lg max-h-96 lg:max-h-full lg:flex-grow overflow-y-auto text-gray-300 border border-gray-700">
            <p className="whitespace-pre-wrap">{transcriptionText}</p>
          </div>
        </div>
        {/* Right: Instructions Form */}
        <div className="lg:w-1/2 flex flex-col">
          <form onSubmit={handleSubmit} className="h-full flex flex-col">
            <label htmlFor="instructions" className="text-lg font-semibold mb-2 text-gray-200">Your Creative Direction</label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Paste your detailed editing instructions here. For each scene, describe the text section, background, text overlays, and images (with prompts or search terms)."
              className="w-full flex-grow p-4 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white resize-none transition-colors"
              rows={15}
              required
            />
             {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={!instructions.trim()}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 disabled:scale-100"
            >
              <GenerateIcon />
              Generate Visual Plan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InstructionEditor;
