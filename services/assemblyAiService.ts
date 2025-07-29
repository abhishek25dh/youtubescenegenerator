import { TranscriptionResult, Word } from '../types';

// WARNING: Storing API keys in client-side code is highly insecure and should never be done in a production environment.
// This is for demonstration purposes only. In a real application, this key should be on a server and proxied.
const ASSEMBLYAI_API_KEY = '98dd4c7e12d745bc97722b54671ebeff';
const ASSEMBLYAI_API_BASE = 'https://api.assemblyai.com/v2';

const UPLOAD_ENDPOINT = `${ASSEMBLYAI_API_BASE}/upload`;
const TRANSCRIPT_ENDPOINT = `${ASSEMBLYAI_API_BASE}/transcript`;

// Helper function to poll for results
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getTranscriptionFromAssemblyAI = async (
  audioFile: File,
  onStatusChange: (status: 'uploading' | 'transcribing') => void
): Promise<TranscriptionResult> => {
  // 1. Upload the audio file to AssemblyAI's secure storage
  onStatusChange('uploading');
  const uploadResponse = await fetch(UPLOAD_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      'Content-Type': 'application/octet-stream',
    },
    body: audioFile,
  });

  if (!uploadResponse.ok) {
    throw new Error('Failed to upload audio file to AssemblyAI.');
  }

  const { upload_url } = await uploadResponse.json();
  if (!upload_url) {
      throw new Error('AssemblyAI did not return an upload URL.');
  }

  // 2. Request the transcription with word-level detail
  onStatusChange('transcribing');
  const transcriptPayload = {
      audio_url: upload_url,
      speech_model: 'universal',
      punctuate: true,
      // The 'word_details' parameter is deprecated and was causing the 'Invalid endpoint schema' error.
      // Word-level timestamps are now returned by default with the 'universal' model.
  };

  const transcriptResponse = await fetch(TRANSCRIPT_ENDPOINT, {
    method: 'POST',
    headers: {
      authorization: ASSEMBLYAI_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transcriptPayload),
  });

  if (!transcriptResponse.ok) {
    let errorData;
    try {
        errorData = await transcriptResponse.json();
    } catch (e) {
        errorData = { error: `API returned a non-JSON error: ${transcriptResponse.statusText}` };
    }
    console.error("AssemblyAI transcription creation failed:", JSON.stringify(errorData, null, 2));
    const errorMessage = errorData.error || (Array.isArray(errorData.errors) && errorData.errors[0]?.message) || 'Check console for details.';
    throw new Error(`Failed to create transcription job in AssemblyAI: ${errorMessage}`);
  }

  const { id: transcriptId } = await transcriptResponse.json();
  if (!transcriptId) {
      throw new Error('AssemblyAI did not return a transcript ID.');
  }

  // 3. Poll for the transcription result
  while (true) {
    const pollResponse = await fetch(`${TRANSCRIPT_ENDPOINT}/${transcriptId}`, {
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
      },
    });

    if (!pollResponse.ok) {
        throw new Error('Failed while polling for transcription results.');
    }
    
    const result = await pollResponse.json();

    if (result.status === 'completed') {
      if (!result.words || result.words.length === 0) {
        throw new Error('Transcription completed, but no words were returned from the audio.');
      }
      // AssemblyAI returns start/end in milliseconds.
      const words: Word[] = result.words.map((w: any) => ({
        text: w.text,
        start: w.start,
        end: w.end,
      }));

      // Sentences might not be available, but we can construct them from words if needed
      // For now, we mainly need the words for timing and the full text for the AI prompt.
      const sentences = result.sentences || [];
      const fullText = result.text;
      const audioDuration = result.audio_duration;

      if (!fullText || !audioDuration) {
          throw new Error('Transcription result was missing critical data (text or duration).');
      }

      return { words, sentences, fullText, audioDuration };

    } else if (result.status === 'error') {
      throw new Error(`AssemblyAI transcription failed: ${result.error}`);
    } else {
      // Wait for 3 seconds before polling again
      await sleep(3000);
    }
  }
};