import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import axios from "axios";

import { GoogleOAuthProvider } from "@react-oauth/google";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";

const API = process.env.REACT_APP_BACKEND_URL;

// ─────────────────────────────────────────────────────────────
// AUTO LOGOUT ON BROWSER CLOSE
// Use sessionStorage instead of localStorage.
// sessionStorage is automatically cleared when the browser tab
// or browser window is closed — no manual logout needed.
//
// Migration: if user has old token in localStorage, move it to
// sessionStorage so they don't get logged out unexpectedly on
// first load after this update.
// ─────────────────────────────────────────────────────────────
const oldToken = localStorage.getItem('token');
if (oldToken) {
  sessionStorage.setItem('token', oldToken);
  localStorage.removeItem('token');  // remove from localStorage
}

// Validate token on startup
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

const storedToken = sessionStorage.getItem('token');
if (storedToken && isTokenExpired(storedToken)) {
  sessionStorage.clear();
  const publicPaths = ['/login', '/signup', '/verify', '/reset-password', '/reset-verify'];
  if (!publicPaths.includes(window.location.pathname)) {
    window.location.replace('/login');
  }
}

// ─────────────────────────────────────────────────────────────
// Microsoft MSAL setup
// ─────────────────────────────────────────────────────────────
const msalInstance = new PublicClientApplication(msalConfig);

async function completeMicrosoftLogin(email) {
  try {
    const res = await axios.post(`${API}/auth/microsoft`, { email });
    // Store in sessionStorage — clears on browser close
    sessionStorage.setItem('token', res.data.token);
    localStorage.removeItem('token');
    window.location.replace('/');
  } catch (err) {
    console.error('[MSAL] Backend login failed:', err);
    renderApp();
  }
}

msalInstance.addEventCallback(async (event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload?.account) {
    await completeMicrosoftLogin(event.payload.account.username);
  }
});

function renderApp() {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <GoogleOAuthProvider clientId="540183279775-jgg81ormd7mg08bakrjlkrvoau338h2v.apps.googleusercontent.com">
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </GoogleOAuthProvider>
  );
}

msalInstance.initialize().then(() => {
  msalInstance.handleRedirectPromise()
    .then(async (response) => {
      if (response && response.account) {
        await completeMicrosoftLogin(response.account.username);
      } else {
        renderApp();
      }
    })
    .catch((err) => {
      console.error('[MSAL] Redirect error:', err);
      renderApp();
    });
});