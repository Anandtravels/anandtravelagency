import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AppCoupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: Date;
  endDate: Date;
  maxUses?: number | null;
  usedCount: number;
  active: boolean;
  usedBy: string[];
  description: string;
  createdAt?: Date;
  appOnly?: boolean; // Flag to indicate this coupon is only for app users
}

/**
 * Initializes default app coupons in the database if they don't exist
 */
export const initializeAppCoupons = async (): Promise<void> => {
  try {
    // Check if APP50 coupon already exists
    const couponsRef = collection(db, 'coupons');
    const app50Query = query(couponsRef, where('code', '==', 'APP50'));
    const existingCoupons = await getDocs(app50Query);

    if (existingCoupons.empty) {
      // Create APP50 coupon
      const app50Coupon: AppCoupon = {
        code: 'APP50',
        type: 'percentage',
        value: 10,
        startDate: new Date(),
        endDate: new Date(new Date().getFullYear() + 1, 11, 31), // Valid for 1 year
        maxUses: null, // Unlimited uses
        usedCount: 0,
        active: true,
        usedBy: [],
        description: 'Exclusive 10% discount for mobile app users',
        appOnly: true
      };

      await addDoc(couponsRef, {
        ...app50Coupon,
        createdAt: serverTimestamp()
      });

      console.log('APP50 coupon created successfully');
    }
  } catch (error) {
    console.error('Error initializing app coupons:', error);
  }
};

/**
 * Validates if a coupon is app-only and should only be used through the mobile app
 */
export const validateAppOnlyCoupon = async (couponCode: string): Promise<boolean> => {
  try {
    const couponsRef = collection(db, 'coupons');
    const couponQuery = query(couponsRef, where('code', '==', couponCode.toUpperCase()));
    const snapshot = await getDocs(couponQuery);

    if (!snapshot.empty) {
      const couponData = snapshot.docs[0].data();
      return couponData.appOnly === true;
    }

    return false;
  } catch (error) {
    console.error('Error validating app-only coupon:', error);
    return false;
  }
};
