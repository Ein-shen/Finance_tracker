import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'

import { pool } from './db.js'
import { firebaseAuth } from './firebaseAdmin.js'

const app = express()

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors())
app.use(express.json())

// ==========================================
// PATH CONFIGURATION
// ==========================================

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// ==========================================
// MULTER CONFIG FOR PHOTO UPLOADS
// ==========================================

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'))
  },

  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname))
  },
})

const upload = multer({
  storage: fileStorageEngine,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/

    const valid = allowed.test(
      path.extname(file.originalname).toLowerCase()
    )

    if (valid) {
      cb(null, true)
    } else {
      cb(
        new Error(
          'Only image files (jpg, png, webp) are allowed'
        )
      )
    }
  },
})

// ==========================================
// SERVE UPLOADED PHOTOS
// ==========================================

app.use(
  '/uploads',
  express.static(
    path.join(__dirname, 'uploads')
  )
)

// ==========================================
// FIREBASE AUTH MIDDLEWARE
// ==========================================

const authenticateFirebase = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        message: 'Authorization header is required',
      })
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Invalid authorization format',
      })
    }

    const token = authHeader.split('Bearer ')[1]

    if (!token) {
      return res.status(401).json({
        message: 'Firebase token is required',
      })
    }

    const decodedToken =
      await firebaseAuth.verifyIdToken(token)

    req.firebaseUid = decodedToken.uid
    req.firebaseEmail = decodedToken.email

    next()
  } catch (error) {
    console.error(
      'Firebase authentication error:',
      error
    )

    return res.status(401).json({
      message: 'Invalid or expired Firebase token',
    })
  }
}

// ==========================================
// TEST ROOT
// ==========================================

app.get('/', (req, res) => {
  res.json({
    message: 'Finance Tracker API is running',
  })
})

// ==========================================
// TEST POSTGRESQL
// ==========================================

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT NOW()'
    )

    res.json({
      message: 'PostgreSQL connected!',
      time: result.rows[0].now,
    })
  } catch (error) {
    console.error(
      'Database error:',
      error
    )

    res.status(500).json({
      message:
        'PostgreSQL connection failed',
    })
  }
})

// ==========================================
// TEST FIREBASE
// ==========================================

app.get('/api/test-firebase', async (req, res) => {
  try {
    const users =
      await firebaseAuth.listUsers(1)

    res.json({
      message:
        'Firebase Admin connected!',
      usersFound:
        users.users.length,
    })
  } catch (error) {
    console.error(
      'Firebase error:',
      error
    )

    res.status(500).json({
      message:
        'Firebase Admin connection failed',
    })
  }
})

// ==========================================
// SAVE USER
// ==========================================

app.post(
  '/api/users',
  async (req, res) => {
    try {
      const { token, name } = req.body

      if (!token) {
        return res.status(401).json({
          message:
            'Firebase token is required',
        })
      }

      const decodedToken =
        await firebaseAuth.verifyIdToken(
          token
        )

      const firebaseUid =
        decodedToken.uid

      const email =
        decodedToken.email

      const result =
        await pool.query(
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
          RETURNING
            id,
            firebase_uid,
            email,
            name
          `,
          [
            firebaseUid,
            email,
            name || '',
          ]
        )

      res.status(200).json({
        message:
          'User saved to PostgreSQL',
        user: result.rows[0],
      })
    } catch (error) {
      console.error(
        'User sync error:',
        error
      )

      res.status(500).json({
        message:
          'Failed to save user',
      })
    }
  }
)

// ==========================================
// ADD TRANSACTION
// ==========================================

app.post(
  '/api/transactions',
  async (req, res) => {
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
          message:
            'Firebase token is required',
        })
      }

      const decodedToken =
        await firebaseAuth.verifyIdToken(
          token
        )

      const firebaseUid =
        decodedToken.uid

      if (
        !description ||
        amount === undefined ||
        amount === null ||
        amount === '' ||
        !category ||
        !transaction_date
      ) {
        return res.status(400).json({
          message:
            'All fields are required',
        })
      }

      const numericAmount =
        Number(amount)

      if (
        !Number.isFinite(
          numericAmount
        )
      ) {
        return res.status(400).json({
          message:
            'Amount must be a valid number',
        })
      }

      const result =
        await pool.query(
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
        message:
          'Transaction added successfully',
        transaction:
          result.rows[0],
      })
    } catch (error) {
      console.error(
        'Transaction error:',
        error
      )

      res.status(500).json({
        message:
          'Failed to add transaction',
      })
    }
  }
)

// ==========================================
// GET TRANSACTIONS
// ==========================================

app.get(
  '/api/transactions',
  authenticateFirebase,
  async (req, res) => {
    try {
      const firebaseUid =
        req.firebaseUid

      const result =
        await pool.query(
          `
          SELECT *
          FROM transactions
          WHERE firebase_uid = $1
          ORDER BY
            transaction_date DESC,
            id DESC
          `,
          [firebaseUid]
        )

      res.status(200).json({
        transactions:
          result.rows,
      })
    } catch (error) {
      console.error(
        'Get transactions error:',
        error
      )

      res.status(500).json({
        message:
          'Failed to get transactions',
      })
    }
  }
)

// ==========================================
// EDIT TRANSACTION
// ==========================================

app.put(
  '/api/transactions/:id',
  authenticateFirebase,
  async (req, res) => {
    try {
      const { id } = req.params

      const transactionId =
        Number(id)

      const {
        description,
        amount,
        category,
        transaction_date,
      } = req.body

      const firebaseUid =
        req.firebaseUid

      if (
        !description ||
        amount === undefined ||
        amount === null ||
        amount === '' ||
        !category ||
        !transaction_date
      ) {
        return res.status(400).json({
          message:
            'All fields are required',
        })
      }

      const numericAmount =
        Number(amount)

      if (
        !Number.isFinite(
          numericAmount
        )
      ) {
        return res.status(400).json({
          message:
            'Amount must be a valid number',
        })
      }

      const result =
        await pool.query(
          `
          UPDATE transactions
          SET
            description = $1,
            amount = $2,
            category = $3,
            transaction_date = $4
          WHERE id = $5
          AND firebase_uid = $6
          RETURNING *
          `,
          [
            description,
            numericAmount,
            category,
            transaction_date,
            transactionId,
            firebaseUid,
          ]
        )

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            'Transaction not found',
        })
      }

      res.status(200).json({
        message:
          'Transaction updated successfully',
        transaction:
          result.rows[0],
      })
    } catch (error) {
      console.error(
        'Edit transaction error:',
        error
      )

      res.status(500).json({
        message:
          'Failed to edit transaction',
      })
    }
  }
)

// ==========================================
// ADD SCHEDULE
// ==========================================

app.post(
  '/api/schedule',
  authenticateFirebase,
  async (req, res) => {
    try {
      const {
        description,
        amount,
        category,
        due_date,
        repeat_type,
      } = req.body

      const firebaseUid =
        req.firebaseUid

      // Validate fields

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
          message:
            'All fields are required',
        })
      }

      // Validate amount

      const numericAmount =
        Number(amount)

      if (
        !Number.isFinite(
          numericAmount
        )
      ) {
        return res.status(400).json({
          message:
            'Amount must be a valid number',
        })
      }

      // Insert schedule

      const result =
        await pool.query(
          `
          INSERT INTO schedule (
            firebase_uid,
            description,
            amount,
            category,
            due_date,
            repeat_type
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6
          )
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
        message:
          'Schedule added successfully',

        schedule:
          result.rows[0],
      })
    } catch (error) {
      console.error(
        'Schedule error:',
        error
      )

      res.status(500).json({
        message:
          'Failed to add schedule',
      })
    }
  }
)

// ==========================================
// GET SCHEDULES
// ==========================================

app.get(
  '/api/schedule',
  authenticateFirebase,
  async (req, res) => {
    try {
      const firebaseUid =
        req.firebaseUid

      const result =
        await pool.query(
          `
          SELECT *
          FROM schedule
          WHERE firebase_uid = $1
          ORDER BY
            due_date ASC,
            id DESC
          `,
          [firebaseUid]
        )

      res.status(200).json({
        schedules:
          result.rows,
      })
    } catch (error) {
      console.error(
        'Get schedules error:',
        error
      )

      res.status(500).json({
        message:
          'Failed to get schedules',
      })
    }
  }
)

// ==========================================
// EDIT SCHEDULE
// ==========================================

app.put(
  '/api/schedule/:id',
  authenticateFirebase,
  async (req, res) => {
    try {
      const { id } = req.params

      const scheduleId =
        Number(id)

      const {
        description,
        amount,
        category,
        due_date,
        repeat_type,
      } = req.body

      const firebaseUid =
        req.firebaseUid

      // Validate ID

      if (
        !Number.isInteger(
          scheduleId
        )
      ) {
        return res.status(400).json({
          message:
            'Invalid schedule ID',
        })
      }

      // Validate fields

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
          message:
            'All fields are required',
        })
      }

      // Validate amount

      const numericAmount =
        Number(amount)

      if (
        !Number.isFinite(
          numericAmount
        )
      ) {
        return res.status(400).json({
          message:
            'Amount must be a valid number',
        })
      }

      // Update schedule

      const result =
        await pool.query(
          `
          UPDATE schedule
          SET
            description = $1,
            amount = $2,
            category = $3,
            due_date = $4,
            repeat_type = $5
          WHERE id = $6
          AND firebase_uid = $7
          RETURNING *
          `,
          [
            description,
            numericAmount,
            category,
            due_date,
            repeat_type,
            scheduleId,
            firebaseUid,
          ]
        )

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            'Schedule not found',
        })
      }

      res.status(200).json({
        message:
          'Schedule updated successfully',

        schedule:
          result.rows[0],
      })
    } catch (error) {
      console.error(
        'Edit schedule error:',
        error
      )

      res.status(500).json({
        message:
          'Failed to edit schedule',
      })
    }
  }
)

// ==========================================
// DELETE SCHEDULE
// ==========================================

app.delete(
  '/api/schedule/:id',
  authenticateFirebase,
  async (req, res) => {
    try {
      const { id } = req.params

      const scheduleId =
        Number(id)

      const firebaseUid =
        req.firebaseUid

      // Validate ID

      if (
        !Number.isInteger(
          scheduleId
        )
      ) {
        return res.status(400).json({
          message:
            'Invalid schedule ID',
        })
      }

      // Delete schedule

      const result =
        await pool.query(
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

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            'Schedule not found',
        })
      }

      res.status(200).json({
        message:
          'Schedule deleted successfully',

        schedule:
          result.rows[0],
      })
    } catch (error) {
      console.error(
        'Delete schedule error:',
        error
      )

      res.status(500).json({
        message:
          'Failed to delete schedule',
      })
    }
  }
)

// ==========================================
// GET USER PROFILE
// ==========================================

app.get(
  '/api/user',
  authenticateFirebase,
  async (req, res) => {
    try {
      const firebaseUid =
        req.firebaseUid

      const result =
        await pool.query(
          `
          SELECT
            name,
            email,
            photo_url
          FROM users
          WHERE firebase_uid = $1
          `,
          [firebaseUid]
        )

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            'User not found',
        })
      }

      res.status(200).json({
        name:
          result.rows[0].name,

        email:
          result.rows[0].email,

        photo_url:
          result.rows[0].photo_url,
      })
    } catch (error) {
      console.error(
        'Get user error:',
        error
      )

      res.status(500).json({
        message:
          'Server error',
      })
    }
  }
)

// ==========================================
// UPLOAD USER PHOTO
// ==========================================

app.post(
  '/api/user/photo',
  authenticateFirebase,
  upload.single('photo'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            'No photo uploaded',
        })
      }

      const firebaseUid =
        req.firebaseUid

      const photoUrl =
        `/uploads/${req.file.filename}`

      const result =
        await pool.query(
          `
          UPDATE users
          SET photo_url = $1
          WHERE firebase_uid = $2
          RETURNING
            id,
            firebase_uid,
            email,
            name,
            photo_url
          `,
          [
            photoUrl,
            firebaseUid,
          ]
        )

      if (
        result.rows.length === 0
      ) {
        return res.status(404).json({
          message:
            'User not found',
        })
      }

      res.status(200).json({
        message:
          'Photo uploaded successfully',

        user:
          result.rows[0],
      })
    } catch (error) {
      console.error(
        'Photo upload error:',
        error
      )

      res.status(500).json({
        message:
          'Failed to upload photo',
      })
    }
  }
)

// ==========================================
// 404 HANDLER
// ==========================================

app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found',
    method: req.method,
    path: req.originalUrl,
  })
})

// ==========================================
// GLOBAL ERROR HANDLER
// ==========================================

app.use(
  (error, req, res, next) => {
    console.error(
      'Unhandled server error:',
      error
    )

    res.status(500).json({
      message:
        'Internal server error',
    })
  }
)

// ==========================================
// START SERVER
// ==========================================

app.listen(5000, () => {
  console.log(
    'Server running on http://localhost:5000'
  )
})