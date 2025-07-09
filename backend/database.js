// Import required MongoDB modules
// MongoClient: Main driver for connecting to MongoDB
// ObjectId: Used for creating and working with MongoDB document IDs
const { MongoClient, ObjectId } = require('mongodb');

/**
 * ContactDatabase Class
 * Handles all database operations for the Contact Manager application
 * Provides methods for CRUD operations on contacts collection
 */
class ContactDatabase {
  /**
   * Constructor - Initializes database connection parameters
   * Sets up MongoDB connection URI, database name, and client instance
   */
  constructor() {
    // MongoDB connection URI - connects to local MongoDB instance
    this.uri = "mongodb://127.0.0.1";
    // Name of the database to use
    this.dbName = "Contacts";
    // Create new MongoDB client instance
    this.client = new MongoClient(this.uri);
    // Will hold the database reference after connection
    this.db = null;
    // Will hold the collection reference after connection
    this.collection = null;
  }

  /**
   * Establishes connection to MongoDB database
   * Creates necessary indexes for performance optimization
   * @throws {Error} If connection fails
   */
  async connect() {
    try {
      // Connect to MongoDB server
      await this.client.connect();
      console.log("Connected to MongoDB ...");
      
      // Get database reference
      this.db = this.client.db(this.dbName);
      // Get collection reference for contacts
      this.collection = this.db.collection('contacts');
      
      // Create indexes for better performance
      // Unique index on email to prevent duplicate emails
      await this.collection.createIndex({ email: 1 }, { unique: true });
      // Index on name for faster name-based queries
      await this.collection.createIndex({ name: 1 });
      // Index on createdAt for faster sorting by creation date
      await this.collection.createIndex({ createdAt: -1 });
      
      console.log('Database initialized successfully');
    } catch (error) {
      console.error(`Error connecting to ${this.dbName}:`, error);
      throw error;
    }
  }

  /**
   * Retrieves all contacts from the database
   * Returns contacts sorted by creation date (newest first)
   * @returns {Array} Array of contact objects
   * @throws {Error} If database operation fails
   */
  async getAllContacts() {
    try {
      // Find all documents in contacts collection
      // Sort by createdAt field in descending order (newest first)
      const contacts = await this.collection
        .find({})
        .sort({ createdAt: -1 })
        .toArray();
      return contacts;
    } catch (error) {
      console.error('Error getting all contacts:', error);
      throw error;
    }
  }

  /**
   * Finds a contact by their email address
   * @param {string} email - The email address to search for
   * @returns {Object|null} Contact object if found, null otherwise
   * @throws {Error} If database operation fails
   */
  async getContactByEmail(email) {
    try {
      // Find one document where email matches the provided email
      const contact = await this.collection.findOne({ email: email });
      return contact;
    } catch (error) {
      console.error('Error getting contact by email:', error);
      throw error;
    }
  }

  /**
   * Finds a contact by their MongoDB ObjectId
   * @param {string} id - The MongoDB ObjectId as a string
   * @returns {Object|null} Contact object if found, null otherwise
   * @throws {Error} If database operation fails
   */
  async getContactById(id) {
    try {
      // Convert string ID to MongoDB ObjectId and find the document
      const contact = await this.collection.findOne({ _id: new ObjectId(id) });
      return contact;
    } catch (error) {
      console.error('Error getting contact by ID:', error);
      throw error;
    }
  }

  /**
   * Adds a new contact to the database
   * @param {string} name - The contact's name
   * @param {string} email - The contact's email address
   * @returns {Object} The newly created contact object with _id
   * @throws {Error} If email already exists or database operation fails
   */
  async addContact(name, email) {
    try {
      // Create contact object with current timestamp
      const contact = {
        name: name,
        email: email,
        createdAt: new Date() // Automatically set creation timestamp
      };
      
      // Insert the contact into the database
      const result = await this.collection.insertOne(contact);
      
      // Return the newly created contact with the generated _id
      return {
        _id: result.insertedId, // MongoDB-generated unique ID
        ...contact
      };
    } catch (error) {
      // Handle duplicate email error (MongoDB error code 11000)
      if (error.code === 11000) {
        throw new Error('Email already exists');
      }
      console.error('Error adding contact:', error);
      throw error;
    }
  }

  /**
   * Deletes a contact from the database by their ID
   * @param {string} id - The MongoDB ObjectId as a string
   * @returns {boolean} True if contact was deleted, false if not found
   * @throws {Error} If database operation fails
   */
  async deleteContact(id) {
    try {
      // Delete one document where _id matches the provided ObjectId
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      // Return true if a document was deleted, false otherwise
      return result.deletedCount > 0;
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }

  /**
   * Searches for contacts by name or email using case-insensitive regex
   * @param {string} query - The search query string
   * @returns {Array} Array of matching contact objects
   * @throws {Error} If database operation fails
   */
  async searchContacts(query) {
    try {
      // Find documents where name OR email matches the query
      // $regex: Uses regular expression for pattern matching
      // $options: 'i' makes the search case-insensitive
      const contacts = await this.collection
        .find({
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        })
        .sort({ createdAt: -1 }) // Sort by creation date (newest first)
        .toArray();
      
      return contacts;
    } catch (error) {
      console.error('Error searching contacts:', error);
      throw error;
    }
  }

  /**
   * Gets the total count of contacts in the database
   * @returns {number} Total number of contacts
   * @throws {Error} If database operation fails
   */
  async getContactCount() {
    try {
      // Count all documents in the contacts collection
      const count = await this.collection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error getting contact count:', error);
      throw error;
    }
  }

  /**
   * Closes the MongoDB connection
   * Should be called when the application shuts down
   */
  async close() {
    await this.client.close();
  }
}

// Export the ContactDatabase class for use in other modules
module.exports = ContactDatabase;