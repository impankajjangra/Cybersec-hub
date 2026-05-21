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

  // Password validation
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/
    return regex.test(password)
  }

  // Email validation
  const validateEmail = (email) => {
    return email.includes("@") && email.includes(".")
  }

  // Signup function
  const signup = async () => {

    setError("")

    if (!name || !email || !password) {
      setError("Name, email and password are required")
      return
    }

    if (!validateEmail(email)) {
      setError("Invalid email format")
      return
    }

    if (!validatePassword(password)) {
      setError("Weak password (8+ chars, uppercase, number, special char)")
      return
    }

    try {

      setLoading(true)

      // FIX 3: No mobile field sent
      await axios.post(`${API}/auth/signup`, {
        name,
        gender,
        email,
        password
      })

      alert("OTP sent to your email. Please check your inbox.")

      window.location.href = "/verify?email=" + encodeURIComponent(email)

    } catch (err) {

      setError(err.response?.data?.detail || "Signup failed")

    } finally {
      setLoading(false)
    }
  }

  return (

    <div className="max-w-md mx-auto mt-32 bg-[#0a0a0a] p-6 border border-white/10 rounded-sm">

      <h1 className="text-4xl text-white text-center mb-6 font-bold tracking-wider">
        CREATE <span className="text-red-500">ACCOUNT</span>
      </h1>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 text-sm mb-4 text-center">
          {error}
        </p>
      )}

      <input
        placeholder="Name"
        onChange={e => setName(e.target.value)}
        className="w-full p-3 bg-black border border-gray-700 mb-3 text-white"
      />

      <select
        onChange={e => setGender(e.target.value)}
        className="w-full p-3 bg-black border border-gray-700 mb-3 text-white"
      >
        <option value="">Select Gender (optional)</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
        <option value="prefer_not">Prefer not to say</option>
      </select>

      <input
        placeholder="Email"
        type="email"
        onChange={e => setEmail(e.target.value)}
        className="w-full p-3 bg-black border border-gray-700 mb-3 text-white"
      />

      <input
        type="password"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
        className="w-full p-3 bg-black border border-gray-700 mb-3 text-white"
      />

      <p className="text-xs text-gray-500 mb-3">
        Password must include uppercase, lowercase, number &amp; special character
      </p>

      <button
        onClick={signup}
        disabled={loading}
        className="w-full bg-red-500 p-3 font-mono uppercase tracking-wider hover:bg-red-600 transition text-white"
      >
        {loading ? "Creating..." : "Signup"}
      </button>

      <div className="text-center mt-4">
        <p className="text-gray-400">Already have an account?</p>
        <button
          onClick={() => (window.location.href = "/login")}
          className="text-red-500 underline"
        >
          Login
        </button>
      </div>

    </div>

  )
}
