import { Shield, Radar, Search, ShieldOff, Activity, ArrowRight, Lock, Cpu, Globe, ChevronDown } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const features = [
  { icon: Radar, title: 'Network Scanner', desc: 'Real Nmap port scanning, OS detection, service fingerprinting and CVE analysis', color: '#FF3B30' },
  { icon: Search, title: 'OSINT Intelligence', desc: 'WHOIS, DNS, Shodan, VirusTotal and IPInfo lookups for any IP or domain', color: '#0ea5e9' },
  { icon: Shield, title: 'AI Threat Detection', desc: 'Random Forest ML model with CVE-based risk scoring and classification', color: '#a855f7' },
  { icon: ShieldOff, title: 'Leaked Data Search', desc: 'Check if your email or phone appears in known data breaches', color: '#F59E0B' },
  { icon: Activity, title: 'Live Dashboard', desc: 'Real-time charts, graphs and analytics for all your scan history', color: '#10B981' },
  { icon: Cpu, title: 'Multi-Tool Scanning', desc: 'Nmap, Nuclei, Nikto, WhatWeb and OWASP ZAP in one place', color: '#ec4899' },
];

const techStack = [
  'React 18','FastAPI','MongoDB','Python','Nmap','scikit-learn',
  'Nuclei','Nikto','WhatWeb','OWASP ZAP','Shodan API','VirusTotal API',
];

const brandLetters = ['C','Y','B','E','R','S','E','C'];

export default function Landing() {
  const revealRef = useScrollReveal();

  return (
    <div ref={revealRef} className="page-enter" style={{ minHeight:'100vh', backgroundColor:'#050505', overflow:'hidden', position:'relative' }}>

      {/* Orbs */}
      <div className="orb-1" style={{ position:'fixed', top:'-100px', left:'-100px', width:'400px', height:'400px', borderRadius:'50%', background:'radial-gradient(circle, rgba(255,59,48,0.12) 0%, transparent 70%)', filter:'blur(40px)', pointerEvents:'none', zIndex:0 }} />
      <div className="orb-2" style={{ position:'fixed', top:'20%', right:'-150px', width:'450px', height:'450px', borderRadius:'50%', background:'radial-gradient(circle, rgba(168,85,247,0.1) 0%, transparent 70%)', filter:'blur(50px)', pointerEvents:'none', zIndex:0 }} />
      <div className="orb-3" style={{ position:'fixed', bottom:'-50px', left:'30%', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', filter:'blur(45px)', pointerEvents:'none', zIndex:0 }} />

      {/* Particles */}
      <div style={{ position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} className="particle" style={{
            left: `${(i * 5.5) % 100}%`,
            width: `${(i % 3) + 2}px`, height: `${(i % 3) + 2}px`,
            animationDuration: `${12 + (i * 1.2)}s`,
            animationDelay: `${i * 0.8}s`,
            background: i % 3 === 0 ? '#FF3B30' : i % 3 === 1 ? '#a855f7' : '#10B981',
            opacity: 0.4,
          }} />
        ))}
      </div>

      {/* Nav */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)', position:'relative', zIndex:10, backdropFilter:'blur(8px)' }}>
        <span style={{ fontSize:'18px', fontWeight:'bold', letterSpacing:'3px' }}>
          {brandLetters.map((letter, i) => (
            <span key={i} className="letter-pop" style={{ animationDelay:`${i * 0.05}s`, color: i < 5 ? '#FF3B30' : 'white' }}>{letter}</span>
          ))}
          <span style={{ color:'#52525b', fontSize:'11px', marginLeft:'6px', fontFamily:'monospace' }}>HUB</span>
        </span>
        <div style={{ display:'flex', gap:'10px' }}>
          <a href="/login" className="ripple" style={navBtnGhost}>Login</a>
          <a href="/signup" className="ripple" style={navBtnSolid}>Sign Up</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth:'900px', margin:'0 auto', padding:'70px 20px 60px', textAlign:'center', position:'relative', zIndex:5 }}>
        <div className="scan-sweep" />

        <div className="hero-badge" style={{ display:'inline-flex', alignItems:'center', gap:'6px', padding:'5px 14px', background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.2)', borderRadius:'20px', marginBottom:'24px' }}>
          <div className="pulse-dot" style={{ width:'6px', height:'6px', borderRadius:'50%', background:'#10B981' }} />
          <span style={{ color:'#10B981', fontFamily:'monospace', fontSize:'11px', letterSpacing:'1px' }}>LIVE · ALL SYSTEMS OPERATIONAL</span>
        </div>

        <h1 className="hero-title" style={{ fontSize:'clamp(32px, 7vw, 64px)', fontWeight:'bold', color:'white', letterSpacing:'2px', margin:'0 0 16px', lineHeight:'1.15' }}>
          AI-Powered <span className="gradient-text">Cybersecurity</span><br />
          Intelligence Platform
        </h1>

        <p className="hero-subtitle" style={{ color:'#9ca3af', fontSize:'clamp(13px, 2vw, 16px)', maxWidth:'600px', margin:'0 auto 32px', lineHeight:'1.7' }}>
          Scan networks, gather OSINT intelligence, detect threats with AI, and check for leaked credentials — all in one unified security platform.
        </p>

        <div className="hero-cta" style={{ display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/signup" className="ripple" style={ctaPrimary}>Get Started Free <ArrowRight size={16} /></a>
          <a href="/login" className="ripple" style={ctaSecondary}>Login to Dashboard</a>
        </div>

        <p className="hero-cta" style={{ color:'#3f3f46', fontSize:'11px', fontFamily:'monospace', marginTop:'16px' }}>
          <Lock size={11} style={{ display:'inline', marginRight:'4px', verticalAlign:'middle' }} />
          Free forever · No credit card required · Educational use
        </p>

        <div className="scroll-indicator" style={{ marginTop:'40px', display:'flex', justifyContent:'center' }}>
          <ChevronDown size={20} color="#3f3f46" />
        </div>
      </section>

      {/* Features */}
      <section style={{ maxWidth:'1100px', margin:'0 auto', padding:'20px 20px 70px', position:'relative', zIndex:5 }}>
        <h2 className="fade-up" style={{ textAlign:'center', color:'white', fontFamily:'monospace', fontSize:'12px', textTransform:'uppercase', letterSpacing:'3px', marginBottom:'32px' }}>
          Everything You Need
        </h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:'16px' }}>
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <div key={title}
              className={`tilt-card ${i % 2 === 0 ? 'zigzag-left' : 'zigzag-right'} fade-up`}
              style={{ transitionDelay:`${(i % 3) * 0.1}s`, background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'8px', padding:'22px', position:'relative', overflow:'hidden' }}
            >
              <div style={{ position:'absolute', top:'-30px', right:'-30px', width:'90px', height:'90px', borderRadius:'50%', background:`${color}10`, filter:'blur(20px)' }} />
              <div className={`float-icon float-icon-delay${(i % 3) + 1}`} style={{ width:'40px', height:'40px', borderRadius:'8px', background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px', position:'relative', zIndex:1 }}>
                <Icon size={19} color={color} />
              </div>
              <h3 style={{ color:'white', fontSize:'15px', fontWeight:'bold', margin:'0 0 6px', position:'relative', zIndex:1 }}>{title}</h3>
              <p style={{ color:'#71717a', fontSize:'12px', lineHeight:'1.6', margin:0, position:'relative', zIndex:1 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Marquee */}
      <section className="fade-up" style={{ maxWidth:'1100px', margin:'0 auto', padding:'0 0 70px', textAlign:'center', position:'relative', zIndex:5 }}>
        <h2 style={{ color:'white', fontFamily:'monospace', fontSize:'12px', textTransform:'uppercase', letterSpacing:'3px', marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
          <Globe size={14} color="#10B981" /> Built With Industry-Standard Tools
        </h2>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[...techStack, ...techStack].map((tech, i) => (
              <span key={i} style={{ padding:'6px 16px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'20px', color:'#9ca3af', fontFamily:'monospace', fontSize:'12px', whiteSpace:'nowrap', flexShrink:0 }}>{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="fade-up" style={{ maxWidth:'900px', margin:'0 auto', padding:'0 20px 70px', display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'16px', position:'relative', zIndex:5 }}>
        {[
          { value:'5', label:'Security Tools', color:'#FF3B30' },
          { value:'9000+', label:'Vuln Templates', color:'#a855f7' },
          { value:'100%', label:'Free Forever', color:'#10B981' },
          { value:'24/7', label:'Always Online', color:'#0ea5e9' },
        ].map(({ value, label, color }, i) => (
          <div key={label} className="count-animate hover-lift" style={{ animationDelay:`${i * 0.1}s`, textAlign:'center', padding:'20px', background:'#0a0a0a', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'8px' }}>
            <div style={{ fontSize:'clamp(22px, 4vw, 32px)', fontWeight:'bold', color, fontFamily:'monospace' }}>{value}</div>
            <div style={{ color:'#71717a', fontSize:'11px', fontFamily:'monospace', textTransform:'uppercase', letterSpacing:'1px', marginTop:'4px' }}>{label}</div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="fade-up zigzag-up" style={{ maxWidth:'900px', margin:'0 auto 70px', padding:'36px 24px', background:'linear-gradient(135deg, rgba(255,59,48,0.06), rgba(124,58,237,0.06))', border:'1px solid rgba(255,59,48,0.15)', borderRadius:'12px', textAlign:'center', position:'relative', overflow:'hidden', zIndex:5 }}>
        <div className="cyber-grid" />
        <h2 style={{ color:'white', fontSize:'clamp(18px, 3vw, 26px)', fontWeight:'bold', margin:'0 0 8px', position:'relative' }}>Ready to start securing your network?</h2>
        <p style={{ color:'#9ca3af', fontSize:'13px', margin:'0 0 20px', position:'relative' }}>Create a free account and start scanning in less than 30 seconds.</p>
        <a href="/signup" className="ripple" style={{ ...ctaPrimary, position:'relative' }}>Create Free Account <ArrowRight size={16} /></a>
      </section>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid rgba(255,255,255,0.06)', padding:'24px 20px', textAlign:'center', position:'relative', zIndex:5 }}>
        <p style={{ color:'#3f3f46', fontSize:'11px', fontFamily:'monospace', margin:'0 0 8px' }}>© 2026 CyberSec Hub · B.Tech CSE Final Year Project</p>
        <div style={{ display:'flex', gap:'16px', justifyContent:'center', flexWrap:'wrap' }}>
          <a href="/login" style={footerLink}>Login</a>
          <a href="/signup" style={footerLink}>Sign Up</a>
          <a href="mailto:cybersecchub@gmail.com" style={footerLink}>Contact</a>
        </div>
      </footer>
    </div>
  );
}

const navBtnGhost = { padding:'8px 18px', color:'#d4d4d8', textDecoration:'none', fontFamily:'monospace', fontSize:'12px', textTransform:'uppercase', letterSpacing:'1px', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'4px' };
const navBtnSolid = { padding:'8px 18px', background:'#FF3B30', color:'white', textDecoration:'none', fontFamily:'monospace', fontSize:'12px', textTransform:'uppercase', letterSpacing:'1px', borderRadius:'4px' };
const ctaPrimary = { display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 28px', background:'#FF3B30', color:'white', textDecoration:'none', fontFamily:'monospace', fontSize:'13px', textTransform:'uppercase', letterSpacing:'1px', borderRadius:'4px', fontWeight:'bold' };
const ctaSecondary = { display:'inline-flex', alignItems:'center', gap:'8px', padding:'13px 28px', background:'transparent', color:'white', textDecoration:'none', fontFamily:'monospace', fontSize:'13px', textTransform:'uppercase', letterSpacing:'1px', borderRadius:'4px', border:'1px solid rgba(255,255,255,0.15)' };
const footerLink = { color:'#71717a', textDecoration:'none', fontFamily:'monospace', fontSize:'11px' };