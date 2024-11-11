import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCV } from '@/context/CVContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, StopCircle, Loader2 } from 'lucide-react';
import { VoiceInterview as VoiceInterviewService } from '@/lib/voice-interview';
import { toast } from 'sonner';

interface Message {
  type: 'user' | 'assistant';
  content: string;
}

export default function VoiceInterview() {
  const { user } = useAuth();
  const { cvData } = useCV();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const audioElement = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio element
    audioElement.current = new Audio();
    audioElement.current.onended = () => {
      setIsProcessing(false);
    };

    return () => {
      if (audioElement.current) {
        audioElement.current.pause();
        audioElement.current.src = '';
      }
    };
  }, []);

  const startRecording = async () => {
    if (!user?.uid || !cvData || isProcessing) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });
      
      mediaRecorder.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.current.push(event.data);
        }
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
        await processAudioQuery(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      toast.info('Listening...');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const processAudioQuery = async (audioBlob: Blob) => {
    if (!user?.uid || !cvData) return;

    try {
      setIsProcessing(true);
      
      // Process audio and get response
      const { response, audioBuffer } = await VoiceInterviewService.processAudioQuery(
        audioBlob,
        user.uid,
        cvData
      );

      // Update conversation history
      setMessages(prev => [
        ...prev,
        { type: 'assistant', content: response }
      ]);

      // Play response audio
      if (audioElement.current) {
        const audioUrl = URL.createObjectURL(
          new Blob([audioBuffer], { type: 'audio/mp3' })
        );
        audioElement.current.src = audioUrl;
        await audioElement.current.play();
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process query');
      setIsProcessing(false);
    }
  };

  if (!cvData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Interactive Discussion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <ScrollArea className="h-[300px] rounded-md border p-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`mb-4 flex ${
                  msg.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`rounded-lg px-4 py-2 ${
                    msg.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
          </ScrollArea>

          <div className="flex justify-center">
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
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
                  {isProcessing ? 'Processing...' : 'Start Speaking'}
                </>
              )}
            </Button>
          </div>

          {isProcessing && (
            <div className="flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="ml-2">Processing response...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}