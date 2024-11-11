import { PDFExtractor } from './pdf-extractor';
import { DOCXExtractor } from './docx-extractor';

export class DocumentExtractor {
  static async extract(file: File): Promise<string> {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileType = file.type.toLowerCase();
    
    try {
      if (fileType === 'application/pdf') {
        const extractor = new PDFExtractor(file);
        return await extractor.extract();
      } 
      
      if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
          fileType === 'application/msword') {
        const extractor = new DOCXExtractor(file);
        return await extractor.extract();
      }
      
      throw new Error('Unsupported file type. Please upload a PDF or Word document.');
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Document extraction failed');
    }
  }
}