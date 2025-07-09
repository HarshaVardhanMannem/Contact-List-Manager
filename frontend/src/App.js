// Import React hooks and components
// useState: For managing component state
// useEffect: For side effects like API calls and timers
// useRef: For direct DOM element access
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ContactForm from './components/ContactForm';
import SearchBox from './components/SearchBox';
import Message from './components/Message';
import ContactList from './components/ContactList';

// API base URL for backend communication
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Main App Component
 * Manages the Contact Manager application state and coordinates between components
 * Handles all API interactions and user interactions
 */
function App() {
  // --- STATE MANAGEMENT ---
  
  // Store all contacts from the database
  const [allContacts, setAllContacts] = useState([]);
  // Form input states for adding new contacts
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  // Search functionality state
  const [searchTerm, setSearchTerm] = useState('');
  // Message display states for user feedback
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
  // Loading state for API operations
  const [loading, setLoading] = useState(false);
  // Filtered contacts based on search term
  const [filteredContacts, setFilteredContacts] = useState([]);
  
  // Refs for direct access to form input elements
  const nameInput = useRef(null);
  const emailInput = useRef(null);

  // --- LIFECYCLE EFFECTS ---

  /**
   * Load contacts when component mounts
   * Fetches all contacts from the API on initial load
   */
  useEffect(() => {
    loadContacts();
  }, []);

  /**
   * Auto-hide messages after 3 seconds
   * Clears the message state to hide notification
   */
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer); // Cleanup timer on unmount
    }
  }, [message]);

  // --- UTILITY FUNCTIONS ---

  /**
   * Display a message to the user
   * @param {string} text - Message text to display
   * @param {string} type - Message type: 'success' or 'error'
   */
  const showMessage = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
  };

  // --- API INTERACTIONS ---

  /**
   * Load all contacts from the API
   * Updates the allContacts state with fetched data
   * Handles loading states and error messages
   */
  const loadContacts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`);
      const data = await response.json();
      if (data.success) {
        setAllContacts(data.data);
      } else {
        showMessage('Failed to load contacts', 'error');
      }
    } catch (error) {
      showMessage('Unable to connect to server. Please ensure the API is running on port 3001.', 'error');
    }
    setLoading(false);
  };

  /**
   * Add a new contact to the database
   * Validates input fields before submission
   * Handles duplicate email errors and success feedback
   */
  const addContact = async () => {
    // Validate that both name and email are provided
    if (!name.trim() || !email.trim()) {
      showMessage('Please fill in both name and email', 'error');
      return;
    }
    
    // Validate email format using regex
    if (!/\S+@\S+\.\S+/.test(email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      
      if (data.success) {
        // Clear form fields on successful addition
        setName('');
        setEmail('');
        showMessage('Contact added successfully!');
        loadContacts(); // Refresh the contact list
        if (nameInput.current) nameInput.current.focus(); // Focus back to name input
      } else {
        // Handle specific error cases
        if (response.status === 409) {
          showMessage('A contact with this email already exists', 'error');
        } else {
          showMessage(data.message || 'Failed to add contact', 'error');
        }
      }
    } catch (error) {
      showMessage('Failed to add contact. Please try again.', 'error');
    }
  };

  /**
   * Delete a contact from the database
   * Shows confirmation dialog before deletion
   * @param {string} id - MongoDB ObjectId of the contact to delete
   */
  const deleteContact = async (id) => {
    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (data.success) {
        showMessage('Contact deleted successfully!');
        loadContacts(); // Refresh the contact list
      } else {
        showMessage(data.message || 'Failed to delete contact', 'error');
      }
    } catch (error) {
      showMessage('Failed to delete contact. Please try again.', 'error');
    }
  };

  /**
   * Search contacts by name or email
   * Makes API call to search endpoint with query parameter
   * @param {string} term - Search term to look for in contacts
   */
  const searchContacts = async (term) => {
    setSearchTerm(term);
    
    // If search term is empty, show all contacts
    if (!term.trim()) {
      setFilteredContacts(allContacts);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/search?q=${encodeURIComponent(term)}`);
      const data = await response.json();
      
      if (data.success) {
        setFilteredContacts(data.data);
      } else {
        showMessage('Search failed. Please try again.', 'error');
      }
    } catch (error) {
      showMessage('Search failed. Please try again.', 'error');
    }
  };

  // --- SYNC EFFECTS ---

  /**
   * Keep filtered contacts in sync with all contacts and search term
   * Updates filtered contacts when all contacts change or search term is cleared
   */
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredContacts(allContacts);
    }
  }, [allContacts, searchTerm]);

  // --- EVENT HANDLERS ---

  /**
   * Handle Enter key press in email input
   * Allows users to add contact by pressing Enter in email field
   * @param {Event} e - Keyboard event
   */
  const handleEmailKeyPress = (e) => {
    if (e.key === 'Enter') {
      addContact();
    }
  };

  // --- RENDER ---

  return (
    <div className="container">
      <h1>Contact Manager</h1>
      
      {/* Contact Form Component */}
      <ContactForm
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        addContact={addContact}
        nameInput={nameInput}
        emailInput={emailInput}
        handleEmailKeyPress={handleEmailKeyPress}
      />
      
      {/* Search Box Component */}
      <SearchBox searchTerm={searchTerm} searchContacts={searchContacts} />
      
      {/* Message Display Component */}
      <Message message={message} messageType={messageType} />
      
      {/* Contact Count Display */}
      <div className="contacts-count">
        Contacts: <span id="contactCount">{filteredContacts.length}</span>
      </div>
      
      {/* Contact List Component */}
      <div id="contactsList">
        <ContactList
          filteredContacts={filteredContacts}
          loading={loading}
          deleteContact={deleteContact}
        />
      </div>
    </div>
  );
}

export default App; 