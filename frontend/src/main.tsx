import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App'; // Assumes App.tsx exists
import { Auth0Provider } from '@auth0/auth0-react';

const container = document.getElementById('root');

if (!container) {
  throw new Error("Root container not found");
}

createRoot(container).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-q42vneml3qho4xpf.us.auth0.com"
      clientId="0cUXfIspLNeFB1n7ChCwemjzdLo9jXSI"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
