import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtsCxwNbAJCA8ooPz2IDHHbRv7uri5kOQ",
  authDomain: "neuro-tools.firebaseapp.com",
  projectId: "neuro-tools",
  storageBucket: "neuro-tools.appspot.com",
  messagingSenderId: "796322162018",
  appId: "1:796322162018:web:657ebf09cfa11cf6fb783b"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

export default firebaseApp;
