import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Simple test component
function TestApp() {
  return (
    <div style={{ padding: '50px', fontFamily: 'Arial' }}>
      <h1 style={{ color: '#ef4444' }}>🎉 React is Working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
