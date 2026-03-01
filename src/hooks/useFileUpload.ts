import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface UploadState {
  uploading: boolean;
  progress: number;
  error: string | null;
  downloadURL: string | null;
}

interface UseFileUploadOptions {
  folder?: string;
  allowedTypes?: string[];
  maxSizeMB?: number;
}

const DEFAULT_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const DEFAULT_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    folder = 'uploads',
    allowedTypes = DEFAULT_IMAGE_TYPES,
    maxSizeMB = 10
  } = options;

  const [state, setState] = useState<UploadState>({
    uploading: false,
    progress: 0,
    error: null,
    downloadURL: null
  });

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `Invalid file type. Allowed types: ${allowedTypes.map(t => t.split('/')[1]).join(', ')}`;
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File too large. Maximum size: ${maxSizeMB}MB`;
    }

    return null;
  }, [allowedTypes, maxSizeMB]);

  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setState(prev => ({ ...prev, error: validationError }));
      return null;
    }

    setState({
      uploading: true,
      progress: 0,
      error: null,
      downloadURL: null
    });

    try {
      // Create unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);

      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setState(prev => ({ ...prev, progress }));
          },
          (error) => {
            console.error('Upload error:', error);
            setState(prev => ({
              ...prev,
              uploading: false,
              error: error.message || 'Upload failed'
            }));
            reject(error);
          },
          async () => {
            // Upload complete, get download URL
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              setState({
                uploading: false,
                progress: 100,
                error: null,
                downloadURL
              });
              resolve(downloadURL);
            } catch (err: any) {
              setState(prev => ({
                ...prev,
                uploading: false,
                error: err.message || 'Failed to get download URL'
              }));
              reject(err);
            }
          }
        );
      });
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        uploading: false,
        error: err.message || 'Upload failed'
      }));
      return null;
    }
  }, [folder, validateFile]);

  const resetState = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      error: null,
      downloadURL: null
    });
  }, []);

  return {
    ...state,
    uploadFile,
    resetState,
    validateFile
  };
};

// Pre-configured hooks for specific use cases
export const useImageUpload = (folder: string = 'images') => {
  return useFileUpload({
    folder,
    allowedTypes: DEFAULT_IMAGE_TYPES,
    maxSizeMB: 5
  });
};

export const useDocumentUpload = (folder: string = 'documents') => {
  return useFileUpload({
    folder,
    allowedTypes: DEFAULT_DOCUMENT_TYPES,
    maxSizeMB: 10
  });
};
