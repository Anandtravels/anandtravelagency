import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword
} from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";

const ADMIN_EMAIL = "admin@anandtravels.com";
const ADMIN_PASSWORD = "admin@anandtravels.com";

// Create a custom user type that extends Firebase User
interface ExtendedUser extends FirebaseUser {
  role?: 'admin' | 'agent' | 'customer';
  agentId?: string;
  agentInfo?: any;
}

type AuthContextType = {
  user: ExtendedUser | null;
  signIn: (email: string, password: string, role?: 'admin' | 'agent') => Promise<{ user?: ExtendedUser, error?: any }>;
  signOut: () => Promise<{ error: any }>;
  isAdmin: boolean;
  isAgent: boolean;
  loading: boolean;
  userRole: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Create an extended user object
        const extendedUser = firebaseUser as ExtendedUser;
        await checkRole(extendedUser.email);
        setUser(extendedUser);
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const checkRole = async (email: string | null) => {
    if (!email) {
      setUserRole(null);
      return;
    }

    if (email === ADMIN_EMAIL) {
      setUserRole('admin');
      return;
    }

    const agentsRef = collection(db, 'agents');
    const q = query(agentsRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      setUserRole('agent');
      return;
    }

    setUserRole('customer');
  };

  const signIn = async (email: string, password: string, role: string = 'customer') => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Create extended user
      const extendedUser = firebaseUser as ExtendedUser;

      if (role === 'admin' && email !== ADMIN_EMAIL) {
        await auth.signOut();
        return { error: { message: 'Unauthorized access' } };
      }

      if (role === 'agent') {
        const agentsRef = collection(db, 'agents');
        const q = query(agentsRef, where('email', '==', email.toLowerCase()));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await auth.signOut();
          return { error: { message: 'Invalid agent credentials' } };
        }

        const agentData = querySnapshot.docs[0].data();
        extendedUser.role = 'agent';
        extendedUser.agentId = querySnapshot.docs[0].id;
        extendedUser.agentInfo = agentData;
        
        setUserRole('agent');
        setUser(extendedUser);
      } else if (role === 'admin') {
        extendedUser.role = 'admin';
        setUserRole('admin');
        setUser(extendedUser);
      } else {
        extendedUser.role = 'customer';
        setUserRole('customer');
        setUser(extendedUser);
      }

      return { user: extendedUser };
    } catch (error) {
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

  const isAdmin = useMemo(() => {
    return user?.email === ADMIN_EMAIL;
  }, [user]);

  const isAgent = useMemo(() => {
    return userRole === 'agent';
  }, [userRole]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAdmin,
        isAgent,
        userRole
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
