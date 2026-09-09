import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

// Page component responsible for allowing the operator to connect a new printer.
export default function ConnectPrinter({ onPrinterAdded }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Connection / Printer type ('octoprint' or 'bambu')
  const [type, setType] = useState('octoprint');
  const [name, setName] = useState('');
  const [ip, setIp] = useState('');
  const [apiKey, setApiKey] = useState('d41d8cd98f00b204e9800998ecf8427e');
  const [showKey, setShowKey] = useState(false);
  const [materialType, setMaterialType] = useState('PLA (Black)');

  // Default thumbnail fallback
  const defaultThumbnail = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdPoNMfF8SFlhmAnXqp_iKMoKNrIT5mxiFEwM7g-nDLVlZos_TBP6EgHenmgtqWhZIelSVmB5RAdJ-T0xNxJwIXBTIHiAbSEWLQIo2By0QR-jiUZdhZLXGXrGOchXHNrJYjUSutpH61ZTO7v3eRa04k-FZk680X6j3lIr6oPuBOVP4sCTNU9RL7l9s-vUEWQ93IA_o1l48GyDW4mZ1b3Wv6DrlXMiXf9fNeFvotgsyXjGYgP19HOIIyw';
  const [thumbnail, setThumbnail] = useState(defaultThumbnail);

  // UI state for submit progress and success alert.
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Handle local image file load
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnail(reader.result); // Base64 data URL
      };
      reader.readAsDataURL(file);
    }
  };

  // Called when the user submits the add printer form.
  const addPrinter = async (e) => {
    e.preventDefault();

    if (!name.trim()) return alert('Please enter a printer alias');

    setSubmitting(true);

    const payload = {
      name,
      type,
      ip: ip || '192.168.1.50',
      materialType,
      spoolRemaining: 1000,
      filamentDiameter: 1.75,
      thumbnail // Use selected image state
    };

    try {
      const response = await fetch('/api/addPrinter', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        if (onPrinterAdded) {
          await onPrinterAdded();
        }
        // Reset form inputs (excluding apiKey for easy recurring config if wanted)
        setName('');
        setIp('');
        setThumbnail(defaultThumbnail);
        setSuccessMsg('Workstation node linked successfully!');
        setTimeout(() => setSuccessMsg(''), 5000);
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
    <div className="space-y-6 max-w-4xl mx-auto pb-12 select-none text-left">
      
      {/* Inline Back Button */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-on-surface-variant dark:text-slate-400 hover:text-primary transition-colors duration-200 group"
      >
        <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
        <span className="text-sm font-semibold">Back to Fleet Overview</span>
      </button>

      {/* Page Header */}
      <div className="space-y-1.5 border-b border-outline-variant/60 dark:border-slate-800/80 pb-5">
        <h2 className="font-headline-lg text-2xl font-extrabold text-on-surface dark:text-white">Connect New Node</h2>
        <p className="text-on-surface-variant dark:text-slate-400 font-body-default text-sm">
          Link a Klipper/OctoPrint node to your unified dashboard cluster.
        </p>
      </div>

      {/* Form Card */}
      <section className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl p-8 shadow-sm">
        <h3 className="font-headline-lg text-lg font-bold text-on-surface dark:text-white mb-6">Configuration Details</h3>

        {/* Success Message Banner */}
        {successMsg && (
          <div className="mb-6 bg-emerald-50 border border-emerald-250 text-emerald-800 p-4 rounded-xl text-xs flex items-center gap-2.5 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-450">
            <span className="material-symbols-outlined text-sm text-emerald-600 dark:text-emerald-450">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5" onSubmit={addPrinter}>
          
          {/* Connection / Printer Type */}
          <div className="space-y-2">
            <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-455 uppercase font-bold tracking-wider">Connection Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 text-on-surface dark:text-white px-3 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-body-default"
            >
              <option value="octoprint">OctoPrint / Moonraker Node</option>
              <option value="bambu">Bambu Lab MQTT Node</option>
            </select>
          </div>

          {/* Printer Alias */}
          <div className="space-y-2">
            <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">Printer Alias</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 text-on-surface dark:text-white px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline-variant/50 text-sm font-body-default"
              placeholder="e.g. Voron 2.4 - Lab A"
              type="text"
            />
          </div>

          {/* Network IP Address */}
          <div className="space-y-2">
            <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">Network IP Address / Hostname</label>
            <div className="relative">
              <input
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 text-on-surface dark:text-white px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-outline-variant/50 text-sm font-mono"
                placeholder="192.168.1.15"
                type="text"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant dark:text-slate-450 font-mono">PORT: 80</span>
            </div>
          </div>

          {/* API Key / Token */}
          <div className="space-y-2">
            <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">API Key / Token</label>
            <div className="relative">
              <input
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 text-on-surface dark:text-white px-4 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-mono"
                type={showKey ? 'text' : 'password'}
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant dark:text-slate-450 hover:text-primary transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-lg">
                  {showKey ? 'visibility' : 'visibility_off'}
                </span>
              </button>
            </div>
          </div>

          {/* Loaded Material */}
          <div className="space-y-2">
            <label className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">Loaded Material</label>
            <select
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-outline-variant dark:border-slate-800 text-on-surface dark:text-white px-3 py-3 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm font-body-default"
            >
              <option>PLA (Black)</option>
              <option>ASA-CF (Carbon Fiber)</option>
              <option>PETG-CF (Carbon Fiber)</option>
              <option>ABS (Red)</option>
              <option>TPU (Transparent)</option>
            </select>
          </div>

          {/* Submit Action Area */}
          <div className="md:col-span-2 flex flex-col md:flex-row justify-between items-center pt-8 border-t border-outline-variant/60 dark:border-slate-800/80 gap-4 mt-4">
            <div className="flex items-center gap-3 text-on-surface-variant dark:text-slate-400 text-xs font-body-default">
              <span className="material-symbols-outlined text-primary text-lg">info</span>
              <span>Workstation credentials will be encrypted using local hardware keys.</span>
            </div>
            <div className="w-full md:w-auto">
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto bg-primary hover:bg-blue-700 text-white font-label-caps font-bold px-8 py-3 rounded-full text-xs transition-all shadow-sm disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <span>{submitting ? 'Linking...' : 'Link Workstation'}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>

        </form>
      </section>

      {/* Preview Panel Section */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3 h-48 rounded-2xl bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 overflow-hidden relative group shadow-sm">
          <div className="absolute inset-0 opacity-20 dark:opacity-10">
            <img
              className="w-full h-full object-cover"
              src={thumbnail}
              alt="Nozzle Macro Shot"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-transparent"></div>
          <div className="absolute bottom-6 left-6">
            <h4 className="font-headline-lg text-sm font-bold text-on-surface dark:text-white">Connection Preview</h4>
            <p className="font-body-default text-xs text-on-surface-variant dark:text-slate-400">Live chamber diagnostics will render here once connected.</p>
          </div>
          <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md rounded-full border border-outline-variant/60 dark:border-slate-800 text-xs font-semibold text-on-surface dark:text-white">
            <div className="w-2 h-2 rounded-full bg-slate-400 shadow-[0_0_8px_rgba(156,163,175,0.5)]"></div>
            <span className="font-technical-data font-bold uppercase tracking-wider text-[9px]">OFFLINE</span>
          </div>
        </div>

        {/* Upload Thumbnail Card */}
        <div 
          onClick={() => fileInputRef.current.click()}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-6 flex flex-col justify-center items-center text-center space-y-3 cursor-pointer hover:border-primary/50 transition-colors shadow-sm"
        >
          {thumbnail !== defaultThumbnail ? (
            <div className="w-16 h-12 rounded-lg overflow-hidden border border-outline-variant/60 dark:border-slate-800">
              <img src={thumbnail} alt="Upload preview" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-xl bg-primary-container dark:bg-blue-950/30 text-secondary dark:text-blue-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">add_photo_alternate</span>
            </div>
          )}
          <p className="font-body-default text-xs text-on-surface-variant dark:text-slate-400 px-4 leading-normal font-semibold">
            {thumbnail !== defaultThumbnail ? 'Change thumbnail' : 'Upload thumbnail'}
          </p>
        </div>

        {/* Hidden File Input */}
        <input 
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
      </section>

    </div>
  );
}
