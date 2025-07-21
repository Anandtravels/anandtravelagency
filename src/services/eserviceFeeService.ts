import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  onSnapshot,
  query
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EServiceFee } from '@/types/eservice-fees';

export class EServiceFeeService {
  private static readonly COLLECTION_NAME = 'eservice_fees';
  private static readonly SETTINGS_DOC_ID = 'fee_settings';

  // Get all service fees
  static async getAllFees(): Promise<Record<string, string>> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          pan_card: data.pan_card || '₹107 (New) / ₹107 (Reissue)',
          passport: data.passport || '₹1,500 (36 pages) / ₹2,000 (60 pages)',
          aadhaar_pvc: data.aadhaar_pvc || '₹50',
          fd_credit_card: data.fd_credit_card || 'As per bank charges',
          bank_account: data.bank_account || 'As per bank charges'
        };
      } else {
        // Return default fees if document doesn't exist
        return this.getDefaultFees();
      }
    } catch (error) {
      console.error('Error fetching service fees:', error);
      return this.getDefaultFees();
    }
  }

  // Update service fees
  static async updateFees(fees: Record<string, string>, updatedBy: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      await setDoc(docRef, {
        ...fees,
        lastUpdated: serverTimestamp(),
        updatedBy: updatedBy
      }, { merge: true });
    } catch (error) {
      console.error('Error updating service fees:', error);
      throw error;
    }
  }

  // Listen to fee changes
  static subscribeToFees(callback: (fees: Record<string, string>) => void): () => void {
    const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
    
    return onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        callback({
          pan_card: data.pan_card || '₹107 (New) / ₹107 (Reissue)',
          passport: data.passport || '₹1,500 (36 pages) / ₹2,000 (60 pages)',
          aadhaar_pvc: data.aadhaar_pvc || '₹50',
          fd_credit_card: data.fd_credit_card || 'As per bank charges',
          bank_account: data.bank_account || 'As per bank charges'
        });
      } else {
        callback(this.getDefaultFees());
      }
    }, (error) => {
      console.error('Error listening to fee changes:', error);
      callback(this.getDefaultFees());
    });
  }

  // Get default fees
  private static getDefaultFees(): Record<string, string> {
    return {
      pan_card: '₹107 (New) / ₹107 (Reissue)',
      passport: '₹1,500 (36 pages) / ₹2,000 (60 pages)',
      aadhaar_pvc: '₹50',
      fd_credit_card: 'As per bank charges',
      bank_account: 'As per bank charges'
    };
  }

  // Initialize fees document with defaults (one-time setup)
  static async initializeDefaultFees(adminEmail: string): Promise<void> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, this.SETTINGS_DOC_ID);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        await setDoc(docRef, {
          ...this.getDefaultFees(),
          lastUpdated: serverTimestamp(),
          updatedBy: adminEmail,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error initializing default fees:', error);
    }
  }
}
