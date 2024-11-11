import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Share2 } from 'lucide-react';
import { AccessControl } from '@/lib/access-control';
import { toast } from 'sonner';

export default function ShareProfilePage() {
  const { profileId } = useParams();
  const [loading, setLoading] = useState(true);
  const [shareUrl, setShareUrl] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profileId) {
      // Generate shareable URL
      const url = `${window.location.origin}/view/${profileId}`;
      setShareUrl(url);
      setLoading(false);
    }
  }, [profileId]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard');
  };

  const handleSendInvite = async () => {
    if (!profileId || !recruiterEmail.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      await AccessControl.sendRecruiterInvite(profileId, {
        email: recruiterEmail.trim(),
        message: message.trim()
      });

      toast.success('Invite sent successfully');
      setRecruiterEmail('');
      setMessage('');
    } catch (error) {
      console.error('Error sending invite:', error);
      toast.error('Failed to send invite');
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

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-6 w-6" />
            Share Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Shareable Link</Label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly />
              <Button onClick={handleCopyLink}>Copy</Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Share this link with recruiters to let them request access to your profile.
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recruiterEmail">Invite Recruiter</Label>
              <Input
                id="recruiterEmail"
                type="email"
                placeholder="Enter recruiter's email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <Button 
              className="w-full"
              onClick={handleSendInvite}
              disabled={loading || !recruiterEmail.trim()}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Send Invite
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}