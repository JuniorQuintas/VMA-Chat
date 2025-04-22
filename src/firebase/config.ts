import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyD7yIbGt_aXftxGtGK4V_j0PfwI1DWtlek",
  authDomain: "chat-vma.firebaseapp.com",
  projectId: "chat-vma",
  storageBucket: "chat-vma.firebasestorage.app",
  messagingSenderId: "438550377581",
  appId: "1:438550377581:web:bb0033e6f5df13e2467b64",
  measurementId: "G-6T6EXD3ZNN"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);