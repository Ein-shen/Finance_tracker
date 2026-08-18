import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import { pool } from './db.js'
import { firebaseAuth } from './firebaseAdmin.js'

const app = express()

app.use(cors())
app.use(express.json())

// Test PostgreSQL
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()')

    res.json({
      message: 'PostgreSQL connected!',
      time: result.rows[0].now,
    })
  } catch (error) {
    console.error('Database error:', error)

    res.status(500).json({
      message: 'PostgreSQL connection failed',
    })
  }
})

// Test Firebase Admin
app.get('/api/test-firebase', async (req, res) => {
  try {
    const user = await firebaseAuth.listUsers(1)

    res.json({
      message: 'Firebase Admin connected!',
      usersFound: user.users.length,
    })
  } catch (error) {
    console.error('Firebase error:', error)

    res.status(500).json({
      message: 'Firebase Admin connection failed',
    })
  }
})

// Firebase -> PostgreSQL
app.post('/api/users', async (req, res) => {
  try {
    const { token, name } = req.body

    if (!token) {
      return res.status(401).json({
        message: 'Firebase token is required',
      })
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token)

    const firebaseUid = decodedToken.uid
    const email = decodedToken.email

    const result = await pool.query(
      `
      INSERT INTO users (firebase_uid, email, name)
      VALUES ($1, $2, $3)
      ON CONFLICT (firebase_uid)
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name
      RETURNING id, firebase_uid, email, name
      `,
      [firebaseUid, email, name || '']
    )

    res.status(200).json({
      message: 'User saved to PostgreSQL',
      user: result.rows[0],
    })

  } catch (error) {
    console.error('User sync error:', error)

    res.status(500).json({
      message: 'Failed to save user',
    })
  }
})

// Start server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000')
})