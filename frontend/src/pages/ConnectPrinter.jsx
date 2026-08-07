import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Page component responsible for allowing the operator to connect a new printer.
export default function ConnectPrinter() {
  const navigate = useNavigate();

  // This app currently supports a single connection type.
  const connectionType = 'OctoPrint / Moonraker';
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [apiKey, setApiKey] = useState('d41d8cd98f00b204e9800998ecf8427e');
  const [showKey, setShowKey] = useState(false);
  const [materialType, setMaterialType] = useState('PLA (Black)');

  // UI state for connection test and submit progress.
  const [submitting, setSubmitting] = useState(false);


  // Called when the user submits the add printer form.
  const addPrinter = async (e) => {
    e.preventDefault();

    // Require a printer alias before continuing.
    if (!name.trim()) return alert('Please enter a printer alias');

    setSubmitting(true);

    // Build request payload from current form values.
    const payload = {
      name,
      type: connectionType,
      ip: ip || '192.168.1.50',
      materialType,
      spoolRemaining: 1000,
      filamentDiameter: 1.75,
      thumbnail: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdPoNMfF8SFlhmAnXqp_iKMoKNrIT5mxiFEwM7g-nDLVlZos_TBP6EgHenmgtqWhZIelSVmB5RAdJ-T0xNxJwIXBTIHiAbSEWLQIo2By0QR-jiUZdhZLXGXrGOchXHNrJYjUSutpH61ZTO7v3eRa04k-FZk680X6j3lIr6oPuBOVP4sCTNU9RL7l9s-vUEWQ93IA_o1l48GyDW4mZ1b3Wv6DrlXMiXf9fNeFvotgsyXjGYgP19HOIIyw'
    };

    try {
      // Send printer connection request to the backend.
      const response = await fetch('/api/addPrinter', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // On success, navigate back to the dashboard.
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

  return (
    <div className="space-y-12 max-w-5xl mx-auto pb-margin-page select-none">

      {/* Step 2: form fields to capture printer details */}
      <section className="space-y-6 pt-6 border-t border-outline-variant">
        <div>
        
          <h3 className="font-headline-md text-xl font-bold text-on-surface mt-2">Configuration Details</h3>
        </div>

        <div className="bg-surface-container-low border border-outline-variant rounded-lg p-6">
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8" onSubmit={addPrinter}>
            {/* Left column includes printer alias and address fields. */}
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
                <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold">Network IP Address / Hostname</label>
                <div className="relative">
                  <input
                    value={ip}
                    onChange={(e) => setIp(e.target.value)}
                    className="w-full bg-background border border-outline-variant text-on-surface px-4 py-3 rounded focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline-variant/50 text-sm font-mono"
                    placeholder="192.168.1.15"
                    type="text"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant font-mono">PORT: 80</span>
                </div>
              </div>
            </div>

            {/* Right column includes API key, access level, and material type. */}
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


            {/* Buttons for test and submit actions. */}
            <div className="md:col-span-2 flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/30 gap-4">
              <div className="flex items-center gap-3 text-on-surface-variant text-xs">
                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                <span>Connections are encrypted and authenticated via TLS 1.3/AES-256</span>
              </div>
              <div className="w-full md:w-auto">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary font-label-caps font-bold px-6 py-3 rounded text-xs hover:bg-primary-container active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {submitting ? 'Adding...' : 'Add Printer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Preview panel shows a visual mockup of connection health. */}
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

        {/* Placeholder card for thumbnail upload. */}
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
