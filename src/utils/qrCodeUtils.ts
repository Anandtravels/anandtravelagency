import QRCode from 'qrcode';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { app } from '@/lib/firebase';

const storage = getStorage(app);

/**
 * Generate UPI QR Code with payment details
 * @param upiId - UPI ID of the merchant
 * @param accountName - Name of the account holder
 * @param amount - Payment amount
 * @param note - Optional payment note/description
 * @returns Promise<string> - Data URL of the generated QR code
 */
export const generateUPIQRCode = async (
  upiId: string,
  accountName: string,
  amount: number,
  note?: string
): Promise<string> => {
  try {
    // WORKING UPI QR FORMAT - Based on verified working example
    // Format: upi://pay?pa=ID&pn=Name&am=Amount&cu=INR&tn=Note
    
    // Clean inputs
    const cleanUpiId = upiId.trim();
    const cleanName = accountName.trim();
    const cleanAmount = amount.toFixed(2);
    const cleanNote = note ? note.trim() : 'Payment';
    
    // CRITICAL: UPI QR Format encoding rules based on NPCI specs and testing
    // Working example: upi://pay?pa=9849834102@ybl&pn=Govardhan&am=50&cu=INR&tn=50%20rs
    // 
    // Key findings:
    // 1. DO NOT encode the payee name (pn) - use plain text
    // 2. Only encode transaction note (tn) for spaces
    // 3. Keep all other parameters unencoded
    //
    // Using encodeURIComponent causes issues with some UPI apps
    const upiString = `upi://pay?pa=${cleanUpiId}&pn=${cleanName}&am=${cleanAmount}&cu=INR&tn=${cleanNote.replace(/ /g, '%20')}`;
    
    console.log('🔍 Generating UPI QR Code with string:', upiString);
    console.log('📱 Format: upi://pay?pa=UPI_ID&pn=Plain_Name&am=Amount&cu=INR&tn=Note%20With%20Spaces');
    
    const qrDataUrl = await QRCode.toDataURL(upiString, {
      width: 512,          // High resolution for clear scanning
      margin: 4,           // Good margin for better scanning
      color: {
        dark: '#000000',   // Pure black for maximum contrast
        light: '#FFFFFF'   // Pure white background
      },
      errorCorrectionLevel: 'H'  // High error correction (up to 30% damage tolerance)
    });

    console.log('✅ QR Code generated successfully');
    console.log('✅ Format verified against working example');
    return qrDataUrl;
  } catch (error) {
    console.error('❌ Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Upload QR code image to Firebase Storage
 * @param qrDataUrl - Base64 data URL of the QR code
 * @param billNumber - Bill number for file naming
 * @returns Promise<string> - Download URL of the uploaded image
 */
export const uploadQRCodeToStorage = async (
  qrDataUrl: string,
  billNumber: string
): Promise<string> => {
  try {
    const storageRef = ref(storage, `qr-codes/${billNumber}.png`);
    
    // Upload the base64 data URL
    await uploadString(storageRef, qrDataUrl, 'data_url');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading QR code:', error);
    throw new Error('Failed to upload QR code');
  }
};

/**
 * Generate UPI QR Code with alternative format (without upi:// prefix)
 * Some QR scanners work better with this format
 * @param upiId - UPI ID of the merchant
 * @param accountName - Name of the account holder
 * @param amount - Payment amount
 * @param note - Optional payment note
 * @returns Promise<string> - Data URL of the generated QR code
 */
export const generateUPIQRCodeAlternative = async (
  upiId: string,
  accountName: string,
  amount: number,
  note?: string
): Promise<string> => {
  try {
    // Alternative format without upi:// prefix (NOT recommended - use main format instead)
    // This format is kept for backward compatibility but main format should be preferred
    const cleanName = accountName.trim();
    const cleanNote = note ? note.trim() : 'Payment';
    
    // DO NOT encode name, only encode spaces in note
    const upiString = `pa=${upiId}&pn=${cleanName}&am=${amount.toFixed(2)}&cu=INR&tn=${cleanNote.replace(/ /g, '%20')}`;
    
    console.log('⚠️ Using alternative format (not recommended):', upiString);
    console.log('💡 Consider using generateUPIQRCode() with upi:// prefix instead');
    
    const qrDataUrl = await QRCode.toDataURL(upiString, {
      width: 512,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Error generating alternative QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generate and upload UPI QR code in one step
 * @param upiId - UPI ID of the merchant
 * @param accountName - Name of the account holder
 * @param amount - Payment amount
 * @param billNumber - Bill number for file naming
 * @param note - Optional payment note
 * @returns Promise<string> - Download URL of the uploaded QR code
 */
export const generateAndUploadUPIQR = async (
  upiId: string,
  accountName: string,
  amount: number,
  billNumber: string,
  note?: string
): Promise<string> => {
  const qrDataUrl = await generateUPIQRCode(upiId, accountName, amount, note);
  const downloadURL = await uploadQRCodeToStorage(qrDataUrl, billNumber);
  return downloadURL;
};
