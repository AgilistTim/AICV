import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  DocumentData
} from 'firebase/firestore';
import { CVAnalyzer } from './cv-analyzer';
import { EmbeddingsStore } from './embeddings-store';
import { parseDocument } from './document-parser';
import type { CVData } from '@/types';

export class DocumentStorage {
  private static readonly USERS_COLLECTION = 'users';
  private static readonly DOCUMENTS_COLLECTION = 'documents';

  static async initializeUserDocument(userId: string) {
    try {
      console.debug('Initializing user document:', { userId });
      const userDocRef = doc(db, this.USERS_COLLECTION, userId);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.debug('Creating new user document');
        await setDoc(userDocRef, {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.debug('User document created successfully');
      }
    } catch (error) {
      console.error('Error initializing user document:', error);
      throw error;
    }
  }

  static async storeDocument(file: File, userId: string): Promise<CVData> {
    try {
      console.debug('Processing document:', { fileName: file.name, userId });

      // Extract text from document
      const text = await parseDocument(file);
      console.debug('Document text extracted:', { textLength: text.length });

      // Analyze CV content
      const cvData = await CVAnalyzer.analyze(text);
      console.debug('CV analysis complete');

      // Create and store embeddings
      const embedding = await EmbeddingsStore.createEmbedding(text);
      await EmbeddingsStore.storeEmbedding(text, embedding, {
        type: 'cv_document',
        userId,
        timestamp: Date.now()
      });
      console.debug('CV embeddings stored');

      // Store CV data
      const docRef = doc(collection(db, this.USERS_COLLECTION, userId, this.DOCUMENTS_COLLECTION));
      await setDoc(docRef, {
        fileName: file.name,
        fileType: file.type,
        cvData,
        createdAt: serverTimestamp()
      });
      console.debug('CV data stored successfully');

      return cvData;
    } catch (error) {
      console.error('Error storing document:', error);
      throw error;
    }
  }

  static async getUserDocuments(userId: string): Promise<DocumentData[]> {
    try {
      console.debug('Fetching user documents:', { userId });
      const docsQuery = query(
        collection(db, this.USERS_COLLECTION, userId, this.DOCUMENTS_COLLECTION),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(docsQuery);
      console.debug('Documents fetched:', { count: snapshot.size });
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw error;
    }
  }

  static async updateDocument(cvData: CVData, userId: string): Promise<void> {
    try {
      console.debug('Updating user document:', { userId });
      const docRef = doc(collection(db, this.USERS_COLLECTION, userId, this.DOCUMENTS_COLLECTION));
      await setDoc(docRef, {
        cvData,
        updatedAt: serverTimestamp()
      }, { merge: true });
      console.debug('Document updated successfully');
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  }
}