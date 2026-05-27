import { useState } from "react"
import axios from "axios"

const API = process.env.REACT_APP_BACKEND_URL

export default function Signup() {
  const [name, setName] = useState("")
  const [gender, setGender] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const validatePassword = (p) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(p)
  const validateEmail = (e) => e.includes("@") && e.includes(".")

  const signup = async () => {
    setError("")
    if (!name || !email || !password) { setError("Name, email and password are required"); return; }
    if (!validateEmail(email)) { setError("Invalid email format"); return; }
    if (!validatePassword(password)) { setError("Weak password — need uppercase, number & special char"); return; }
    try {
      setLoading(true)
      await axios.post(`${API}/auth/signup`, { name, gender, email, password })
      alert("OTP sent to your email. Please check your inbox (and spam folder).")
      window.location.href = "/verify?email=" + encodeURIComponent(email)
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed")
    } finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '16px', backgroundColor: '#050505'
    }}>
      <div style={{
        width: '100%', maxWidth: '400px',
        backgroundColor: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '4px', padding: '32px 24px'
      }}>
        <h1 style={{
          fontSize: 'clamp(22px, 5vw, 30px)', fontWeight: 'bold',
          color: 'white', textAlign: 'center', letterSpacing: '3px', marginBottom: '24px'
        }}>
          CREATE <span style={{ color: '#ef4444' }}>ACCOUNT</span>
        </h1>

        {error && <p style={{ color: '#ef4444', fontSize: '12px', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

        <input placeholder="Full Name" onChange={e => setName(e.target.value)} style={inputStyle} />

        <select onChange={e => setGender(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
          <option value="">Select Gender (optional)</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not">Prefer not to say</option>
        </select>

        <input placeholder="Email" type="email" onChange={e => setEmail(e.target.value)} style={inputStyle} />

        <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && signup()} style={inputStyle} />

        <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '16px' }}>
          Must include uppercase, lowercase, number &amp; special character
        </p>

        <button onClick={signup} disabled={loading} style={primaryBtnStyle}>
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '4px' }}>Already have an account?</p>
          <button onClick={() => window.location.href = '/login'}
            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}>
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', marginBottom: '12px',
  backgroundColor: '#000', border: '1px solid #374151',
  color: 'white', fontSize: '14px', borderRadius: '2px',
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
};

const primaryBtnStyle = {
  width: '100%', padding: '11px', backgroundColor: '#ef4444',
  color: 'white', border: 'none', borderRadius: '2px', cursor: 'pointer',
  fontSize: '14px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase'
};
