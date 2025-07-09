// Import React for component creation
import React from 'react';

/**
 * Message Component
 * Displays user feedback messages (success/error notifications)
 * Conditionally renders based on message presence
 * Applies different CSS classes based on message type
 * 
 * @param {string} message - Message text to display
 * @param {string} messageType - Type of message: 'success' or 'error'
 * @returns {JSX.Element|null} Message component or null if no message
 */
function Message({ message, messageType }) {
  // Don't render anything if no message is provided
  if (!message) return null;
  
  // Render message with appropriate CSS class based on type
  return <div className={`message ${messageType}`}>{message}</div>;
}

export default Message; 