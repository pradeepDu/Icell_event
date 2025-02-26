import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
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

googleProvider.setCustomParameters({ 
  prompt: 'select_account',
  // Restrict to @student.mes.ac.in domain
  hd: 'student.mes.ac.in'
});

interface AdminUser {
  email: string;
  role: 'admin';
}

type AuthUser = User | AdminUser | null;

interface AuthContextType {
  currentUser: AuthUser;
  isAdmin: boolean;
  isStudent: boolean;
  loading: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  loginStudent: (email: string, password: string) => Promise<UserCredential>;
  loginWithGoogle: () => Promise<UserCredential>;
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<AuthUser>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isStudent, setIsStudent] = useState<boolean>(false);
  
  // Fix: Added proper error handling function
  
  async function loginAdmin(email: string, password: string): Promise<void> {
    try {
      console.log("Attempting admin login with:", email);
      
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        // Create a simple admin user object
        const adminUser: AdminUser = {
          email: email,
          role: 'admin'
        };
        
        console.log("Admin login successful");
        setCurrentUser(adminUser);
        setIsAdmin(true);
        setIsStudent(false);
      } else {
        console.log("Invalid admin credentials");
        throw new Error("Invalid admin credentials");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  }
  
  async function loginStudent(email: string, password: string): Promise<UserCredential> {
    if (!email.endsWith('@student.mes.ac.in')) {
      throw new Error("Invalid student email domain");
    }
    const result = await signInWithEmailAndPassword(auth, email, password);
    setIsAdmin(false);
    setIsStudent(true);
    return result;
  }
  
  async function loginWithGoogle(): Promise<UserCredential> {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Popup auth result:", result);
      
      if (result.user.email?.endsWith('@student.mes.ac.in')) {
        setCurrentUser(result.user);
        setIsStudent(true);
        setIsAdmin(false);
        return result;
      } else {
        await signOut(auth);
        throw new Error("Only @student.mes.ac.in emails are allowed");
      }
    } catch (error) {
      console.error("Popup auth error:", error);
      throw error;
    }
  }
  
  async function logout(): Promise<void> {
    setCurrentUser(null);
    setIsAdmin(false);
    setIsStudent(false);
    return signOut(auth);
  }
  
  useEffect(() => {
    // First, set up the auth state listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      //console.log("Auth state changed, user:", user);
      
      if (user) {
        // Check if the user is a student based on email
        const isStudentEmail = user.email?.endsWith('@student.mes.ac.in') || false;
        
        // Only update if the user is not already set as admin
        if (!isAdmin) {
          setCurrentUser(user);
          setIsStudent(isStudentEmail);
        }
      } else if (!isAdmin) {
        // Only reset if not admin
        setCurrentUser(null);
        setIsStudent(false);
      }
      
      setLoading(false);
    });
    
    return unsubscribe;
  }, [isAdmin]); // Keep the dependency on isAdmin
  
  const contextValue: AuthContextType = {
    currentUser,
    isAdmin,
    isStudent,
    loading,
    loginAdmin,
    loginStudent,
    loginWithGoogle,
    logout
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
}