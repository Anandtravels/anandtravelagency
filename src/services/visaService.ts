import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface VisaFormData {
  visaType?: string;
  name?: string;
  contactNumber?: string;
  email?: string;
  travelDate?: string;
  countryName?: string;
}

export const submitVisaApplication = async (data: VisaFormData) => {
  try {
    // Validate travel date is not in the past
    const travelDate = new Date(data.travelDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (travelDate < today) {
      throw new Error('Travel date cannot be in the past');
    }

    // Submit to Firebase
    const docRef = await addDoc(collection(db, 'visa-services'), {
      ...data,
      submittedAt: serverTimestamp(),
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return {
      success: true,
      id: docRef.id,
      message: 'Visa application submitted successfully!'
    };

  } catch (error: any) {
    console.error('Error submitting visa application:', error);
    return {
      success: false,
      error: error.message || 'Failed to submit application'
    };
  }
};

export const getVisaApplications = async () => {
  // This would be used in admin panel to view applications
  try {
    // Implementation would go here for admin functionality
    return { success: true, applications: [] };
  } catch (error) {
    console.error('Error fetching visa applications:', error);
    return { success: false, error: 'Failed to fetch applications' };
  }
};
