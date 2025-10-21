/**
 * Contact Model
 * Defines the structure and validation rules for contact data
 */

class Contact {
  constructor (data) {
    this.id = data.id || data._id || null
    this._id = data._id || data.id?.toString() || null
    this.name = data.name || ''
    this.email = data.email || ''
    this.createdAt = data.createdAt || new Date()
  }

  /**
   * Validates contact data
   * @returns {Object} Validation result with isValid boolean and errors array
   */
  validate () {
    const errors = []

    // Name validation
    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required')
    } else if (this.name.length > 50) {
      errors.push('Name must be less than 50 characters')
    } else if (!/^[A-Za-z\s]+$/.test(this.name)) {
      errors.push('Name must only contain letters and spaces')
    }

    // Email validation
    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email is required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('Please provide a valid email address')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Converts contact to JSON format
   * @returns {Object} Contact data as plain object
   */
  toJSON () {
    return {
      _id: this._id || this.id?.toString(),
      name: this.name,
      email: this.email,
      createdAt: this.createdAt
    }
  }

  /**
   * Creates a Contact instance from database row
   * @param {Object} row - Database row data
   * @returns {Contact} Contact instance
   */
  static fromDatabase (row) {
    return new Contact({
      id: row.id,
      _id: row._id,
      name: row.name,
      email: row.email,
      createdAt: new Date(row.created_at || row.createdAt)
    })
  }

  /**
   * Creates a Contact instance from API request data
   * @param {Object} data - Request body data
   * @returns {Contact} Contact instance
   */
  static fromRequest (data) {
    return new Contact({
      name: data.name,
      email: data.email
    })
  }
}

module.exports = Contact
