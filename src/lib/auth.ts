import { 
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// Types
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'standard';
  hotels: string[];
  modules: string[];
  active: boolean;
};

// Store the current user
let currentUser: AuthUser | null = null;

// Simple login function
export const login = async (email: string, password: string): Promise<{ success: boolean; message?: string; user?: AuthUser }> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) {
      await firebaseSignOut(auth);
      return { success: false, message: "Utilisateur non trouvé" };
    }
    
    const userData = userDoc.data();
    if (!userData.active) {
      await firebaseSignOut(auth);
      return { success: false, message: "Compte désactivé" };
    }
    
    // Set the current user
    currentUser = {
      id: firebaseUser.uid,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      hotels: userData.hotels,
      modules: userData.modules,
      active: userData.active
    };
    
    // Store the user in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    return { success: true, user: currentUser };
  } catch (error: any) {
    console.error("Login error:", error);
    return { 
      success: false, 
      message: error.code === 'auth/invalid-credential' 
        ? "Identifiants incorrects"
        : "Une erreur est survenue" 
    };
  }
};

// Logout function
export const logout = async () => {
  try {
    await firebaseSignOut(auth);
    currentUser = null;
    localStorage.removeItem('currentUser');
  } catch (error) {
    console.error("Logout error:", error);
  }
};

// Get the current user
export const getCurrentUser = (): AuthUser | null => {
  if (currentUser) {
    return currentUser;
  }
  
  // Check if user is stored in localStorage
  const storedUser = localStorage.getItem('currentUser');
  if (storedUser) {
    currentUser = JSON.parse(storedUser);
    return currentUser;
  }
  
  return null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};

// Check if user has access to a specific module
export const hasModuleAccess = (moduleCode: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin has access to all modules
  if (user.role === 'admin') return true;
  
  // Check if the module is in the user's allowed modules
  return user.modules.some(m => m === moduleCode);
};

// Check if user has access to a specific hotel
export const hasHotelAccess = (hotelId: string): boolean => {
  const user = getCurrentUser();
  if (!user) return false;
  
  // Admin has access to all hotels
  if (user.role === 'admin') return true;
  
  // Check if the hotel is in the user's allowed hotels
  return user.hotels.includes(hotelId);
};

// Initialize auth from localStorage and set up auth state listener
export const initAuth = () => {
  // First check localStorage
  getCurrentUser();
  
  // Then set up auth state listener
  onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
    if (firebaseUser) {
      // User is signed in
      if (!currentUser) {
        // If we don't have the user data yet, fetch it
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          currentUser = {
            id: firebaseUser.uid,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            hotels: userData.hotels,
            modules: userData.modules,
            active: userData.active
          };
          localStorage.setItem('currentUser', JSON.stringify(currentUser));
        }
      }
    } else {
      // User is signed out
      currentUser = null;
      localStorage.removeItem('currentUser');
    }
  });
};