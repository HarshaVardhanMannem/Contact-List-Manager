// Import React for component creation
import React from 'react'

/**
 * SearchBox Component
 * Renders a search input field for filtering contacts
 * Provides real-time search functionality as user types
 *
 * @param {string} searchTerm - Current search term value
 * @param {Function} searchContacts - Function to handle search input changes
 * @returns {JSX.Element} Search input component
 */
function SearchBox ({ searchTerm, searchContacts }) {
  return (
    <input
      type='text'
      id='searchBox'
      className='search-box'
      placeholder='Search contacts...' // Placeholder text for user guidance
      value={searchTerm} // Controlled input value
      onChange={e => searchContacts(e.target.value)} // Call search function on every keystroke
    />
  )
}

export default SearchBox
