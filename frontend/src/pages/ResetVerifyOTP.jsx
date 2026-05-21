import { useState, useEffect } from "react"
import axios from "axios"

const API = process.env.REACT_APP_BACKEND_URL

export default function ResetVerifyOTP() {

  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState(1) // 1 = verify OTP, 2 = set new password
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const emailParam = params.get("email")
    if (emailParam) setEmail(decodeURIComponent(emailParam))
  }, [])

  const verifyOTP = async () => {
    setError("")
    if (!otp) {
      setError("Please enter the OTP")
      return
    }
    try {
      setLoading(true)
      await axios.post(`${API}/auth/reset-otp-verify`, null, {
        params: { email, otp }
      })
      setStep(2) // OTP correct — show password fields
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid OTP")
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async () => {
    setError("")

    if (!newPassword || !confirmPassword) {
      setError("Please fill both password fields")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
    if (!passwordRegex.test(newPassword)) {
      setError("Password must be 8+ chars with uppercase, number & special character")
      return
    }

    try {
      setLoading(true)
      await axios.post(`${API}/auth/reset-password`, {
        email,
        new_password: newPassword
      })
      alert("Password updated successfully! Please login.")
      window.location.href = "/login"
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to reset password")
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    try {
      setResendLoading(true)
      await axios.post(`${API}/auth/reset-otp`, null, { params: { email } })
      alert("New OTP sent to your email")
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to resend OTP")
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-32 bg-[#0a0a0a] p-6 border border-white/10 rounded-sm">

      {step === 1 && (
        <>
          <h1 className="text-3xl text-white mb-2 font-bold tracking-wider text-center">
            VERIFY <span className="text-red-500">OTP</span>
          </h1>
          <p className="text-gray-400 text-sm text-center mb-6">
            Enter the 6-digit OTP sent to <span className="text-white">{email}</span>
          </p>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <input
            placeholder="6-digit OTP"
            maxLength={6}
            onChange={e => setOtp(e.target.value)}
            onKeyDown={e => e.key === "Enter" && verifyOTP()}
            className="w-full p-3 bg-black border border-gray-700 mb-4 text-white tracking-widest text-center text-lg"
          />

          <button
            onClick={verifyOTP}
            disabled={loading}
            className="w-full bg-red-500 p-3 text-white font-mono uppercase tracking-wider hover:bg-red-600 transition disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <div className="text-center mt-4">
            <button
              onClick={resendOTP}
              disabled={resendLoading}
              className="text-red-500 underline text-sm"
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="text-3xl text-white mb-2 font-bold tracking-wider text-center">
            NEW <span className="text-red-500">PASSWORD</span>
          </h1>
          <p className="text-gray-400 text-sm text-center mb-6">
            OTP verified — set your new password
          </p>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <input
            type="password"
            placeholder="New Password"
            onChange={e => setNewPassword(e.target.value)}
            className="w-full p-3 bg-black border border-gray-700 mb-3 text-white"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            onChange={e => setConfirmPassword(e.target.value)}
            onKeyDown={e => e.key === "Enter" && resetPassword()}
            className="w-full p-3 bg-black border border-gray-700 mb-3 text-white"
          />

          <p className="text-xs text-gray-500 mb-4">
            Must include uppercase, lowercase, number &amp; special character
          </p>

          <button
            onClick={resetPassword}
            disabled={loading}
            className="w-full bg-red-500 p-3 text-white font-mono uppercase tracking-wider hover:bg-red-600 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </>
      )}

    </div>
  )
}
