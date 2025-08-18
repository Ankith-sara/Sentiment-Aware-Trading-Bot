import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB4ryJokhH-K0a3EbdtIgWZXgxBRypoJlU",
  authDomain: "sentiment-aware-trading-bot.firebaseapp.com",
  projectId: "sentiment-aware-trading-bot",
  storageBucket: "sentiment-aware-trading-bot.firebasestorage.app",
  messagingSenderId: "909497121683",
  appId: "1:909497121683:web:7464ba324d7673cca80666",
  measurementId: "G-5JKZRL8CM6"
};

const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);
logEvent(analytics, 'notification_received');

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;