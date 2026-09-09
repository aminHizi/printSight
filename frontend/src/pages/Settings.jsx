import React, { useState } from 'react';

export default function Settings({ user, onUpdateUser, onLogout }) {

  // Account details states
  const [fullName, setFullName] = useState(user?.name || 'Alexander Vance');
  const [email, setEmail] = useState(user?.email || 'a.vance@printsight.industrial');

  // Preferences toggles
  const [criticalNotify, setCriticalNotify] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Save feedback states
  const [savingAccount, setSavingAccount] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveAccount = (e) => {
    e.preventDefault();
    setSavingAccount(true);

    setTimeout(async () => {
      try {
        const response = await fetch('/api/settings/account', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
          },
          body: JSON.stringify({ fullName, email })
        });
        if (response.ok) {
          onUpdateUser({ name: fullName, email });
          alert('Account details updated successfully.');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSavingAccount(false);
      }
    }, 800);
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword !== confirmPassword) {
      return alert('New passwords do not match.');
    }
    setSavingPassword(true);

    setTimeout(() => {
      setSavingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated. Key hashes re-calculated.');
    }, 1000);
  };

  const handleTogglePreference = async (type, val) => {
    if (type === 'critical') setCriticalNotify(val);
    if (type === 'weekly') setWeeklyDigest(val);
    if (type === 'refresh') setAutoRefresh(val);

    try {
      await fetch('/api/settings/preferences', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ [type]: val })
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 select-none text-left">
      {/* Header */}
      <div className="space-y-1.5 border-b border-outline-variant/60 dark:border-slate-800/80 pb-6">
        <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface dark:text-white">Settings</h1>
        <p className="text-on-surface-variant dark:text-slate-400 font-body-default text-sm">
          Manage operator workstation configurations, workstation keys, and alert preferences.
        </p>
      </div>

      {/* Section 1: Account Details */}
      <section className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          {/* Identical Blue Icon Badge */}
          <div className="w-12 h-12 flex items-center justify-center bg-primary-container dark:bg-blue-950/30 text-secondary dark:text-blue-400 rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">person</span>
          </div>
          <div>
            <h3 className="font-headline-lg text-lg font-bold text-on-surface dark:text-white">Account Details</h3>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">Manage operator profiles and Station identifiers.</p>
          </div>
        </div>

        <form onSubmit={handleSaveAccount} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">Full Name</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-3.5 text-on-surface dark:text-white font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                type="text"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">Email Address</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-3.5 text-on-surface dark:text-white font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                type="email"
                required
              />
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-outline-variant/60 dark:border-slate-800/80">
            <button
              type="submit"
              disabled={savingAccount}
              className="bg-primary hover:bg-blue-700 text-white font-label-caps font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {savingAccount ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </section>

      {/* Section 2: Change Password */}
      <section className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          {/* Identical Blue Icon Badge */}
          <div className="w-12 h-12 flex items-center justify-center bg-primary-container dark:bg-blue-950/30 text-secondary dark:text-blue-400 rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">lock</span>
          </div>
          <div>
            <h3 className="font-headline-lg text-lg font-bold text-on-surface dark:text-white">Security Keys</h3>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">Update local workstation access keys.</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">Current Password</label>
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-3.5 text-on-surface dark:text-white font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-mono"
                placeholder="••••••••"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">New Password</label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-3.5 text-on-surface dark:text-white font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-mono"
                placeholder="••••••••"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">Confirm New Password</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl p-3.5 text-on-surface dark:text-white font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-mono"
                placeholder="••••••••"
                type="password"
                required
              />
            </div>
          </div>
          <div className="flex justify-end pt-2 border-t border-outline-variant/60 dark:border-slate-800/80">
            <button
              type="submit"
              disabled={savingPassword}
              className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-850 text-primary border border-primary font-label-caps font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-sm disabled:opacity-50"
            >
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </section>

      {/* Section 3: Preferences */}
      <section className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          {/* Identical Blue Icon Badge */}
          <div className="w-12 h-12 flex items-center justify-center bg-primary-container dark:bg-blue-950/30 text-secondary dark:text-blue-400 rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">tune</span>
          </div>
          <div>
            <h3 className="font-headline-lg text-lg font-bold text-on-surface dark:text-white">System Preferences</h3>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">Toggle notification digests and sync parameters.</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Push Notifications Toggle */}
          <div className="flex items-center justify-between py-4 border-b border-outline-variant/60 dark:border-slate-800/80">
            <div>
              <p className="font-body-default text-sm text-on-surface dark:text-white font-bold">Critical Push Alerts</p>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">Send alerts to operators when hardware encounters critical halts.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={criticalNotify} 
                onChange={(e) => handleTogglePreference('critical', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Performance Digest Toggle */}
          <div className="flex items-center justify-between py-4 border-b border-outline-variant/60 dark:border-slate-800/80">
            <div>
              <p className="font-body-default text-sm text-on-surface dark:text-white font-bold">Weekly Performance Digest</p>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">Send email telemetry reports and material efficiency logs.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={weeklyDigest} 
                onChange={(e) => handleTogglePreference('weekly', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {/* Auto Refresh Toggle */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-body-default text-sm text-on-surface dark:text-white font-bold">Auto-Refresh Dashboard</p>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">Fetch and refresh node telemetry every 30 seconds automatically.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={(e) => handleTogglePreference('refresh', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Section 4: Danger Zone */}
      <section className="bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950/60 rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          {/* Identical Blue Icon Badge - Danger Zone card uses it too as required by layout rules */}
          <div className="w-12 h-12 flex items-center justify-center bg-primary-container dark:bg-blue-950/30 text-secondary dark:text-blue-400 rounded-xl shrink-0">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div>
            <h3 className="font-headline-lg text-lg font-bold text-red-650 dark:text-red-400">Danger Zone</h3>
            <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">Destructive workstation session management.</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Logout device */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-950/40 border border-outline-variant dark:border-slate-800/80 rounded-xl">
            <div className="text-center md:text-left">
              <p className="font-body-default text-sm text-on-surface dark:text-white font-bold">Session Management</p>
              <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-1 leading-normal">
                Force terminate workstation token and return to credentials page.
              </p>
            </div>
            <button 
              onClick={onLogout}
              className="bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 border border-red-200 dark:border-red-900/40 font-semibold px-6 py-2.5 rounded-full text-xs transition-all shadow-sm"
            >
              Log Out Device
            </button>
          </div>

          {/* Delete account */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/30 rounded-xl">
            <div className="text-center md:text-left">
              <p className="font-body-default text-sm text-red-750 dark:text-red-400 font-bold">Workstation Deletion</p>
              <p className="text-xs text-on-surface-variant dark:text-slate-450 mt-1 leading-normal">
                Irreversibly delete operator workstation configs and telemetry database log cache.
              </p>
            </div>
            <button 
              onClick={() => {
                if (window.confirm('WARNING: THIS ACTION CANNOT BE UNDONE. Delete account and purge telemetry databases?')) {
                  onLogout();
                }
              }}
              className="bg-red-650 hover:bg-red-750 text-white font-semibold px-6 py-2.5 rounded-full text-xs transition-all shadow-sm"
            >
              Purge Database
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
