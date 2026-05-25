import { Link, useLocation } from 'react-router-dom';
import { Activity, Radar, Search, Shield, ShieldOff, History, ChevronLeft, ChevronRight, LogOut, Menu, X } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Activity, label: 'Dashboard' },
    { path: '/scanner', icon: Radar, label: 'Network Scanner' },
    { path: '/osint', icon: Search, label: 'OSINT' },
    { path: '/threats', icon: Shield, label: 'Threats' },
    { path: '/leakeddata', icon: ShieldOff, label: 'Leaked Data' },
    { path: '/history', icon: History, label: 'History' },
    { path: '/logout', icon: LogOut, label: 'Logout' },
  ];

  // On mobile: sidebar is 256px wide but slides in/out via transform
  // On desktop: sidebar is always visible, 256px open or 64px collapsed
  const sidebarStyle = isMobile ? {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: '256px',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s',
    zIndex: 50,
    backgroundColor: 'rgba(9,9,11,0.97)',
    borderRight: '1px solid rgba(255,255,255,0.1)',
  } : {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    width: isOpen ? '256px' : '64px',
    transition: 'width 0.3s',
    zIndex: 50,
    backgroundColor: 'rgba(9,9,11,0.97)',
    borderRight: '1px solid rgba(255,255,255,0.1)',
  };

  return (
    <>
      {/* Dark overlay on mobile when sidebar open */}
      {isMobile && isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            zIndex: 40,
          }}
        />
      )}

      {/* Mobile hamburger */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            position: 'fixed', top: 12, left: 12,
            zIndex: 60, padding: '8px',
            backgroundColor: '#0a0a0a',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      )}

      {/* Sidebar */}
      <div style={sidebarStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Header */}
          <div style={{
            padding: '16px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            minHeight: '64px',
          }}>
            {isOpen && (
              <h1 style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', margin: 0 }}>
                <span style={{ color: '#FF3B30' }}>CYBER</span>
                <span style={{ color: 'white' }}>SEC</span>
              </h1>
            )}

            {/* Desktop toggle */}
            {!isMobile && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                  padding: '8px', cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none', color: 'white',
                  marginLeft: isOpen ? 'auto' : '0',
                }}
              >
                {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
              </button>
            )}

            {/* Mobile close */}
            {isMobile && isOpen && (
              <button
                onClick={() => setIsOpen(false)}
                style={{ padding: '8px', cursor: 'pointer', backgroundColor: 'transparent', border: 'none', color: 'white' }}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => { if (isMobile) setIsOpen(false); }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    marginBottom: '4px',
                    borderRadius: '2px',
                    textDecoration: 'none',
                    color: isActive ? '#FF3B30' : '#a1a1aa',
                    backgroundColor: isActive ? 'rgba(255,59,48,0.1)' : 'transparent',
                    borderLeft: isActive ? '2px solid #FF3B30' : '2px solid transparent',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  <Icon size={20} strokeWidth={1.5} style={{ flexShrink: 0 }} />
                  {isOpen && (
                    <span style={{
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      textTransform: 'uppercase',
                      letterSpacing: '1.5px',
                    }}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '8px', height: '8px',
                backgroundColor: '#10B981',
                borderRadius: '50%',
                flexShrink: 0,
              }} />
              {isOpen && (
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#71717a', textTransform: 'uppercase' }}>
                  System Online
                </span>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
