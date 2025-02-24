import React, { createContext, useContext, useState, useEffect, ReactNode, JSX } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
  UserCredential
} from 'firebase/auth';

// Firebase configuration using Vite environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Store admin credentials in constants
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  isStudent: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  loginStudent: (email: string, password: string) => Promise<UserCredential>;
  loginWithRedirect: () => Promise<void>;
  checkRedirectResult: () => Promise<UserCredential | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isStudent, setIsStudent] = useState<boolean>(false);
  
  // Admin login (traditional email/password check against env variables)
  async function loginAdmin(email: string, password: string): Promise<void> {
    try {
      // Check if credentials match the admin credentials from .env
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Set admin status without using Firebase auth
        setIsAdmin(true);
        setIsStudent(false);
        setCurrentUser(null); // Clear any existing Firebase user
        setLoading(false);
      } else if (email === ADMIN_EMAIL) {
        throw new Error("Incorrect admin password");
      } else {
        throw new Error("Not an admin account");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  }
  
  // Student login (using Firebase auth with email/password)
  async function loginStudent(email: string, password: string): Promise<UserCredential> {
    try {
      // Validate the email domain for students
      if (!email.endsWith('@student.mes.ac.in')) {
        throw new Error("Please use a valid student email (@student.mes.ac.in)");
      }
      
      // Proceed with Firebase authentication for students
      const result = await signInWithEmailAndPassword(auth, email, password);
      setIsAdmin(false); // Ensure they're not marked as admin
      setIsStudent(true);
      return result;
    } catch (error) {
      console.error("Student login error:", error);
      throw error;
    }
  }
  
  // Student login with Google redirect instead of popup
  async function loginWithRedirect(): Promise<void> {
    try {
      // Add a hint to use the student domain
      googleProvider.setCustomParameters({
        'login_hint': '@student.mes.ac.in'
      });
      
      // Use redirect instead of popup
      return signInWithRedirect(auth, googleProvider);
    } catch (error) {
      console.error("Google redirect error:", error);
      throw error;
    }
  }
  
  // Check for redirect result when the page loads
  async function checkRedirectResult(): Promise<UserCredential | null> {
    try {
      const result = await getRedirectResult(auth);
      
      if (result) {
        // Verify student email domain after Google sign-in
        const user = result.user;
        if (!user.email || !user.email.endsWith('@student.mes.ac.in')) {
          // If not a student email, log them out and throw error
          await signOut(auth);
          throw new Error("Please use a valid student email (@student.mes.ac.in)");
        }
        
        setIsAdmin(false);
        setIsStudent(true);
        return result;
      }
      
      return null;
    } catch (error) {
      console.error("Redirect result error:", error);
      throw error;
    }
  }
  
  async function logout(): Promise<void> {
    if (isAdmin) {
      // For admin logout, just reset the state
      setIsAdmin(false);
      return Promise.resolve();
    } else {
      // For Firebase users, use the Firebase signOut method
      setIsAdmin(false);
      setIsStudent(false);
      return signOut(auth);
    }
  }
  
  useEffect(() => {
    // Only listen for Firebase auth state changes for non-admin users
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isAdmin) {  // Don't override admin status if admin is logged in
        setCurrentUser(user);
        
        // Check if the user is a student based on email domain
        if (user && user.email && user.email.endsWith('@student.mes.ac.in')) {
          setIsStudent(true);
        } else {
          setIsStudent(false);
        }
        
        setIsAdmin(false);
      }
      setLoading(false);
    });
    
    // Check for redirect result when the component mounts
    checkRedirectResult().catch(error => {
      console.error("Error checking redirect result:", error);
    });
    
    return unsubscribe;
  }, [isAdmin]);
  
  const value: AuthContextType = {
    currentUser,
    isAdmin,
    isStudent,
    loginAdmin,
    loginStudent,
    loginWithRedirect,
    checkRedirectResult,
    logout,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}