// Import React and ReactDOM for application setup
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css';

// Create root element for React 18 concurrent features
// Uses the 'root' element from public/index.html
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the main App component
// Wrapped in StrictMode for development warnings and checks
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);