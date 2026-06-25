import { Mail, Shield, Code, Globe } from 'lucide-react';

const sectionStyle = {
  background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '20px',
};

export default function AboutUs() {
  return (
    <div className="inner-page page-header" style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 16px' }}>

      {/* Background orbs */}
      <div className="page-orb-red" />
      <div className="page-orb-purple" />

      {/* Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 'bold', color: 'white', letterSpacing: '3px', margin: '0 0 8px' }}>
          ABOUT <span style={{ color: '#FF3B30' }}>US</span>
        </h1>
        <div style={{ width: '56px', height: '2px', background: '#FF3B30', margin: '0 auto' }} />
      </div>

      {/* About Project */}
      <div className="glow-on-hover" style={{ ...sectionStyle, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div className="float-icon" style={{ background: 'rgba(255,59,48,0.1)', padding: '8px', borderRadius: '6px', flexShrink: 0 }}>
            <Shield size={18} color="#FF3B30" />
          </div>
          <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            About CyberSec Hub
          </h2>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.85', margin: '0 0 12px', textAlign: 'justify' }}>
          <strong style={{ color: 'white' }}>CyberSec Hub</strong> is a full-stack cybersecurity intelligence platform that brings together multiple real-world security tools and methodologies into a single unified web application. The platform demonstrates how modern security professionals investigate, monitor and respond to threats across public networks and web applications.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.85', margin: '0 0 12px', textAlign: 'justify' }}>
          The platform integrates network reconnaissance using <strong style={{ color: 'white' }}>Nmap</strong> for real port scanning and service fingerprinting, open-source intelligence gathering through <strong style={{ color: 'white' }}>WHOIS, DNS, Shodan, VirusTotal and IPInfo</strong>, an AI-powered threat detection engine built on a <strong style={{ color: 'white' }}>Random Forest machine learning model</strong>, and a leaked data search module that queries breached credential databases to help users understand their exposure.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.85', margin: 0, textAlign: 'justify' }}>
          Built with <strong style={{ color: 'white' }}>React 18, FastAPI, MongoDB, Python and scikit-learn</strong>, deployed on <strong style={{ color: 'white' }}>Google Cloud Platform</strong> with Nginx, SSL and a custom domain. It features per-user data isolation, JWT authentication, Google and Microsoft OAuth, SendGrid email OTP, a fully responsive mobile interface and a multi-tool scanner supporting Nmap, Nuclei, Nikto, WhatWeb and OWASP ZAP.
        </p>
      </div>

      {/* Tech Stack */}
      <div className="glow-on-hover" style={{ ...sectionStyle, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div className="float-icon float-icon-delay1" style={{ background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '6px', flexShrink: 0 }}>
            <Code size={18} color="#10B981" />
          </div>
          <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            Tech Stack
          </h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {[
            'React 18', 'FastAPI', 'MongoDB', 'Python 3.11', 'Nmap',
            'scikit-learn', 'JWT Auth', 'SendGrid', 'Google OAuth',
            'Microsoft MSAL', 'Tailwind CSS', 'Google Cloud Platform',
            'Nginx', 'PM2', 'Shodan API', 'VirusTotal API', 'Recharts',
          ].map((tech, i) => (
            <span key={tech} className="tool-badge" style={{
              padding: '4px 12px', background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '20px', color: '#9ca3af',
              fontFamily: 'monospace', fontSize: '11px',
              animationDelay: `${i * 0.03}s`,
            }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="glow-on-hover" style={{ ...sectionStyle, position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div className="float-icon float-icon-delay2" style={{ background: 'rgba(245,158,11,0.1)', padding: '8px', borderRadius: '6px', flexShrink: 0 }}>
            <Globe size={18} color="#F59E0B" />
          </div>
          <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            Key Features
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {[
            { title: 'Network Scanner', desc: 'Real Nmap port scanning with service fingerprinting and Shodan CVE enrichment' },
            { title: 'OSINT Intelligence', desc: 'WHOIS, DNS, Shodan, VirusTotal and IPInfo lookups for any IP or domain' },
            { title: 'AI Threat Detection', desc: 'Random Forest ML model with CVE analysis and rule-based risk scoring' },
            { title: 'Leaked Data Search', desc: 'Search breached databases for compromised emails, phones and credentials' },
            { title: 'Secure Auth', desc: 'JWT, Email OTP via SendGrid, Google OAuth and Microsoft MSAL login' },
            { title: 'Analytics Dashboard', desc: 'Per-user charts, graphs and threat intelligence with historical data' },
          ].map(({ title, desc }, i) => (
            <div key={title} className="glow-on-hover" style={{
              padding: '12px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderLeft: '2px solid #FF3B30', borderRadius: '0 4px 4px 0',
              animationDelay: `${i * 0.05}s`,
            }}>
              <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold', margin: '0 0 5px' }}>{title}</p>
              <p style={{ color: '#6b7280', fontSize: '11px', margin: 0, lineHeight: '1.55', textAlign: 'justify' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Meet the Team — HIDDEN (commented out) */}
      {/* 
      <h2>Meet the Team</h2>
      <div style={{ display: 'grid', ...}}>
        team cards hidden for anonymity
      </div>
      */}

      {/* Contact */}
      <div className="glow-on-hover" style={{
        background: 'linear-gradient(135deg, rgba(255,59,48,0.05), rgba(124,58,237,0.05))',
        border: '1px solid rgba(255,59,48,0.18)', borderRadius: '8px',
        padding: '28px', textAlign: 'center', position: 'relative', zIndex: 1,
      }}>
        <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          Contact Us
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '18px', lineHeight: '1.7', maxWidth: '500px', margin: '0 auto 18px', textAlign: 'center' }}>
          Have questions, suggestions or feedback about CyberSec Hub? We'd love to hear from you — whether it's a bug report, feature request or collaboration idea.
        </p>
        <a href="mailto:cybersecchub@gmail.com" className="cta-pulse" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 26px', background: 'rgba(255,59,48,0.1)',
          border: '1px solid rgba(255,59,48,0.3)',
          borderRadius: '4px', color: '#FF3B30',
          textDecoration: 'none', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '1px',
        }}>
          <Mail size={15} />
          cybersecchub@gmail.com
        </a>
        <p style={{ color: '#3f3f46', fontSize: '11px', fontFamily: 'monospace', marginTop: '20px' }}>
          © 2026 CyberSec Hub
        </p>
      </div>

    </div>
  );
}
