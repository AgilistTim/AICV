import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GraduationCap, Building } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="container flex h-screen items-center justify-center">
      <div className="grid gap-8 md:grid-cols-2">
        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-6 w-6" />
              Candidate
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Create and manage your interactive CV profile. Share it with recruiters and track who views it.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate('/candidate')}
            >
              Enter as Candidate
            </Button>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-6 w-6" />
              Recruiter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              View candidate profiles, analyze fit for roles, and conduct AI-powered assessments.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate('/recruiter')}
            >
              Enter as Recruiter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}