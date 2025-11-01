/**
 * Cloudinary Upload Utility
 * Uploads QR code images to Cloudinary and returns the public URL
 * 
 * NOTE: For unsigned uploads, the upload preset MUST be set to "Unsigned" mode in Cloudinary dashboard.
 * Go to: Settings > Upload > Upload presets > Edit your preset > Signing Mode = "Unsigned"
 */

interface CloudinaryResponse {
  secure_url: string;
  public_id: string;
  url: string;
  error?: {
    message: string;
  };
  [key: string]: any;
}

/**
 * Upload a base64 image to Cloudinary
 * @param base64Image - Base64 data URL of the image
 * @param fileName - Optional file name
 * @returns Promise<string> - Public URL of uploaded image
 */
export const uploadToCloudinary = async (
  base64Image: string,
  fileName?: string
): Promise<string> => {
  try {
    // Cloudinary configuration
    const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    // Validate configuration
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary credentials not configured. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env file');
    }
    
    console.log('Uploading to Cloudinary:', { 
      cloudName: CLOUDINARY_CLOUD_NAME, 
      preset: CLOUDINARY_UPLOAD_PRESET,
      fileName 
    });
    
    const formData = new FormData();
    formData.append('file', base64Image);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    if (fileName) {
      formData.append('public_id', fileName);
    }
    
    formData.append('folder', 'anand-travels/qr-codes');
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Cloudinary error response:', data);
      const errorMessage = data.error?.message || response.statusText;
      throw new Error(`Cloudinary upload failed: ${errorMessage}`);
    }
    
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Upload QR code to Cloudinary with specific naming
 * @param qrCodeDataUrl - Base64 data URL of QR code
 * @param billNumber - Bill number for file naming
 * @returns Promise<string> - Public URL of uploaded QR code
 */
export const uploadQRCodeToCloudinary = async (
  qrCodeDataUrl: string,
  billNumber: string
): Promise<string> => {
  const fileName = `qr_${billNumber}_${Date.now()}`;
  return await uploadToCloudinary(qrCodeDataUrl, fileName);
};
