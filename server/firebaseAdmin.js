import 'dotenv/config'
import { initializeApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT

if (!rawKey) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is missing!')
}

const serviceAccount = typeof rawKey === 'string' ? JSON.parse(rawKey) : rawKey

if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n')
}

initializeApp({
  credential: cert(serviceAccount),
})

export const firebaseAuth = getAuth()