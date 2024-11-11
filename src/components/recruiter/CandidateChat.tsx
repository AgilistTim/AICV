import { useState } from 'react';
import { useCV } from '@/context/CVContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mic, Send, MessageSquare, StopCircle } from 'lucide-react';

export default function CandidateChat() {
  const { chatHistory, setChatHistory } = useCV();
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');

  const handleVoiceQuery = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording and transcription
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage = { role: 'user' as const, content: message };
    setChatHistory([...chatHistory, newMessage]);
    setMessage('');

    // TODO: Implement ChatGPT response
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: 'I can help you evaluate this candidate. What would you like to know?'
      }]);
    }, 1000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Interactive Chat
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-[500px] flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${
                    msg.role === 'assistant' ? 'justify-start' : 'justify-end'
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      msg.role === 'assistant'
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="mt-4">
            <div className="flex gap-2">
              <Button
                variant={isRecording ? 'destructive' : 'outline'}
                size="icon"
                onClick={handleVoiceQuery}
              >
                {isRecording ? (
                  <StopCircle className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about the candidate..."
                className="min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}