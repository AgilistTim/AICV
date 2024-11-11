import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Add test recruiter credentials
const TEST_RECRUITER = {
  email: 'test@test.com',
  password: 'password',
  approved: true
};

export class AuthService {
  static async signIn(email: string, password: string) {
    try {
      console.debug('Signing in user:', { email });
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if this is our test recruiter
      if (email === TEST_RECRUITER.email) {
        const userRef = doc(db, 'users', userCredential.user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          // Set up test recruiter profile
          await setDoc(userRef, {
            email: TEST_RECRUITER.email,
            role: 'recruiter',
            approved: TEST_RECRUITER.approved,
            createdAt: new Date()
          });
        }
      }

      console.debug('Sign in successful:', { userId: userCredential.user.uid });
      return { user: userCredential.user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Invalid email or password' 
      };
    }
  }

  static async signUp(email: string, password: string) {
    try {
      console.debug('Creating new user:', { email });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.debug('Sign up successful:', { userId: userCredential.user.uid });
      return { user: userCredential.user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        user: null, 
        error: error instanceof Error ? error.message : 'Failed to create account' 
      };
    }
  }

  static async signOut() {
    try {
      console.debug('Signing out user');
      await firebaseSignOut(auth);
      console.debug('Sign out successful');
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { 
        error: error instanceof Error ? error.message : 'Failed to sign out' 
      };
    }
  }

  static subscribeToAuthChanges(callback: (user: User | null) => void) {
    console.debug('Setting up auth state change subscription');
    return onAuthStateChanged(auth, (user) => {
      console.debug('Auth state changed:', { userId: user?.uid });
      callback(user);
    });
  }
}