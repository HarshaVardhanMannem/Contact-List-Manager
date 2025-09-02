// Import React for component creation
import React from 'react'
import ContactItem from './ContactItem'

/**
 * ContactList Component
 * Renders a list of contacts with conditional states
 * Handles loading state, empty state, and populated contact list
 * Maps through contacts and renders individual ContactItem components
 *
 * @param {Array} filteredContacts - Array of contact objects to display
 * @param {boolean} loading - Loading state indicator
 * @param {Function} deleteContact - Function to handle contact deletion
 * @returns {JSX.Element} Contact list component with appropriate state
 */
function ContactList ({ filteredContacts, loading, deleteContact }) {
  // Show loading message while fetching contacts
  if (loading) {
    return <div className='loading'>Loading contacts...</div>
  }

  // Show message when no contacts are found
  if (filteredContacts.length === 0) {
    return <div className='no-contacts'>No contacts found</div>
  }

  // Render list of contact items
  return (
    <>
      {filteredContacts.map(contact => (
        <ContactItem
          key={contact._id} // Unique key for React list rendering
          contact={contact} // Pass individual contact data
          deleteContact={deleteContact} // Pass delete function
        />
      ))}
    </>
  )
}

export default ContactList
