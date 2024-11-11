import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DocumentStorage } from '@/lib/document-storage';
import { toast } from 'sonner';
import type { CVData } from '@/types';

interface CVContextType {
  cvData: CVData | null;
  setCVData: (data: CVData | null) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
  saveProfile: (data: CVData) => Promise<void>;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

export function CVProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cvData, setCVData] = useState<CVData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const loadUserProfile = async () => {
      if (!user?.uid) {
        setCVData(null);
        return;
      }

      try {
        console.debug('Loading user profile:', { userId: user.uid });
        const userDocs = await DocumentStorage.getUserDocuments(user.uid);
        
        if (userDocs.length > 0) {
          const mostRecent = userDocs[0];
          if (mostRecent.cvData) {
            console.debug('Found existing CV data');
            setCVData(mostRecent.cvData);
            toast.success('Profile loaded successfully');
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile');
      }
    };

    loadUserProfile();
  }, [user]);

  const saveProfile = async (data: CVData) => {
    if (!user?.uid) {
      toast.error('You must be logged in to save your profile');
      return;
    }

    try {
      console.debug('Saving profile:', { userId: user.uid });
      await DocumentStorage.updateDocument(data, user.uid);
      setCVData(data);
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
      throw error;
    }
  };

  return (
    <CVContext.Provider 
      value={{ 
        cvData, 
        setCVData, 
        isAnalyzing, 
        setIsAnalyzing,
        saveProfile 
      }}
    >
      {children}
    </CVContext.Provider>
  );
}

export function useCV() {
  const context = useContext(CVContext);
  if (context === undefined) {
    throw new Error('useCV must be used within a CVProvider');
  }
  return context;
}