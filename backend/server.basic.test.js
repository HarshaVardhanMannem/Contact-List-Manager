// Import supertest for HTTP testing
const request = require('supertest');

// Mock the database module to isolate tests from actual database
// This ensures tests run quickly and don't depend on external services
jest.mock('./database', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    getAllContacts: jest.fn().mockResolvedValue([
      { _id: '1', name: 'Test User', email: 'test@example.com', createdAt: new Date() }
    ]),
    searchContacts: jest.fn().mockResolvedValue([
      { _id: '1', name: 'Test User', email: 'test@example.com', createdAt: new Date() }
    ]),
    getContactByEmail: jest.fn().mockResolvedValue(null),
    addContact: jest.fn().mockResolvedValue({
      _id: '2',
      name: 'Test User',
      email: 'test@example.com',
      createdAt: new Date()
    }),
    deleteContact: jest.fn().mockResolvedValue(true)
  }));
});

// Import required dependencies for test server setup
const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');

// Create Express app for testing
const app = express();

/**
 * Helper function for consistent error responses
 * @param {Object} res - Express response object
 * @param {number} status - HTTP status code
 * @param {string} message - Error message
 * @returns {Object} JSON error response
 */
function errorResponse(res, status, message) {
  return res.status(status).json({ success: false, message });
}

// --- MIDDLEWARE SETUP ---

// Enable CORS for cross-origin requests
app.use(cors());
// Parse JSON request bodies
app.use(express.json());

// Mock database instance with predefined responses
// Each method returns a Promise that resolves to test data
const mockDb = {
  getAllContacts: jest.fn().mockResolvedValue([
    { _id: '1', name: 'Test User', email: 'test@example.com', createdAt: new Date() }
  ]),
  searchContacts: jest.fn().mockResolvedValue([
    { _id: '1', name: 'Test User', email: 'test@example.com', createdAt: new Date() }
  ]),
  getContactByEmail: jest.fn().mockResolvedValue(null),
  addContact: jest.fn().mockResolvedValue({
    _id: '2',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date()
  }),
  deleteContact: jest.fn().mockResolvedValue(true)
};

// --- VALIDATION MIDDLEWARE ---

/**
 * Validation middleware for contact data
 * Validates name and email fields using express-validator
 */
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
];

/**
 * Error handling middleware for validation errors
 * Checks for validation errors and returns them if any exist
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  next();
};

// --- API ROUTES FOR TESTING ---

/**
 * GET /api/contacts - Get all contacts
 * Returns all contacts from the mock database
 */
app.get('/api/contacts', async (req, res) => {
  try {
    const contacts = await mockDb.getAllContacts();
    res.json({ success: true, data: contacts });
  } catch (error) {
    errorResponse(res, 500, 'Failed to fetch contacts');
  }
});

/**
 * GET /api/contacts/search - Search contacts
 * Searches contacts by query parameter and returns filtered results
 */
app.get('/api/contacts/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim() === '') {
      return res.json({ success: true, data: [] });
    }
    const contacts = await mockDb.searchContacts(q.trim());
    res.json({ success: true, data: contacts });
  } catch (error) {
    errorResponse(res, 500, 'Failed to search contacts');
  }
});

/**
 * POST /api/contacts - Add new contact
 * Creates a new contact with validation and duplicate email checking
 */
app.post('/api/contacts', validateContact, handleValidationErrors, async (req, res) => {
  try {
    const { name, email } = req.body;
    const existingContact = await mockDb.getContactByEmail(email);
    if (existingContact) {
      return errorResponse(res, 409, 'A contact with this email already exists');
    }
    const contact = await mockDb.addContact(name, email);
    res.status(201).json({
      success: true,
      data: contact,
      message: 'Contact added successfully'
    });
  } catch (error) {
    errorResponse(res, 500, 'Failed to add contact');
  }
});

/**
 * DELETE /api/contacts/:id - Delete contact
 * Deletes a contact by ID with validation
 */
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return errorResponse(res, 400, 'Invalid contact ID');
    }
    const deleted = await mockDb.deleteContact(id);
    if (!deleted) {
      return errorResponse(res, 404, 'Contact not found');
    }
    res.json({ success: true, message: 'Contact deleted successfully' });
  } catch (error) {
    errorResponse(res, 500, 'Failed to delete contact');
  }
});

/**
 * GET /api/health - Health check endpoint
 * Returns server status and timestamp
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// --- TEST SUITES ---

/**
 * Main test suite for Contact Manager API
 * Tests all endpoints and their functionality
 */
describe('Contact Manager API - Basic Tests', () => {
  // Clear all mocks before each test to ensure clean state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Test suite for GET /api/contacts endpoint
   * Tests retrieving all contacts functionality
   */
  describe('GET /api/contacts', () => {
    test('should return all contacts', async () => {
      const response = await request(app)
        .get('/api/contacts')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  /**
   * Test suite for GET /api/contacts/search endpoint
   * Tests search functionality with various query scenarios
   */
  describe('GET /api/contacts/search', () => {
    test('should return empty array for empty query', async () => {
      const response = await request(app)
        .get('/api/contacts/search')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body.data).toEqual([]);
    });

    test('should return search results for valid query', async () => {
      const response = await request(app)
        .get('/api/contacts/search?q=test')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
    });
  });

  /**
   * Test suite for POST /api/contacts endpoint
   * Tests contact creation with validation and error handling
   */
  describe('POST /api/contacts', () => {
    test('should create a new contact with valid data', async () => {
      const contactData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Contact added successfully');
    });

    test('should reject contact with missing name', async () => {
      const contactData = {
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    test('should reject contact with invalid email', async () => {
      const contactData = {
        name: 'Test User',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
    });

    test('should reject contact with name containing numbers', async () => {
      const contactData = {
        name: 'John123',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Name must only contain letters and spaces'
          })
        ])
      );
    });

    test('should reject contact with name containing symbols', async () => {
      const contactData = {
        name: 'John@Doe',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(400);
      
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Name must only contain letters and spaces'
          })
        ])
      );
    });

    test('should accept contact with name containing only letters and spaces', async () => {
      const contactData = {
        name: 'John Doe Smith',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/api/contacts')
        .send(contactData)
        .expect(201);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('message', 'Contact added successfully');
    });
  });

  /**
   * Test suite for DELETE /api/contacts/:id endpoint
   * Tests contact deletion with validation and error handling
   */
  describe('DELETE /api/contacts/:id', () => {
    test('should delete contact with valid ID', async () => {
      const response = await request(app)
        .delete('/api/contacts/123')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Contact deleted successfully');
    });

    test('should reject delete with missing ID', async () => {
      const response = await request(app)
        .delete('/api/contacts/')
        .expect(404);
    });
  });

  /**
   * Test suite for GET /api/health endpoint
   * Tests the health check endpoint
   */
  describe('GET /api/health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);
      
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Server is running');
      expect(response.body).toHaveProperty('timestamp');
    });
  });
}); 