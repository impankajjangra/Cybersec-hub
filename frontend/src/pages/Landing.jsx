import { Shield, Radar, Search, ShieldOff, Activity, ArrowRight, Lock, Cpu, Globe } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

const features = [
  { icon: Radar, title: 'Network Scanner', desc: 'Real Nmap port scanning, OS detection, service fingerprinting and CVE analysis', color: '#FF3B30' },
  { icon: Search, title: 'OSINT Intelligence', desc: 'WHOIS, DNS, Shodan, VirusTotal and IPInfo lookups for any IP or domain', color: '#0ea5e9' },
  { icon: Shield, title: 'AI Threat Detection', desc: 'Random Forest ML model with CVE-based risk scoring and classification', color: '#a855f7' },
  { icon: ShieldOff, title: 'Leaked Data Search', desc: 'Check if your email or phone appears in known data breaches', color: '#F59E0B' },
  { icon: Activity, title: 'Live Dashboard', desc: 'Real-time charts, graphs and analytics for all your scan history', color: '#10B981' },
  { icon: Cpu, title: 'Multi-Tool Scanning', desc: 'Nmap, Nuclei, Nikto, WhatWeb and OWASP ZAP — all in one place', color: '#ec4899' },
];

const techStack = [
  'React 18', 'FastAPI', 'MongoDB', 'Python', 'Nmap', 'scikit-learn',
  'Nuclei', 'Nikto', 'WhatWeb', 'OWASP ZAP', 'Shodan API', 'VirusTotal API',
];

export default function Landing() {
  const revealRef = useScrollReveal();

  return (
    <div ref={revealRef} className="page-enter" style={{ minHeight: '100vh', backgroundColor: '#050505', overflow: 'hidden' }}>

      {/* Top Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px' }}>
          <span style={{ color: '#FF3B30' }}>CYBER</span>
          <span style={{ color: 'white' }}>SEC</span>
          <span style={{ color: '#52525b', fontSize: '11px', marginLeft: '6px', fontFamily: 'monospace' }}>HUB</span>
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <a href="/login" style={navBtnGhost}>Login</a>
          <a href="/signup" className="ripple" style={navBtnSolid}>Sign Up</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        maxWidth: '900px', margin: '0 auto', padding: '60px 20px 50px',
        textAlign: 'center', position: 'relative'
      }}>
        {/* Glow effect */}
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '300px',
          background: 'radial-gradient(circle, rgba(255,59,48,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '5px 14px', background: 'rgba(16,185,129,0.08)',
          border: '1px solid rgba(16,185,129,0.2)', borderRadius: '20px',
          marginBottom: '20px',
        }}>
          <div className="pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
          <span style={{ color: '#10B981', fontFamily: 'monospace', fontSize: '11px', letterSpacing: '1px' }}>
            LIVE · ALL SYSTEMS OPERATIONAL
          </span>
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 7vw, 64px)', fontWeight: 'bold', color: 'white',
          letterSpacing: '2px', margin: '0 0 16px', lineHeight: '1.15',
        }}>
          AI-Powered <span style={{ color: '#FF3B30' }}>Cybersecurity</span><br />
          Intelligence Platform
        </h1>

        <p style={{
          color: '#9ca3af', fontSize: 'clamp(13px, 2vw, 16px)',
          maxWidth: '600px', margin: '0 auto 32px', lineHeight: '1.7',
        }}>
          Scan networks, gather OSINT intelligence, detect threats with AI, and check for leaked credentials —
          all in one unified security platform built for researchers and students.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/signup" className="ripple" style={ctaPrimary}>
            Get Started Free <ArrowRight size={16} />
          </a>
          <a href="/login" className="ripple" style={ctaSecondary}>
            Login to Dashboard
          </a>
        </div>

        <p style={{ color: '#3f3f46', fontSize: '11px', fontFamily: 'monospace', marginTop: '16px' }}>
          <Lock size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
          Free forever · No credit card required · Educational use
        </p>
      </section>

      {/* Features Grid */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '20px 20px 60px' }}>
        <h2 style={{
          textAlign: 'center', color: 'white', fontFamily: 'monospace',
          fontSize: '12px', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '24px',
        }}>
          Everything You Need
        </h2>

        <div className="fade-up-stagger" style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px',
        }}>
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div key={title} className="hover-lift" style={{
              background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', padding: '20px',
              transition: 'border-color 0.2s, transform 0.2s',
            }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '8px',
                background: `${color}15`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '14px',
              }}>
                <Icon size={18} color={color} />
              </div>
              <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 'bold', margin: '0 0 6px' }}>{title}</h3>
              <p style={{ color: '#71717a', fontSize: '12px', lineHeight: '1.6', margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px 60px', textAlign: 'center' }}>
        <h2 style={{
          color: 'white', fontFamily: 'monospace', fontSize: '12px',
          textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '20px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
        }}>
          <Globe size={14} color="#10B981" /> Built With Industry-Standard Tools
        </h2>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {techStack.map(tech => (
            <span key={tech} style={{
              padding: '5px 14px', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px',
              color: '#9ca3af', fontFamily: 'monospace', fontSize: '11px',
            }}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{
        maxWidth: '900px', margin: '0 auto 60px', padding: '32px 24px',
        background: 'linear-gradient(135deg, rgba(255,59,48,0.06), rgba(124,58,237,0.06))',
        border: '1px solid rgba(255,59,48,0.15)', borderRadius: '12px',
        textAlign: 'center',
      }}>
        <h2 style={{ color: 'white', fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 'bold', margin: '0 0 8px' }}>
          Ready to start securing your network?
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '13px', margin: '0 0 20px' }}>
          Create a free account and start scanning in less than 30 seconds.
        </p>
        <a href="/signup" className="ripple" style={ctaPrimary}>
          Create Free Account <ArrowRight size={16} />
        </a>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)', padding: '24px 20px',
        textAlign: 'center',
      }}>
        <p style={{ color: '#3f3f46', fontSize: '11px', fontFamily: 'monospace', margin: '0 0 8px' }}>
          © 2025 CyberSec Hub · B.Tech CSE Final Year Project
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/login" style={footerLink}>Login</a>
          <a href="/signup" style={footerLink}>Sign Up</a>
          <a href="mailto:cybersecchub@gmail.com" style={footerLink}>Contact</a>
        </div>
      </footer>

    </div>
  );
}

const navBtnGhost = {
  padding: '8px 18px', color: '#d4d4d8', textDecoration: 'none',
  fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase',
  letterSpacing: '1px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px',
};
const navBtnSolid = {
  padding: '8px 18px', background: '#FF3B30', color: 'white', textDecoration: 'none',
  fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase',
  letterSpacing: '1px', borderRadius: '4px',
};
const ctaPrimary = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '13px 28px', background: '#FF3B30', color: 'white', textDecoration: 'none',
  fontFamily: 'monospace', fontSize: '13px', textTransform: 'uppercase',
  letterSpacing: '1px', borderRadius: '4px', fontWeight: 'bold',
};
const ctaSecondary = {
  display: 'inline-flex', alignItems: 'center', gap: '8px',
  padding: '13px 28px', background: 'transparent', color: 'white', textDecoration: 'none',
  fontFamily: 'monospace', fontSize: '13px', textTransform: 'uppercase',
  letterSpacing: '1px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.15)',
};
const footerLink = {
  color: '#71717a', textDecoration: 'none', fontFamily: 'monospace', fontSize: '11px',
};