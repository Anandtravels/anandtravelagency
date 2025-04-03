import { useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  doc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";

// This component doesn't render anything but runs in the background to handle auth account creation
const AuthAccountCreator = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Set up a listener for agents that need auth accounts
    const agentsQuery = query(
      collection(db, 'agents'),
      where('needsAuthAccount', '==', true)
    );

    const unsubscribe = onSnapshot(agentsQuery, 
      async (snapshot) => {
        for (const docSnapshot of snapshot.docs) {
          const agent = docSnapshot.data();
          try {
            // Create auth account
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              agent.email,
              agent.password
            );
            
            // Update the agent doc to remove needsAuthAccount flag and password
            await updateDoc(doc(db, 'agents', docSnapshot.id), {
              needsAuthAccount: false, 
              password: null,  // Remove password from Firestore
              uid: userCredential.user.uid  // Store the auth UID
            });
            
            console.log(`Auth account created for ${agent.email}`);
          } catch (error) {
            console.error(`Error creating auth account for ${agent.email}:`, error);
            // Update flag to indicate failed attempt
            await updateDoc(doc(db, 'agents', docSnapshot.id), {
              needsAuthAccount: false,
              authAccountError: error.message
            });
          }
        }
      },
      (error) => {
        console.error("Error listening for agents needing auth accounts:", error);
      }
    );

    return () => unsubscribe();
  }, [toast]);

  return null; // This component doesn't render anything
};

export default AuthAccountCreator;
