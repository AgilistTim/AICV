import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Shield } from 'lucide-react';
import { AccessControl, type AccessRequest } from '@/lib/access-control';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ManageAccessPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadAccessRequests();
  }, [user]);

  const loadAccessRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      // TODO: Implement loading access requests from Firebase
      // This will be added when we implement the Firebase functions
    } catch (error) {
      console.error('Error loading access requests:', error);
      toast.error('Failed to load access requests');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRequest = async (
    requestId: string,
    status: 'approved' | 'denied'
  ) => {
    if (!user) return;

    try {
      setProcessing(requestId);
      await AccessControl.updateAccessRequest(requestId, status, user.uid);
      
      toast.success(
        status === 'approved' 
          ? 'Access request approved' 
          : 'Access request denied'
      );
      
      await loadAccessRequests();
    } catch (error) {
      console.error('Error updating access request:', error);
      toast.error('Failed to update access request');
    } finally {
      setProcessing(null);
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
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Manage Access Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              No access requests to display
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recruiter</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.recruiterId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.recruiterName}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.recruiterEmail}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{request.companyName}</TableCell>
                    <TableCell>
                      {format(request.createdAt, 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === 'approved'
                            ? 'success'
                            : request.status === 'denied'
                            ? 'destructive'
                            : 'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleUpdateRequest(
                              request.recruiterId,
                              'approved'
                            )}
                            disabled={!!processing}
                          >
                            {processing === request.recruiterId ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Approve'
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleUpdateRequest(
                              request.recruiterId,
                              'denied'
                            )}
                            disabled={!!processing}
                          >
                            Deny
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}