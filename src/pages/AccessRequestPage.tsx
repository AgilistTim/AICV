import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Building } from 'lucide-react';
import { AccessControl } from '@/lib/access-control';
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';

export default function AccessRequestPage() {
  const { candidateId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  // Required fields
  const [recruiterName, setRecruiterName] = useState('');
  const [recruiterEmail, setRecruiterEmail] = useState('');
  const [requestDetails, setRequestDetails] = useState('');
  
  // Optional field
  const [recruiterPhone, setRecruiterPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !candidateId) return;

    // Validate required fields
    if (!recruiterName.trim() || !recruiterEmail.trim() || !requestDetails.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      toast.info('Sending access request...', {
        description: 'The candidate will be notified by email.'
      });

      // Create access request
      await AccessControl.requestAccess(
        candidateId,
        user,
        {
          recruiterName: recruiterName.trim(),
          recruiterEmail: recruiterEmail.trim(),
          recruiterPhone: recruiterPhone.trim(),
          requestDetails: requestDetails.trim()
        }
      );
      
      toast.success('Access request sent', {
        description: "You'll be notified when the candidate approves your request."
      });
      
      navigate('/pending-approval');
    } catch (error) {
      console.error('Error requesting access:', error);
      toast.error('Failed to send request', {
        description: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-6 w-6" />
            Request Profile Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recruiterName" className="after:ml-0.5 after:text-red-500 after:content-['*']">
                Your Name
              </Label>
              <Input
                id="recruiterName"
                value={recruiterName}
                onChange={(e) => setRecruiterName(e.target.value)}
                required
                placeholder="Enter your full name"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recruiterEmail" className="after:ml-0.5 after:text-red-500 after:content-['*']">
                Your Email
              </Label>
              <Input
                id="recruiterEmail"
                type="email"
                value={recruiterEmail}
                onChange={(e) => setRecruiterEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recruiterPhone">
                Phone Number <span className="text-sm text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="recruiterPhone"
                type="tel"
                value={recruiterPhone}
                onChange={(e) => setRecruiterPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestDetails" className="after:ml-0.5 after:text-red-500 after:content-['*']">
                Message to Candidate
              </Label>
              <Textarea
                id="requestDetails"
                value={requestDetails}
                onChange={(e) => setRequestDetails(e.target.value)}
                required
                placeholder="Please explain why you'd like to view this profile and any relevant details about the role..."
                className="min-h-[150px] focus:ring-2 focus:ring-primary"
              />
              <p className="text-sm text-muted-foreground">
                This message will be sent to the candidate for review.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !recruiterName || !recruiterEmail || !requestDetails}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Request...
                </>
              ) : (
                'Request Access'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}