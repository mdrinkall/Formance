/**
 * Storage service
 * Handles file uploads and downloads to Supabase Storage
 */

import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

/**
 * Upload a video file
 * @param file - File to upload
 * @param userId - User ID for file organization
 * @returns URL of uploaded file
 */
export const uploadVideo = async (file: any, userId: string): Promise<string> => {
  const fileName = `${userId}/${Date.now()}.mp4`;
  const { data, error } = await supabase.storage
    .from('recordings')
    .upload(fileName, file);

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('recordings')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

/**
 * Upload an image file
 * @param file - File to upload (can be base64 string, blob, or File object)
 * @param userId - User ID for file organization
 * @param bucket - Storage bucket name (default: 'images')
 * @returns URL of uploaded file
 */
export const uploadImage = async (
  file: string | Blob | File,
  userId: string,
  bucket: string = 'images'
): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${userId}/${timestamp}.jpg`;

  let fileToUpload: ArrayBuffer | Blob | File;

  // Handle base64 string (common for mobile image pickers)
  if (typeof file === 'string') {
    // Remove data URL prefix if present
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    fileToUpload = decode(base64Data);
  } else {
    fileToUpload = file;
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, fileToUpload, {
      contentType: 'image/jpeg',
      upsert: false,
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

/**
 * Upload a profile avatar
 * @param file - File to upload (can be base64 string, blob, or File object)
 * @param userId - User ID
 * @returns URL of uploaded avatar
 */
export const uploadAvatar = async (
  file: string | Blob | File,
  userId: string
): Promise<string> => {
  const timestamp = Date.now();
  const fileName = `${userId}/avatar_${timestamp}.jpg`;

  let fileToUpload: ArrayBuffer | Blob | File;

  // Handle base64 string (common for mobile image pickers)
  if (typeof file === 'string') {
    // Remove data URL prefix if present
    const base64Data = file.replace(/^data:image\/\w+;base64,/, '');
    fileToUpload = decode(base64Data);
  } else {
    fileToUpload = file;
  }

  const { data, error } = await supabase.storage
    .from('profiles')
    .upload(fileName, fileToUpload, {
      contentType: 'image/jpeg',
      upsert: true, // Allow overwriting old avatars
    });

  if (error) throw error;

  const { data: publicUrlData } = supabase.storage
    .from('profiles')
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};

/**
 * Get a public URL for a file
 * @param bucket - Storage bucket name
 * @param path - File path
 * @returns Public URL
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Delete a file
 * @param bucket - Storage bucket name
 * @param path - File path
 */
export const deleteFile = async (bucket: string, path: string): Promise<void> => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
};

/**
 * Download a file
 * @param bucket - Storage bucket name
 * @param path - File path
 * @returns File blob
 */
export const downloadFile = async (bucket: string, path: string): Promise<Blob> => {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  return data;
};
