import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import serviceAccount from './finanace-tracker-6ca95-firebase-adminsdk-fbsvc-ed5d874815.json' with { type: 'json' }

initializeApp({
  credential: cert(serviceAccount),
})

export const firebaseAuth = getAuth()