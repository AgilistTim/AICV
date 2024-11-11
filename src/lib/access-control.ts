import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { sendAccessRequestEmail, sendAccessGrantedEmail } from './email-service';
import type { User } from 'firebase/auth';

interface RequestorInfo {
  recruiterName: string;
  recruiterEmail: string;
  recruiterPhone?: string;
  requestDetails: string;
}

export interface AccessRequest {
  recruiterId: string;
  recruiterEmail: string;
  recruiterName: string;
  recruiterPhone?: string;
  requestDetails: string;
  status: 'pending' | 'approved' | 'denied';
  createdAt: Date;
  updatedAt: Date;
}

export class AccessControl {
  private static readonly ACCESS_REQUESTS_COLLECTION = 'recruiterApprovals';

  static async requestAccess(
    candidateId: string,
    recruiter: User,
    requestorInfo: RequestorInfo
  ): Promise<void> {
    try {
      console.debug('Creating access request:', {
        candidateId,
        recruiterId: recruiter.uid,
        recruiterEmail: requestorInfo.recruiterEmail
      });

      // Create access request document
      const requestRef = doc(db, this.ACCESS_REQUESTS_COLLECTION, `${recruiter.uid}_${candidateId}`);
      const request: AccessRequest = {
        recruiterId: recruiter.uid,
        recruiterEmail: requestorInfo.recruiterEmail,
        recruiterName: requestorInfo.recruiterName,
        recruiterPhone: requestorInfo.recruiterPhone,
        requestDetails: requestorInfo.requestDetails,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(requestRef, {
        ...request,
        candidateId,
        timestamp: serverTimestamp()
      });

      // Send email notification
      await sendAccessRequestEmail(
        candidateId,
        requestorInfo.recruiterEmail,
        requestorInfo.recruiterName,
        requestorInfo.requestDetails,
        requestorInfo.recruiterPhone
      );

      console.debug('Access request created and notification sent');
    } catch (error) {
      console.error('Error requesting access:', error);
      throw error;
    }
  }

  static async getAccessStatus(recruiterId: string, candidateId: string): Promise<AccessRequest | null> {
    try {
      console.debug('Getting access status:', { recruiterId, candidateId });
      const requestRef = doc(db, this.ACCESS_REQUESTS_COLLECTION, `${recruiterId}_${candidateId}`);
      const request = await getDoc(requestRef);
      return request.exists() ? (request.data() as AccessRequest) : null;
    } catch (error) {
      console.error('Error getting access status:', error);
      throw error;
    }
  }

  static async updateAccessRequest(
    recruiterId: string,
    candidateId: string,
    status: 'approved' | 'denied'
  ): Promise<void> {
    try {
      console.debug('Updating access request:', { recruiterId, candidateId, status });

      const requestRef = doc(db, this.ACCESS_REQUESTS_COLLECTION, `${recruiterId}_${candidateId}`);
      const request = await getDoc(requestRef);

      if (!request.exists()) {
        throw new Error('Access request not found');
      }

      const requestData = request.data() as AccessRequest;

      await setDoc(requestRef, {
        ...requestData,
        status,
        updatedAt: new Date(),
        timestamp: serverTimestamp()
      }, { merge: true });

      if (status === 'approved') {
        // Send approval notification
        await sendAccessGrantedEmail(
          requestData.recruiterEmail,
          requestData.recruiterName,
          `${window.location.origin}/recruiter/${candidateId}`
        );
      }

      console.debug('Access request updated successfully');
    } catch (error) {
      console.error('Error updating access request:', error);
      throw error;
    }
  }

  static async checkAccess(candidateId: string, recruiterId: string): Promise<boolean> {
    try {
      console.debug('Checking access:', { candidateId, recruiterId });
      const requestRef = doc(db, this.ACCESS_REQUESTS_COLLECTION, `${recruiterId}_${candidateId}`);
      const request = await getDoc(requestRef);
      
      if (!request.exists()) return false;
      
      const data = request.data();
      return data.status === 'approved';
    } catch (error) {
      console.error('Error checking access:', error);
      return false;
    }
  }
}