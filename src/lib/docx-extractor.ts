import mammoth from 'mammoth';

export class DOCXExtractor {
  private file: File;

  constructor(file: File) {
    this.file = file;
  }

  async extract(): Promise<string> {
    try {
      const arrayBuffer = await this.file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } catch (error) {
      throw new Error(`DOCX extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}