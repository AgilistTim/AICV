import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';

const sendAccessRequestEmailFunction = httpsCallable(functions, 'sendAccessRequestEmail');
const sendAccessGrantedEmailFunction = httpsCallable(functions, 'sendAccessGrantedEmail');

export async function sendAccessRequestEmail(
  candidateId: string,
  recruiterEmail: string,
  recruiterName: string,
  requestDetails: string,
  recruiterPhone?: string
) {
  try {
    console.debug('Sending access request email:', {
      candidateId,
      recruiterEmail,
      recruiterName
    });

    const result = await sendAccessRequestEmailFunction({
      candidateId,
      recruiterEmail,
      recruiterName,
      recruiterPhone,
      requestDetails
    });

    console.debug('Access request email sent successfully', result);
    toast.success('Access request sent to candidate');
    return true;
  } catch (error) {
    console.error('Error sending access request email:', error);
    toast.error('Failed to send access request email');
    throw error;
  }
}

export async function sendAccessGrantedEmail(
  recruiterEmail: string,
  candidateName: string,
  profileUrl: string
) {
  try {
    console.debug('Sending access granted email:', {
      recruiterEmail,
      candidateName
    });

    const result = await sendAccessGrantedEmailFunction({
      recruiterEmail,
      candidateName,
      profileUrl
    });

    console.debug('Access granted email sent successfully', result);
    toast.success('Access granted notification sent');
    return true;
  } catch (error) {
    console.error('Error sending access granted email:', error);
    toast.error('Failed to send access granted email');
    throw error;
  }
}