import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function SideNavBar({ user }) {
  const navigate = useNavigate();

  return (
    <aside className="fixed left-0 top-0 h-screen w-sidebar-width bg-surface border-r border-outline-variant flex flex-col justify-between py-margin-page z-50">
      <div>
        {/* Brand Header */}
        <div className="px-6 mb-10 flex flex-col items-start cursor-pointer" onClick={() => navigate('/')}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 flex items-center justify-center bg-primary-container rounded status-glow-primary">
              <span className="material-symbols-outlined text-on-primary text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                precision_manufacturing
              </span>
            </div>
            <div>
              <h1 className="font-headline-md text-headline-md font-bold text-primary leading-none">PrintSight</h1>
              <p className="text-[10px] font-label-caps uppercase tracking-widest text-on-surface-variant opacity-60 mt-1">Fleet Management</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex items-center px-6 py-3 transition-colors cursor-pointer active:opacity-80 ${
                isActive
                  ? 'text-primary border-l-2 border-primary bg-surface-variant font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined mr-4">dashboard</span>
            <span className="font-body-default text-body-default">Dashboard</span>
          </NavLink>

          <NavLink
            to="/errors"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 transition-colors cursor-pointer active:opacity-80 ${
                isActive
                  ? 'text-primary border-l-2 border-primary bg-surface-variant font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined mr-4">history</span>
            <span className="font-body-default text-body-default">Error History</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center px-6 py-3 transition-colors cursor-pointer active:opacity-80 ${
                isActive
                  ? 'text-primary border-l-2 border-primary bg-surface-variant font-semibold'
                  : 'text-on-surface-variant hover:bg-surface-variant'
              }`
            }
          >
            <span className="material-symbols-outlined mr-4">settings</span>
            <span className="font-body-default text-body-default">Settings</span>
          </NavLink>
        </nav>
      </div>

      {/* Profile Footer */}
      <div className="px-4">
        <div 
          onClick={() => navigate('/settings')}
          className="flex items-center p-3 rounded-lg hover:bg-surface-variant cursor-pointer transition-colors active:opacity-80 group"
        >
          <span className="material-symbols-outlined mr-3 text-on-surface-variant group-hover:text-primary text-[28px]">
            account_circle
          </span>
          <div>
            <p className="text-body-sm font-body-sm font-bold text-on-surface">{user?.name || 'Alex Rivera'}</p>
            <p className="text-[10px] text-on-surface-variant font-label-caps">{user?.role || 'Operator Account'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
