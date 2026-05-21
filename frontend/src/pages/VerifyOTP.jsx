import { useState, useEffect } from "react"
import axios from "axios"

const API = process.env.REACT_APP_BACKEND_URL

export default function VerifyOTP() {

  const [email, setEmail] = useState("")
  const [emailOtp, setEmailOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  // FIX 3: Auto-fill email from URL query param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get("email")
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
  }, [])

  // FIX 3: Only email_otp needed — mobile_otp removed
  const verify = async () => {
    if (!email || !emailOtp) {
      alert("Please enter your email and OTP")
      return
    }

    try {
      setLoading(true)

      await axios.post(`${API}/auth/verify`, null, {
        params: {
          email: email,
          email_otp: emailOtp
        }
      })

      alert("Account Verified! You can now login.")
      window.location.href = "/login"

    } catch (err) {
      alert(err.response?.data?.detail || "Verification failed")
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (!email) {
      alert("Please enter your email first")
      return
    }

    try {
      setResendLoading(true)

      await axios.post(`${API}/auth/resend-otp`, null, {
        params: { email }
      })

      alert("OTP sent to your email again. Check your inbox.")

    } catch (err) {
      alert(err.response?.data?.detail || "Failed to resend OTP")
    } finally {
      setResendLoading(false)
    }
  }

  return (

    <div className="max-w-md mx-auto mt-32 bg-[#0a0a0a] p-6 border border-white/10 rounded-sm">

      <h1 className="text-3xl text-white mb-2 font-bold tracking-wider text-center">
        VERIFY <span className="text-red-500">EMAIL</span>
      </h1>

      <p className="text-gray-400 text-sm text-center mb-6">
        Enter the 6-digit OTP sent to your email
      </p>

      <input
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-3 bg-black border border-gray-700 mb-3 text-white"
      />

      <input
        placeholder="Email OTP (6 digits)"
        maxLength={6}
        onChange={e => setEmailOtp(e.target.value)}
        className="w-full p-3 bg-black border border-gray-700 mb-3 text-white tracking-widest text-center text-lg"
      />

      {/* FIX 3: Mobile OTP input removed */}

      <button
        onClick={verify}
        disabled={loading}
        className="w-full bg-red-500 p-3 font-mono text-white uppercase tracking-wider hover:bg-red-600 transition"
      >
        {loading ? "Verifying..." : "Verify"}
      </button>

      <div className="text-center mt-4">
        <button
          onClick={resend}
          disabled={resendLoading}
          className="text-red-500 underline text-sm"
        >
          {resendLoading ? "Sending..." : "Resend OTP"}
        </button>
      </div>

    </div>

  )
}
