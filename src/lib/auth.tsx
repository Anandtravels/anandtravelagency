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

    // Check if user is an agent
    const agentsRef = collection(db, 'agents');
    const q = query(agentsRef, where('email', '==', email));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
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
        // First check if agent exists in Firestore
        const agentsRef = collection(db, 'agents');
        const q = query(agentsRef, where('email', '==', email));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          return { error: { message: 'Agent not found' } };
        }

        const agent = snapshot.docs[0].data();
        if (agent.password !== password) {
          return { error: { message: 'Invalid password' } };
        }

        try {
          // Try to sign in
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          await checkRole(email);
          return { error: null };
        } catch (signInError: any) {
          // If agent doesn't exist in Firebase Auth, create them
          if (signInError.code === 'auth/user-not-found') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await checkRole(email);
            return { error: null };
          }
          throw signInError;
        }
      }

      return { error: { message: "Invalid credentials" } };
    } catch (error: any) {
      console.error("Sign in/up error:", error);
      return { error };
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
