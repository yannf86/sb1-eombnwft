import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import type { Maintenance } from '../schema';

// Get all maintenance requests
export const getMaintenanceRequests = async (hotelId?: string) => {
  try {
    let q = collection(db, 'maintenance');
    if (hotelId) {
      q = query(q, where('hotelId', '==', hotelId));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Maintenance[];
  } catch (error) {
    console.error('Error getting maintenance requests:', error);
    throw error;
  }
};

// Create new maintenance request
export const createMaintenanceRequest = async (data: Omit<Maintenance, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'maintenance'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating maintenance request:', error);
    throw error;
  }
};