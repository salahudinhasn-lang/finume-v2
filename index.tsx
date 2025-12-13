import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (container) {
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error("Failed to mount application:", error);
    container.innerHTML = `<div style="padding: 20px; font-family: sans-serif; text-align: center; color: #333;">
      <h1 style="color: #e11d48;">Something went wrong</h1>
      <p>The application failed to start. Please check the console for more details.</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; background: #0ea5e9; color: white; border: none; border-radius: 5px; cursor: pointer;">Reload Application</button>
    </div>`;
  }
} else {
  console.error("Root element not found in the document.");
}