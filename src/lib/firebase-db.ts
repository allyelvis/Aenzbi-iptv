import { db } from "./firebase-backend";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  query, 
  where 
} from "firebase/firestore";

// Helper to get all documents from a collection as typed array
export async function getCollectionData<T>(collectionName: string): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const data: T[] = [];
    snapshot.forEach((doc) => {
      data.push({ ...doc.data() } as T);
    });
    return data;
  } catch (error) {
    console.error(`Error fetching collection ${collectionName}:`, error);
    throw error;
  }
}

// Helper to set/update a document in a collection
export async function setDocumentData<T>(collectionName: string, docId: string, data: any): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error(`Error setting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
}

// Helper to delete a document
export async function deleteDocument(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${docId} in ${collectionName}:`, error);
    throw error;
  }
}

// Seed a standard collection if it contains no documents
export async function seedCollectionIfEmpty<T>(collectionName: string, initialData: T[], keyField: keyof T): Promise<void> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log(`[Firebase DB] Seeding collection ${collectionName} with ${initialData.length} records...`);
      for (const item of initialData) {
        const id = String(item[keyField]);
        await setDocumentData(collectionName, id, item);
      }
      console.log(`[Firebase DB] Seeding completed for ${collectionName}.`);
    } else {
      console.log(`[Firebase DB] Collection ${collectionName} already has data (${snapshot.size} records).`);
    }
  } catch (error) {
    console.error(`Error seeding collection ${collectionName}:`, error);
  }
}

// Seed settings specifically as /settings/config
export async function seedSettingsIfEmpty(initialSettings: any): Promise<void> {
  try {
    const docRef = doc(db, "settings", "config");
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) {
      console.log("[Firebase DB] Seeding system settings under /settings/config...");
      await setDoc(docRef, initialSettings);
    } else {
      console.log("[Firebase DB] System settings already exist under /settings/config.");
    }
  } catch (error) {
    console.error("Error seeding system settings:", error);
  }
}

// Seed all folios from key-value dictionary
export async function seedFoliosIfEmpty(initialFolios: { [roomNumber: string]: any[] }): Promise<void> {
  try {
    const colRef = collection(db, "folios");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      console.log("[Firebase DB] Seeding folios collection...");
      for (const [roomNumber, charges] of Object.entries(initialFolios)) {
        for (const charge of charges) {
          const item = {
            ...charge,
            roomNumber // Make sure roomNumber is present
          };
          await setDocumentData("folios", charge.id, item);
        }
      }
      console.log("[Firebase DB] Folios seeding completed.");
    } else {
      console.log(`[Firebase DB] Folios collection already has data (${snapshot.size} records).`);
    }
  } catch (error) {
    console.error("Error seeding folios:", error);
  }
}

// Fetch folio charges for a specific room
export async function getRoomFolio(roomNumber: string): Promise<any[]> {
  try {
    const colRef = collection(db, "folios");
    const q = query(colRef, where("roomNumber", "==", roomNumber));
    const snapshot = await getDocs(q);
    const charges: any[] = [];
    snapshot.forEach((doc) => {
      charges.push(doc.data());
    });
    // Sort charges by date/id for consistent presentation
    return charges.sort((a, b) => a.id.localeCompare(b.id));
  } catch (error) {
    console.error(`Error fetching room folio for room ${roomNumber}:`, error);
    return [];
  }
}
