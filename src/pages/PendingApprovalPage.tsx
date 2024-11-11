import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Loader2 } from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

interface AccessStatus {
  status: 'pending' | 'approved' | 'denied';
  candidateEmail?: string;
  updatedAt?: Date;
}

export default function PendingApprovalPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState<AccessStatus | null>(null);

  useEffect(() => {
    const checkAccessStatus = async () => {
      if (!user?.uid) return;

      try {
        const accessRef = doc(db, 'recruiterApprovals', user.uid);
        const accessDoc = await getDoc(accessRef);

        if (accessDoc.exists()) {
          const data = accessDoc.data();
          setAccessStatus({
            status: data.status,
            candidateEmail: data.candidateEmail,
            updatedAt: data.updatedAt?.toDate()
          });
        } else {
          toast.error('Access request not found');
        }
      } catch (error) {
        console.error('Error checking access status:', error);
        toast.error('Failed to check access status');
      } finally {
        setLoading(false);
      }
    };

    checkAccessStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="container flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Access Request Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge
              variant={
                accessStatus?.status === 'approved'
                  ? 'success'
                  : accessStatus?.status === 'denied'
                  ? 'destructive'
                  : 'secondary'
              }
            >
              {accessStatus?.status || 'Unknown'}
            </Badge>
          </div>

          {accessStatus?.candidateEmail && (
            <div className="text-sm">
              <span className="font-medium">Candidate Email:</span>{' '}
              {accessStatus.candidateEmail}
            </div>
          )}

          {accessStatus?.updatedAt && (
            <div className="text-sm">
              <span className="font-medium">Last Updated:</span>{' '}
              {accessStatus.updatedAt.toLocaleDateString()}
            </div>
          )}

          <div className="pt-4 text-center text-sm text-muted-foreground">
            {accessStatus?.status === 'pending' ? (
              'Your request is being reviewed. You will receive an email once approved.'
            ) : accessStatus?.status === 'approved' ? (
              'Your access has been approved. You can now view the candidate\'s profile.'
            ) : accessStatus?.status === 'denied' ? (
              'Your access request has been denied. Please contact the candidate for more information.'
            ) : (
              'Unable to determine access status.'
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}