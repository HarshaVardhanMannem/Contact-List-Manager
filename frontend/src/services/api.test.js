// Import API service functions to test
import { fetchContacts, searchContacts, addContact, deleteContact } from './api';

// Mock fetch globally to intercept HTTP requests during testing
// This allows testing API functions without making real network calls
global.fetch = jest.fn();

/**
 * Test suite for API Service functions
 * Tests all API endpoints and their error handling
 */
describe('API Service - Unit Tests', () => {
  // Clear fetch mock before each test to ensure clean state
  beforeEach(() => {
    fetch.mockClear();
  });

  /**
   * Test suite for fetchContacts function
   * Tests retrieving all contacts from the API
   */
  describe('fetchContacts', () => {
    test('fetches contacts successfully', async () => {
      // Mock contact data for testing
      const mockContacts = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' }
      ];
      
      // Mock successful API response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockContacts })
      });

      // Call the function and verify result
      const result = await fetchContacts();

      // Verify correct API endpoint was called
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/contacts');
      // Verify response data structure
      expect(result).toEqual({ success: true, data: mockContacts });
    });

    test('handles fetch error', async () => {
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Verify error is properly thrown
      await expect(fetchContacts()).rejects.toThrow('Network error');
      // Verify API endpoint was still called
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/contacts');
    });

    test('handles non-json response', async () => {
      // Mock invalid JSON response
      fetch.mockResolvedValueOnce({
        json: () => Promise.reject(new Error('Invalid JSON'))
      });

      // Verify JSON parsing error is handled
      await expect(fetchContacts()).rejects.toThrow('Invalid JSON');
    });
  });

  /**
   * Test suite for searchContacts function
   * Tests searching contacts with various query scenarios
   */
  describe('searchContacts', () => {
    test('searches contacts with query parameter', async () => {
      // Mock search results
      const mockResults = [
        { _id: '1', name: 'John Doe', email: 'john@example.com' }
      ];
      
      // Mock successful search response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockResults })
      });

      // Call search function
      const result = await searchContacts('john');

      // Verify correct search endpoint with query parameter
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/contacts/search?q=john');
      // Verify response structure
      expect(result).toEqual({ success: true, data: mockResults });
    });

    test('encodes special characters in query', async () => {
      // Mock empty search response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: [] })
      });

      // Search with email containing special characters
      await searchContacts('john@example.com');

      // Verify special characters are properly URL encoded
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/contacts/search?q=john%40example.com');
    });

    test('handles empty query', async () => {
      // Mock empty search response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: [] })
      });

      // Search with empty string
      await searchContacts('');

      // Verify empty query is handled correctly
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/contacts/search?q=');
    });

    test('handles query with spaces', async () => {
      // Mock empty search response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: [] })
      });

      // Search with name containing spaces
      await searchContacts('john doe');

      // Verify spaces are properly URL encoded
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/contacts/search?q=john%20doe');
    });

    test('handles fetch error for search', async () => {
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Verify search error is properly handled
      await expect(searchContacts('test')).rejects.toThrow('Network error');
    });
  });

  /**
   * Test suite for addContact function
   * Tests adding new contacts with various scenarios
   */
  describe('addContact', () => {
    test('adds contact successfully', async () => {
      // Mock contact data
      const newContact = { name: 'John Doe', email: 'john@example.com' };
      const mockResponse = {
        _id: '1',
        ...newContact,
        createdAt: '2023-01-01T00:00:00.000Z'
      };
      
      // Mock successful contact creation
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: mockResponse })
      });

      // Call add contact function
      const result = await addContact('John Doe', 'john@example.com');

      // Verify correct POST request with proper headers and body
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      });
      // Verify response structure
      expect(result).toEqual({ success: true, data: mockResponse });
    });

    test('handles duplicate email error', async () => {
      // Mock duplicate email error response
      fetch.mockResolvedValueOnce({
        status: 409,
        json: () => Promise.resolve({ 
          success: false, 
          message: 'A contact with this email already exists' 
        })
      });

      // Call add contact function
      const result = await addContact('John Doe', 'john@example.com');

      // Verify error response is properly handled
      expect(result).toEqual({
        success: false,
        message: 'A contact with this email already exists'
      });
    });

    test('handles validation error', async () => {
      // Mock validation error response
      fetch.mockResolvedValueOnce({
        status: 400,
        json: () => Promise.resolve({
          success: false,
          errors: [{ msg: 'Name must be between 1 and 50 characters' }]
        })
      });

      // Call add contact with invalid data
      const result = await addContact('', 'invalid-email');

      // Verify validation error is properly handled
      expect(result).toEqual({
        success: false,
        errors: [{ msg: 'Name must be between 1 and 50 characters' }]
      });
    });

    test('handles network error', async () => {
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Verify network error is properly thrown
      await expect(addContact('John Doe', 'john@example.com')).rejects.toThrow('Network error');
    });

    test('sends correct JSON payload', async () => {
      // Mock successful response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, data: {} })
      });

      // Call add contact function
      await addContact('John Doe', 'john@example.com');

      // Verify request body contains correct JSON data
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' })
      });
    });
  });

  /**
   * Test suite for deleteContact function
   * Tests deleting contacts with various scenarios
   */
  describe('deleteContact', () => {
    test('deletes contact successfully', async () => {
      // Mock successful deletion response
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true, message: 'Contact deleted successfully' })
      });

      // Call delete contact function
      const result = await deleteContact('123');

      // Verify correct DELETE request to proper endpoint
      expect(fetch).toHaveBeenCalledWith('http://localhost:3001/api/contacts/123', {
        method: 'DELETE'
      });
      // Verify success response
      expect(result).toEqual({ success: true, message: 'Contact deleted successfully' });
    });

    test('handles contact not found error', async () => {
      // Mock contact not found error
      fetch.mockResolvedValueOnce({
        status: 404,
        json: () => Promise.resolve({
          success: false,
          message: 'Contact not found'
        })
      });

      // Call delete with non-existent contact ID
      const result = await deleteContact('nonexistent');

      // Verify error response is properly handled
      expect(result).toEqual({
        success: false,
        message: 'Contact not found'
      });
    });

    test('handles invalid ID error', async () => {
      // Mock invalid ID error response
      fetch.mockResolvedValueOnce({
        status: 400,
        json: () => Promise.resolve({
          success: false,
          message: 'Invalid contact ID'
        })
      });

      // Call delete with invalid ID
      const result = await deleteContact('invalid-id');

      // Verify error response is properly handled
      expect(result).toEqual({
        success: false,
        message: 'Invalid contact ID'
      });
    });

    test('handles network error', async () => {
      // Mock network error
      fetch.mockRejectedValueOnce(new Error('Network error'));

      // Verify network error is properly thrown
      await expect(deleteContact('123')).rejects.toThrow('Network error');
    });

    test('sends DELETE request with correct URL', async () => {
      // Mock successful response for delete
      fetch.mockResolvedValueOnce({
        json: () => Promise.resolve({ success: true })
      });

      // Call delete contact function
      await deleteContact('507f1f77bcf86cd799439011');

      // Verify correct DELETE request URL
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/contacts/507f1f77bcf86cd799439011',
        { method: 'DELETE' }
      );
    });
  });

  describe('Error Handling', () => {
    test('handles malformed JSON response', async () => {
      fetch.mockResolvedValueOnce({
        json: () => Promise.reject(new Error('Unexpected token'))
      });

      await expect(fetchContacts()).rejects.toThrow('Unexpected token');
    });

    test('handles timeout scenarios', async () => {
      fetch.mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 100)
        )
      );

      await expect(fetchContacts()).rejects.toThrow('Request timeout');
    });

    test('handles server error responses', async () => {
      fetch.mockResolvedValueOnce({
        status: 500,
        json: () => Promise.resolve({
          success: false,
          message: 'Internal server error'
        })
      });

      const result = await fetchContacts();

      expect(result).toEqual({
        success: false,
        message: 'Internal server error'
      });
    });
  });

  describe('URL Construction', () => {
    test('uses correct base URL for all endpoints', () => {
      fetch.mockResolvedValue({
        json: () => Promise.resolve({ success: true, data: [] })
      });

      // Test all endpoints use the same base URL
      const baseUrl = 'http://localhost:3001/api';
      
      fetchContacts();
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/contacts`);
      
      searchContacts('test');
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/contacts/search?q=test`);
      
      addContact('John', 'john@example.com');
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/contacts`, expect.any(Object));
      
      deleteContact('123');
      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/contacts/123`, expect.any(Object));
    });
  });
}); 