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
  serverTimestamp
} from 'firebase/firestore';
import { openai } from './openai';

interface EmbeddingMetadata {
  type: string;
  userId: string;
  context?: string;
  roleIndex?: number;
  timestamp?: number;
}

export class EmbeddingsStore {
  private static readonly COLLECTION = 'embeddings';

  static async createEmbedding(text: string): Promise<number[]> {
    try {
      console.debug('Creating embedding for text:', { textLength: text.length });
      
      const response = await openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text.replace(/\n/g, ' '),
        dimensions: 1536,
        encoding_format: "float"
      });

      console.debug('Embedding created successfully');
      return response.data[0].embedding;
    } catch (error) {
      console.error('Error creating embedding:', error);
      throw error;
    }
  }

  static async storeEmbedding(
    content: string,
    embedding: number[],
    metadata: EmbeddingMetadata
  ): Promise<void> {
    try {
      console.debug('Storing embedding:', { 
        contentLength: content.length,
        embeddingLength: embedding.length,
        metadata 
      });

      const docRef = doc(collection(db, this.COLLECTION));
      await setDoc(docRef, {
        content,
        embedding,
        metadata: {
          ...metadata,
          timestamp: Date.now()
        },
        createdAt: serverTimestamp()
      });

      console.debug('Embedding stored successfully:', { docId: docRef.id });
    } catch (error) {
      console.error('Error storing embedding:', error);
      throw error;
    }
  }

  static async findSimilarEmbeddings(
    embedding: number[],
    userId: string,
    type?: string,
    minSimilarity = 0.7,
    limit = 5
  ): Promise<Array<{ content: string; similarity: number; metadata: EmbeddingMetadata }>> {
    try {
      console.debug('Finding similar embeddings:', { userId, type });

      const constraints = [where('metadata.userId', '==', userId)];
      if (type) {
        constraints.push(where('metadata.type', '==', type));
      }

      const q = query(collection(db, this.COLLECTION), ...constraints);
      const snapshot = await getDocs(q);

      const results = snapshot.docs
        .map(doc => {
          const data = doc.data();
          const similarity = this.cosineSimilarity(embedding, data.embedding);
          return {
            content: data.content,
            similarity,
            metadata: data.metadata
          };
        })
        .filter(result => result.similarity >= minSimilarity)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      console.debug('Found similar embeddings:', { count: results.length });
      return results;
    } catch (error) {
      console.error('Error finding similar embeddings:', error);
      throw error;
    }
  }

  private static cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}