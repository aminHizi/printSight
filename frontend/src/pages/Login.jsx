import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logoColored from '../assets/Fab43-Logo.png';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  // This state controls whether the form is in login mode or register mode.
  const [mode, setMode] = useState('login'); // 'login' or 'register'

  // These store the values typed by the user in the form.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // These track the current request status and any error message to show the user.
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Runs when the form is submitted.
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    // During registration, make sure both password fields match before sending the request.
    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg('Access keys do not match.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, name };

      const response = await fetch(endpoint, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onLoginSuccess(data.user);
        navigate('/');
      } else {
        setErrorMsg(data.message || (mode === 'login' ? 'Invalid operator credentials.' : 'Account creation failed.'));
      }
    } catch (error) {
      console.error(`${mode} error:`, error);
      setErrorMsg('Cannot connect to PrintSight service. Verify network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  return (
    <main className="flex h-screen w-full bg-background dark:bg-slate-950 transition-colors duration-200 select-none bg-grid-pattern">
      {/* Left Section: Authentication */}
      <section className="w-full lg:w-[42%] flex flex-col justify-center items-center px-8 bg-white dark:bg-dark-navy z-10 border-r border-outline-variant dark:border-slate-800 overflow-y-auto custom-scrollbar py-8">
        <div className="w-full max-w-sm space-y-8">
          
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <img 
              src={logoColored} 
              alt="Fab43 Logo" 
              className="h-10 w-auto object-contain" 
            />
            <div>
              <h1 className="font-headline-md text-xl font-bold tracking-tight text-on-surface dark:text-white leading-none">
                PrintSight
              </h1>
              <span className="text-[9px] font-label-caps uppercase tracking-widest text-on-surface-variant dark:text-slate-400 block mt-0.5">
                FLEET MANAGEMENT
              </span>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="font-headline-lg text-3xl font-extrabold text-on-surface dark:text-white leading-tight">
              {mode === 'login' ? 'Welcome back' : 'Create Account'}
            </h2>
            <p className="text-on-surface-variant dark:text-slate-400 font-body-default text-sm">
              {mode === 'login' 
                ? 'Enter your operator credentials to access the node cluster.' 
                : 'Register a new operator profile for this local workspace.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2.5 dark:bg-red-950/20 dark:border-red-900/30 dark:text-red-400">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider" htmlFor="name">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400 text-lg">
                    person
                  </span>
                  <input 
                    className="w-full bg-white dark:bg-slate-900/60 border border-outline-variant dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-on-surface dark:text-white font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 text-sm" 
                    id="name" 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alexander Vance" 
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400 text-lg">
                  alternate_email
                </span>
                <input 
                  className="w-full bg-white dark:bg-slate-900/60 border border-outline-variant dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-on-surface dark:text-white font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 text-sm" 
                  id="email" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@printsight.industrial" 
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider" htmlFor="password">Access Key</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400 text-lg">
                  lock
                </span>
                <input 
                  className="w-full bg-white dark:bg-slate-900/60 border border-outline-variant dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-on-surface dark:text-white font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 text-sm font-mono" 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider" htmlFor="confirmPassword">Confirm Access Key</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-400 text-lg">
                    lock_reset
                  </span>
                  <input 
                    className="w-full bg-white dark:bg-slate-900/60 border border-outline-variant dark:border-slate-800 rounded-xl py-3 pl-11 pr-4 text-on-surface dark:text-white font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 text-sm font-mono" 
                    id="confirmPassword" 
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" 
                    required
                  />
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex items-center justify-between py-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="rounded border-gray-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-primary focus:ring-primary w-4 h-4 cursor-pointer" type="checkbox" />
                  <span className="font-body-default text-on-surface-variant dark:text-slate-450 group-hover:text-on-surface dark:group-hover:text-white transition-colors">Remember station</span>
                </label>
                <a className="font-body-default font-semibold text-primary hover:text-blue-700 transition-colors" href="#" onClick={(e) => e.preventDefault()}>Reset key</a>
              </div>
            )}

            {/* Premium rounded-full primary button with chevron */}
            <button 
              className={`w-full bg-primary hover:bg-blue-700 text-white font-semibold py-3.5 px-6 rounded-full transition-all flex items-center justify-center gap-2 mt-4 active:scale-98 shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign in' : 'Create Operator'}</span>
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Secondary Action */}
          <div className="pt-6 text-center border-t border-outline-variant/60 dark:border-slate-800/80">
            <p className="font-body-default text-xs text-on-surface-variant dark:text-slate-400">
              {mode === 'login' ? (
                <>
                  Need to configure a new operator?{' '}
                  <button 
                    onClick={() => handleModeSwitch('register')}
                    className="text-primary font-bold hover:underline transition-all focus:outline-none"
                  >
                    Register profile
                  </button>
                </>
              ) : (
                <>
                  Already registered on this workstation?{' '}
                  <button 
                    onClick={() => handleModeSwitch('login')}
                    className="text-primary font-bold hover:underline transition-all focus:outline-none"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Footer Meta */}
          <div className="pt-6 flex justify-between items-center opacity-40 text-[9px] font-technical-data uppercase tracking-wider text-on-surface-variant dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
              <span>Service Online</span>
            </div>
            <span>v4.2.0-PRO</span>
          </div>
        </div>
      </section>

      {/* Right Section: Visual Content (Cinematic Camera Feed) */}
      <section className="hidden lg:block lg:w-[58%] relative overflow-hidden bg-slate-900">
        <img 
          className="absolute inset-0 w-full h-full object-cover opacity-80" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPTFvjtcSR8dXAoDEOHf8Fyvv9vpS829ZeY53LONfk48PyXl_vg6uMRCD29yAC4xoDiNILK-GUIG70swKzpdm863rqBTKKSDFuTV_pv3UM2iUNM7VQ9ClHJ-uzLsFB_DauTLZgdIgt1RQgxJqSShjF1LtCgRoKjEvt_dAWnVlWrSW3KblRGUoaBQm03akV9OdYPAsMJ4o6zckUBeh2nq6dnX76cu7CKiN4ryz3fTbzTu9cf1KCiK3vPg" 
          alt="Active 3D Print Camera Feed" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 dark:from-slate-950/40 to-transparent pointer-events-none"></div>

        {/* Live Simulation Overlay - Styled with beautiful glassmorphism */}
        <div className="absolute bottom-10 left-10 p-6 bg-white/70 dark:bg-slate-900/75 backdrop-blur-md border border-white/40 dark:border-slate-800/60 rounded-2xl max-w-sm shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center bg-white/50 dark:bg-slate-900/50">
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></div>
            </div>
            <span className="font-technical-data text-[10px] text-primary font-bold tracking-wider">LIVE TELEMETRY ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="font-label-caps text-[9px] text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block font-bold">Nozzle Temp</span>
              <span className="font-technical-data text-lg text-on-surface dark:text-white font-semibold">235.4°C</span>
            </div>
            <div className="space-y-1">
              <span className="font-label-caps text-[9px] text-on-surface-variant dark:text-slate-400 uppercase tracking-wider block font-bold">Build Progress</span>
              <span className="font-technical-data text-lg text-[#2563EB] dark:text-blue-400 font-semibold">74.2%</span>
            </div>
          </div>
          <div className="mt-4 w-full h-1.5 bg-gray-250 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[74.2%]"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
