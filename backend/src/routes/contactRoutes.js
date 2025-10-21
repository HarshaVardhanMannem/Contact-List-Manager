const express = require('express')
const ContactController = require('../controllers/contactController')
const { validateContact, handleValidationErrors, validateContactId, validateSearchQuery } = require('../middleware/validation')

const router = express.Router()
const contactController = new ContactController()

// Initialize controller
contactController.initialize().catch(error => {
  console.error('Failed to initialize contact controller:', error)
})

/**
 * GET /api/contacts
 * Get all contacts
 */
router.get('/', contactController.getAllContacts.bind(contactController))

/**
 * GET /api/contacts/search
 * Search contacts by name or email
 */
router.get('/search', validateSearchQuery, contactController.searchContacts.bind(contactController))

/**
 * POST /api/contacts
 * Create a new contact
 */
router.post('/', validateContact, handleValidationErrors, contactController.createContact.bind(contactController))

/**
 * DELETE /api/contacts/:id
 * Delete a contact by ID
 */
router.delete('/:id', validateContactId, contactController.deleteContact.bind(contactController))

/**
 * GET /api/contacts/count
 * Get total number of contacts
 */
router.get('/count', contactController.getContactCount.bind(contactController))

module.exports = router
