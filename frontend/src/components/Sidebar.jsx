import { Link, useLocation } from 'react-router-dom';
import { Activity, Radar, Search, Shield, ShieldOff, History, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
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

  return (
    <div
      className={`fixed left-0 top-0 h-screen bg-zinc-950/90 backdrop-blur-xl border-r border-white/10 transition-all duration-300 z-50 ${
        isOpen ? 'w-64' : 'w-16'
      }`}
      data-testid="sidebar"
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {isOpen && (
            <h1 className="font-heading text-xl uppercase tracking-wider text-[#FF3B30]">
              CYBER<span className="text-white">SEC</span>
            </h1>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 hover:bg-white/5 rounded-sm transition-colors"
            data-testid="sidebar-toggle"
          >
            {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
          </button>
        </div>

        <nav className="flex-1 p-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-3 mb-1 rounded-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-l-2 border-[#FF3B30]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
              >
                <Icon size={20} strokeWidth={1.5} />
                {isOpen && (
                  <span className="font-mono text-xs uppercase tracking-wider">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
            {isOpen && (
              <span className="font-mono text-xs text-zinc-500 uppercase">
                System Online
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
