import { createContext, useContext, useEffect, useState } from "react";
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  createUserWithEmailAndPassword // Add this import
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

const ADMIN_EMAIL = "admin@anandtravels.com";
const ADMIN_PASSWORD = "admin@anandtravels.com";

type AuthContextType = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  isAdmin: boolean;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await checkIfAdmin(user.email);
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkIfAdmin = async (email: string | null) => {
    if (!email || email !== ADMIN_EMAIL) {
      setIsAdmin(false);
      return false;
    }
    setIsAdmin(true);
    return true;
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Check if it's the admin credentials
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        try {
          // Try to sign in first
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          await checkIfAdmin(email);
          return { data: userCredential, error: null };
        } catch (signInError: any) {
          // If sign in fails, it might be first time - try to create account
          if (signInError.code === 'auth/user-not-found') {
            console.log('First time admin login, creating account...');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await checkIfAdmin(email);
            return { data: userCredential, error: null };
          }
          throw signInError;
        }
      }

      // Not admin credentials
      return { data: null, error: { message: "Invalid credentials" } };
    } catch (error: any) {
      console.error("Sign in/up error:", error);
      return { data: null, error };
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
