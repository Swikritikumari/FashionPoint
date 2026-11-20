// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// The Firebase Web API key is supplied through client/.env.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-ecom-66142.firebaseapp.com",
  projectId: "mern-ecom-66142",
  storageBucket: "mern-ecom-66142.appspot.com",
  messagingSenderId: "633570726758",
  appId: "1:633570726758:web:f0fe655304076969eaeea7"
};

export const firebaseConfigured = Boolean(firebaseConfig.apiKey);
export const app = firebaseConfigured ? initializeApp(firebaseConfig) : null;
