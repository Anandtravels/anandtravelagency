import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const debugAuth = async (email: string, password: string) => {
  try {
    console.log("Attempting login with:", email);
    
    // Step 1: Check if user exists in Firebase Auth
    const auth = getAuth();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Firebase Auth login successful:", userCredential.user.uid);
    } catch (error: any) {
      console.error("Firebase Auth login failed:", error.message);
      return { success: false, message: `Auth failed: ${error.message}` };
    }
    
    // Step 2: Check if user exists in agents collection
    const agentsRef = collection(db, 'agents');
    const q = query(agentsRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.error("User not found in agents collection");
      return { success: false, message: "User not found in agents collection" };
    }
    
    console.log("Agent found in database:", querySnapshot.docs[0].data());
    return { success: true, message: "Login successful!" };
  } catch (error: any) {
    console.error("Debug authentication failed:", error);
    return { success: false, message: `Debug failed: ${error.message}` };
  }
};
