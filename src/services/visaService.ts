import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { sendPushNotification } from '@/utils/sendPushNotification';
import { whatsappService } from '@/services/whatsappService';

export interface VisaFormData {
  visaType?: string;
  name?: string;
  contactNumber?: string;
  email?: string;
  travelDate?: string;
  countryName?: string;
}

/** Build WhatsApp message for a new visa application */
function buildVisaApplicationMessage(data: VisaFormData, applicationId: string): string {
  const name = data.name || 'Customer';
  const appId = applicationId.slice(-6).toUpperCase();
  const visaType = data.visaType || 'N/A';
  const country = data.countryName || 'N/A';
  const travelDate = data.travelDate || 'N/A';
  const email = data.email || 'N/A';

  return `Dear *${name}*,

✅ *Visa Application Received!*

Thank you for submitting your visa application with Anand Travel Agency.

📋 *Application Details:*
• Application ID: #${appId}
• Visa Type: ${visaType}
• Destination: ${country}
• Travel Date: ${travelDate}
• Email: ${email}

Our visa expert team will review your application and contact you within 24 hours with the next steps.

📞 For urgent queries, contact us anytime.

Thank you for choosing *Anand Travel Agency!*`;
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

    // Send push notification to admin
    sendPushNotification('new_visa_application', {
      name: data.name || 'Applicant',
      country: data.countryName || 'Visa',
      applicationId: docRef.id
    });

    // Send WhatsApp confirmation to applicant (fire-and-forget, non-blocking)
    if (data.contactNumber) {
      const message = buildVisaApplicationMessage(data, docRef.id);
      whatsappService.sendMessage(
        data.contactNumber,
        message,
        data.name,
        docRef.id,
        'visa'
      ).then(() => {
        console.log('[Visa WhatsApp] Confirmation sent for application', docRef.id);
      }).catch((err) => {
        console.warn('[Visa WhatsApp] Failed to send confirmation:', err);
      });
    }

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
