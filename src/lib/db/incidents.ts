import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { Incident } from '../schema';

// Get all incidents
export const getIncidents = async (hotelId?: string) => {
  try {
    let q = collection(db, 'incidents');
    if (hotelId) {
      q = query(q, where('hotelId', '==', hotelId));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Incident[];
  } catch (error) {
    console.error('Error getting incidents:', error);
    throw error;
  }
};

// Upload a file to storage and get its URL
async function uploadFile(file: File, path: string): Promise<string> {
  try {
    // Create a unique filename using timestamp and original name
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, `${path}/${filename}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Create new incident
export const createIncident = async (data: any) => {
  try {
    // Extract file fields and preview data
    const { photo, photoPreview, document, documentName, ...incidentData } = data;
    
    // Create the incident payload
    const incidentPayload: any = {
      ...incidentData,
      concludedById: incidentData.concludedById || null,
      resolutionDescription: incidentData.resolutionDescription || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Upload photo if present
    if (photo instanceof File) {
      const photoUrl = await uploadFile(photo, 'incidents/photos');
      incidentPayload.photoUrl = photoUrl;
    }

    // Upload document if present
    if (document instanceof File) {
      const documentUrl = await uploadFile(document, 'incidents/documents');
      incidentPayload.documentUrl = documentUrl;
      incidentPayload.documentName = documentName;
    }

    // Create incident document
    const docRef = await addDoc(collection(db, 'incidents'), incidentPayload);
    return docRef.id;
  } catch (error) {
    console.error('Error creating incident:', error);
    throw error;
  }
};

// Update incident
export const updateIncident = async (id: string, data: Partial<Incident>) => {
  try {
    const docRef = doc(db, 'incidents', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating incident:', error);
    throw error;
  }
};

// Delete incident
export const deleteIncident = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'incidents', id));
  } catch (error) {
    console.error('Error deleting incident:', error);
    throw error;
  }
};