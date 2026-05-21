import { useState } from "react"
import axios from "axios"

const API = process.env.REACT_APP_BACKEND_URL

export default function ResetPassword() {

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const sendOTP = async () => {
    setError("")

    if (!email) {
      setError("Please enter your email")
      return
    }

    try {
      setLoading(true)

      await axios.post(`${API}/auth/reset-otp`, null, {
        params: { email }
      })

      // Redirect to OTP verification page with email in URL
      window.location.href = "/reset-verify?email=" + encodeURIComponent(email)

    } catch (err) {
      setError(err.response?.data?.detail || "Failed to send OTP")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-32 bg-[#0a0a0a] p-6 border border-white/10 rounded-sm">

      <h1 className="text-3xl text-white mb-2 font-bold tracking-wider text-center">
        RESET <span className="text-red-500">PASSWORD</span>
      </h1>

      <p className="text-gray-400 text-sm text-center mb-6">
        Enter your email — we'll send you an OTP to verify
      </p>

      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
      )}

      <input
        placeholder="Email"
        type="email"
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && sendOTP()}
        className="w-full p-3 bg-black border border-gray-700 mb-4 text-white"
      />

      <button
        onClick={sendOTP}
        disabled={loading}
        className="w-full bg-red-500 p-3 text-white font-mono uppercase tracking-wider hover:bg-red-600 transition disabled:opacity-50"
      >
        {loading ? "Sending OTP..." : "Send OTP"}
      </button>

      <div className="text-center mt-4">
        <button
          onClick={() => (window.location.href = "/login")}
          className="text-gray-400 underline text-sm"
        >
          Back to Login
        </button>
      </div>

    </div>
  )
}
