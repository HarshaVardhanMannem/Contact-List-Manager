import React from 'react';

function ContactForm({ name, setName, email, setEmail, addContact, nameInput, emailInput, handleEmailKeyPress }) {
  return (
    <div className="form-section">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            placeholder="Enter contact name"
            value={name}
            onChange={e => setName(e.target.value)}
            ref={nameInput}
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Enter email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyPress={handleEmailKeyPress}
            ref={emailInput}
          />
        </div>
      </div>
      <button onClick={addContact}>Add Contact</button>
    </div>
  );
}

export default ContactForm; 