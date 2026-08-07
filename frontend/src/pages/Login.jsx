import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  // It sends either a login request or a registration request to the backend.
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
      // Choose the correct backend endpoint based on the selected mode.
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';

      // Build the request body with only the fields needed for that action.
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

      // If the request succeeds and the backend reports success, log the user in.
      if (response.ok && data.success) {
        onLoginSuccess(data.user);
        navigate('/');
      } else {
        // Show a useful error message from the backend or a fallback message.
        setErrorMsg(data.message || (mode === 'login' ? 'Invalid operator credentials.' : 'Account creation failed.'));
      }
    } catch (error) {
      // Handle network or server connection problems.
      console.error(`${mode} error:`, error);
      setErrorMsg('Cannot connect to PrintSight service. Verify network connection.');
    } finally {
      // Always stop the loading spinner once the request finishes.
      setLoading(false);
    }
  };

  // Switches between login and registration views and clears the old form values.
  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setEmail('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  return (
    <main className="flex h-screen w-full bg-background select-none">
      {/* Left Section: Authentication */}
      <section className="w-full lg:w-[40%] flex flex-col justify-center items-center px-gutter bg-surface z-10 border-r border-outline-variant overflow-y-auto custom-scrollbar py-6">
        <div className="w-full max-w-sm space-y-6">
          {/* Brand Identity */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-primary-container rounded-lg status-glow-primary">
                <span className="material-symbols-outlined text-on-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  precision_manufacturing
                </span>
              </div>
              <div>
                <h1 className="font-headline-md text-headline-md text-primary leading-none font-bold">PrintSight</h1>
                <p className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Industrial Fleet Management</p>
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h2 className="font-headline-lg text-[28px] text-on-surface font-bold leading-tight">
              {mode === 'login' ? 'System Access' : 'Create Operator'}
            </h2>
            <p className="text-on-surface-variant font-body-sm text-xs">
              {mode === 'login' 
                ? 'Enter operator credentials to access the fleet dashboard.' 
                : 'Register a new operator profile on this local workstation.'}
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-error/10 border border-error/20 text-error p-3 rounded text-xs flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            {/* Show the full name field only when creating a new account. */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold" htmlFor="name">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-default">
                    person
                  </span>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 text-sm" 
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
              <label className="font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold" htmlFor="email">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-default">
                  alternate_email
                </span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 text-sm" 
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
              <label className="font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold" htmlFor="password">Access Key</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-default">
                  lock
                </span>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 text-sm" 
                  id="password" 
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>

            {/* Confirm password is only needed during registration. */}
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="font-label-caps text-[10px] text-on-surface-variant uppercase font-semibold" htmlFor="confirmPassword">Confirm Access Key</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-body-default">
                    lock_reset
                  </span>
                  <input 
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-2.5 pl-10 pr-4 text-on-surface font-body-default focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/40 text-sm" 
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
              <div className="flex items-center justify-between py-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input className="rounded border-outline bg-surface-variant text-primary-container focus:ring-primary-container w-4 h-4 cursor-pointer" type="checkbox" />
                  <span className="font-body-sm text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">Remember station</span>
                </label>
                <a className="font-body-sm text-xs text-primary hover:underline" href="#" onClick={(e) => e.preventDefault()}>Reset key</a>
              </div>
            )}

            <button 
              className={`w-full bg-primary-container text-on-primary-container font-semibold py-3.5 rounded-lg status-glow-primary hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-2 ${loading ? 'opacity-70' : ''}`}
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
                  <span>{mode === 'login' ? 'Log in' : 'Create Operator'}</span>
                  <span className="material-symbols-outlined text-sm">{mode === 'login' ? 'login' : 'how_to_reg'}</span>
                </>
              )}
            </button>
          </form>

          {/* Secondary Action */}
          <div className="pt-6 text-center border-t border-outline-variant/30">
            <p className="font-body-sm text-xs text-on-surface-variant">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button 
                    onClick={() => handleModeSwitch('register')}
                    className="text-secondary font-bold hover:underline transition-all focus:outline-none"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an operator account?{' '}
                  <button 
                    onClick={() => handleModeSwitch('login')}
                    className="text-primary font-bold hover:underline transition-all focus:outline-none"
                  >
                    Log in
                  </button>
                </>
              )}
            </p>
          </div>

          {/* Footer Meta */}
          <div className="pt-8 flex justify-between items-center opacity-40">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary status-glow-primary"></div>
              <span className="font-technical-data text-[10px] uppercase">Service Online</span>
            </div>
            <span className="font-technical-data text-[10px]">v4.2.0-PRO</span>
          </div>
        </div>
      </section>

      {/* Right Section: Visual Content (Cinematic Print Shot) */}
      <section className="hidden lg:block lg:w-[60%] relative overflow-hidden bg-surface-container-lowest">
        <img 
          className="absolute inset-0 w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPTFvjtcSR8dXAoDEOHf8Fyvv9vpS829ZeY53LONfk48PyXl_vg6uMRCD29yAC4xoDiNILK-GUIG70swKzpdm863rqBTKKSDFuTV_pv3UM2iUNM7VQ9ClHJ-uzLsFB_DauTLZgdIgt1RQgxJqSShjF1LtCgRoKjEvt_dAWnVlWrSW3KblRGUoaBQm03akV9OdYPAsMJ4o6zckUBeh2nq6dnX76cu7CKiN4ryz3fTbzTu9cf1KCiK3vPg" 
          alt="Active 3D Print Camera Feed" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none"></div>

        {/* Live Simulation Overlay on Login Page */}
        <div className="absolute bottom-margin-page left-margin-page p-gutter bg-surface-container-low/80 backdrop-blur-md border border-outline-variant rounded-lg max-w-md">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
            </div>
            <span className="font-technical-data text-xs text-primary font-bold">LIVE MONITORING ACTIVE</span>
          </div>
          <div className="grid grid-cols-2 gap-stack-md">
            <div className="space-y-1">
              <span className="font-label-caps text-[10px] text-on-surface-variant block">Nozzle Temp</span>
              <span className="font-technical-data text-xl text-on-surface font-semibold">235.4°C</span>
            </div>
            <div className="space-y-1">
              <span className="font-label-caps text-[10px] text-on-surface-variant block">Build Progress</span>
              <span className="font-technical-data text-xl text-secondary font-semibold">74.2%</span>
            </div>
          </div>
          <div className="mt-4 w-full h-1 bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-primary w-[74.2%]"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
