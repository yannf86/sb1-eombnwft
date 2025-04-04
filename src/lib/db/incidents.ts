import { collection, addDoc, getDocs, query, where, orderBy, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import type { Incident } from '../schema';
import { getCurrentUser } from '../auth';

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

// Get incident by ID
export const getIncident = async (id: string) => {
  try {
    const docRef = doc(db, 'incidents', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as Incident;
  } catch (error) {
    console.error('Error getting incident:', error);
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
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Create the incident payload
    const incidentPayload: any = {
      ...incidentData,
      concludedById: incidentData.concludedById || null,
      resolutionDescription: incidentData.resolutionDescription || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.id || 'system',
      updatedBy: currentUser?.id || 'system',
      // Initialize history array
      history: [{
        timestamp: new Date().toISOString(),
        userId: currentUser?.id || 'system',
        action: 'create',
        changes: { type: 'initial_creation' }
      }]
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

// Track changes between old and new data
const trackChanges = (oldData: any, newData: any) => {
  const changes: Record<string, { old: any, new: any }> = {};
  
  // Compare each field in the new data with the old data
  for (const [key, value] of Object.entries(newData)) {
    // Skip history field, internal fields, and functions
    if (key === 'history' || key === 'id' || key === 'createdAt' || key === 'updatedAt' || 
        key === 'createdBy' || key === 'updatedBy' || typeof value === 'function') {
      continue;
    }
    
    // Check if the field exists in old data
    if (key in oldData) {
      // Check if the value is different
      if (JSON.stringify(oldData[key]) !== JSON.stringify(value)) {
        changes[key] = {
          old: oldData[key],
          new: value
        };
      }
    } else if (value !== null && value !== undefined && value !== '') {
      // New field with a value
      changes[key] = {
        old: null,
        new: value
      };
    }
  }
  
  return changes;
};

// Update incident
export const updateIncident = async (id: string, data: Partial<Incident>) => {
  try {
    // Get the current incident to track changes
    const docRef = doc(db, 'incidents', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Incident not found');
    }
    
    const oldData = docSnap.data();
    
    // Get current user
    const currentUser = getCurrentUser();
    const userId = currentUser?.id || 'system';
    
    // Track what has changed
    const changes = trackChanges(oldData, data);
    
    // Check if concludedById was set and set timestamp
    let concludedAt = oldData.concludedAt;
    if (data.concludedById && !oldData.concludedById) {
      concludedAt = new Date().toISOString();
    } else if (data.concludedById === null && oldData.concludedById) {
      concludedAt = null;
    }
    
    // Create a history entry
    const historyEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action: 'update',
      changes
    };
    
    // Update the history array
    const history = oldData.history || [];
    history.push(historyEntry);
    
    // Update the document with new data and history
    await updateDoc(docRef, {
      ...data,
      concludedAt,
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
      history
    });
  } catch (error) {
    console.error('Error updating incident:', error);
    throw error;
  }
};

// Delete incident
export const deleteIncident = async (id: string) => {
  try {
    // Get current user
    const currentUser = getCurrentUser();
    const userId = currentUser?.id || 'system';
    
    // Get the current incident
    const docRef = doc(db, 'incidents', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Incident not found');
    }
    
    const oldData = docSnap.data();
    
    // Add deletion to history
    const historyEntry = {
      timestamp: new Date().toISOString(),
      userId,
      action: 'delete',
      changes: { type: 'deletion' }
    };
    
    // Update history before deletion (for audit purposes)
    const history = oldData.history || [];
    history.push(historyEntry);
    
    await updateDoc(docRef, {
      updatedAt: new Date().toISOString(),
      updatedBy: userId,
      history
    });
    
    // Now delete the document
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting incident:', error);
    throw error;
  }
};

// Clear concludedBy field on an incident
export const clearConcludedBy = async (id: string) => {
  try {
    const docRef = doc(db, 'incidents', id);
    await updateDoc(docRef, {
      concludedById: null,
      concludedAt: null,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing concludedBy field:', error);
    throw error;
  }
};