import { openai } from './openai';
import { EmbeddingsStore } from './embeddings-store';
import { DocumentStorage } from './document-storage';
import { AudioService } from './audio-service';
import type { CVData } from '@/types';

export class VoiceInterview {
  private static readonly SYSTEM_PROMPT = `You are an AI assistant helping a recruiter evaluate a candidate's CV and experience. 
  Use the provided CV data and previous conversation context to engage in a natural discussion about the candidate's experience.
  Focus on:
  - Understanding the depth of their experience
  - Technical skills and achievements
  - Problem-solving approaches
  - Project impacts and outcomes
  
  Keep responses concise and professional.`;

  static async processAudioQuery(
    audioBlob: Blob,
    userId: string,
    cvData: CVData
  ): Promise<{ response: string; audioBuffer: ArrayBuffer }> {
    try {
      console.debug('Processing audio query...');

      // Transcribe audio to text
      const transcript = await AudioService.transcribeAudio(audioBlob);
      console.debug('Audio transcribed:', { transcript });

      // Get embedding for the query
      const queryEmbedding = await EmbeddingsStore.createEmbedding(transcript);
      
      // Find relevant context from stored embeddings
      const similarContent = await EmbeddingsStore.findSimilarEmbeddings(
        queryEmbedding,
        userId,
        'interview_response',
        0.7,
        3
      );

      // Combine CV data and relevant context
      const context = `
        CV Summary: ${cvData.personalInfo.summary}
        
        Skills: ${cvData.skills.join(', ')}
        
        Experience:
        ${cvData.experience.map(exp => `
          ${exp.role} at ${exp.company} (${exp.period})
          ${exp.highlights.join('\n')}
        `).join('\n')}
        
        Previous Discussion Context:
        ${similarContent.map(item => item.content).join('\n')}
      `;

      // Generate response using GPT-4o-mini
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: this.SYSTEM_PROMPT },
          { role: "user", content: context },
          { role: "user", content: transcript }
        ],
        temperature: 0.7,
        max_tokens: 300
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) throw new Error('No response generated');

      console.debug('Generated response:', { response });

      // Store the interaction
      const interactionEmbedding = await EmbeddingsStore.createEmbedding(
        `Q: ${transcript}\nA: ${response}`
      );
      await EmbeddingsStore.storeEmbedding(
        `Q: ${transcript}\nA: ${response}`,
        interactionEmbedding,
        {
          type: 'interview_response',
          userId,
          timestamp: Date.now()
        }
      );

      // Convert response to speech
      const audioBuffer = await AudioService.generateSpeech(response);

      return {
        response,
        audioBuffer
      };
    } catch (error) {
      console.error('Error processing audio query:', error);
      throw error;
    }
  }
}