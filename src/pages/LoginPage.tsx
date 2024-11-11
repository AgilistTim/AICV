import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState<'candidate' | 'recruiter'>('candidate');
  const [candidateEmail, setCandidateEmail] = useState('');

  const handleAuth = async (action: 'signin' | 'signup') => {
    if (!email || !password) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      if (action === 'signup') {
        if (userType === 'recruiter' && !candidateEmail) {
          toast.error('Please provide the candidate\'s email');
          return;
        }

        await signUp(email, password, {
          userType,
          candidateEmail: userType === 'recruiter' ? candidateEmail : undefined
        });

        if (userType === 'recruiter') {
          toast.success('Registration submitted', {
            description: 'Please wait for the candidate to approve your access'
          });
          navigate('/pending-approval');
        } else {
          toast.success('Account created successfully');
          navigate('/candidate');
        }
      } else {
        await signIn(email, password);
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast.error('Authentication failed', {
        description: error instanceof Error ? error.message : 'Please try again'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => handleAuth('signin')}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign In
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label>Account Type</Label>
                <RadioGroup
                  value={userType}
                  onValueChange={(value) => setUserType(value as 'candidate' | 'recruiter')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="candidate" id="candidate" />
                    <Label htmlFor="candidate">Candidate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="recruiter" id="recruiter" />
                    <Label htmlFor="recruiter">Recruiter</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-email">Your Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              {userType === 'recruiter' && (
                <div className="space-y-2">
                  <Label htmlFor="candidate-email">
                    Candidate's Email
                    <span className="ml-1 text-sm text-muted-foreground">
                      (Required for approval)
                    </span>
                  </Label>
                  <Input
                    id="candidate-email"
                    type="email"
                    value={candidateEmail}
                    onChange={(e) => setCandidateEmail(e.target.value)}
                    placeholder="Enter candidate's email"
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Choose a password"
                  disabled={loading}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => handleAuth('signup')}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Sign Up
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}