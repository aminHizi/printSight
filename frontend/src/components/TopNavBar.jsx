import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import logoColored from '../assets/Fab43-Logo.png';

export default function TopNavBar({ 
  searchQuery = '', 
  setSearchQuery = null, 
  user,
  theme,
  toggleTheme
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notifRef = useRef(null);

  // Close notifications dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Notifications mock data
  const notifications = [
    { id: 1, text: 'PS-02 Bravo reports Filament Runout', time: '10m ago', type: 'error' },
    { id: 2, text: 'PS-04 Delta finished pre-heating', time: '25m ago', type: 'info' },
    { id: 3, text: 'Core-X1 Platinum homing limit reached', time: '1h ago', type: 'error' }
  ];

  // Check if search bar should be displayed (only on Dashboard '/' or Logs '/errors')
  const isSearchable = location.pathname === '/' || location.pathname === '/errors';

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors cursor-pointer ${
      isActive
        ? 'text-primary border-b-2 border-primary pb-[23px] font-semibold'
        : 'text-on-surface-variant dark:text-slate-400 hover:text-primary pb-[23px]'
    }`;

  return (
    <header className="fixed top-0 left-0 right-0 h-topbar-height bg-white dark:bg-dark-navy border-b border-outline-variant dark:border-slate-800 transition-colors duration-200 z-50">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        
        {/* Left: Brand Identity with Logo and Tagline */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => navigate('/')}>
          <img 
            src={logoColored} 
            alt="Fab43 Logo" 
            className="h-9 w-auto object-contain" 
          />
          <div>
            <h1 className="font-headline-md text-lg font-bold tracking-tight text-on-surface dark:text-white leading-none">
              PrintSight
            </h1>
            <span className="text-[9px] font-label-caps uppercase tracking-widest text-on-surface-variant dark:text-slate-400 block mt-0.5">
              FLEET MANAGEMENT
            </span>
          </div>
        </div>

        {/* Center: Nav Links — Desktop */}
        <nav className="hidden md:flex items-center gap-7 h-full">
          <NavLink to="/" end className={navLinkClass}>Dashboard</NavLink>
          <NavLink to="/errors" className={navLinkClass}>Activity Logs</NavLink>
          <NavLink to="/settings" className={navLinkClass}>Settings</NavLink>
          <NavLink to="/connect" className={navLinkClass}>Connect Node</NavLink>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          {/* Search bar, only shown on searchable routes */}
          {isSearchable && setSearchQuery !== null && (
            <div className="hidden lg:flex items-center bg-background dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-full px-4 py-1.5 w-56 group focus-within:border-primary transition-all">
              <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 mr-2 text-lg">search</span>
              <input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none focus:outline-none focus:ring-0 text-xs w-full text-on-surface dark:text-white placeholder:text-on-surface-variant/50" 
                placeholder="Search nodes or logs..." 
                type="text"
              />
            </div>
          )}

          {/* Notifications, Dark-mode toggle */}
          <div className="flex items-center gap-3 relative" ref={notifRef}>
            
            {/* Notifications */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative text-on-surface-variant dark:text-slate-400 hover:text-primary cursor-pointer active:scale-95 transition-all focus:outline-none"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-0 right-0 w-2 h-2 bg-[#2563EB] rounded-full border border-white dark:border-dark-navy"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-8 right-0 w-72 bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-xl shadow-lg z-50 p-2 mt-2">
                <div className="px-3 py-1.5 border-b border-outline-variant dark:border-slate-800 font-label-caps text-xs text-on-surface dark:text-white font-bold">
                  SYSTEM ALERTS
                </div>
                <div className="divide-y divide-outline-variant/30 dark:divide-slate-800">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors flex gap-2.5">
                      <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'error' ? 'bg-error' : 'bg-primary'}`}></span>
                      <div>
                        <p className="text-xs text-on-surface dark:text-white font-medium leading-snug">{n.text}</p>
                        <span className="text-[10px] text-on-surface-variant dark:text-slate-400 font-technical-data mt-0.5 block">{n.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dark mode toggle */}
            <button 
              onClick={toggleTheme}
              className="text-on-surface-variant dark:text-slate-400 hover:text-primary cursor-pointer active:scale-95 transition-all focus:outline-none"
              title="Toggle Theme"
            >
              <span className="material-symbols-outlined text-[22px]">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-on-surface-variant dark:text-slate-400 hover:text-primary transition-colors focus:outline-none"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Profile link */}
          <div 
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant dark:border-slate-800 cursor-pointer hover:border-primary transition-all flex-shrink-0 hidden sm:block"
          >
            <img 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFaYD5DvwXG5l4n-9-r_4V33zIusKRuFVKFT9Rz30kJuOR9MzQLgnnbHdcPuOH6h8DsBi0ieuT-RZBKYy_yQLQTmI5_ck04u47xv2-P73onDRx4kLMqLv3j89pI13jOp-zZti7BJSqBf9i3yK6iCb6cpCZVVa6lHXKX4E1ifFH5aplO1cCr6bP69bF9TgLwZF2-c_6tOr_btci-6VIeucwFqaFHzc-4-EyUtphJ1cAUGwtuCXrf9ZqWg" 
              alt="User Profile" 
            />
          </div>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-dark-navy border-b border-outline-variant dark:border-slate-800 shadow-lg">
          <nav className="flex flex-col px-6 py-3 gap-1">
            <NavLink to="/" end onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary-container/30 font-semibold' : 'text-on-surface-variant dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Dashboard</NavLink>
            <NavLink to="/errors" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary-container/30 font-semibold' : 'text-on-surface-variant dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Activity Logs</NavLink>
            <NavLink to="/settings" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary-container/30 font-semibold' : 'text-on-surface-variant dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Settings</NavLink>
            <NavLink to="/connect" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `py-2.5 px-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'text-primary bg-primary-container/30 font-semibold' : 'text-on-surface-variant dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>Connect Node</NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
