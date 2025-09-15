import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc,
  updateDoc,
  deleteDoc,
  query, 
  where 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";

import CONFIG from './config.js';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: CONFIG.API_KEY,
  authDomain: CONFIG.AUTH_DOMAIN,
  projectId: CONFIG.PROJECT_ID,
  storageBucket: CONFIG.STORAGE_BUCKET,
  messagingSenderId: CONFIG.MESSAGING_SENDER_ID,
  appId: CONFIG.APP_ID
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const registerUser = async (email, password, username) => {
  try {
    console.log("Registering user with email:", email, "and username:", username);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered:", userCredential.user);
    
    // Send verification email
    await sendEmailVerification(userCredential.user);
    
    // Add user info to Firestore
    await addDoc(collection(db, "users"), {
      uid: userCredential.user.uid,
      username: username,
      email: email,
      emailVerified: (!userCredential.user.emailVerified),
      createdAt: new Date().toISOString()
    });
    return { success: true, user: userCredential.user };  
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if email is verified
    if (!userCredential.user.emailVerified) {
      return { 
        success: false, 
        error: "Email not verified. Please check your inbox and verify your email.",
        needsVerification: true,
        user: userCredential.user
      };
    }
    
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Function to resend verification email
export const resendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Function to send password reset email
export const sendPasswordResetEmail = async (email) => {
  try {
    await firebaseSendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getUserInfo = async (uid) => {
  try {
    const userQuery = query(collection(db, "users"), where("uid", "==", uid));
    const querySnapshot = await getDocs(userQuery);
    if (!querySnapshot.empty) {
      return { success: true, data: querySnapshot.docs[0].data() };
    }
    return { success: false, error: "User not found" };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Lost Items functions
export const addLostItem = async (lostItemData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    // Add additional metadata
    const itemWithMetadata = {
      ...lostItemData,
      userId: user.uid,
      userEmail: user.email,
      status: 'lost',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, "lostItems"), itemWithMetadata);
    return { success: true, id: docRef.id };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getAllLostItems = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "lostItems"));
    const lostItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: lostItems };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getLostItemById = async (itemId) => {
  try {
    const docRef = doc(db, "lostItems", itemId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { success: true, data: { id: docSnap.id, ...docSnap.data() } };
    } else {
      return { success: false, error: "Lost item not found" };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserLostItems = async (userId) => {
  try {
    const userItemsQuery = query(
      collection(db, "lostItems"), 
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(userItemsQuery);
    const userItems = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { success: true, data: userItems };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Function to update a lost item document by ID
export const updateLostItem = async (itemId, updatedData) => {
  try {
    const docRef = doc(db, "lostItems", itemId);
    await updateDoc(docRef, {
      ...updatedData,
      updatedAt: new Date().toISOString()
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Function to delete a lost item document by ID
export const deleteLostItem = async (itemId) => {
  try {
    const docRef = doc(db, "lostItems", itemId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export default { 
  auth, 
  db, 
  registerUser, 
  loginUser, 
  logoutUser, 
  getCurrentUser, 
  getUserInfo,
  addLostItem,
  getAllLostItems,
  getLostItemById,
  getUserLostItems,
  resendVerificationEmail,
  sendPasswordResetEmail,
  updateLostItem,
  deleteLostItem
};