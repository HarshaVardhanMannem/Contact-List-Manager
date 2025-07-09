// API base URL for backend communication
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Fetch all contacts from the API
 * Makes GET request to /api/contacts endpoint
 * @returns {Promise<Object>} JSON response with contacts data
 */
export async function fetchContacts() {
  const res = await fetch(`${API_BASE_URL}/contacts`);
  return res.json();
}

/**
 * Search contacts by name or email
 * Makes GET request to /api/contacts/search endpoint with query parameter
 * @param {string} q - Search query term
 * @returns {Promise<Object>} JSON response with filtered contacts
 */
export async function searchContacts(q) {
  const res = await fetch(`${API_BASE_URL}/contacts/search?q=${encodeURIComponent(q)}`);
  return res.json();
}

/**
 * Add a new contact to the database
 * Makes POST request to /api/contacts endpoint with contact data
 * @param {string} name - Contact name
 * @param {string} email - Contact email address
 * @returns {Promise<Object>} JSON response with created contact data
 */
export async function addContact(name, email) {
  const res = await fetch(`${API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });
  return res.json();
}

/**
 * Delete a contact by ID
 * Makes DELETE request to /api/contacts/:id endpoint
 * @param {string} id - MongoDB ObjectId of the contact to delete
 * @returns {Promise<Object>} JSON response with deletion status
 */
export async function deleteContact(id) {
  const res = await fetch(`${API_BASE_URL}/contacts/${id}`, { method: 'DELETE' });
  return res.json();
} 