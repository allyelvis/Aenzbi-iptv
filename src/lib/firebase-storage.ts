import { storage } from "./firebase-backend";
import { ref, uploadString, getDownloadURL, uploadBytes } from "firebase/storage";

/**
 * Upload string content (such as M3U playlists, system backups, JSON configurations) to Firebase Storage
 * and return the public access/download URL.
 */
export async function uploadTextToStorage(filePath: string, content: string, contentType: string = "text/plain"): Promise<string> {
  try {
    const fileRef = ref(storage, filePath);
    await uploadString(fileRef, content, "raw", { contentType });
    const downloadUrl = await getDownloadURL(fileRef);
    console.log(`[Firebase Storage] String uploaded to path "${filePath}" successfully. URL: ${downloadUrl}`);
    return downloadUrl;
  } catch (error) {
    console.error(`[Firebase Storage] Error uploading text/string to "${filePath}":`, error);
    throw error;
  }
}

/**
 * Upload binary buffers (e.g. software package builds, images) to Firebase Storage
 * and return the public access/download URL.
 */
export async function uploadBufferToStorage(filePath: string, buffer: Buffer | Uint8Array, contentType: string): Promise<string> {
  try {
    const fileRef = ref(storage, filePath);
    // Node Buffer is a subclass of Uint8Array, which uploadBytes fully supports.
    const snapshot = await uploadBytes(fileRef, buffer, { contentType });
    const downloadUrl = await getDownloadURL(snapshot.ref);
    console.log(`[Firebase Storage] Binary uploaded to path "${filePath}" successfully. URL: ${downloadUrl}`);
    return downloadUrl;
  } catch (error) {
    console.error(`[Firebase Storage] Error uploading binary buffer to "${filePath}":`, error);
    throw error;
  }
}
