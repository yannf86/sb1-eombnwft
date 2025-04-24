import { collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { getCurrentUser } from '../auth';

// Get all lost items
export const getLostItems = async (hotelId?: string) => {
  try {
    let q = collection(db, 'lost_items');
    if (hotelId) {
      q = query(q, where('hotelId', '==', hotelId));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting lost items:', error);
    throw error;
  }
};

// Get a single lost item by ID
export const getLostItem = async (id: string) => {
  try {
    const docRef = doc(db, 'lost_items', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error getting lost item:', error);
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

// Create new lost item
export const createLostItem = async (data: any) => {
  try {
    // Extract file fields and preview data
    const { photo, photoPreview, ...lostItemData } = data;
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Create the lost item payload
    const lostItemPayload: any = {
      ...lostItemData,
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
      const photoUrl = await uploadFile(photo, 'lost_items/photos');
      lostItemPayload.photoUrl = photoUrl;
    } else if (photoPreview) {
      lostItemPayload.photoUrl = photoPreview;
    }

    // Create lost item document
    const docRef = await addDoc(collection(db, 'lost_items'), lostItemPayload);
    return docRef.id;
  } catch (error) {
    console.error('Error creating lost item:', error);
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
        key === 'createdBy' || key === 'updatedBy' || typeof value === 'function' ||
        key === 'photo' || key === 'photoPreview') {
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

// Update lost item
export const updateLostItem = async (id: string, data: any) => {
  try {
    // Get the current lost item to track changes
    const docRef = doc(db, 'lost_items', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Lost item not found');
    }
    
    const oldData = docSnap.data();
    
    // Extract file fields if present
    const { photo, photoPreview, ...itemData } = data;
    
    // Get current user
    const currentUser = getCurrentUser();
    const userId = currentUser?.id || 'system';
    
    // Create update payload
    const payload: any = { ...itemData };
    
    // Track what has changed
    const changes = trackChanges(oldData, payload);
    
    // Check if returnDate was set and add it to changes
    if (payload.status === 'rendu' && !oldData.returnDate && !payload.returnDate) {
      payload.returnDate = new Date().toISOString();
      changes['returnDate'] = { old: null, new: payload.returnDate };
    }
    
    // Upload photo if present
    if (photo instanceof File) {
      const photoUrl = await uploadFile(photo, 'lost_items/photos');
      payload.photoUrl = photoUrl;
      changes['photoUrl'] = { old: oldData.photoUrl || null, new: 'Updated' };
    } else if (photoPreview && photoPreview !== oldData.photoUrl) {
      payload.photoUrl = photoPreview;
      changes['photoUrl'] = { old: oldData.photoUrl || null, new: 'Updated' };
    }
    
    // Create a history entry if there are changes
    if (Object.keys(changes).length > 0) {
      const historyEntry = {
        timestamp: new Date().toISOString(),
        userId,
        action: 'update',
        changes
      };
      
      // Update the history array
      const history = oldData.history || [];
      history.push(historyEntry);
      payload.history = history;
    }
    
    // Update timestamps and user
    payload.updatedAt = new Date().toISOString();
    payload.updatedBy = userId;
    
    // Update the document
    await updateDoc(docRef, payload);
  } catch (error) {
    console.error('Error updating lost item:', error);
    throw error;
  }
};

// Delete lost item
export const deleteLostItem = async (id: string) => {
  try {
    // Get current user
    const currentUser = getCurrentUser();
    const userId = currentUser?.id || 'system';
    
    // Get the current lost item
    const docRef = doc(db, 'lost_items', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Lost item not found');
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
    console.error('Error deleting lost item:', error);
    throw error;
  }
};