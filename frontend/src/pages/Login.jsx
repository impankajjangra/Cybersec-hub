import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
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
  // Using useGoogleLogin hook instead of GoogleLogin component
  // This gives us full control over the button styling
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google using the access token
        const userInfo = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
        );
        const googleEmail = userInfo.data.email;

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
    },
    onError: () => alert("Google Login Failed"),
  });

  // ---------- MICROSOFT LOGIN ----------
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

      {/* GOOGLE BUTTON — fully custom, matches Microsoft style */}
      <button
        onClick={() => googleLogin()}
        className="w-full flex items-center justify-center gap-3
                   bg-white text-black border border-gray-300
                   p-[10px] rounded-md text-[14px] font-medium
                   hover:bg-gray-100 transition mb-3"
      >
        {/* Google SVG icon */}
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          <path fill="none" d="M0 0h48v48H0z"/>
        </svg>
        <span className="leading-none">Sign in with Google</span>
      </button>

      {/* MICROSOFT BUTTON */}
      <button
        onClick={microsoftLogin}
        className="w-full flex items-center justify-center gap-3
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
