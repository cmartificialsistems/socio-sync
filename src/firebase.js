import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAA94cZlUoc0gRoTT9wGnFuwh4WoMbBHyk",
  authDomain: "sociosync-d1c14.firebaseapp.com",
  projectId: "sociosync-d1c14",
  databaseURL: "https://sociosync-d1c14-default-rtdb.firebaseio.com",
  storageBucket: "sociosync-d1c14.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:1234567890abcdef"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
