import { useState } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { useCV } from '@/context/CVContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function CVUpload() {
  const { cvData, setCVData, isAnalyzing, setIsAnalyzing } = useCV();
  const [dragActive, setDragActive] = useState(false);

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
    if (!file.type.includes('pdf') && !file.type.includes('word')) {
      toast.error('Please upload a PDF or Word document');
      return;
    }

    setIsAnalyzing(true);
    // TODO: Implement file processing and ChatGPT analysis
    setTimeout(() => {
      setCVData({
        personalInfo: {
          name: 'Tim Smith',
          title: 'Senior Software Engineer',
          summary: 'Experienced software engineer with expertise in React and Node.js',
        },
        skills: ['React', 'TypeScript', 'Node.js'],
        experience: [{
          company: 'Tech Corp',
          role: 'Senior Developer',
          period: '2020-Present',
          highlights: ['Led team of 5 developers', 'Improved performance by 50%']
        }],
        insights: {
          strengths: ['Technical leadership', 'Problem solving'],
          improvements: ['Public speaking'],
          recommendations: ['Consider obtaining cloud certifications']
        }
      });
      setIsAnalyzing(false);
      toast.success('CV analyzed successfully');
    }, 2000);
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
          />
          <div className="flex flex-col items-center gap-2">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Analyzing your CV with AI...
                </p>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drag and drop your CV here or click to browse
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