import { useState } from "react";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";

const API = process.env.REACT_APP_BACKEND_URL;

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { instance } = useMsal();

  // ---------- NORMAL LOGIN ----------
  const login = async () => {
    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // ---------- GOOGLE LOGIN ----------
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      const payload = JSON.parse(atob(googleToken.split(".")[1]));
      const googleEmail = payload.email;

      if (!googleEmail) {
        alert("Could not get email from Google. Please try again.");
        return;
      }

      const res = await axios.post(`${API}/auth/microsoft`, { email: googleEmail });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/";
    } catch (err) {
      console.error("Google login error:", err);
      alert("Google login failed. Please try again.");
    }
  };

  // ---------- MICROSOFT LOGIN ----------
  // FIX: Use loginRedirect (not loginPopup) — popup inside Chrome is blocked.
  // The redirect response is handled in index.js via handleRedirectPromise().
  const microsoftLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className="max-w-md mx-auto mt-32">

      <h1 className="text-6xl font-bold text-white text-center tracking-wider mb-6">
        CYBER <span className="text-red-500">SEC</span>
      </h1>

      <input
        placeholder="Email"
        type="email"
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 bg-black border border-gray-700 mb-3 text-white"
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && login()}
        className="w-full p-3 bg-black border border-gray-700 text-white"
      />

      <div className="text-right">
        <button
          onClick={() => (window.location.href = "/reset-password")}
          className="text-gray-400 underline mt-2"
        >
          Forgot Password?
        </button>
      </div>

      <button
        onClick={login}
        disabled={loading}
        className="w-full mt-4 bg-red-500 p-3 font-mono text-white hover:bg-red-600 transition disabled:opacity-50"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="flex items-center gap-3 my-4">
        <div className="flex-1 h-px bg-gray-700" />
        <span className="text-gray-500 text-xs font-mono">OR</span>
        <div className="flex-1 h-px bg-gray-700" />
      </div>

      <div className="mt-1">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => alert("Google Login Failed")}
          useOneTap={false}
          width="100%"
        />
      </div>

      <button
        onClick={microsoftLogin}
        className="w-full mt-3 flex items-center justify-center gap-3
                   bg-white text-black border border-gray-300
                   p-[10px] rounded-md text-[14px] font-medium
                   hover:bg-gray-100 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24">
          <rect width="10" height="10" x="0" y="0" fill="#F25022"/>
          <rect width="10" height="10" x="12" y="0" fill="#7FBA00"/>
          <rect width="10" height="10" x="0" y="12" fill="#00A4EF"/>
          <rect width="10" height="10" x="12" y="12" fill="#FFB900"/>
        </svg>
        <span className="leading-none">Sign in with Microsoft</span>
      </button>

      <div className="text-center mt-6">
        <p className="text-gray-400">Don't have an account?</p>
        <button
          onClick={() => (window.location.href = "/signup")}
          className="text-red-500 underline"
        >
          Create Account
        </button>
      </div>

    </div>
  );
}
