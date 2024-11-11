import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCV } from '@/context/CVContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentStorage } from '@/lib/document-storage';
import { toast } from 'sonner';

export default function CVUpload() {
  const { user } = useAuth();
  const { cvData, setCVData } = useCV();
  const [dragActive, setDragActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleFile = async (file: File) => {
    if (!user?.uid) {
      toast.error('Please sign in to upload your CV');
      return;
    }

    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    try {
      setIsProcessing(true);
      
      // Process and analyze the document
      toast.info('Processing your CV...', {
        description: 'This may take a few moments.'
      });

      const cvData = await DocumentStorage.storeDocument(file, user.uid);
      
      // Update the UI
      setCVData(cvData);
      toast.success('CV processed successfully', {
        description: 'Your profile has been updated with the new information.'
      });
    } catch (error) {
      console.error('CV processing error:', error);
      toast.error('Failed to process CV', {
        description: error instanceof Error ? error.message : 'An unexpected error occurred'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (cvData) return null;

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-6 w-6" />
          Upload your CV
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`relative flex h-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
            dragActive
              ? 'border-primary bg-muted/50'
              : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute h-full w-full cursor-pointer opacity-0"
            accept=".pdf,.doc,.docx"
            onChange={handleFileInput}
            disabled={isProcessing}
          />
          <div className="flex flex-col items-center gap-2">
            {isProcessing ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Processing your CV...
                </p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop your CV here or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: PDF, DOC, DOCX (Max 10MB)
                </p>
                <Button variant="secondary">Select File</Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}