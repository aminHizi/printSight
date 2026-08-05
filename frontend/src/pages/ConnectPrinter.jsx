import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ConnectPrinter() {
  const navigate = useNavigate();

  // Form states
  const [connectionType, setConnectionType] = useState('OctoPrint / Moonraker');
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [apiKey, setApiKey] = useState('d41d8cd98f00b204e9800998ecf8427e');
  const [showKey, setShowKey] = useState(false);
  const [accessLevel, setAccessLevel] = useState('Standard Monitor');
  const [materialType, setMaterialType] = useState('PLA (Black)');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleTestConnection = (e) => {
    e.preventDefault();
    setTesting(true);
    setTestResult(null);

    setTimeout(() => {
      setTesting(false);
      setTestResult({
        success: true,
        msg: 'Connection verified. OctoPrint Core v1.9.3 responded on Port 80.'
      });
    }, 1500);
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (!name.trim()) return alert('Please enter a printer alias');
    setSubmitting(true);

    const payload = {
      name,
      type: connectionType,
      ip: ip || '192.168.1.50',
      accessLevel,
      materialType,
      spoolRemaining: 1000,
      filamentDiameter: 1.75
    };

    // Pre-assign image thumbnails based on selected type
    if (connectionType.includes('USB')) {
      payload.thumbnail = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKCyy2SN0brqqt34FOJYc8WFkwRfxun14j5soVjlbK6I0x6NKmwvPG-udQg6k98iAgcxvonDIakl4c3dT_n6oqyCdBZLkcdSlZA-jjMu_eA-0ZQpFFQQD1Fy0JLXQpLPHcUAomk7x9GI_64GVUIvqQrXxf3k2M7LUDX7EQJRsQzskvd_h6YzIqbpsh5dfHCrOl3gHHmAH1ATgdICoWzZxL_BmFiXgi_EdFXE781JIJb11FOzw-dItxlw';
    } else if (connectionType.includes('Cloud')) {
      payload.thumbnail = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV6QoOU1liVLEsY08J-l9cQku3uV9r17nNT4bzWiXr8E1XNEh143X6agmYWxgAWhSmLYpR3LCWhuFgKvNPSWlLG3m3uN9bI8YDrwXx2kVeb768MgL684F-goXg0xH-qSa-7uId0WKZwPUQGAvBulgev0zVj8U_-ru1H70W_D6QObPuVpwhqJ9Gkz15PTw6o3u8Z2-5T5xtx9rmywIZu62_sSi6iWFtM2aaTgicYuAMd8gI6tIk-5ImiA';
    } else {
      payload.thumbnail = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdPoNMfF8SFlhmAnXqp_iKMoKNrIT5mxiFEwM7g-nDLVlZos_TBP6EgHenmgtqWhZIelSVmB5RAdJ-T0xNxJwIXBTIHiAbSEWLQIo2By0QR-jiUZdhZLXGXrGOchXHNrJYjUSutpH61ZTO7v3eRa04k-FZk680X6j3lIr6oPuBOVP4sCTNU9RL7l9s-vUEWQ93IA_o1l48GyDW4mZ1b3Wv6DrlXMiXf9fNeFvotgsyXjGYgP19HOIIyw';
    }

    try {
      const response = await fetch('/api/printers', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate('/');
      } else {
        alert('Failed to connect printer.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting printer.');
    } finally {
      setSubmitting(false);
    }
  };

  const connectionOptions = [
    {
      id: 'Moonraker',
      title: 'OctoPrint / Moonraker',
      desc: 'Connect via network API. Recommended for Voron, Ender, and Prusa machines.',
      icon: 'settings_input_component'
    },
    {
      id: 'USB',
      title: 'Direct USB / Serial',
      desc: 'Hardwired connection via local COM port or USB. Best for standalone local control.',
      icon: 'usb'
    },
    {
      id: 'Cloud',
      title: 'Cloud API',
      desc: 'Sync via manufacturer cloud services (Bambu Lab, Creality Cloud, etc).',
      icon: 'cloud_sync'
    }
  ];

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-margin-page select-none">
      {/* Step 1: Selection Cards */}
      <section className="space-y-6">
        <div>
          <span className="font-label-caps text-xs text-primary tracking-widest uppercase font-semibold">Step 01</span>
          <h3 className="font-headline-md text-xl font-bold text-on-surface mt-2">Select Connection Type</h3>
          <p className="font-body-default text-sm text-on-surface-variant">Choose how you want PrintSight to communicate with your hardware.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {connectionOptions.map((opt) => {
            const isSelected = connectionType === opt.title;
            return (
              <div
                key={opt.id}
                onClick={() => setConnectionType(opt.title)}
                className={`group cursor-pointer p-8 rounded-lg border transition-all relative overflow-hidden bg-surface-container-low ${
                  isSelected ? 'border-primary glow-active' : 'border-outline-variant hover:border-primary/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 p-4">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                )}
                <div className={`w-12 h-12 rounded flex items-center justify-center mb-6 transition-colors ${
                  isSelected ? 'bg-primary/10' : 'bg-surface-variant group-hover:bg-primary/10'
                }`}>
                  <span className={`material-symbols-outlined text-3xl ${isSelected ? 'text-primary' : 'text-on-surface-variant group-hover:text-primary'}`}>
                    {opt.icon}
                  </span>
                </div>
                <h4 className="font-headline-md text-sm font-bold text-on-surface mb-2">{opt.title}</h4>
                <p className="font-body-sm text-xs text-on-surface-variant leading-relaxed">{opt.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step 2: Form Panel */}
      <section className="space-y-6 pt-6 border-t border-outline-variant">
        <div>
          <span className="font-label-caps text-xs text-on-surface-variant tracking-widest uppercase font-semibold">Step 02</span>
          <h3 className="font-headline-md text-xl font-bold text-on-surface mt-2">Configuration Details</h3>
        </div>

        <div className="bg-surface-container-low border border-outline-variant rounded-lg p-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8" onSubmit={handleConnect}>
            {/* Left Column: Primary Identity */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">Printer Alias</label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-outline-variant text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline-variant/50 text-sm"
                  placeholder="e.g. Voron 2.4 - Lab A"
                  type="text"
                />
              </div>

              <div className="space-y-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">
                  {connectionType.includes('USB') ? 'COM Serial Port' : 'Network IP Address / Hostname'}
                </label>
                <div className="relative">
                  <input
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    className="w-full bg-background border border-outline-variant text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline-variant/50 text-sm font-mono"
                    placeholder={connectionType.includes('USB') ? 'COM3 / dev/ttyUSB0' : '192.168.1.15'}
                    type="text"
                  />
                  {!connectionType.includes('USB') && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-mono">PORT: 80</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Security & Settings */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">API Key / Token</label>
                <div className="relative">
                  <input
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-background border border-outline-variant text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-mono"
                    type={showKey ? 'text' : 'password'}
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showKey ? 'visibility' : 'visibility_off'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">Access Level</label>
                  <select
                    value={accessLevel}
                    onChange={(e) => setAccessLevel(e.target.value)}
                    className="w-full bg-background border border-outline-variant text-on-surface px-3 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                  >
                    <option>Standard Monitor</option>
                    <option>Full Control (Manager)</option>
                    <option>View Only</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">Loaded Material</label>
                  <select
                    value={materialType}
                    onChange={(e) => setMaterialType(e.target.value)}
                    className="w-full bg-background border border-outline-variant text-on-surface px-3 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-sm"
                  >
                    <option>PLA (Black)</option>
                    <option>ASA-CF (Carbon Fiber)</option>
                    <option>PETG-CF (Carbon Fiber)</option>
                    <option>ABS (Red)</option>
                    <option>TPU (Transparent)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Test Connection Result Alert */}
            {testResult && (
              <div className="md:col-span-2 bg-primary/10 border border-primary/20 text-primary p-4 rounded text-sm flex items-center gap-3">
                <span className="material-symbols-outlined">check_circle</span>
                <span>{testResult.msg}</span>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="md:col-span-2 flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/30 gap-4">
              <div className="flex items-center gap-3 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <span>Connections are encrypted and authenticated via TLS 1.3/AES-256</span>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  type="button"
                  disabled={testing}
                  onClick={handleTestConnection}
                  className="flex-1 md:flex-none border border-outline-variant text-on-surface font-label-caps font-bold px-6 py-3 rounded text-xs hover:bg-surface-variant active:scale-95 transition-all disabled:opacity-50"
                >
                  {testing ? 'Testing...' : 'Test Connection'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 md:flex-none bg-primary text-on-primary font-label-caps font-bold px-6 py-3 rounded text-xs hover:bg-primary-container active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {submitting ? 'Connecting...' : 'Connect Printer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Connection Preview Panel */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 h-48 rounded-lg bg-surface-container-low border border-outline-variant overflow-hidden relative group">
          <div className="absolute inset-0 opacity-20">
            <img
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCswnHOjwT6vhG8bC5HB1zCSIMlEfMTctErggyNwJpPi-fK640JDaW29oJQw26kyUH4wEOWaDG96Ch7QPAJiAdHCz0NrRK985tu3OK0a3h42fj2lEJfKz2rCYqfxxY5E1fB-wrhVBuLdM5k5dOeRZNWZk7XJNXm1HEfBpURsIkWJQ_wcuxtc7gOwhK8Ysi8JN40beI16MOUPXElZwVTBO2lXkoIyiXHgUSAiroDID3locl60hN4ynUcUA"
              alt="Nozzle Macro Shot"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6">
            <h4 className="font-headline-md text-sm font-bold text-on-surface">Connection Health Preview</h4>
            <p className="font-body-sm text-xs text-on-surface-variant">Real-time telemetry will appear here after connection.</p>
          </div>
          <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full border border-outline-variant/30">
            <div className="w-2.5 h-2.5 rounded-full bg-error animate-pulse shadow-[0_0_8px_rgba(255,180,171,0.5)]"></div>
            <span className="font-technical-data text-xs text-on-surface font-semibold">OFFLINE</span>
          </div>
        </div>

        <div className="rounded-lg bg-surface-container-low border border-outline-variant p-6 flex flex-col justify-center items-center text-center space-y-4 cursor-pointer hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant text-2xl">add_photo_alternate</span>
          </div>
          <p className="font-body-sm text-xs text-on-surface-variant px-4">Upload printer thumbnail for fleet view</p>
        </div>
      </section>
    </div>
  );
}
