import { Injectable, inject } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';

@Injectable({
  providedIn: 'root',
})
export class ImageService {
  private storage = inject(Storage);

  /**
   * Upload an image file to Firebase Storage
   * @param file - The image file to upload
   * @param path - The storage path (e.g., 'items/userId/listId/itemId')
   * @returns Promise with the download URL
   */
  async uploadImage(file: File, path: string): Promise<string> {
    try {
      console.log('Starting image upload to:', path);
      console.log('Storage instance:', this.storage);
      
      const storageRef = ref(this.storage, path);
      console.log('Storage ref created for path:', path);
      
      // Upload with metadata
      const result = await uploadBytes(storageRef, file, {
        contentType: file.type,
        cacheControl: 'public, max-age=3600'
      });
      console.log('File uploaded successfully:', result);
      
      console.log('Getting download URL...');
      const downloadUrl = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', downloadUrl);
      
      return downloadUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Delete an image from Firebase Storage
   * @param path - The storage path
   */
  async deleteImage(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw, just log the error
    }
  }

  /**
   * Convert File to base64 string (for preview)
   * @param file - The file to convert
   * @returns Promise with base64 string
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Extract storage path from download URL
   * @param downloadUrl - The Firebase download URL
   * @returns Storage path
   */
  extractPathFromUrl(downloadUrl: string): string {
    try {
      const url = new URL(downloadUrl);
      const decodedPath = decodeURIComponent(url.pathname);
      const pathParts = decodedPath.split('/o/');
      return pathParts[1] || '';
    } catch {
      return '';
    }
  }
}

