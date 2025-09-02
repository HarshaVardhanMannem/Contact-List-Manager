const express = require('express')
const cors = require('cors')
const { body, validationResult } = require('express-validator')
const ContactDatabase = require('./database')

const app = express()
const PORT = process.env.PORT || 3001

// Initialize database
const db = new ContactDatabase()

// Helper for consistent error responses
function errorResponse (res, status, message) {
  return res.status(status).json({ success: false, message })
}

// Middleware
app.use(cors())
app.use(express.json())

// Initialize database connection
async function initializeDatabase () {
  try {
    await db.connect()
    console.log('Database connection established')
  } catch (error) {
    console.error('Failed to connect to database:', error)
    process.exit(1)
  }
}

// Validation middleware
const validateContact = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters')
    .matches(/^[A-Za-z\s]+$/)
    .withMessage('Name must only contain letters and spaces'),
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address')
]

// Error handling middleware for validation
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    })
  }
  next()
}

// --- ROUTES ---

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await db.getAllContacts()
    res.json({ success: true, data: contacts })
  } catch (error) {
    console.error('Error fetching contacts:', error)
    errorResponse(res, 500, 'Failed to fetch contacts')
  }
})

// Search contacts
app.get('/api/contacts/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q || q.trim() === '') {
      return res.json({ success: true, data: [] })
    }
    const contacts = await db.searchContacts(q.trim())
    res.json({ success: true, data: contacts })
  } catch (error) {
    console.error('Error searching contacts:', error)
    errorResponse(res, 500, 'Failed to search contacts')
  }
})

// Add new contact
app.post(
  '/api/contacts',
  validateContact,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email } = req.body
      // Check if email already exists
      const existingContact = await db.getContactByEmail(email)
      if (existingContact) {
        return errorResponse(
          res,
          409,
          'A contact with this email already exists'
        )
      }

      try {
        const contact = await db.addContact(name, email)
        res.status(201).json({
          success: true,
          data: contact,
          message: 'Contact added successfully'
        })
      } catch (error) {
        if (error.message === 'Email already exists') {
          return errorResponse(
            res,
            409,
            'A contact with this email already exists'
          )
        }
        throw error
      }
    } catch (error) {
      console.error('Error adding contact:', error)
      errorResponse(res, 500, 'Failed to add contact')
    }
  }
)

// Delete contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params
    if (!id) {
      return errorResponse(res, 400, 'Invalid contact ID')
    }
    const deleted = await db.deleteContact(id)
    if (!deleted) {
      return errorResponse(res, 404, 'Contact not found')
    }
    res.json({ success: true, message: 'Contact deleted successfully' })
  } catch (error) {
    console.error('Error deleting contact:', error)
    errorResponse(res, 500, 'Failed to delete contact')
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.use('*', (req, res) => {
  errorResponse(res, 404, 'Endpoint not found')
})

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error)
  errorResponse(res, 500, 'Internal server error')
})

// Start server
async function startServer () {
  await initializeDatabase()
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`Health check: http://localhost:${PORT}/api/health`)
  })
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...')
  await db.close()
  process.exit(0)
})

startServer().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})

module.exports = app
