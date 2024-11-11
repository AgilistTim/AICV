import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Upload, 
  Download,
  Mic, 
  StopCircle, 
  Loader2,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { AccessControl } from '@/lib/access-control';
import { DocumentStorage } from '@/lib/document-storage';
import { VoiceInterview } from '@/lib/voice-interview';
import { generateAssessmentReport } from '@/lib/report-generator';

export default function RecruiterPage() {
  const { candidateId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [candidateData, setCandidateData] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [matchScore, setMatchScore] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [canDownloadReport, setCanDownloadReport] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);

  useEffect(() => {
    checkAccess();
  }, [user, candidateId]);

  const checkAccess = async () => {
    if (!user?.uid || !candidateId) {
      toast.error('Authentication required');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const access = await AccessControl.checkAccess(candidateId, user.uid);
      
      if (!access) {
        toast.error('Access not granted', {
          description: 'Please request access to view this profile'
        });
        navigate(`/access-request/${candidateId}`);
        return;
      }

      setHasAccess(true);
      const data = await DocumentStorage.getCandidateProfile(candidateId);
      setCandidateData(data);
      
      toast.success('Access granted', {
        description: `Viewing profile for ${data.personalInfo.name}`
      });
    } catch (error) {
      console.error('Access check error:', error);
      toast.error('Failed to verify access');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleJobDescriptionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid || !candidateId) return;

    try {
      setLoading(true);
      toast.info('Processing job description...');
      
      const text = await DocumentStorage.parseDocument(file);
      setJobDescription(text);
      await analyzeJobFit(text);
    } catch (error) {
      console.error('Error processing job description:', error);
      toast.error('Failed to process job description');
    } finally {
      setLoading(false);
    }
  };

  const handleJobDescriptionInput = async () => {
    if (!jobDescription.trim() || !user?.uid || !candidateId) return;

    try {
      setLoading(true);
      toast.info('Analyzing job fit...');
      await analyzeJobFit(jobDescription);
    } catch (error) {
      console.error('Error analyzing job description:', error);
      toast.error('Failed to analyze job description');
    } finally {
      setLoading(false);
    }
  };

  const analyzeJobFit = async (jobText: string) => {
    try {
      const { score, analysis } = await DocumentStorage.analyzeJobFit(
        candidateData,
        jobText
      );

      setMatchScore(score);
      setAnalysis(analysis);
      setCanDownloadReport(true);

      toast.success('Analysis complete', {
        description: `Match score: ${score}%`
      });
    } catch (error) {
      console.error('Job fit analysis error:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    if (!user?.uid || !candidateId || !candidateData) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      setIsRecording(true);
      toast.info('Recording started');

      // Initialize voice interview with candidate context
      await VoiceInterview.initializeSession(
        user.uid,
        candidateId,
        candidateData,
        (message) => {
          setMessages(prev => [...prev, message]);
        }
      );
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      setIsProcessing(true);
      toast.info('Processing recording...');

      await VoiceInterview.stopSession();
      
      toast.success('Recording processed');
    } catch (error) {
      console.error('Error processing recording:', error);
      toast.error('Failed to process recording');
    } finally {
      setIsProcessing(false);
    }
  };

  const generateReport = async () => {
    if (!user?.uid || !candidateId) return;

    try {
      setLoading(true);
      toast.info('Generating report...');
      
      const report = await generateAssessmentReport(
        candidateId,
        jobDescription,
        matchScore || 0,
        analysis || ''
      );

      // Trigger download
      const blob = new Blob([report], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${candidateData.personalInfo.name.replace(/\s+/g, '-')}-assessment.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container max-w-md py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Lock className="mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="mb-2 text-lg font-semibold">Access Required</h2>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              You need permission to view this profile.
            </p>
            <Button onClick={() => navigate(`/access-request/${candidateId}`)}>
              Request Access
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6" />
              Job Description Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => document.getElementById('jd-upload')?.click()}
                  disabled={loading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Job Description
                </Button>
                <input
                  id="jd-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleJobDescriptionUpload}
                />
              </div>

              <div className="space-y-2">
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Or paste job description here..."
                  className="min-h-[200px]"
                />
                <Button 
                  onClick={handleJobDescriptionInput}
                  disabled={!jobDescription.trim() || loading}
                >
                  Analyze Fit
                </Button>
              </div>

              {matchScore !== null && (
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Match Score</span>
                      <span className="text-sm text-muted-foreground">
                        {matchScore}%
                      </span>
                    </div>
                    <Progress value={matchScore} className="h-2" />
                  </div>

                  {analysis && (
                    <Card>
                      <CardContent className="pt-6">
                        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                          {analysis}
                        </ScrollArea>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-6 w-6" />
              Voice Assessment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Record your thoughts about {candidateData?.personalInfo.name}'s fit for the role.
                This will be included in the final assessment report.
              </p>

              <div className="flex justify-center">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isProcessing}
                  className="w-full max-w-sm"
                >
                  {isRecording ? (
                    <>
                      <StopCircle className="mr-2 h-5 w-5" />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic className="mr-2 h-5 w-5" />
                      Start Recording
                    </>
                  )}
                </Button>
              </div>

              {messages.length > 0 && (
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`mb-4 ${
                        msg.role === 'user' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              )}

              {isProcessing && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Processing recording...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {canDownloadReport && (
          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full"
                onClick={generateReport}
                disabled={loading}
              >
                <Download className="mr-2 h-4 w-4" />
                Generate Assessment Report
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}