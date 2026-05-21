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
// Clear expired token on startup
// ─────────────────────────────────────────────────────────────
function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (!payload.exp) return false;
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

const storedToken = localStorage.getItem("token");
if (storedToken && isTokenExpired(storedToken)) {
  localStorage.clear();
  sessionStorage.clear();
  const publicPaths = ["/login", "/signup", "/verify", "/reset-password", "/reset-verify"];
  if (!publicPaths.includes(window.location.pathname)) {
    window.location.replace("/login");
  }
}

// ─────────────────────────────────────────────────────────────
// Microsoft MSAL setup
// ─────────────────────────────────────────────────────────────
const msalInstance = new PublicClientApplication(msalConfig);

async function completeMicrosoftLogin(email) {
  console.log("[MSAL] Calling backend with email:", email);
  try {
    const res = await axios.post(`${API}/auth/microsoft`, { email });
    console.log("[MSAL] Backend responded:", res.data);
    localStorage.setItem("token", res.data.token);
    console.log("[MSAL] Token saved, redirecting to /");
    window.location.replace("/");
  } catch (err) {
    console.error("[MSAL] Backend call failed:", err.response?.data || err.message);
    renderApp(); // show login page so user can retry
  }
}

function renderApp() {
  console.log("[APP] Rendering React app");
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    <GoogleOAuthProvider clientId="540183279775-jgg81ormd7mg08bakrjlkrvoau338h2v.apps.googleusercontent.com">
      <MsalProvider instance={msalInstance}>
        <App />
      </MsalProvider>
    </GoogleOAuthProvider>
  );
}

// ─────────────────────────────────────────────────────────────
// Boot sequence
// ─────────────────────────────────────────────────────────────
console.log("[MSAL] Initializing...");

msalInstance.initialize().then(() => {
  console.log("[MSAL] Initialized. Checking for redirect response...");
  console.log("[MSAL] Current URL:", window.location.href);

  // Check if any account is already signed in via MSAL
  const accounts = msalInstance.getAllAccounts();
  console.log("[MSAL] Accounts already in MSAL cache:", accounts.length, accounts.map(a => a.username));

  msalInstance.handleRedirectPromise()
    .then(async (response) => {
      console.log("[MSAL] handleRedirectPromise resolved. Response:", response);

      if (response !== null && response.account) {
        // ✅ Redirect just completed — finish login
        const msEmail = response.account.username;
        console.log("[MSAL] Redirect response found! Email:", msEmail);
        await completeMicrosoftLogin(msEmail);

      } else if (accounts.length > 0 && !localStorage.getItem("token")) {
        // ✅ MSAL has an account cached but we have no app token yet
        // This happens when MSAL caches the account but our backend call failed
        const msEmail = accounts[0].username;
        console.log("[MSAL] Using cached MSAL account:", msEmail);
        await completeMicrosoftLogin(msEmail);

      } else {
        // Normal page load
        console.log("[MSAL] No redirect response. Normal load.");
        renderApp();
      }
    })
    .catch((err) => {
      console.error("[MSAL] handleRedirectPromise error:", err);
      renderApp();
    });

}).catch((err) => {
  console.error("[MSAL] Initialization failed:", err);
  renderApp();
});