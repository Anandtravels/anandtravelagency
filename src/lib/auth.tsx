import { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword // Add this import
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const ADMIN_EMAIL = "admin@anandtravels.com";
const ADMIN_PASSWORD = "admin@anandtravels.com";

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string, role?: 'admin' | 'agent') => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAdmin: boolean;
  isAgent: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await checkRole(user.email);
      } else {
        setIsAdmin(false);
        setIsAgent(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkRole = async (email: string | null) => {
    if (!email) {
      setIsAdmin(false);
      setIsAgent(false);
      return;
    }

    if (email === ADMIN_EMAIL) {
      setIsAdmin(true);
      setIsAgent(false);
      return;
    }

    // Check if agent exists using query
    const agentsRef = collection(db, 'agents');
    const q = query(agentsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setIsAgent(true);
      setIsAdmin(false);
      return;
    }

    setIsAdmin(false);
    setIsAgent(false);
  };

  const signIn = async (email: string, password: string, role?: 'admin' | 'agent') => {
    try {
      if (role === 'admin' && email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          await checkRole(email);
          return { error: null };
        } catch (signInError: any) {
          if (signInError.code === 'auth/user-not-found') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await checkRole(email);
            return { error: null };
          }
          throw signInError;
        }
      } else if (role === 'agent') {
        console.log('Attempting agent login:', email); // Debug log
        
        // Query agents collection for the email
        const agentsRef = collection(db, 'agents');
        const q = query(agentsRef, where('email', '==', email));
        
        try {
          const querySnapshot = await getDocs(q);
          
          if (querySnapshot.empty) {
            console.log('No agent found with email:', email); // Debug log
            return { error: { message: 'Agent not found' } };
          }

          const agentDoc = querySnapshot.docs[0];
          const agentData = agentDoc.data();
          
          console.log('Agent found:', agentData.email); // Debug log

          if (agentData.password !== password) {
            return { error: { message: 'Invalid password' } };
          }

          // Try to authenticate with Firebase
          try {
            await signInWithEmailAndPassword(auth, email, password);
          } catch (authError: any) {
            if (authError.code === 'auth/user-not-found') {
              await createUserWithEmailAndPassword(auth, email, password);
            } else {
              throw authError;
            }
          }

          setIsAgent(true);
          return { error: null };
        } catch (error: any) {
          console.error('Agent verification error:', error); // Debug log
          return { error: { message: 'Error verifying agent credentials' } };
        }
      }

      return { error: { message: "Invalid credentials" } };
    } catch (error: any) {
      console.error("Sign in error:", error);
      return { error: { message: error.message || 'Authentication failed' } };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signIn,
        signOut,
        isAdmin,
        isAgent,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
