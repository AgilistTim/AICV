import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCV } from '@/context/CVContext';
import CVUpload from '@/components/candidate/CVUpload';
import ProfileBuilder from '@/components/candidate/ProfileBuilder';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { DocumentStorage } from '@/lib/document-storage';
import { toast } from 'sonner';

export default function CandidatePage() {
  const { user } = useAuth();
  const { isAnalyzing, setCVData } = useCV();

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.id) return;

      try {
        // Load user's most recent CV data
        const userDocs = DocumentStorage.getUserDocuments(user.id);
        if (userDocs.length > 0) {
          const mostRecent = userDocs[0];
          setCVData(mostRecent.analysis);
          toast.info('Loaded your existing profile');
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load your profile');
      }
    };

    loadUserProfile();
  }, [user, setCVData]);

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Build Your Professional Profile</h1>
      
      {isAnalyzing ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-lg text-muted-foreground">
              Analyzing your CV with AI...
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <CVUpload />
          <ProfileBuilder />
        </>
      )}
    </div>
  );
}