import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './style.css';

// Nunca aceitar ou armazenar tokens em fragmentos de URL (ex.: confirmacao de e-mail).
if (window.location.hash && /(?:access_token|refresh_token|provider_token)=/.test(window.location.hash)) {
  window.history.replaceState({}, '', window.location.pathname + window.location.search);
}
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter><AuthProvider><App /></AuthProvider></BrowserRouter>
  </React.StrictMode>
);
