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
    <div className="max-w-4xl mx-auto space-y-stack-md pb-margin-page select-none text-left">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-headline-lg text-3xl font-bold text-on-surface mb-1">Settings</h1>
        <p className="text-on-surface-variant font-body-default text-sm">Manage operator workstation credentials and fleet notification filters.</p>
      </div>

      {/* Section 1: Account */}
      <section className="bg-surface-container-low border border-outline-variant rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary text-2xl">person</span>
          <h3 className="font-headline-md text-lg font-bold text-on-surface">Account Details</h3>
        </div>
        <form onSubmit={handleSaveAccount} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">FULL NAME</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded p-3 text-on-surface font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                type="text"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">EMAIL ADDRESS</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded p-3 text-on-surface font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                type="email"
                required
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingAccount}
              className="bg-primary-container text-on-primary px-6 py-2.5 rounded-lg font-label-caps font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/10 disabled:opacity-50"
            >
              {savingAccount ? 'SAVING...' : 'SAVE CHANGES'}
            </button>
          </div>
        </form>
      </section>

      {/* Section 2: Change Password */}
      <section className="bg-surface-container-low border border-outline-variant rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-primary text-2xl">lock</span>
          <h3 className="font-headline-md text-lg font-bold text-on-surface">Change Password</h3>
        </div>
        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">CURRENT PASSWORD</label>
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded p-3 text-on-surface font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                placeholder="••••••••"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">NEW PASSWORD</label>
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded p-3 text-on-surface font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                placeholder="••••••••"
                type="password"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">CONFIRM NEW PASSWORD</label>
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-surface border border-outline-variant/60 rounded p-3 text-on-surface font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                placeholder="••••••••"
                type="password"
                required
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingPassword}
              className="border border-outline-variant text-on-surface px-6 py-2.5 rounded-lg font-label-caps font-bold text-xs hover:bg-surface-variant transition-all active:scale-95 disabled:opacity-50"
            >
              {savingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </div>
        </form>
      </section>

      {/* Section 3: Preferences */}
      <section className="bg-surface-container-low border border-outline-variant rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-secondary text-2xl">tune</span>
          <h3 className="font-headline-md text-lg font-bold text-on-surface">System Preferences</h3>
        </div>
        <div className="space-y-4">
          {/* Toggle 1 */}
          <div className="flex items-center justify-between py-4 border-b border-outline-variant/30">
            <div>
              <p className="font-body-default text-sm text-on-surface font-semibold">Critical Error Push Notifications</p>
              <p className="text-xs text-on-surface-variant">Receive alerts on your mobile device when a printer halts.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={criticalNotify} 
                onChange={(e) => handleTogglePreference('critical', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>

          {/* Toggle 2 */}
          <div className="flex items-center justify-between py-4 border-b border-outline-variant/30">
            <div>
              <p className="font-body-default text-sm text-on-surface font-semibold">Weekly Performance Digest</p>
              <p className="text-xs text-on-surface-variant">Email summary of fleet uptime and material usage.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={weeklyDigest} 
                onChange={(e) => handleTogglePreference('weekly', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-container"></div>
            </label>
          </div>

          {/* Toggle 3 */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="font-body-default text-sm text-on-surface font-semibold">Auto-Refresh Dashboard</p>
              <p className="text-xs text-on-surface-variant">Update dashboard metrics every 30 seconds automatically.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoRefresh} 
                onChange={(e) => handleTogglePreference('refresh', e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
            </label>
          </div>
        </div>
      </section>

      {/* Section 4: Danger Zone */}
      <section className="bg-surface-container-low border border-error-container/50 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="material-symbols-outlined text-error text-2xl">warning</span>
          <h3 className="font-headline-md text-lg font-bold text-error">Danger Zone</h3>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-gutter p-6 bg-error-container/10 rounded-lg">
          <div className="text-center md:text-left">
            <p className="font-body-default text-sm text-on-surface font-bold">Session Management</p>
            <p className="text-xs text-on-surface-variant">Force log out of all active web and mobile sessions.</p>
          </div>
          <button 
            onClick={onLogout}
            className="border border-error text-error px-6 py-2 rounded-lg font-label-caps font-bold text-xs hover:bg-error/15 transition-all active:scale-95"
          >
            LOG OUT DEVICE
          </button>
        </div>
        <div className="mt-gutter flex flex-col md:flex-row items-center justify-between gap-gutter p-6 bg-error-container/20 rounded-lg border border-error-container/30">
          <div className="text-center md:text-left">
            <p className="font-body-default text-sm text-error font-bold">Permanent Deletion</p>
            <p className="text-xs text-on-surface-variant">Irreversibly delete your account and all associated printer telemetry data.</p>
          </div>
          <button 
            onClick={() => {
              if (window.confirm('WARNING: THIS ACTION CANNOT BE UNDONE. Delete account and purge telemetry databases?')) {
                onLogout();
              }
            }}
            className="bg-error text-on-error px-6 py-2 rounded-lg font-label-caps font-bold text-xs hover:brightness-110 transition-all active:scale-95"
          >
            DELETE ACCOUNT
          </button>
        </div>
      </section>

      {/* Footer system details */}
      <div className="pt-8 text-center border-t border-outline-variant/20">
        <p className="text-on-surface-variant font-technical-data text-[10px] uppercase">
          System Instance: PS-ALPHA-V4.2 • Build: 02.24.2024.1205
        </p>
      </div>
    </div>
  );
}
