/**
 * UPI QR Code Format Testing Utility
 * 
 * This utility helps test different UPI QR code formats to find the one that works best.
 * 
 * Common UPI QR Formats:
 * 
 * 1. Standard NPCI Format (Most Common):
 *    upi://pay?pa=merchant@upi&pn=MerchantName&am=100.00&cu=INR&tn=Payment
 * 
 * 2. Alternative Format (Without upi:// prefix):
 *    pa=merchant@upi&pn=MerchantName&am=100.00&cu=INR&tn=Payment
 * 
 * 3. PhonePe Format:
 *    upi://pay?pa=merchant@upi&pn=MerchantName&mc=0000&tid=txn123&tr=ref123&tn=Payment&am=100.00&cu=INR
 * 
 * 4. Google Pay Format:
 *    upi://pay?pa=merchant@upi&pn=MerchantName&am=100.00&cu=INR&tn=Payment&mode=02
 * 
 * 5. Paytm Format:
 *    upi://pay?pa=merchant@paytm&pn=MerchantName&am=100.00&cu=INR&tn=Payment&mode=04
 */

import QRCode from 'qrcode';

export interface UPIParams {
  pa: string;      // Payee Address (UPI ID)
  pn: string;      // Payee Name
  am: string;      // Amount
  cu?: string;     // Currency (default: INR)
  tn?: string;     // Transaction Note
  mc?: string;     // Merchant Code
  tid?: string;    // Transaction ID
  tr?: string;     // Transaction Reference
  mode?: string;   // Payment Mode
}

/**
 * Format 1: Standard NPCI UPI Deep Link (RECOMMENDED - WORKING FORMAT)
 * Based on: upi://pay?pa=9849834102@ybl&pn=Govardhan&am=50&cu=INR&tn=50%20rs
 * CRITICAL: Name (pn) is NOT encoded, only transaction note (tn) has space encoding
 */
export const generateStandardUPIQR = async (params: UPIParams): Promise<string> => {
  // DO NOT encode name - use plain text
  // Only encode spaces in transaction note
  const encodedNote = params.tn ? params.tn.replace(/ /g, '%20') : '';
  
  const upiString = `upi://pay?pa=${params.pa}&pn=${params.pn}&am=${params.am}&cu=${params.cu || 'INR'}${params.tn ? `&tn=${encodedNote}` : ''}`;
  
  console.log('✅ Standard Format (WORKING):', upiString);
  
  return await QRCode.toDataURL(upiString, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'H'
  });
};

/**
 * Format 2: Alternative Format (No upi:// prefix) - NOT RECOMMENDED
 */
export const generateAlternativeUPIQR = async (params: UPIParams): Promise<string> => {
  // DO NOT encode name, only encode spaces in note
  const encodedNote = params.tn ? params.tn.replace(/ /g, '%20') : '';
  
  const upiString = `pa=${params.pa}&pn=${params.pn}&am=${params.am}&cu=${params.cu || 'INR'}${params.tn ? `&tn=${encodedNote}` : ''}`;
  
  console.log('⚠️ Alternative Format (Not Recommended):', upiString);
  
  return await QRCode.toDataURL(upiString, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'H'
  });
};

/**
 * Format 3: PhonePe Compatible Format
 */
export const generatePhonePeUPIQR = async (params: UPIParams): Promise<string> => {
  // DO NOT encode name, only encode spaces in note
  const encodedNote = (params.tn || 'Payment').replace(/ /g, '%20');
  
  const upiString = `upi://pay?pa=${params.pa}&pn=${params.pn}&am=${params.am}&cu=${params.cu || 'INR'}&tn=${encodedNote}&mc=${params.mc || '0000'}`;
  
  console.log('PhonePe Format:', upiString);
  
  return await QRCode.toDataURL(upiString, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'H'
  });
};

/**
 * Format 4: Google Pay Compatible Format
 */
export const generateGooglePayUPIQR = async (params: UPIParams): Promise<string> => {
  // DO NOT encode name, only encode spaces in note
  const encodedNote = (params.tn || 'Payment').replace(/ /g, '%20');
  
  const upiString = `upi://pay?pa=${params.pa}&pn=${params.pn}&am=${params.am}&cu=${params.cu || 'INR'}&tn=${encodedNote}&mode=02`;
  
  console.log('Google Pay Format:', upiString);
  
  return await QRCode.toDataURL(upiString, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'H'
  });
};

/**
 * Format 5: Universal Format (Works with most apps)
 * This is the recommended format that works across PhonePe, GPay, Paytm, BHIM, etc.
 */
export const generateUniversalUPIQR = async (params: UPIParams): Promise<string> => {
  // Build parameters in the exact order recommended by NPCI
  const queryParams = new URLSearchParams();
  queryParams.append('pa', params.pa);
  queryParams.append('pn', params.pn);
  queryParams.append('am', params.am);
  queryParams.append('cu', params.cu || 'INR');
  if (params.tn) queryParams.append('tn', params.tn);
  
  const upiString = `upi://pay?${queryParams.toString()}`;
  
  console.log('Universal Format:', upiString);
  
  return await QRCode.toDataURL(upiString, {
    width: 512,
    margin: 2,
    errorCorrectionLevel: 'H'
  });
};

/**
 * Test all formats and return an array of QR codes
 * Use this for debugging which format works best
 */
export const generateAllFormats = async (
  upiId: string,
  name: string,
  amount: number,
  note?: string
): Promise<{ format: string; qrCode: string; upiString: string }[]> => {
  const params: UPIParams = {
    pa: upiId,
    pn: name,
    am: amount.toFixed(2),
    cu: 'INR',
    tn: note || 'Payment'
  };
  
  const formats = [
    { name: 'Standard NPCI', generator: generateStandardUPIQR },
    { name: 'Alternative (No Prefix)', generator: generateAlternativeUPIQR },
    { name: 'PhonePe Compatible', generator: generatePhonePeUPIQR },
    { name: 'Google Pay Compatible', generator: generateGooglePayUPIQR },
    { name: 'Universal', generator: generateUniversalUPIQR }
  ];
  
  const results = [];
  
  for (const format of formats) {
    try {
      const qrCode = await format.generator(params);
      const upiString = extractUPIString(params);
      results.push({
        format: format.name,
        qrCode,
        upiString
      });
    } catch (error) {
      console.error(`Error generating ${format.name}:`, error);
    }
  }
  
  return results;
};

function extractUPIString(params: UPIParams): string {
  return `upi://pay?pa=${params.pa}&pn=${params.pn}&am=${params.am}&cu=${params.cu}&tn=${params.tn}`;
}
