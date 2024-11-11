import { PDFExtractor } from './pdf-extractor';

export async function parseDocument(file: File): Promise<string> {
  try {
    console.debug('Starting document parsing...', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(file.type)) {
      console.debug('Invalid file type:', file.type);
      throw new Error('Unsupported file format. Please upload a PDF or Word document.');
    }

    let text = '';

    if (file.type === 'application/pdf') {
      console.debug('Processing PDF document...');
      const extractor = new PDFExtractor(file);
      text = await extractor.extract();
      console.debug('PDF extraction complete', { textLength: text.length });
    } else {
      console.debug('Processing Word document...');
      // For Word documents, extract text directly
      const rawText = await file.text();
      console.debug('Raw text extracted', { rawTextLength: rawText.length });
      
      // Clean up text - remove special characters and normalize whitespace
      text = rawText
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/[\u2000-\u200F\u2028-\u202F]/g, ' ') // Replace Unicode spaces/breaks
        .replace(/\r\n|\r|\n/g, ' ') // Normalize line endings
        .replace(/\s+/g, ' ') // Collapse multiple spaces
        .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '') // Keep only printable ASCII and Latin-1
        .trim();

      console.debug('Text cleaned', { 
        cleanedTextLength: text.length,
        sample: text.substring(0, 100)
      });
    }

    if (!text.trim()) {
      console.debug('No text content extracted');
      throw new Error('No text content could be extracted from the document');
    }

    // Ensure reasonable text length for analysis
    const maxLength = 32000; // Reasonable limit for GPT models
    if (text.length > maxLength) {
      console.debug('Truncating long text', { 
        originalLength: text.length,
        truncatedLength: maxLength 
      });
      text = text.substring(0, maxLength);
    }

    console.debug('Document parsing successful', {
      finalTextLength: text.length,
      firstChars: text.substring(0, 100)
    });

    return text;
  } catch (error) {
    console.error('Document parsing error:', {
      error,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    });
    throw error;
  }
}