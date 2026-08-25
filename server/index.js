import express from 'express'
import cors from 'cors'
import 'dotenv/config'

import { pool } from './db.js'
import { firebaseAuth } from './firebaseAdmin.js'

const app = express()

app.use(cors())
app.use(express.json())

// ==========================================
// TEST POSTGRESQL
// ==========================================

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

// ==========================================
// TEST FIREBASE
// ==========================================

app.get('/api/test-firebase', async (req, res) => {
  try {
    const users = await firebaseAuth.listUsers(1)

    res.json({
      message: 'Firebase Admin connected!',
      usersFound: users.users.length,
    })
  } catch (error) {
    console.error('Firebase error:', error)

    res.status(500).json({
      message: 'Firebase Admin connection failed',
    })
  }
})

// ==========================================
// SAVE USER
// ==========================================

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
      INSERT INTO users (
        firebase_uid,
        email,
        name
      )
      VALUES ($1, $2, $3)
      ON CONFLICT (firebase_uid)
      DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name
      RETURNING id, firebase_uid, email, name
      `,
      [
        firebaseUid,
        email,
        name || '',
      ]
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

// ==========================================
// ADD TRANSACTION
// ==========================================

app.post('/api/transactions', async (req, res) => {
  try {
    const {
      token,
      description,
      amount,
      category,
      transaction_date,
    } = req.body

    if (!token) {
      return res.status(401).json({
        message: 'Firebase token is required',
      })
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token)

    const firebaseUid = decodedToken.uid

    if (
      !description ||
      amount === undefined ||
      amount === null ||
      amount === '' ||
      !category ||
      !transaction_date
    ) {
      return res.status(400).json({
        message: 'All fields are required',
      })
    }

    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount)) {
      return res.status(400).json({
        message: 'Amount must be a valid number',
      })
    }

    const result = await pool.query(
      `
      INSERT INTO transactions (
        firebase_uid,
        description,
        amount,
        category,
        transaction_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        firebaseUid,
        description,
        numericAmount,
        category,
        transaction_date,
      ]
    )

    res.status(201).json({
      message: 'Transaction added successfully',
      transaction: result.rows[0],
    })
  } catch (error) {
    console.error('Transaction error:', error)

    res.status(500).json({
      message: 'Failed to add transaction',
    })
  }
})

// ==========================================
// GET TRANSACTIONS   <-- NEW ROUTE
// ==========================================

app.get('/api/transactions', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader
      ? authHeader.split('Bearer ')[1]
      : null

    if (!token) {
      return res.status(401).json({
        message: 'Firebase token is required',
      })
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token)

    const firebaseUid = decodedToken.uid

    const result = await pool.query(
      `
      SELECT *
      FROM transactions
      WHERE firebase_uid = $1
      ORDER BY transaction_date DESC, id DESC
      `,
      [firebaseUid]
    )

    res.status(200).json({
      transactions: result.rows,
    })
  } catch (error) {
    console.error('Get transactions error:', error)

    res.status(500).json({
      message: 'Failed to get transactions',
    })
  }
})

// ==========================================
// GET SCHEDULES
// ==========================================

app.get('/api/schedule', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader
      ? authHeader.split('Bearer ')[1]
      : null

    if (!token) {
      return res.status(401).json({
        message: 'Firebase token is required',
      })
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token)

    const firebaseUid = decodedToken.uid

    const result = await pool.query(
      `
      SELECT *
      FROM schedule
      WHERE firebase_uid = $1
      ORDER BY due_date ASC, id DESC
      `,
      [firebaseUid]
    )

    res.status(200).json({
      schedules: result.rows,
    })
  } catch (error) {
    console.error('Get schedules error:', error)

    res.status(500).json({
      message: 'Failed to get schedules',
    })
  }
})

// ==========================================
// DELETE TRANSACTION
// ==========================================

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params
    const transactionId = Number(id)

    const authHeader = req.headers.authorization
    const token = authHeader
      ? authHeader.split('Bearer ')[1]
      : null

    if (!token) {
      return res.status(401).json({
        message: 'Firebase token is required',
      })
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token)

    const firebaseUid = decodedToken.uid

    const result = await pool.query(
      `
      DELETE FROM transactions
      WHERE id = $1
      AND firebase_uid = $2
      RETURNING *
      `,
      [
        transactionId,
        firebaseUid,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Transaction not found',
      })
    }

    res.status(200).json({
      message: 'Transaction deleted successfully',
      transaction: result.rows[0],
    })
  } catch (error) {
    console.error('Delete transaction error:', error)

    res.status(500).json({
      message: 'Failed to delete transaction',
    })
  }
})

// ==========================================
// ADD SCHEDULE
// ==========================================

app.post('/api/schedule', async (req, res) => {
  try {
    const {
      token,
      description,
      amount,
      category,
      due_date,
      repeat_type,
    } = req.body

    if (!token) {
      return res.status(401).json({
        message: 'Firebase token is required',
      })
    }

    const decodedToken =
      await firebaseAuth.verifyIdToken(token)

    const firebaseUid = decodedToken.uid

    if (
      !description ||
      amount === undefined ||
      amount === null ||
      amount === '' ||
      !category ||
      !due_date ||
      !repeat_type
    ) {
      return res.status(400).json({
        message: 'All fields are required',
      })
    }

    const numericAmount = Number(amount)

    if (!Number.isFinite(numericAmount)) {
      return res.status(400).json({
        message: 'Amount must be a valid number',
      })
    }

    const result = await pool.query(
      `
      INSERT INTO schedule (
        firebase_uid,
        description,
        amount,
        category,
        due_date,
        repeat_type
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        firebaseUid,
        description,
        numericAmount,
        category,
        due_date,
        repeat_type,
      ]
    )

    res.status(201).json({
      message: 'Schedule added successfully',
      schedule: result.rows[0],
    })
  } catch (error) {
    console.error('Schedule error:', error)

    res.status(500).json({
      message: 'Failed to add schedule',
    })
  }
})
// ==========================================
// DELETE SCHEDULE
// ==========================================

app.delete('/api/schedule/:id', async (req, res) => {
  try {
    const { id } = req.params
    const scheduleId = Number(id)

    const authHeader = req.headers.authorization
    const token = authHeader
      ? authHeader.split('Bearer ')[1]
      : null

    if (!token) {
      return res.status(401).json({
        message: 'Firebase token is required',
      })
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token)

    const firebaseUid = decodedToken.uid

    const result = await pool.query(
      `
      DELETE FROM schedule
      WHERE id = $1
      AND firebase_uid = $2
      RETURNING *
      `,
      [
        scheduleId,
        firebaseUid,
      ]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Schedule not found',
      })
    }

    res.status(200).json({
      message: 'Schedule deleted successfully',
      schedule: result.rows[0],
    })
  } catch (error) {
    console.error('Delete schedule error:', error)

    res.status(500).json({
      message: 'Failed to delete schedule',
    })
  }
})


app.get('/api/user', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader
      ? authHeader.split('Bearer ')[1]
      : null

    if (!token) {
      return res.status(401).json({
        message: 'Firebase token is required',
      })
    }

    const decodedToken = await firebaseAuth.verifyIdToken(token)
    const firebaseUid = decodedToken.uid

    const result = await pool.query(
      'SELECT name, email FROM users WHERE firebase_uid = $1',
      [firebaseUid]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ name: result.rows[0].name, email: result.rows[0].email })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Server error' })
  }
})
// ==========================================
// START SERVER
// ==========================================

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000')
})