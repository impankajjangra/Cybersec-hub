import { useState } from "react"
import axios from "axios"

const API = process.env.REACT_APP_BACKEND_URL

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const sendOTP = async () => {
    setError("")
    if (!email) { setError("Please enter your email"); return; }
    try {
      setLoading(true)
      await axios.post(`${API}/auth/reset-otp`, null, { params: { email } })
      window.location.href = "/reset-verify?email=" + encodeURIComponent(email)
    } catch (err) { setError(err.response?.data?.detail || "Failed to send OTP") }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: '#050505' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '32px 24px' }}>

        <h1 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 'bold', color: 'white', textAlign: 'center', letterSpacing: '3px', marginBottom: '8px' }}>
          RESET <span style={{ color: '#ef4444' }}>PASSWORD</span>
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
          Enter your email — we'll send you an OTP to verify
        </p>

        {error && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

        <input placeholder="Email" type="email" onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendOTP()} style={inputStyle} />

        <button onClick={sendOTP} disabled={loading} style={primaryBtnStyle}>
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button onClick={() => window.location.href = '/login'}
            style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: '16px', backgroundColor: '#000', border: '1px solid #374151', color: 'white', fontSize: '14px', borderRadius: '2px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const primaryBtnStyle = { width: '100%', padding: '11px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '14px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase' };
