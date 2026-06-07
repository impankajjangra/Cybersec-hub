import { Mail, Linkedin, Shield, Code, Globe } from 'lucide-react';

const team = [
  {
    name: 'Pankaj Jangra',
    role: 'Full Stack Developer & Security Researcher',
    description: 'Specializes in cybersecurity, IoT and blockchain technology. Led backend development, AI-powered threat detection ML model, deployment on GCP and overall system architecture.',
    linkedin: 'https://www.linkedin.com/in/impankajjangra/',
    photo: null, // add photo URL here e.g. 'https://...' or '/team/pankaj.jpg'
    initials: 'PJ',
    color: '#FF3B30',
  },
  {
    name: 'Yashdeep Kumar',
    role: 'Frontend Developer',
    description: 'Designed and developed the complete React frontend, UI/UX components, responsive mobile layout and interactive dashboard with real-time data visualization.',
    linkedin: 'https://www.linkedin.com/in/yashdeep-kumar-7a9321265/',
    photo: null,
    initials: 'YK',
    color: '#F59E0B',
  },
  {
    name: 'Varun Kumar Singla',
    role: 'Backend Developer',
    description: 'Worked on OSINT API integrations, database architecture, authentication systems and backend API endpoints including VirusTotal, Shodan and LeakOSINT integrations.',
    linkedin: 'https://www.linkedin.com/in/varun-singla-05a736406/',
    photo: null,
    initials: 'VS',
    color: '#10B981',
  },
];

const cardStyle = {
  background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  padding: '24px',
  textAlign: 'center',
};

const sectionStyle = {
  background: '#0a0a0a',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  padding: '24px',
  marginBottom: '20px',
};

export default function AboutUs() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 'bold', color: 'white', letterSpacing: '3px', margin: '0 0 8px' }}>
          ABOUT <span style={{ color: '#FF3B30' }}>US</span>
        </h1>
        <div style={{ width: '56px', height: '2px', background: '#FF3B30', margin: '0 auto' }} />
      </div>

      {/* About Project */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(255,59,48,0.1)', padding: '8px', borderRadius: '6px', flexShrink: 0 }}>
            <Shield size={18} color="#FF3B30" />
          </div>
          <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', margin: 0 }}>
            About CyberSec Hub
          </h2>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.85', margin: '0 0 12px', textAlign: 'justify' }}>
          <strong style={{ color: 'white' }}>CyberSec Hub</strong> is a full-stack cybersecurity intelligence platform developed as a final year B.Tech Computer Science & Engineering project at{' '}
          <strong style={{ color: '#FF3B30' }}>Dronacharya College of Engineering, Gurugram</strong>.
          The platform brings together multiple real-world cybersecurity tools and methodologies into a single unified web application that demonstrates how modern security professionals investigate, monitor and respond to threats.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.85', margin: '0 0 12px', textAlign: 'justify' }}>
          The project integrates network reconnaissance using <strong style={{ color: 'white' }}>Nmap</strong> for real port scanning and service fingerprinting, open-source intelligence gathering through <strong style={{ color: 'white' }}>WHOIS, DNS, Shodan, VirusTotal and IPInfo</strong>, an AI-powered threat detection engine using a <strong style={{ color: 'white' }}>Random Forest machine learning model</strong>, and a leaked data search module that queries breached credential databases to help users understand their exposure.
        </p>
        <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: '1.85', margin: 0, textAlign: 'justify' }}>
          The entire platform is built with <strong style={{ color: 'white' }}>React 18, FastAPI, MongoDB, Python and scikit-learn</strong>, deployed on <strong style={{ color: 'white' }}>Google Cloud Platform</strong> with Nginx, SSL and a custom domain. It features per-user data isolation, JWT authentication, Google and Microsoft OAuth, SendGrid email OTP and a fully responsive mobile interface. This project represents months of collaborative research, engineering and real-world problem solving by a team of three undergraduate students passionate about cybersecurity.
        </p>
      </div>

      {/* Tech Stack */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(16,185,129,0.1)', padding: '8px', borderRadius: '6px', flexShrink: 0 }}>
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
          ].map(tech => (
            <span key={tech} style={{
              padding: '4px 12px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '20px', color: '#9ca3af',
              fontFamily: 'monospace', fontSize: '11px',
            }}>
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(245,158,11,0.1)', padding: '8px', borderRadius: '6px', flexShrink: 0 }}>
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
          ].map(({ title, desc }) => (
            <div key={title} style={{
              padding: '12px', background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderLeft: '2px solid #FF3B30', borderRadius: '0 4px 4px 0',
            }}>
              <p style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px', fontWeight: 'bold', margin: '0 0 5px' }}>{title}</p>
              <p style={{ color: '#6b7280', fontSize: '11px', margin: 0, lineHeight: '1.55', textAlign: 'justify' }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team */}
      <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px', textAlign: 'center' }}>
        Meet the Team
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {team.map(({ name, role, description, linkedin, photo, initials, color }) => (
          <div key={name} style={cardStyle}>

            {/* Photo or Avatar */}
            <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 14px' }}>
              {photo ? (
                <img
                  src={photo}
                  alt={name}
                  style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    objectFit: 'cover', border: `2px solid ${color}`,
                  }}
                />
              ) : (
                <div style={{
                  width: '80px', height: '80px', borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color}, ${color}66)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px', fontWeight: 'bold', color: 'white',
                  border: `2px solid ${color}`,
                  boxShadow: `0 0 20px ${color}22`,
                }}>
                  {initials}
                </div>
              )}
              {/* Online dot */}
              <div style={{
                position: 'absolute', bottom: '4px', right: '4px',
                width: '12px', height: '12px', borderRadius: '50%',
                background: '#10B981', border: '2px solid #0a0a0a',
              }} />
            </div>

            <h3 style={{ color: 'white', fontSize: '15px', fontWeight: 'bold', margin: '0 0 4px' }}>{name}</h3>
            <p style={{ color, fontFamily: 'monospace', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>
              {role}
            </p>
            <p style={{ color: '#9ca3af', fontSize: '12px', lineHeight: '1.7', margin: '0 0 16px', textAlign: 'justify' }}>
              {description}
            </p>

            <a href={linkedin} target="_blank" rel="noreferrer" style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 18px',
              background: 'rgba(10,102,194,0.12)',
              border: '1px solid rgba(10,102,194,0.3)',
              borderRadius: '20px', color: '#0a66c2',
              textDecoration: 'none', fontFamily: 'monospace', fontSize: '11px',
            }}>
              <Linkedin size={13} />
              LinkedIn
            </a>

            {/* Hint text */}
            <p style={{ color: '#3f3f46', fontSize: '10px', fontFamily: 'monospace', marginTop: '8px' }}>
              Update linkedin URL in AboutUs.jsx
            </p>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255,59,48,0.05), rgba(124,58,237,0.05))',
        border: '1px solid rgba(255,59,48,0.18)', borderRadius: '8px',
        padding: '28px', textAlign: 'center',
      }}>
        <h2 style={{ color: 'white', fontFamily: 'monospace', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>
          Contact Us
        </h2>
        <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '18px', lineHeight: '1.7', maxWidth: '500px', margin: '0 auto 18px', textAlign: 'center' }}>
          Have questions, suggestions or feedback about CyberSec Hub? We'd love to hear from you — whether it's a bug report, feature request or collaboration idea.
        </p>
        <a href="mailto:cybersecchub@gmail.com" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '10px 26px',
          background: 'rgba(255,59,48,0.1)',
          border: '1px solid rgba(255,59,48,0.3)',
          borderRadius: '4px', color: '#FF3B30',
          textDecoration: 'none', fontFamily: 'monospace', fontSize: '13px', letterSpacing: '1px',
        }}>
          <Mail size={15} />
          cybersecchub@gmail.com
        </a>
        <p style={{ color: '#3f3f46', fontSize: '11px', fontFamily: 'monospace', marginTop: '20px' }}>
            2026 CyberSec Hub · B.Tech CSE Final Year Project · Dronacharya College of Engineering, Gurugram
        </p>
      </div>

    </div>
  );
}
