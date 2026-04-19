import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

// User needs to define VITE_GOOGLE_CLIENT_ID in .env
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '801109658627-nfulahhusauadk0ihkrh82onm6ccdqik.apps.googleusercontent.com';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
