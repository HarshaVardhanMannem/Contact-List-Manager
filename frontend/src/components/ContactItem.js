// Import React for component creation
import React from 'react'

/**
 * ContactItem Component
 * Renders a single contact with name, email, creation date, and delete button
 * Formats the creation date for display
 * Provides delete functionality for individual contacts
 *
 * @param {Object} contact - Contact object containing _id, name, email, createdAt
 * @param {Function} deleteContact - Function to handle contact deletion
 * @returns {JSX.Element} Individual contact item component
 */
function ContactItem ({ contact, deleteContact }) {
  // Format the creation date for display
  // Converts MongoDB date to readable format: "Jan 15, 2024, 02:30 PM"
  const date = new Date(contact.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className='contact-item'>
      {/* Contact Information Section */}
      <div className='contact-info'>
        {/* Contact Name */}
        <h3>{contact.name}</h3>

        {/* Contact Email with Accessibility Icon */}
        <p>
          <span role='img' aria-label='email'>📧</span> {contact.email}
        </p>

        {/* Creation Date */}
        <small>Added: {date}</small>
      </div>

      {/* Delete Button */}
      <button
        className='btn-delete'
        onClick={() => deleteContact(contact._id)} // Call delete function with contact ID
      >
        Delete
      </button>
    </div>
  )
}

export default ContactItem
