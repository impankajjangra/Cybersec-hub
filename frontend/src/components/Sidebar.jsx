import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Activity, Radar, Search, Shield, ShieldOff,
  History, LogOut, Menu, X, ChevronLeft, ChevronRight,
  User, Info, ShieldCheck
} from 'lucide-react';
import api from '@/axiosConfig';

const Sidebar = ({ isOpen, setIsOpen, isMobile }) => {
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    api.get('/api/admin/check')
      .then(res => setIsAdmin(res.data?.is_admin || false))
      .catch(() => setIsAdmin(false));
  }, []);

  const menuItems = [
    { path: '/',           icon: Activity,  label: 'Dashboard' },
    { path: '/scanner',    icon: Radar,     label: 'Network Scanner' },
    { path: '/osint',      icon: Search,    label: 'OSINT' },
    { path: '/threats',    icon: Shield,    label: 'Threats' },
    { path: '/leakeddata', icon: ShieldOff, label: 'Leaked Data' },
    { path: '/history',    icon: History,   label: 'History' },
  ];

  const bottomItems = [
    ...(isAdmin ? [{ path: '/admin', icon: ShieldCheck, label: 'Admin Panel' }] : []),
    { path: '/profile',  icon: User,   label: 'Profile' },
    { path: '/about',    icon: Info,   label: 'About Us' },
    { path: '/logout',   icon: LogOut, label: 'Logout' },
  ];

  const sidebarStyle = isMobile ? {
    position: 'fixed', left: 0, top: 0, height: '100vh', width: '240px',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.3s', zIndex: 50,
    backgroundColor: '#080808',
    borderRight: '1px solid rgba(255,255,255,0.08)',
  } : {
    position: 'fixed', left: 0, top: 0, height: '100vh',
    width: isOpen ? '240px' : '60px',
    transition: 'width 0.3s', zIndex: 50,
    backgroundColor: '#080808',
    borderRight: '1px solid rgba(255,255,255,0.08)',
  };

  const NavItem = ({ path, icon: Icon, label }) => {
    const isActive = path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(path + '/');
    return (
      <Link
        to={path}
        onClick={() => { if (isMobile) setIsOpen(false); }}
        style={{
          display: 'flex', alignItems: 'center',
          gap: isOpen ? '10px' : '0',
          justifyContent: isOpen ? 'flex-start' : 'center',
          padding: isOpen ? '10px 14px' : '10px',
          marginBottom: '2px', borderRadius: '4px',
          textDecoration: 'none',
          color: isActive ? '#FF3B30' : '#71717a',
          backgroundColor: isActive ? 'rgba(255,59,48,0.1)' : 'transparent',
          borderLeft: isActive ? '2px solid #FF3B30' : '2px solid transparent',
          transition: 'all 0.15s',
        }}
      >
        <Icon size={17} strokeWidth={1.5} style={{ flexShrink: 0 }} />
        {isOpen && (
          <span style={{ fontFamily: 'monospace', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', whiteSpace: 'nowrap', overflow: 'hidden' }}>
            {label}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {isMobile && isOpen && (
        <div onClick={() => setIsOpen(false)} style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 40,
        }} />
      )}

      {isMobile && (
        <button onClick={() => setIsOpen(!isOpen)} style={{
          position: 'fixed', top: 12, left: 12, zIndex: 60,
          padding: '7px', backgroundColor: '#0a0a0a',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px', color: 'white', cursor: 'pointer',
        }}>
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}

      <div style={sidebarStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

          {/* Header */}
          <div style={{
            padding: isOpen ? '14px 16px' : '14px 10px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center',
            justifyContent: isOpen ? 'space-between' : 'center',
            minHeight: '56px',
          }}>
            {isOpen && (
              <span style={{ fontSize: '16px', fontWeight: 'bold', letterSpacing: '3px' }}>
                <span style={{ color: '#FF3B30' }}>CYBER</span>
                <span style={{ color: 'white' }}>SEC</span>
              </span>
            )}
            {!isMobile && (
              <button onClick={() => setIsOpen(!isOpen)} style={{
                padding: '4px', cursor: 'pointer',
                backgroundColor: 'transparent', border: 'none', color: '#71717a',
              }}>
                {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
            )}
          </div>

          {/* Main Nav */}
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
            {isOpen && (
              <p style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '2px', padding: '4px 8px 8px', margin: 0 }}>
                Navigation
              </p>
            )}
            {menuItems.map(item => <NavItem key={item.path} {...item} />)}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px', paddingTop: '8px' }}>
              {isOpen && (
                <p style={{ color: '#4b5563', fontFamily: 'monospace', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '2px', padding: '4px 8px 8px', margin: 0 }}>
                  Account
                </p>
              )}
              {bottomItems.map(item => <NavItem key={item.path} {...item} />)}
            </div>
          </nav>

          {/* Footer */}
          <div style={{
            padding: isOpen ? '12px 16px' : '12px 10px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center',
            justifyContent: isOpen ? 'flex-start' : 'center', gap: '8px'
          }}>
            <div style={{ width: '7px', height: '7px', backgroundColor: '#10B981', borderRadius: '50%', flexShrink: 0 }} />
            {isOpen && (
              <span style={{ fontFamily: 'monospace', fontSize: '10px', color: '#4b5563', textTransform: 'uppercase' }}>
                System Online
              </span>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;
