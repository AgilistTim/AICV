import { useState } from 'react';
import { useCV } from '@/context/CVContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, Upload, Send, PieChart, 
  MessageSquare, StopCircle 
} from 'lucide-react';

export default function RecruiterSection() {
  const { cvData, jobMatch, setJobMatch, chatHistory, setChatHistory } = useCV();
  const [isRecording, setIsRecording] = useState(false);
  const [message, setMessage] = useState('');

  if (!cvData) return null;

  const handleVoiceQuery = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording and transcription
  };

  const handleJobDescriptionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // TODO: Implement job description analysis
      setJobMatch({
        score: 85,
        matchedSkills: ['React', 'TypeScript'],
        missingSkills: ['AWS'],
        recommendations: ['Consider getting AWS certification']
      });
    }
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
    <div className="grid gap-8 lg:grid-cols-2">
      <Card className="lg:order-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-6 w-6" />
            Job Match Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Button variant="outline" className="w-full" onClick={() => document.getElementById('jd-upload')?.click()}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Job Description
              </Button>
              <input
                id="jd-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleJobDescriptionUpload}
              />
            </div>

            {jobMatch && (
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Match Score</span>
                    <span className="text-sm text-muted-foreground">
                      {jobMatch.score}%
                    </span>
                  </div>
                  <Progress value={jobMatch.score} className="h-2" />
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Matched Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobMatch.matchedSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-green-500/10">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Missing Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {jobMatch.missingSkills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-red-500/10">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-2 font-medium">Recommendations</h4>
                  <ul className="list-disc pl-5 text-sm">
                    {jobMatch.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}