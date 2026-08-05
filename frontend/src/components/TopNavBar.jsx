import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function TopNavBar({ 
  searchQuery = '', 
  setSearchQuery = null, 
  title = '', 
  showBackButton = false 
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  // Notifications mock data
  const notifications = [
    { id: 1, text: 'PS-02 Bravo reports Filament Runout', time: '10m ago', type: 'error' },
    { id: 2, text: 'PS-04 Delta finished pre-heating', time: '25m ago', type: 'info' },
    { id: 3, text: 'Core-X1 Platinum homing limit reached', time: '1h ago', type: 'error' }
  ];

  return (
    <header className="fixed top-0 right-0 h-topbar-height w-[calc(100%-240px)] bg-surface border-b border-outline-variant flex justify-between items-center px-gutter z-40">
      {/* Leading section: Title or Back button */}
      <div className="flex items-center gap-4">
        {showBackButton ? (
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors active:scale-95 group border border-outline-variant px-3 py-1.5 rounded-lg bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            <span className="font-body-default text-body-sm">Back</span>
          </button>
        ) : (
          <h2 className="font-headline-md text-body-default font-bold text-on-surface">{title || 'Fleet Dashboard'}</h2>
        )}
      </div>

      {/* Trailing actions */}
      <div className="flex items-center space-x-6">
        {/* Search Input (only if setSearchQuery is provided) */}
        {setSearchQuery !== null && (
          <div className="flex items-center bg-surface-container-lowest border border-outline-variant rounded px-3 py-1.5 w-80 group focus-within:border-primary transition-all">
            <span className="material-symbols-outlined text-on-surface-variant mr-2 text-xl">search</span>
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none focus:outline-none focus:ring-0 text-body-sm w-full text-on-surface placeholder-on-surface-variant/50" 
              placeholder="Search fleet or logs..." 
              type="text"
            />
          </div>
        )}

        {/* Notifications and Help icons */}
        <div className="flex items-center space-x-4 relative">
          {/* Notifications Button */}
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative text-on-surface-variant hover:text-primary cursor-pointer active:scale-95 transition-all focus:outline-none"
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-secondary rounded-full border border-surface"></span>
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute top-8 right-0 w-72 bg-surface-container border border-outline-variant rounded-lg shadow-lg z-50 p-2 mt-2">
              <div className="px-3 py-1.5 border-b border-outline-variant font-label-caps text-xs text-on-surface font-bold">
                SYSTEM ALERTS
              </div>
              <div className="divide-y divide-outline-variant/30">
                {notifications.map(n => (
                  <div key={n.id} className="p-2.5 hover:bg-surface-variant transition-colors flex gap-2.5">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.type === 'error' ? 'bg-error' : 'bg-primary'}`}></span>
                    <div>
                      <p className="text-xs text-on-surface font-medium leading-snug">{n.text}</p>
                      <span className="text-[10px] text-on-surface-variant/60 font-technical-data mt-0.5 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <span className="material-symbols-outlined text-on-surface-variant hover:text-primary cursor-pointer active:scale-95 transition-all">
            help_outline
          </span>
        </div>

        {/* Action Button: Connect Printer (only show if not on /connect page) */}
        {location.pathname !== '/connect' && (
          <button 
            onClick={() => navigate('/connect')}
            className="bg-primary-container text-on-primary-container px-4 py-2 rounded font-bold text-body-sm flex items-center hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10"
          >
            <span className="material-symbols-outlined mr-2">add</span>
            Connect printer
          </button>
        )}

        {/* User avatar */}
        <div 
          onClick={() => navigate('/settings')}
          className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant cursor-pointer hover:border-primary transition-all"
        >
          <img 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCFaYD5DvwXG5l4n-9-r_4V33zIusKRuFVKFT9Rz30kJuOR9MzQLgnnbHdcPuOH6h8DsBi0ieuT-RZBKYy_yQLQTmI5_ck04u47xv2-P73onDRx4kLMqLv3j89pI13jOp-zZti7BJSqBf9i3yK6iCb6cpCZVVa6lHXKX4E1ifFH5aplO1cCr6bP69bF9TgLwZF2-c_6tOr_btci-6VIeucwFqaFHzc-4-EyUtphJ1cAUGwtuCXrf9ZqWg" 
            alt="User Profile" 
          />
        </div>
      </div>
    </header>
  );
}
