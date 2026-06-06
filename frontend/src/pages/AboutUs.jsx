import { Mail, Linkedin, Shield, Code, Globe } from 'lucide-react';

const team = [
  {
    name: 'Pankaj Jangra',
    role: 'Full Stack Developer & Security Researcher',
    description: 'Specializes in cybersecurity, IoT and blockchain. Led backend development, threat detection ML model and deployment.',
    linkedin: 'https://www.linkedin.com/in/impankajjangra/', // update with real URL
    initials: 'PJ',
    color: '#FF3B30',
  },
  {
    name: 'Yashdeep Kumar',
    role: 'Frontend Developer',
    description: 'Designed and built the React frontend, UI/UX components and responsive mobile layout.',
    linkedin: 'https://www.linkedin.com/in/yashdeep-kumar-7a9321265/', // update with real URL
    initials: 'YK',
    color: '#F59E0B',
  },
  {
    name: 'Varun Kumar Singla',
    role: 'Backend Developer',
    description: 'Worked on OSINT integrations, API endpoints, database architecture and authentication systems.',
    linkedin: 'https://www.linkedin.com/in/varun-singla-05a736406/', // update with real URL
    initials: 'VS',
    color: '#10B981',
  },
];

export default function AboutUs() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 'bold', color: 'white', letterSpacing: '3px', margin: '0 0 8px' }}>
          ABOUT <span style={{ color: '#FF3B30' }}>US</span>
        </h1>
        <div style={{ width: '60px', height: '2px', background: '#FF3B30', margin: '0 auto 16px' }} />
      </div>

      {/* Project Description */}
      <div style={{
        background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', padding: '24px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255,59,48,0.1)', padding: '8px', borderRadius: '6px' }}>
            <Shield size={20} color="#FF3B30" />
          </div>
          <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            About CyberSec Hub
          </h2>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.8', margin: '0 0 12px' }}>
          <strong style={{ color: 'white' }}>CyberSec Hub</strong> is a full-stack cybersecurity intelligence platform developed as a final year B.Tech Computer Science & Engineering project at <strong style={{ color: '#FF3B30' }}>Dronacharya College of Engineering, Gurugram</strong>.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.8', margin: '0 0 12px' }}>
          The platform integrates real-world cybersecurity tools and techniques into a unified web application — combining network reconnaissance, OSINT intelligence gathering, AI-powered threat detection, and leaked data analysis. Our goal was to build a practical tool that demonstrates how modern security analysts investigate and assess threats.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.8', margin: 0 }}>
          Built with <strong style={{ color: 'white' }}>React, FastAPI, MongoDB, Python-Nmap, Machine Learning (Random Forest)</strong> and deployed on Google Cloud Platform with a custom domain and SSL. This project represents months of research, development and real-world problem solving.
        </p>
      </div>

      {/* Tech Stack */}
      <div style={{
        background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', padding: '20px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '6px' }}>
            <Code size={20} color="#10B981" />
          </div>
          <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            Tech Stack
          </h2>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {['React 18', 'FastAPI', 'MongoDB', 'Python 3.11', 'Nmap', 'scikit-learn', 'JWT Auth', 'SendGrid', 'Google OAuth', 'Microsoft MSAL', 'Tailwind CSS', 'Google Cloud Platform', 'Nginx', 'PM2', 'Shodan API', 'VirusTotal API'].map(tech => (
            <span key={tech} style={{
              padding: '4px 12px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px',
              color: '#9ca3af', fontFamily: 'monospace', fontSize: '11px'
            }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{
        background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '8px', padding: '20px', marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', padding: '8px', borderRadius: '6px' }}>
            <Globe size={20} color="#F59E0B" />
          </div>
          <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            Key Features
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {[
            { title: 'Network Scanner', desc: 'Real Nmap port scanning with OS detection and service fingerprinting' },
            { title: 'OSINT Intelligence', desc: 'WHOIS, DNS, Shodan, VirusTotal and IPInfo lookups' },
            { title: 'AI Threat Detection', desc: 'Random Forest ML model for intelligent threat classification' },
            { title: 'Leaked Data Search', desc: 'Search breached databases for compromised credentials' },
            { title: 'Secure Auth', desc: 'JWT, Email OTP, Google OAuth and Microsoft MSAL login' },
            { title: 'Personal Dashboard', desc: 'Per-user data isolation with charts and analytics' },
          ].map(({ title, desc }) => (
            <div key={title} style={{
              padding: '12px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px',
              borderLeft: '2px solid #FF3B30'
            }}>
              <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold', margin: '0 0 4px' }}>
                {title}
              </p>
              <p style={{ color: '#6b7280', fontSize: '11px', margin: 0, lineHeight: '1.5' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', textAlign: 'center' }}>
        Meet the Team
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        {team.map(({ name, role, description, linkedin, initials, color }) => (
          <div key={name} style={{
            background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px', padding: '20px', textAlign: 'center',
            transition: 'border-color 0.2s',
          }}>
            {/* Avatar */}
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${color}, ${color}88)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 'bold', color: 'white',
              margin: '0 auto 12px',
              boxShadow: `0 0 20px ${color}33`
            }}>
              {initials}
            </div>

            <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 'bold', margin: '0 0 4px' }}>
              {name}
            </h3>
            <p style={{ color, fontFamily: 'monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 10px' }}>
              {role}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.6', margin: '0 0 16px' }}>
              {description}
            </p>

            {/* LinkedIn */}
            <a href={linkedin} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 16px', background: 'rgba(10,102,194,0.15)',
              border: '1px solid rgba(10,102,194,0.3)', borderRadius: '20px',
              color: '#0a66c2', textDecoration: 'none',
              fontFamily: 'monospace', fontSize: '11px',
              transition: 'background 0.2s'
            }}>
              <Linkedin size={13} />
              LinkedIn
            </a>
          </div>
        ))}
      </div>

      {/* Contact Us */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,59,48,0.05), rgba(124,58,237,0.05))',
        border: '1px solid rgba(255,59,48,0.2)', borderRadius: '8px',
        padding: '24px', textAlign: 'center'
      }}>
        <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          Contact Us
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '16px', lineHeight: '1.6' }}>
          Have questions, suggestions or feedback about CyberSec Hub?<br />
          We'd love to hear from you.
        </p>
        <a href="mailto:cybersecchub@gmail.com" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 24px', background: 'rgba(255,59,48,0.1)',
          border: '1px solid rgba(255,59,48,0.3)', borderRadius: '4px',
          color: '#FF3B30', textDecoration: 'none',
          fontFamily: 'monospace', fontSize: '13px',
          letterSpacing: '1px'
        }}>
          <Mail size={16} />
          cybersecchub@gmail.com
        </a>
        <p style={{ color: '#4b5563', fontSize: '11px', fontFamily: 'monospace', marginTop: '16px' }}>
          © 2025 CyberSec Hub — B.Tech CSE Final Year Project, Dronacharya College of Engineering, Gurugram
        </p>
      </div>

    </div>
  );
}
