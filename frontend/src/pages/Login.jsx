import { useState } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

const API = process.env.REACT_APP_BACKEND_URL;

// Helper — always use sessionStorage so token clears on browser close
const saveToken = (token) => {
  sessionStorage.setItem('token', token);
  localStorage.removeItem('token'); // ensure not in localStorage
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { instance } = useMsal();

  // Normal login
  const login = async () => {
    if (!email || !password) { alert("Please enter email and password"); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${API}/auth/login`, { email, password });
      saveToken(res.data.token);
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  // Google login
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfo = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } });
        const res = await axios.post(`${API}/auth/microsoft`, { email: userInfo.data.email });
        saveToken(res.data.token);
        window.location.href = "/";
      } catch (err) { alert("Google login failed. Please try again."); }
    },
    onError: () => alert("Google Login Failed"),
  });

  // Microsoft login
  const microsoftLogin = () => instance.loginRedirect(loginRequest);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '16px', backgroundColor: '#050505'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px', backgroundColor: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '32px 24px'
      }}>
        <h1 style={{ fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 'bold', color: 'white', textAlign: 'center', letterSpacing: '4px', marginBottom: '24px' }}>
          CYBER <span style={{ color: '#ef4444' }}>SEC</span>
        </h1>

        <input placeholder="Email" type="email" onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()} style={inputStyle} />

        <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          style={{ ...inputStyle, marginBottom: '4px' }} />

        <div style={{ textAlign: 'right', marginBottom: '16px' }}>
          <button onClick={() => window.location.href = '/reset-password'}
            style={{ color: '#9ca3af', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Forgot Password?
          </button>
        </div>

        <button onClick={login} disabled={loading} style={primaryBtnStyle}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '16px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#374151' }} />
          <span style={{ color: '#6b7280', fontSize: '11px', fontFamily: 'monospace' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#374151' }} />
        </div>

        <button onClick={() => googleLogin()} style={oauthBtnStyle}>
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>

        <button onClick={microsoftLogin} style={{ ...oauthBtnStyle, marginTop: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24">
            <rect width="10" height="10" x="0" y="0" fill="#F25022"/>
            <rect width="10" height="10" x="12" y="0" fill="#7FBA00"/>
            <rect width="10" height="10" x="0" y="12" fill="#00A4EF"/>
            <rect width="10" height="10" x="12" y="12" fill="#FFB900"/>
          </svg>
          Sign in with Microsoft
        </button>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>Don't have an account?</p>
          <button onClick={() => window.location.href = '/signup'}
            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
            Create Account
          </button>
        </div>

        {/* Session notice */}
        <p style={{ color: '#3f3f46', fontSize: '10px', fontFamily: 'monospace', textAlign: 'center', marginTop: '16px' }}>
          🔒 Session ends automatically when you close the browser
        </p>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px', marginBottom: '12px',
  backgroundColor: '#000', border: '1px solid #374151', color: 'white',
  fontSize: '14px', borderRadius: '2px', outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit'
};
const primaryBtnStyle = {
  width: '100%', padding: '11px', backgroundColor: '#ef4444', color: 'white',
  border: 'none', borderRadius: '2px', cursor: 'pointer',
  fontSize: '14px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase'
};
const oauthBtnStyle = {
  width: '100%', padding: '10px', backgroundColor: 'white', color: 'black',
  border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer',
  fontSize: '13px', fontWeight: '500',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
};