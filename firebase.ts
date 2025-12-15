import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBP0-6CsAMelMSEFZMZpV1ecvnCVjuDSWM",
  authDomain: "cvtestmaker.firebaseapp.com",
  projectId: "cvtestmaker",
  storageBucket: "cvtestmaker.firebasestorage.app",
  messagingSenderId: "358007084136",
  appId: "1:358007084136:web:a82fc8f2ff0fcb1f38d7dd",
  measurementId: "G-X65G5LHK0S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics is optional and might fail in strict environments/SSR, safe wrap
let analytics;
if (typeof window !== 'undefined') {
  try {
     analytics = getAnalytics(app);
  } catch (e) {
     console.warn("Analytics blocked or failed to load");
  }
}
export { analytics };