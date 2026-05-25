import { Link, useLocation } from 'react-router-dom';
import { Activity, Radar, Search, Shield, ShieldOff, History, ChevronLeft, ChevronRight, LogOut, Menu, X } from 'lucide-react';

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
    <>
      {/* Mobile overlay — clicking it closes sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile hamburger button — only shows on small screens */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-zinc-950 border border-white/10 rounded-sm text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-screen bg-zinc-950/95 backdrop-blur-xl border-r border-white/10 z-50 transition-all duration-300
          ${isOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
          lg:translate-x-0
          ${isOpen ? 'lg:w-64' : 'lg:w-16'}
        `}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            {/* Show title when open */}
            <h1 className={`font-heading text-xl uppercase tracking-wider text-[#FF3B30] transition-all duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0 overflow-hidden'}`}>
              CYBER<span className="text-white">SEC</span>
            </h1>

            {/* Toggle button — only on desktop */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden lg:flex p-2 hover:bg-white/5 rounded-sm transition-colors"
            >
              {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>

            {/* Close button — only on mobile */}
            <button
              onClick={() => setIsOpen(false)}
              className="lg:hidden p-2 hover:bg-white/5 rounded-sm"
            >
              <X size={20} />
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
                  onClick={() => {
                    // Close sidebar on mobile after clicking a link
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 px-3 py-3 mb-1 rounded-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-[#FF3B30]/10 text-[#FF3B30] border-l-2 border-[#FF3B30]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={20} strokeWidth={1.5} className="shrink-0" />
                  <span className={`font-mono text-xs uppercase tracking-wider transition-all duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0 overflow-hidden'}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse shrink-0"></div>
              <span className={`font-mono text-xs text-zinc-500 uppercase transition-all duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:w-0 overflow-hidden'}`}>
                System Online
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
