// Import React for component creation
import React, { useState, useEffect } from 'react'

/**
 * ContactForm Component
 * Renders a form for adding new contacts to the database
 *
 * @param {string} name - Current name input value
 * @param {Function} setName - Function to update name state
 * @param {string} email - Current email input value
 * @param {Function} setEmail - Function to update email state
 * @param {Function} addContact - Function to handle form submission
 * @param {React.RefObject} nameInput - Ref for the name input field
 * @param {React.RefObject} emailInput - Ref for the email input field
 * @param {Function} handleEmailKeyPress - Function to handle Enter key press in email field
 * @returns {JSX.Element} Form component for adding contacts
 */
function ContactForm ({ name, setName, email, setEmail, addContact, nameInput, emailInput, handleEmailKeyPress }) {
  // State for name validation
  const [nameError, setNameError] = useState('')
  const [isNameValid, setIsNameValid] = useState(true)

  // Validate name whenever it changes
  useEffect(() => {
    if (name.trim() === '') {
      setNameError('')
      setIsNameValid(true)
    } else {
      const nameRegex = /^[a-zA-Z\s]+$/
      if (!nameRegex.test(name.trim())) {
        setNameError('Name should only contain letters and spaces. Numbers and symbols are not allowed.')
        setIsNameValid(false)
      } else {
        setNameError('')
        setIsNameValid(true)
      }
    }
  }, [name])
  return (
    <div className='form-section'>
      <div className='form-row'>
        {/* Name Input Field */}
        <div className='form-group'>
          <label htmlFor='name'>Name:</label>
          <input
            type='text'
            id='name'
            placeholder='Enter contact name'
            value={name}
            onChange={e => setName(e.target.value)} // Update name state on input change
            ref={nameInput} // Ref for programmatic focus
            className={name.trim() && !isNameValid ? 'error' : ''} // Add error styling
          />
          {nameError && <div className='error-message'>{nameError}</div>}
        </div>

        {/* Email Input Field */}
        <div className='form-group'>
          <label htmlFor='email'>Email:</label>
          <input
            type='email'
            id='email'
            placeholder='Enter email address'
            value={email}
            onChange={e => setEmail(e.target.value)} // Update email state on input change
            onKeyPress={handleEmailKeyPress} // Handle Enter key press for form submission
            ref={emailInput} // Ref for programmatic focus
          />
        </div>
      </div>

      {/* Submit Button */}
      <button onClick={addContact}>
        Add Contact
      </button>
    </div>
  )
}

export default ContactForm
