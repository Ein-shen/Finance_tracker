import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyAgmmmHsNjkeTgvBq807SXszbW4c6eGWrE",
  authDomain: "finanace-tracker-6ca95.firebaseapp.com",
  projectId: "finanace-tracker-6ca95",
  storageBucket: "finanace-tracker-6ca95.firebasestorage.app",
  messagingSenderId: "286388438785",
  appId: "1:286388438785:web:15b0d32cb29c22b801fd00",
  measurementId: "G-3EVYYL22X1"
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)