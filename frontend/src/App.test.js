// Import React Testing Library utilities for component testing
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
// Import Jest DOM matchers for additional assertions
import '@testing-library/jest-dom'
import App from './App'

// Mock fetch globally to intercept API calls during testing
// This allows us to test API interactions without making real network requests
global.fetch = jest.fn()

/**
 * Main test suite for Contact Manager App
 * Tests all major functionality including rendering, API integration, and user interactions
 */
describe('Contact Manager App - Complete Tests', () => {
  // Clear fetch mock before each test to ensure clean state
  beforeEach(() => {
    fetch.mockClear()
  })

  /**
   * Test suite for basic rendering functionality
   * Ensures all UI elements are properly displayed
   */
  describe('Basic Rendering', () => {
    test('renders main application elements', async () => {
      // Mock fetch to return empty data for initial load
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      // Render the App component
      await act(async () => {
        render(<App />)
      })

      // Check main title is displayed
      expect(screen.getByText('Contact Manager')).toBeInTheDocument()

      // Check form elements are present
      expect(screen.getByLabelText('Name:')).toBeInTheDocument()
      expect(screen.getByLabelText('Email:')).toBeInTheDocument()
      expect(screen.getByText('Add Contact')).toBeInTheDocument()

      // Check search functionality is available
      expect(screen.getByPlaceholderText('Search contacts...')).toBeInTheDocument()

      // Check contacts count display
      expect(screen.getByText('Contacts:')).toBeInTheDocument()
    })

    test('renders empty state when no contacts', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      // Wait for loading to complete and verify empty state message
      await waitFor(() => {
        expect(screen.getByText('No contacts found')).toBeInTheDocument()
      })
    })

    test('form inputs are present and accessible', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      // Get form input elements
      const nameInput = screen.getByLabelText('Name:')
      const emailInput = screen.getByLabelText('Email:')

      // Verify input attributes and accessibility
      expect(nameInput).toHaveAttribute('type', 'text')
      expect(nameInput).toHaveAttribute('placeholder', 'Enter contact name')
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('placeholder', 'Enter email address')
    })

    test('search functionality is present', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      // Verify search box is present with correct attributes
      const searchBox = screen.getByPlaceholderText('Search contacts...')
      expect(searchBox).toHaveAttribute('type', 'text')
      expect(searchBox).toHaveClass('search-box')
    })
  })

  /**
   * Test suite for API integration
   * Tests how the app handles API calls, loading states, and responses
   */
  describe('API Integration', () => {
    test('shows loading state when fetching contacts', async () => {
      // Mock fetch with delay to simulate loading state
      fetch.mockImplementationOnce(() =>
        new Promise(resolve => setTimeout(() => resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        }), 100))
      )

      await act(async () => {
        render(<App />)
      })

      // Verify loading message is displayed
      expect(screen.getByText('Loading contacts...')).toBeInTheDocument()
    })

    test('displays contacts when API call succeeds', async () => {
      // Mock contact data
      const mockContacts = [
        { _id: '1', name: 'John Doe', email: 'john@example.com', createdAt: '2023-01-01T00:00:00.000Z' }
      ]

      // Mock successful API response
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: mockContacts })
        })
      )

      await act(async () => {
        render(<App />)
      })

      // Wait for contact to be displayed
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument()
      })

      // Check for email with proper text matching
      expect(screen.getByText(/john@example\.com/)).toBeInTheDocument()
    })

    test('shows error message when API call fails', async () => {
      // Mock API failure
      fetch.mockImplementationOnce(() =>
        Promise.reject(new Error('Network error'))
      )

      await act(async () => {
        render(<App />)
      })

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/Unable to connect to server/)).toBeInTheDocument()
      })
    })
  })

  /**
   * Test suite for form validation
   * Tests input validation, error messages, and form submission
   */
  describe('Form Validation', () => {
    test('shows error for empty fields', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      // Try to submit form without filling fields
      const addButton = screen.getByText('Add Contact')
      await act(async () => {
        fireEvent.click(addButton)
      })

      // Verify validation error message
      expect(screen.getByText('Please fill in both name and email')).toBeInTheDocument()
    })

    test('shows error for invalid email', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      // Get form elements
      const nameInput = screen.getByLabelText('Name:')
      const emailInput = screen.getByLabelText('Email:')
      const addButton = screen.getByText('Add Contact')

      // Fill form with invalid email
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
        fireEvent.click(addButton)
      })

      // Verify email validation error
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument()
    })

    test('shows error for name containing numbers', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      // Get form elements
      const nameInput = screen.getByLabelText('Name:')
      const emailInput = screen.getByLabelText('Email:')
      const addButton = screen.getByText('Add Contact')

      // Fill form with name containing numbers
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John123' } })
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
        fireEvent.click(addButton)
      })

      // Verify name validation error appears in the message area (form submission error)
      const errorMessages = screen.getAllByText('Name should only contain letters and spaces. Numbers and symbols are not allowed.')
      expect(errorMessages).toHaveLength(2) // One in form, one in message area

      // Check that the message area error is present
      const messageAreaError = screen.getByText('Name should only contain letters and spaces. Numbers and symbols are not allowed.', { selector: '.message.error' })
      expect(messageAreaError).toBeInTheDocument()
    })

    test('shows error for name containing symbols', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      // Get form elements
      const nameInput = screen.getByLabelText('Name:')
      const emailInput = screen.getByLabelText('Email:')
      const addButton = screen.getByText('Add Contact')

      // Fill form with name containing symbols
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John@Doe' } })
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
        fireEvent.click(addButton)
      })

      // Verify name validation error appears in the message area (form submission error)
      const errorMessages = screen.getAllByText('Name should only contain letters and spaces. Numbers and symbols are not allowed.')
      expect(errorMessages).toHaveLength(2) // One in form, one in message area

      // Check that the message area error is present
      const messageAreaError = screen.getByText('Name should only contain letters and spaces. Numbers and symbols are not allowed.', { selector: '.message.error' })
      expect(messageAreaError).toBeInTheDocument()
    })

    test('shows real-time validation error for invalid name', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      // Get name input
      const nameInput = screen.getByLabelText('Name:')

      // Type invalid name with numbers
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John123' } })
      })

      // Verify real-time validation error appears in the form
      const formError = screen.getByText('Name should only contain letters and spaces. Numbers and symbols are not allowed.', { selector: '.error-message' })
      expect(formError).toBeInTheDocument()

      // Verify input has error styling
      expect(nameInput).toHaveClass('error')
    })

    test('removes validation error when name becomes valid', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      // Get name input
      const nameInput = screen.getByLabelText('Name:')

      // Type invalid name first
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John123' } })
      })

      // Verify error appears in the form
      const formError = screen.getByText('Name should only contain letters and spaces. Numbers and symbols are not allowed.', { selector: '.error-message' })
      expect(formError).toBeInTheDocument()

      // Change to valid name
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
      })

      // Verify error disappears
      expect(screen.queryByText('Name should only contain letters and spaces. Numbers and symbols are not allowed.')).not.toBeInTheDocument()

      // Verify input no longer has error styling
      expect(nameInput).not.toHaveClass('error')
    })

    test('accepts valid form input', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      const nameInput = screen.getByLabelText('Name:')
      const emailInput = screen.getByLabelText('Email:')

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'John Doe' } })
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
      })

      expect(nameInput).toHaveValue('John Doe')
      expect(emailInput).toHaveValue('john@example.com')
    })
  })

  // User Interaction Tests
  describe('User Interactions', () => {
    test('search input responds to user typing', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      const searchBox = screen.getByPlaceholderText('Search contacts...')

      await act(async () => {
        fireEvent.change(searchBox, { target: { value: 'john' } })
      })

      expect(searchBox).toHaveValue('john')
    })

    test('form can be filled and submitted', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      const nameInput = screen.getByLabelText('Name:')
      const emailInput = screen.getByLabelText('Email:')
      const addButton = screen.getByText('Add Contact')

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Jane Smith' } })
        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } })
        fireEvent.click(addButton)
      })

      // Should not show validation errors for valid input
      expect(screen.queryByText('Please fill in both name and email')).not.toBeInTheDocument()
      expect(screen.queryByText('Please enter a valid email address')).not.toBeInTheDocument()
    })
  })

  // Accessibility Tests
  describe('Accessibility', () => {
    test('has proper form labels', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      const nameInput = screen.getByLabelText('Name:')
      const emailInput = screen.getByLabelText('Email:')

      expect(nameInput).toHaveAttribute('id', 'name')
      expect(emailInput).toHaveAttribute('id', 'email')
    })

    test('has accessible button text', async () => {
      // Mock fetch to return empty data
      fetch.mockImplementationOnce(() =>
        Promise.resolve({
          json: () => Promise.resolve({ success: true, data: [] })
        })
      )

      await act(async () => {
        render(<App />)
      })

      const addButton = screen.getByRole('button')
      expect(addButton).toHaveTextContent('Add Contact')
    })
  })
})
