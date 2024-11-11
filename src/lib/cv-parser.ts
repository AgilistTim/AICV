import { parseDocument } from './document-parser';
import { CVAnalyzer } from './cv-analyzer';
import type { CVData } from '@/types';

export async function parseCV(file: File): Promise<CVData> {
  try {
    // Extract text from document
    const text = await parseDocument(file);
    if (!text) {
      throw new Error('No text extracted from document');
    }

    // Analyze CV content
    const cvData = await CVAnalyzer.analyze(text);
    return cvData;
  } catch (error) {
    console.error('Error parsing CV:', error);
    throw error;
  }
}