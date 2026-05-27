import { useState, useEffect } from "react"
import axios from "axios"

const API = process.env.REACT_APP_BACKEND_URL

export default function ResetVerifyOTP() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const e = params.get("email")
    if (e) setEmail(decodeURIComponent(e))
  }, [])

  const verifyOTP = async () => {
    setError("")
    if (!otp) { setError("Please enter the OTP"); return; }
    try {
      setLoading(true)
      await axios.post(`${API}/auth/reset-otp-verify`, null, { params: { email, otp } })
      setStep(2)
    } catch (err) { setError(err.response?.data?.detail || "Invalid OTP") }
    finally { setLoading(false) }
  }

  const resetPassword = async () => {
    setError("")
    if (!newPassword || !confirmPassword) { setError("Please fill both fields"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(newPassword)) {
      setError("Password must be 8+ chars with uppercase, number & special char"); return;
    }
    try {
      setLoading(true)
      await axios.post(`${API}/auth/reset-password`, { email, new_password: newPassword })
      alert("Password updated! Please login.")
      window.location.href = "/login"
    } catch (err) { setError(err.response?.data?.detail || "Failed to reset password") }
    finally { setLoading(false) }
  }

  const resendOTP = async () => {
    try {
      setResendLoading(true)
      await axios.post(`${API}/auth/reset-otp`, null, { params: { email } })
      alert("New OTP sent to your email")
    } catch (err) { alert("Failed to resend OTP") }
    finally { setResendLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', backgroundColor: '#050505' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', padding: '32px 24px' }}>

        {step === 1 ? (
          <>
            <h1 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 'bold', color: 'white', textAlign: 'center', letterSpacing: '3px', marginBottom: '8px' }}>
              VERIFY <span style={{ color: '#ef4444' }}>OTP</span>
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginBottom: '12px' }}>
              OTP sent to <strong style={{ color: 'white' }}>{email}</strong>
            </p>

            <div style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: '4px', padding: '10px', marginBottom: '16px', textAlign: 'center' }}>
              <p style={{ color: '#fbbf24', fontSize: '12px', fontFamily: 'monospace', margin: 0 }}>
                ⚠ Check your <strong>Spam / Junk folder</strong> if you don't see the OTP email
              </p>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

            <input placeholder="6-digit OTP" maxLength={6} onChange={e => setOtp(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && verifyOTP()}
              style={{ ...inputStyle, textAlign: 'center', letterSpacing: '8px', fontSize: '20px' }} />

            <button onClick={verifyOTP} disabled={loading} style={primaryBtnStyle}>
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button onClick={resendOTP} disabled={resendLoading}
                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
                {resendLoading ? "Sending..." : "Resend OTP"}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 style={{ fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 'bold', color: 'white', textAlign: 'center', letterSpacing: '3px', marginBottom: '8px' }}>
              NEW <span style={{ color: '#ef4444' }}>PASSWORD</span>
            </h1>
            <p style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
              OTP verified — set your new password
            </p>

            {error && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

            <input placeholder="New Password" type="password" onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
            <input placeholder="Confirm Password" type="password" onChange={e => setConfirmPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && resetPassword()} style={inputStyle} />

            <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '16px' }}>
              Must include uppercase, lowercase, number &amp; special character
            </p>

            <button onClick={resetPassword} disabled={loading} style={primaryBtnStyle}>
              {loading ? "Updating..." : "Update Password"}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

const inputStyle = { width: '100%', padding: '10px 12px', marginBottom: '12px', backgroundColor: '#000', border: '1px solid #374151', color: 'white', fontSize: '14px', borderRadius: '2px', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit' };
const primaryBtnStyle = { width: '100%', padding: '11px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer', fontSize: '14px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase' };
