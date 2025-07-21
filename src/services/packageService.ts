import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Package, PackageFormData } from '@/types/package';

export class PackageService {
  private static COLLECTION = 'packages';

  static async createPackage(data: PackageFormData, userEmail: string): Promise<string> {
    try {
      const packageData = {
        ...data,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
        created_by: userEmail,
        rating: 0,
        reviews: 0
      };

      const docRef = await addDoc(collection(db, this.COLLECTION), packageData);
      return docRef.id;
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  }

  static async updatePackage(id: string, data: Partial<PackageFormData>, userEmail: string): Promise<void> {
    try {
      const updateData = {
        ...data,
        updated_at: serverTimestamp(),
        updated_by: userEmail
      };

      await updateDoc(doc(db, this.COLLECTION, id), updateData);
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  }

  static async deletePackage(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION, id));
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  }

  static async getAllPackages(): Promise<Package[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        orderBy('created_at', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date()
      })) as Package[];
    } catch (error) {
      console.error('Error fetching packages:', error);
      throw error;
    }
  }

  static async getActivePackages(): Promise<Package[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('status', '==', 'active'),
        orderBy('created_at', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date()
      })) as Package[];
    } catch (error) {
      console.error('Error fetching active packages:', error);
      throw error;
    }
  }

  static async getPackagesByCategory(category: 'domestic' | 'international'): Promise<Package[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('category', '==', category),
        where('status', '==', 'active'),
        orderBy('created_at', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date()
      })) as Package[];
    } catch (error) {
      console.error('Error fetching packages by category:', error);
      throw error;
    }
  }

  static async getFeaturedPackages(): Promise<Package[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION),
        where('featured', '==', true),
        where('status', '==', 'active'),
        orderBy('created_at', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        created_at: doc.data().created_at?.toDate() || new Date(),
        updated_at: doc.data().updated_at?.toDate() || new Date()
      })) as Package[];
    } catch (error) {
      console.error('Error fetching featured packages:', error);
      throw error;
    }
  }

  static subscribeToPackages(callback: (packages: Package[]) => void): () => void {
    const q = query(
      collection(db, this.COLLECTION),
      orderBy('created_at', 'desc')
    );

    return onSnapshot(q, 
      (snapshot) => {
        const packages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: doc.data().created_at?.toDate() || new Date(),
          updated_at: doc.data().updated_at?.toDate() || new Date()
        })) as Package[];
        
        callback(packages);
      },
      (error) => {
        console.error('Error in packages subscription:', error);
        // You could also call an error callback here if needed
      }
    );
  }

  static async getPackageById(id: string): Promise<Package | null> {
    try {
      const packages = await this.getAllPackages();
      return packages.find(pkg => pkg.id === id) || null;
    } catch (error) {
      console.error('Error fetching package by ID:', error);
      throw error;
    }
  }
}
