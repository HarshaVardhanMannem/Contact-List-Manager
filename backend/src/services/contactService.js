const ContactDatabase = require('../config/database')
const Contact = require('../models/Contact')

/**
 * Contact Service
 * Handles business logic for contact operations
 */
class ContactService {
  constructor () {
    this.db = new ContactDatabase()
  }

  /**
   * Initialize the service
   */
  async initialize () {
    await this.db.connect()
  }

  /**
   * Get all contacts
   * @returns {Promise<Array>} Array of contacts
   */
  async getAllContacts () {
    try {
      const contacts = await this.db.getAllContacts()
      return contacts.map(contact => Contact.fromDatabase(contact).toJSON())
    } catch (error) {
      console.error('Service: Error getting all contacts:', error)
      throw error
    }
  }

  /**
   * Get contact by ID
   * @param {string} id - Contact ID
   * @returns {Promise<Object|null>} Contact object or null
   */
  async getContactById (id) {
    try {
      const contact = await this.db.getContactById(id)
      return contact ? Contact.fromDatabase(contact).toJSON() : null
    } catch (error) {
      console.error('Service: Error getting contact by ID:', error)
      throw error
    }
  }

  /**
   * Get contact by email
   * @param {string} email - Contact email
   * @returns {Promise<Object|null>} Contact object or null
   */
  async getContactByEmail (email) {
    try {
      const contact = await this.db.getContactByEmail(email)
      return contact ? Contact.fromDatabase(contact).toJSON() : null
    } catch (error) {
      console.error('Service: Error getting contact by email:', error)
      throw error
    }
  }

  /**
   * Create a new contact
   * @param {Object} contactData - Contact data
   * @returns {Promise<Object>} Created contact
   */
  async createContact (contactData) {
    try {
      const contact = Contact.fromRequest(contactData)
      const validation = contact.validate()

      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Check if email already exists
      const existingContact = await this.getContactByEmail(contact.email)
      if (existingContact) {
        throw new Error('Email already exists')
      }

      const newContact = await this.db.addContact(contact.name, contact.email)
      return Contact.fromDatabase(newContact).toJSON()
    } catch (error) {
      console.error('Service: Error creating contact:', error)
      throw error
    }
  }

  /**
   * Delete a contact
   * @param {string} id - Contact ID
   * @returns {Promise<boolean>} True if deleted, false if not found
   */
  async deleteContact (id) {
    try {
      return await this.db.deleteContact(id)
    } catch (error) {
      console.error('Service: Error deleting contact:', error)
      throw error
    }
  }

  /**
   * Search contacts
   * @param {string} query - Search query
   * @returns {Promise<Array>} Array of matching contacts
   */
  async searchContacts (query) {
    try {
      if (!query || query.trim() === '') {
        return await this.getAllContacts()
      }

      const contacts = await this.db.searchContacts(query.trim())
      return contacts.map(contact => Contact.fromDatabase(contact).toJSON())
    } catch (error) {
      console.error('Service: Error searching contacts:', error)
      throw error
    }
  }

  /**
   * Get contact count
   * @returns {Promise<number>} Total number of contacts
   */
  async getContactCount () {
    try {
      return await this.db.getContactCount()
    } catch (error) {
      console.error('Service: Error getting contact count:', error)
      throw error
    }
  }

  /**
   * Close database connection
   */
  async close () {
    await this.db.close()
  }
}

module.exports = ContactService
