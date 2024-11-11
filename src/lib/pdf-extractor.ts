import { getDocument, GlobalWorkerOptions, version } from 'pdfjs-dist';

// Configure worker with explicit version
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

export class PDFExtractor {
  private file: File;

  constructor(file: File) {
    this.file = file;
  }

  async extract(): Promise<string> {
    try {
      console.debug('Starting PDF extraction...', {
        fileName: this.file.name,
        fileSize: this.file.size
      });

      const arrayBuffer = await this.file.arrayBuffer();
      console.debug('File loaded into buffer', { bufferSize: arrayBuffer.byteLength });

      const pdf = await getDocument({ data: arrayBuffer }).promise;
      console.debug('PDF document loaded', { numPages: pdf.numPages });
      
      const textPromises = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        textPromises.push(this.extractPageText(pdf, i));
      }
      
      const textParts = await Promise.all(textPromises);
      console.debug('All pages extracted', { 
        numPages: textParts.length,
        pageLengths: textParts.map(t => t.length)
      });

      const finalText = textParts.join('\n').trim();
      console.debug('PDF extraction complete', { 
        totalLength: finalText.length,
        sample: finalText.substring(0, 100)
      });

      return finalText;
    } catch (error) {
      console.error('PDF extraction error:', {
        error,
        fileName: this.file.name,
        fileSize: this.file.size
      });
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractPageText(pdf: any, pageNum: number): Promise<string> {
    try {
      console.debug(`Extracting text from page ${pageNum}...`);
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      console.debug(`Page ${pageNum} extracted`, { 
        textLength: pageText.length,
        sample: pageText.substring(0, 50)
      });

      return pageText;
    } catch (error) {
      console.error(`Error extracting text from page ${pageNum}:`, error);
      return '';
    }
  }
}