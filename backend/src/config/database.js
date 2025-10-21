// Import required SQLite modules
// Database: Main driver for SQLite operations
const Database = require('better-sqlite3')
const path = require('path')

/**
 * ContactDatabase Class
 * Handles all database operations for the Contact Manager application
 * Provides methods for CRUD operations on contacts table
 */
class ContactDatabase {
  /**
   * Constructor - Initializes database connection parameters
   * Sets up SQLite database file path and database instance
   */
  constructor () {
    // SQLite database file path - creates database in the same directory
    this.dbPath = path.join(__dirname, '../../data/contacts.db')
    // Will hold the database reference after connection
    this.db = null
  }

  /**
   * Establishes connection to SQLite database
   * Enables performance optimizations and creates necessary indexes
   * @throws {Error} If connection fails
   */
  async connect () {
    try {
      // Connect to SQLite database file
      this.db = new Database(this.dbPath)
      
      // Enable performance optimizations
      this.db.pragma('foreign_keys = ON')
      this.db.pragma('journal_mode = WAL')
      this.db.pragma('synchronous = NORMAL')
      this.db.pragma('temp_store = MEMORY')
      this.db.pragma('mmap_size = 30000000000')

      console.log('Connected to SQLite database ...')

      // Verify table exists, if not create it
      await this.ensureTableExists()

      console.log('Database initialized successfully')
    } catch (error) {
      console.error(`Error connecting to database:`, error)
      throw error
    }
  }

  /**
   * Ensures the contacts table exists with proper schema
   * Creates table and indexes if they don't exist
   */
  async ensureTableExists () {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL CHECK(length(name) > 0 AND length(name) <= 50),
        email TEXT NOT NULL UNIQUE CHECK(email LIKE '%_@__%.__%'),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `

    const createIndexesSQL = [
      'CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email)',
      'CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name)',
      'CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC)'
    ]

    try {
      // Create table if it doesn't exist
      this.db.exec(createTableSQL)
      
      // Create indexes if they don't exist
      createIndexesSQL.forEach(sql => {
        this.db.exec(sql)
      })
    } catch (error) {
      console.error('Error ensuring table exists:', error)
      throw error
    }
  }

  /**
   * Retrieves all contacts from the database
   * Returns contacts sorted by creation date (newest first)
   * @returns {Array} Array of contact objects
   * @throws {Error} If database operation fails
   */
  async getAllContacts () {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, email, created_at as createdAt
        FROM contacts 
        ORDER BY created_at DESC
      `)
      
      const contacts = stmt.all()
      
      // Convert SQLite results to match expected format
      return contacts.map(contact => ({
        _id: contact.id.toString(), // Convert to string to match MongoDB ObjectId format
        name: contact.name,
        email: contact.email,
        createdAt: new Date(contact.createdAt)
      }))
    } catch (error) {
      console.error('Error getting all contacts:', error)
      throw error
    }
  }

  /**
   * Finds a contact by their email address
   * @param {string} email - The email address to search for
   * @returns {Object|null} Contact object if found, null otherwise
   * @throws {Error} If database operation fails
   */
  async getContactByEmail (email) {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, email, created_at as createdAt
        FROM contacts 
        WHERE email = ?
      `)
      
      const contact = stmt.get(email)
      
      if (!contact) return null
      
      // Convert SQLite result to match expected format
      return {
        _id: contact.id.toString(),
        name: contact.name,
        email: contact.email,
        createdAt: new Date(contact.createdAt)
      }
    } catch (error) {
      console.error('Error getting contact by email:', error)
      throw error
    }
  }

  /**
   * Finds a contact by their ID
   * @param {string} id - The contact ID as a string
   * @returns {Object|null} Contact object if found, null otherwise
   * @throws {Error} If database operation fails
   */
  async getContactById (id) {
    try {
      const stmt = this.db.prepare(`
        SELECT id, name, email, created_at as createdAt
        FROM contacts 
        WHERE id = ?
      `)
      
      const contact = stmt.get(parseInt(id))
      
      if (!contact) return null
      
      // Convert SQLite result to match expected format
      return {
        _id: contact.id.toString(),
        name: contact.name,
        email: contact.email,
        createdAt: new Date(contact.createdAt)
      }
    } catch (error) {
      console.error('Error getting contact by ID:', error)
      throw error
    }
  }

  /**
   * Adds a new contact to the database
   * @param {string} name - The contact's name
   * @param {string} email - The contact's email address
   * @returns {Object} The newly created contact object with _id
   * @throws {Error} If email already exists or database operation fails
   */
  async addContact (name, email) {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO contacts (name, email, created_at)
        VALUES (?, ?, datetime('now'))
      `)
      
      const result = stmt.run(name, email)
      
      // Get the newly created contact
      const newContact = await this.getContactById(result.lastInsertRowid.toString())
      
      return newContact
    } catch (error) {
      // Handle duplicate email error (SQLite constraint violation)
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new Error('Email already exists')
      }
      console.error('Error adding contact:', error)
      throw error
    }
  }

  /**
   * Deletes a contact from the database by their ID
   * @param {string} id - The contact ID as a string
   * @returns {boolean} True if contact was deleted, false if not found
   * @throws {Error} If database operation fails
   */
  async deleteContact (id) {
    try {
      const stmt = this.db.prepare(`
        DELETE FROM contacts 
        WHERE id = ?
      `)
      
      const result = stmt.run(parseInt(id))
      
      // Return true if a row was deleted, false otherwise
      return result.changes > 0
    } catch (error) {
      console.error('Error deleting contact:', error)
      throw error
    }
  }

  /**
   * Searches for contacts by name or email using case-insensitive LIKE
   * @param {string} query - The search query string
   * @returns {Array} Array of matching contact objects
   * @throws {Error} If database operation fails
   */
  async searchContacts (query) {
    try {
      const searchTerm = `%${query}%`
      const stmt = this.db.prepare(`
        SELECT id, name, email, created_at as createdAt
        FROM contacts 
        WHERE name LIKE ? OR email LIKE ?
        ORDER BY created_at DESC
      `)
      
      const contacts = stmt.all(searchTerm, searchTerm)
      
      // Convert SQLite results to match expected format
      return contacts.map(contact => ({
        _id: contact.id.toString(),
        name: contact.name,
        email: contact.email,
        createdAt: new Date(contact.createdAt)
      }))
    } catch (error) {
      console.error('Error searching contacts:', error)
      throw error
    }
  }

  /**
   * Gets the total count of contacts in the database
   * @returns {number} Total number of contacts
   * @throws {Error} If database operation fails
   */
  async getContactCount () {
    try {
      const stmt = this.db.prepare('SELECT COUNT(*) as count FROM contacts')
      const result = stmt.get()
      return result.count
    } catch (error) {
      console.error('Error getting contact count:', error)
      throw error
    }
  }

  /**
   * Closes the SQLite database connection
   * Should be called when the application shuts down
   */
  async close () {
    if (this.db) {
      this.db.close()
    }
  }
}

// Export the ContactDatabase class for use in other modules
module.exports = ContactDatabase
