import { useState, useEffect } from "react"
import axios from "axios"

const API = process.env.REACT_APP_BACKEND_URL

export default function VerifyOTP() {
  const [email, setEmail] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const e = params.get("email")
    if (e) setEmail(decodeURIComponent(e))
  }, [])

  const verify = async () => {
    if (!email || !emailOtp) { alert("Please enter your email and OTP"); return; }
    try {
      setLoading(true)
      await axios.post(`${API}/auth/verify`, null, { params: { email, email_otp: emailOtp } })
      alert("Account Verified! You can now login.")
      window.location.href = "/login"
    } catch (err) { alert(err.response?.data?.detail || "Verification failed") }
    finally { setLoading(false) }
  }

  const resend = async () => {
    if (!email) { alert("Please enter your email first"); return; }
    try {
      setResendLoading(true)
      await axios.post(`${API}/auth/resend-otp`, null, { params: { email } })
      alert("OTP sent again. Check your inbox.")
    } catch (err) { alert(err.response?.data?.detail || "Failed to resend OTP") }
    finally { setResendLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: '#050505' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '32px 24px' }}>

        <h1 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 'bold', color: 'white', textAlign: 'center', letterSpacing: '3px', marginBottom: '8px' }}>
          VERIFY <span style={{ color: '#ef4444' }}>EMAIL</span>
        </h1>
        <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>
          Enter the 6-digit OTP sent to your email
        </p>

        {/* Spam notice */}
        <div style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '4px', padding: '10px', marginBottom: '16px', textAlign: 'center' }}>
          <p style={{ color: '#fbbf24', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>
            ⚠ Check your <strong>Spam / Junk folder</strong> if you don't see the OTP email
          </p>
        </div>

        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
        <input placeholder="6-digit OTP" maxLength={6} onChange={e => setEmailOtp(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && verify()}
          style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }} />

        <button onClick={verify} disabled={loading} style={primaryBtnStyle}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <div style={{ textAlign: 'center', marginTop: '12px' }}>
          <button onClick={resend} disabled={resendLoading}
            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: '12px', backgroundColor: '#000', border: '1px solid #374151', color: 'white', fontSize: '14px', borderRadius: '2px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const primaryBtnStyle = { width: '100%', padding: '11px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '14px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase' };
