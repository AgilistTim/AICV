import { openai } from './openai';

export class AudioService {
  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      console.debug('Starting audio transcription...', {
        blobSize: audioBlob.size,
        blobType: audioBlob.type
      });

      // Convert audio blob to File object with proper name and type
      const audioFile = new File([audioBlob], 'audio.webm', {
        type: 'audio/webm',
        lastModified: Date.now()
      });

      // Validate file size (Whisper API limit is 25MB)
      if (audioFile.size > 25 * 1024 * 1024) {
        throw new Error('Audio file size exceeds 25MB limit');
      }

      const transcript = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
        temperature: 0.3
      });

      console.debug('Transcription complete', {
        transcriptLength: transcript.length,
        sample: transcript.substring(0, 100)
      });

      return transcript;
    } catch (error) {
      console.error('Audio transcription error:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  static async generateSpeech(text: string): Promise<ArrayBuffer> {
    try {
      console.debug('Generating speech...', {
        textLength: text.length,
        sample: text.substring(0, 100)
      });

      // Truncate text if too long (TTS API limit is 4096 characters)
      const truncatedText = text.length > 4000 
        ? text.substring(0, 4000) + '...'
        : text;

      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: truncatedText,
        speed: 1.0,
        response_format: 'mp3'
      });

      const buffer = await mp3.arrayBuffer();
      console.debug('Speech generated successfully', {
        bufferSize: buffer.byteLength
      });

      return buffer;
    } catch (error) {
      console.error('Speech generation error:', error);
      throw new Error('Failed to generate speech');
    }
  }

  static async validateAudioFormat(blob: Blob): Promise<boolean> {
    console.debug('Validating audio format...', {
      blobType: blob.type,
      blobSize: blob.size
    });

    // Check if the audio format is supported
    const supportedTypes = ['audio/webm', 'audio/wav', 'audio/mp3', 'audio/mpeg'];
    if (!supportedTypes.includes(blob.type)) {
      throw new Error('Unsupported audio format. Please use WebM, WAV, or MP3.');
    }

    // Check file size
    if (blob.size > 25 * 1024 * 1024) {
      throw new Error('Audio file size exceeds 25MB limit');
    }

    return true;
  }
}