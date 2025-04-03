import { useEffect } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
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
import { useAuth } from '@/lib/auth';

// Define interface for the agent data
 interface AgentData {
  id: string;
  email: string;
  password: string;
  name: string;
  phone: string;
  needsAuthAccount?: boolean;
  [key: string]: any; // Allow for other properties
}

// Store admin credentials in an isolated state that only this component can access
let cachedAdminEmail = 'admin@anandtravels.com';
let processingAuth = false;

const AuthAccountCreator = () => {
  const { user } = useAuth();
  
  useEffect(() => {
    // If admin is logged in, update the cached email
    if (user && user.email === 'admin@anandtravels.com') {
      cachedAdminEmail = user.email;
    }
    
    // Only proceed if not already processing auth operations
    if (processingAuth) return;

    const checkForPendingAgentCreation = async () => {
      try {
        processingAuth = true;
        
        // Query for agents needing accounts
        const agentsRef = collection(db, 'agents');
        const pendingAgentsQuery = query(agentsRef, where('needsAuthAccount', '==', true));
        const pendingAgentsSnapshot = await getDocs(pendingAgentsQuery);
        
        if (pendingAgentsSnapshot.empty) {
          processingAuth = false;
          return;
        }
        
        // Get all agents that need accounts and properly type them
        const pendingAgents: AgentData[] = pendingAgentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as AgentData));
        
        // Process each agent one by one
        for (const agent of pendingAgents) {
          try {
            console.log(`Creating auth account for ${agent.email}...`);
            
            // Create the auth account
            const auth = getAuth();
            const userCredential = await createUserWithEmailAndPassword(
              auth,
              agent.email,
              agent.password
            );
            
            // Update the agent record
            await updateDoc(doc(db, 'agents', agent.id), {
              needsAuthAccount: false,
              password: null,  // Remove password from Firestore
              uid: userCredential.user.uid
            });
            
            console.log(`Auth account created for ${agent.email}`);
            
            // If the admin was logged in before, sign them back in
            if (cachedAdminEmail === 'admin@anandtravels.com') {
              // We know this is the admin - sign them back in
              // In a real app we'd use a more secure approach here
              await signInWithEmailAndPassword(auth, 'admin@anandtravels.com', 'admin@anandtravels.com');
              console.log('Admin signed back in after agent creation');
            }
          } catch (error: any) {
            console.error(`Error creating auth account for ${agent.email}:`, error);
            
            // Mark the agent creation as failed
            await updateDoc(doc(db, 'agents', agent.id), {
              needsAuthAccount: false,
              authAccountError: error.message
            });
          }
        }
        
      } finally {
        processingAuth = false;
      }
    };

    // Check for pending agents every 5 seconds - this prevents rapid auth state changes
    const interval = setInterval(checkForPendingAgentCreation, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [user]);

  return null; // This component doesn't render anything
};

export default AuthAccountCreator;
