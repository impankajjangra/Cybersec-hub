import { useState, useEffect } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authConfig";
import { Shield, Lock, Eye, EyeOff } from "lucide-react";

const API = process.env.REACT_APP_BACKEND_URL;

const saveToken = (token) => {
  sessionStorage.setItem('token', token);
  localStorage.removeItem('token');
};

const WORDS = ['SECURE', 'ANALYSE', 'PROTECT', 'MONITOR', 'DEFEND'];

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);
  const [wordIdx, setWordIdx]   = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting]   = useState(false);
  const { instance } = useMsal();

  /* ── Typewriter effect ─────────────────────────────── */
  useEffect(() => {
    const target = WORDS[wordIdx];
    let timer;
    if (!deleting && displayed.length < target.length) {
      timer = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 120);
    } else if (!deleting && displayed.length === target.length) {
      timer = setTimeout(() => setDeleting(true), 1400);
    } else if (deleting && displayed.length > 0) {
      timer = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 60);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setWordIdx((i) => (i + 1) % WORDS.length);
    }
    return () => clearTimeout(timer);
  }, [displayed, deleting, wordIdx]);

  const login = async () => {
    if (!email || !password) { alert("Please enter email and password"); return; }
    try {
      setLoading(true);
      const res = await axios.post(`${API}/auth/login`, { email, password });
      saveToken(res.data.token);
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.detail || "Login failed");
    } finally { setLoading(false); }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tr) => {
      try {
        const info = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",
          { headers: { Authorization: `Bearer ${tr.access_token}` } });
        const res = await axios.post(`${API}/auth/microsoft`, { email: info.data.email });
        saveToken(res.data.token);
        window.location.href = "/";
      } catch { alert("Google login failed."); }
    },
    onError: () => alert("Google Login Failed"),
  });

  const microsoftLogin = () => instance.loginRedirect(loginRequest);

  return (
    <div style={{ minHeight:'100vh', display:'flex', backgroundColor:'#050505', overflow:'hidden', position:'relative' }}>

      {/* ── Left panel — animated visual side ────────────────── */}
      <div className="login-panel-enter" style={{
        display:'none',
        flex: 1, position:'relative', overflow:'hidden',
        background:'linear-gradient(135deg, #0a0a0a 0%, #0f0a0a 50%, #0a0a0f 100%)',
        borderRight:'1px solid rgba(255,255,255,0.06)',
      }}
        ref={el => { if (el && window.innerWidth >= 768) el.style.display = 'flex'; }}
      >
        {/* Orb */}
        <div className="orb-1" style={{ position:'absolute', top:'10%', left:'10%', width:'300px', height:'300px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,59,48,0.15) 0%, transparent 70%)', filter:'blur(40px)', pointerEvents:'none' }} />
        <div className="orb-2" style={{ position:'absolute', bottom:'10%', right:'10%', width:'250px', height:'250px', borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%)', filter:'blur(35px)', pointerEvents:'none' }} />

        {/* Cyber grid */}
        <div className="cyber-grid" />

        {/* Scan sweep */}
        <div className="scan-sweep" />

        {/* Particles */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
          {Array.from({ length: 12 }, (_, i) => (
            <div key={i} className="particle" style={{
              left:`${(i * 8) % 100}%`,
              width:`${(i % 2) + 2}px`, height:`${(i % 2) + 2}px`,
              animationDuration:`${10 + i * 1.5}s`,
              animationDelay:`${i * 1.2}s`,
              background: i % 2 === 0 ? '#FF3B30' : '#a855f7',
            }} />
          ))}
        </div>

        {/* Center content */}
        <div style={{ position:'relative', zIndex:5, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'40px', textAlign:'center', width:'100%' }}>
          <div className="float-icon" style={{ width:'72px', height:'72px', borderRadius:'20px', background:'rgba(255,59,48,0.1)', border:'1px solid rgba(255,59,48,0.2)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'24px' }}>
            <Shield size={36} color="#FF3B30" />
          </div>

          <h2 style={{ color:'white', fontSize:'clamp(20px,3vw,28px)', fontWeight:'bold', letterSpacing:'2px', margin:'0 0 8px' }}>
            CYBERSEC <span style={{ color:'#FF3B30' }}>HUB</span>
          </h2>

          <div style={{ marginBottom:'24px', height:'28px', display:'flex', alignItems:'center', justifyContent:'center', gap:'4px' }}>
            <span style={{ color:'#6b7280', fontFamily:'monospace', fontSize:'13px' }}>Ready to</span>
            <span style={{ color:'#FF3B30', fontFamily:'monospace', fontSize:'13px', fontWeight:'bold', minWidth:'90px', textAlign:'left' }}>{displayed}</span>
            <span className="typing-cursor" />
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px', width:'100%', maxWidth:'260px' }}>
            {[
              { icon:'📡', text:'Real Nmap Port Scanning' },
              { icon:'🔍', text:'OSINT Intelligence' },
              { icon:'🤖', text:'AI Threat Detection' },
              { icon:'💧', text:'Leaked Data Search' },
            ].map(({ icon, text }, i) => (
              <div key={text} className="zigzag-left visible" style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'10px 14px', background:'rgba(255,255,255,0.03)',
                border:'1px solid rgba(255,255,255,0.07)', borderRadius:'6px',
                transitionDelay:`${i * 0.1 + 0.3}s`,
              }}>
                <span style={{ fontSize:'16px' }}>{icon}</span>
                <span style={{ color:'#9ca3af', fontFamily:'monospace', fontSize:'11px' }}>{text}</span>
              </div>
            ))}
          </div>

          <p style={{ color:'#3f3f46', fontFamily:'monospace', fontSize:'10px', marginTop:'32px', letterSpacing:'1px' }}>
            B.TECH CSE PROJECT · DRONACHARYA COLLEGE
          </p>
        </div>
      </div>

      {/* ── Right panel — login form ──────────────────────────── */}
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', position:'relative', minWidth: 0 }}>

        {/* Right side particles */}
        <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="particle" style={{
              left:`${10 + (i * 11) % 80}%`,
              width:'2px', height:'2px',
              animationDuration:`${14 + i * 1.8}s`,
              animationDelay:`${i * 2}s`,
              background:'#FF3B30', opacity:0.3,
            }} />
          ))}
        </div>

        <div className="glow-card login-panel-enter" style={{
          width:'100%', maxWidth:'400px',
          backgroundColor:'#0a0a0a',
          border:'1px solid rgba(255,59,48,0.15)',
          borderRadius:'8px', padding:'36px 28px',
          position:'relative', zIndex:5,
          animationDelay:'0.2s',
        }}>

          {/* Lock icon top */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:'20px' }}>
            <div className="float-icon" style={{ width:'44px', height:'44px', borderRadius:'12px', background:'rgba(255,59,48,0.1)', border:'1px solid rgba(255,59,48,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Lock size={20} color="#FF3B30" />
            </div>
          </div>

          <h1 className="hero-title" style={{ fontSize:'28px', fontWeight:'bold', color:'white', textAlign:'center', letterSpacing:'3px', marginBottom:'6px' }}>
            CYBER <span style={{ color:'#ef4444' }}>SEC</span>
          </h1>
          <p style={{ color:'#6b7280', fontSize:'12px', textAlign:'center', fontFamily:'monospace', marginBottom:'28px' }}>
            Sign in to your account
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
            <div style={{ position:'relative' }}>
              <input
                placeholder="Email address"
                type="email"
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                style={{ ...inputStyle, paddingLeft:'14px' }}
              />
            </div>

            <div style={{ position:'relative' }}>
              <input
                placeholder="Password"
                type={showPwd ? 'text' : 'password'}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && login()}
                style={{ ...inputStyle, paddingRight:'40px' }}
              />
              <button onClick={() => setShowPwd(!showPwd)} style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#6b7280', padding:'4px' }}>
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div style={{ textAlign:'right', marginBottom:'16px' }}>
            <button onClick={() => window.location.href='/reset-password'} style={{ color:'#9ca3af', fontSize:'11px', background:'none', border:'none', cursor:'pointer', textDecoration:'underline', fontFamily:'monospace' }}>
              Forgot Password?
            </button>
          </div>

          <button onClick={login} disabled={loading} className="ripple" style={primaryBtnStyle}>
            {loading ? (
              <span style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
                <span style={{ width:'14px', height:'14px', border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'white', borderRadius:'50%', display:'inline-block', animation:'spin 0.8s linear infinite' }} />
                Signing in...
              </span>
            ) : 'Login'}
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:'12px', margin:'16px 0' }}>
            <div style={{ flex:1, height:'1px', backgroundColor:'rgba(255,255,255,0.08)' }} />
            <span style={{ color:'#4b5563', fontSize:'11px', fontFamily:'monospace' }}>OR</span>
            <div style={{ flex:1, height:'1px', backgroundColor:'rgba(255,255,255,0.08)' }} />
          </div>

          <button onClick={() => googleLogin()} className="ripple" style={oauthBtnStyle}>
            <svg width="16" height="16" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          </button>

          <button onClick={microsoftLogin} className="ripple" style={{ ...oauthBtnStyle, marginTop:'8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24">
              <rect width="10" height="10" x="0" y="0" fill="#F25022"/>
              <rect width="10" height="10" x="12" y="0" fill="#7FBA00"/>
              <rect width="10" height="10" x="0" y="12" fill="#00A4EF"/>
              <rect width="10" height="10" x="12" y="12" fill="#FFB900"/>
            </svg>
            Sign in with Microsoft
          </button>

          <div style={{ textAlign:'center', marginTop:'20px' }}>
            <p style={{ color:'#6b7280', fontSize:'12px', marginBottom:'4px' }}>Don't have an account?</p>
            <button onClick={() => window.location.href='/signup'} style={{ color:'#ef4444', background:'none', border:'none', cursor:'pointer', textDecoration:'underline', fontSize:'13px', fontFamily:'monospace' }}>
              Create Account
            </button>
          </div>

          <p style={{ color:'#27272a', fontSize:'10px', fontFamily:'monospace', textAlign:'center', marginTop:'16px' }}>
            🔒 Session ends when browser closes
          </p>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width:'100%', padding:'11px 14px',
  backgroundColor:'rgba(255,255,255,0.03)',
  border:'1px solid rgba(255,255,255,0.1)',
  color:'white', fontSize:'14px', borderRadius:'6px',
  outline:'none', boxSizing:'border-box', fontFamily:'inherit',
  transition:'border-color 0.2s ease, box-shadow 0.2s ease',
};
const primaryBtnStyle = {
  width:'100%', padding:'12px',
  backgroundColor:'#ef4444', color:'white',
  border:'none', borderRadius:'6px', cursor:'pointer',
  fontSize:'14px', fontFamily:'monospace',
  letterSpacing:'2px', textTransform:'uppercase',
  fontWeight:'bold', transition:'opacity 0.2s, transform 0.1s',
};
const oauthBtnStyle = {
  width:'100%', padding:'10px',
  backgroundColor:'white', color:'black',
  border:'1px solid #e5e7eb', borderRadius:'6px',
  cursor:'pointer', fontSize:'13px', fontWeight:'500',
  display:'flex', alignItems:'center', justifyContent:'center', gap:'10px',
  transition:'background 0.15s ease',
};