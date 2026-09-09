import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function PrinterDetail({ printers = [], logs = [], onCommand, onDisconnect }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const consoleContainerRef = useRef(null);

  const printer = printers.find(p => p.id === id || p._id === id);

  // G-code mock console logs
  const [consoleLogs, setConsoleLogs] = useState([
    { text: 'M110 N0 *0 ; Reset line number', type: 'cmd' },
    { text: 'ok', type: 'res' },
    { text: 'M115 ; Get firmware version', type: 'cmd' },
    { text: 'ok PROTOCOL_VERSION:1.0 FIRMWARE_NAME:Klipper', type: 'res' },
    { text: 'G28 ; Home all axes', type: 'cmd' },
    { text: 'ok', type: 'res' },
    { text: 'G29 ; Auto bed leveling', type: 'cmd' },
    { text: 'ok bed variance: 0.002mm', type: 'res' }
  ]);

  // Command console input
  const [consoleInput, setConsoleInput] = useState('');

  // Scroll console content to bottom on update without moving the page viewport
  useEffect(() => {
    if (consoleContainerRef.current) {
      const container = consoleContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [consoleLogs]);

  // Ensure the detail page starts at the top of the viewport when navigating to a printer
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [id]);

  // Simulate console live scrolling when printer is printing
  useEffect(() => {
    if (!printer || printer.status !== 'PRINTING') return;

    const interval = setInterval(() => {
      const gcodes = [
        `G1 X${(Math.random() * 150 + 20).toFixed(2)} Y${(Math.random() * 150 + 20).toFixed(2)} E${(Math.random() * 0.2 + 0.05).toFixed(3)}`,
        `G1 X${(Math.random() * 150 + 20).toFixed(2)} Y${(Math.random() * 150 + 20).toFixed(2)} F${Math.floor(Math.random() * 2000 + 4000)}`,
        'M105 ; Query temperatures',
        `ok T:${printer.nozzleTemp} /${printer.targetNozzleTemp} B:${printer.bedTemp} /${printer.targetBedTemp}`
      ];

      const randomLine = gcodes[Math.floor(Math.random() * gcodes.length)];
      const type = randomLine.startsWith('ok') ? 'res' : 'cmd';

      setConsoleLogs(prev => [...prev.slice(-30), { text: randomLine, type }]);
    }, 4000);

    return () => clearInterval(interval);
  }, [printer, printer?.status, printer?.nozzleTemp, printer?.targetNozzleTemp, printer?.bedTemp, printer?.targetBedTemp]);

  if (!printer) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl max-w-md mx-auto space-y-6">
        <span className="material-symbols-outlined text-error text-5xl">warning</span>
        <h3 className="font-headline-md text-lg font-bold text-on-surface dark:text-white">Printer Not Found</h3>
        <p className="text-on-surface-variant dark:text-slate-400 font-body-default text-sm px-6">The printer configuration has been removed or the ID is invalid.</p>
        <button 
          onClick={() => navigate('/')} 
          className="bg-primary hover:bg-blue-700 text-white px-6 py-2.5 rounded-full font-label-caps text-xs font-bold active:scale-95 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // Filter logs only for this printer
  const printerLogs = logs.filter(l => l.printerName === printer.name);

  // Command handlers
  const handlePause = () => onCommand(printer._id || printer.id, 'PAUSE');
  const handleResume = () => onCommand(printer._id || printer.id, 'RESUME');
  const handleCancel = () => onCommand(printer._id || printer.id, 'CANCEL');
  const handleDismiss = () => onCommand(printer._id || printer.id, 'DISMISS_ALERT');
  const handleStartPrint = () => {
    const jobName = prompt('Enter G-Code file name to print:', 'Housing_Cover_V3.gcode') || 'Custom_Job.gcode';
    onCommand(printer._id || printer.id, 'START', { jobName, nozzle: 240, bed: 110 });
  };

  const handleConsoleSubmit = (e) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    setConsoleLogs(prev => [
      ...prev,
      { text: `> ${consoleInput}`, type: 'user' },
      { text: 'ok', type: 'res' }
    ]);
    setConsoleInput('');
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to disconnect ${printer.name}? This will clear its configuration telemetry.`)) {
      onDisconnect(printer._id || printer.id);
      navigate('/');
    }
  };

  // Safe access helpers
  const timeRemaining = printer.timeRemaining || '—';
  const timeShort = timeRemaining !== '—' ? (timeRemaining.split(' ')[0] || '—') : '—';

  return (
    <div className="space-y-6 select-none pt-2">
      {/* Back button */}
      <button 
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-on-surface-variant dark:text-slate-400 hover:text-primary transition-colors duration-200 group"
      >
        <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-1">arrow_back</span>
        <span className="text-sm font-semibold">Back to Fleet Overview</span>
      </button>

      {/* Page Header & Status Bar */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant/30 dark:border-slate-800/60 pb-6">
        <div>
          <h2 className="font-headline-lg text-3xl font-bold mb-1.5 text-on-surface dark:text-white">{printer.name}</h2>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-outline-variant/60 dark:border-slate-800 text-xs">
              <span className="material-symbols-outlined text-[16px] text-primary">link</span>
              <span className="font-technical-data font-semibold text-on-surface dark:text-white">{printer.type}</span>
            </span>
            <span className="flex items-center gap-2 px-3 py-1.5 bg-primary-container/10 dark:bg-blue-950/20 border border-primary/20 dark:border-blue-900/30 rounded-lg text-xs">
              <span className={`w-2 h-2 rounded-full ${
                printer.status === 'PRINTING' ? 'bg-secondary' : 
                printer.status === 'HEATING' ? 'bg-primary animate-pulse' :
                printer.status === 'ERROR' ? 'bg-error animate-pulse' : 'bg-outline'
              }`}></span>
              <span className="font-label-caps font-bold text-primary dark:text-blue-400">{printer.status}</span>
            </span>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <button 
            onClick={handleDelete}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-outline-variant dark:border-slate-800 text-on-surface dark:text-white font-label-caps text-xs font-bold hover:bg-error/15 hover:text-error hover:border-error/45 transition-colors active:scale-95"
          >
            Disconnect printer
          </button>
        </div>
      </section>

      {/* Camera Live stream and Logs Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Live feed video container */}
        <div className="col-span-12 lg:col-span-8">
          <div className="relative bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl overflow-hidden group">
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-outline-variant/30 dark:border-slate-800/60 text-xs">
              <span className="material-symbols-outlined text-primary text-[14px]">videocam</span>
              <span className="font-technical-data text-on-surface dark:text-white font-semibold">LIVE_FEED_01</span>
            </div>
            <div className="absolute bottom-4 right-4 z-10 font-technical-data text-[10px] text-on-surface-variant/80 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-lg border border-outline-variant/30 dark:border-slate-800/60">
              last updated 3s ago
            </div>
            <div className="aspect-video w-full bg-slate-50 dark:bg-slate-950">
              <img 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDygfR-z1BHgMunWrsuBAwmfZhvpJOuYLJ3bYbEOfno6fz-qegOer7fq2h8UxKjUshHx3MglaRa_pKK1XwLs0zfXYQ7g__hnUK_0FnVTTud4HX33XWemLIsqIR9U6dBPyBoxKWv5ZPMJ1Ev2_7VYLZekKHR9YVmf1sk_2aUUvqab5S5HkTVbXbA6xOUbgjIkZHyptNiUe6QEXmJhntIt_3ivND-F6mM5XpHB8XzmtgnV4-ZZkd4PoHjFg" 
                alt="Printer Build Chamber" 
              />
            </div>
            {/* Live progress footer */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-200 dark:bg-slate-800">
              <div 
                className="h-full bg-primary transition-all duration-1000 rounded-full" 
                style={{ width: `${printer.status === 'PRINTING' ? (printer.progress || 0) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Telemetry Logs Panel for this printer */}
        <div className="col-span-12 lg:col-span-4 flex flex-col">
          <div className="flex-grow bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl flex flex-col min-h-[300px]">
            <div className="px-5 py-4 border-b border-outline-variant dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 rounded-t-2xl">
              <span className="font-label-caps text-xs font-bold uppercase tracking-wider text-on-surface dark:text-white">Unit logs</span>
              <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 text-[18px]">filter_list</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 max-h-[340px]">
              {printerLogs.length === 0 ? (
                <div className="text-center py-10 text-on-surface-variant/40 dark:text-slate-500 text-xs">No historical records for this unit.</div>
              ) : (
                printerLogs.map(log => {
                  let badge = 'bg-primary';
                  if (log.severity === 'CRITICAL') badge = 'bg-error';
                  else if (log.severity === 'WARNING') badge = 'bg-secondary';

                  return (
                    <div key={log.id || log._id} className="flex gap-3">
                      <div className="mt-1"><span className={`w-2 h-2 rounded-full block ${badge}`}></span></div>
                      <div className="flex-1">
                        <p className="font-technical-data text-xs font-semibold text-on-surface dark:text-white">{log.errorCode}</p>
                        <p className="text-xs text-on-surface-variant dark:text-slate-400 leading-snug">{log.message}</p>
                        <span className="font-technical-data text-[9px] text-on-surface-variant/50 dark:text-slate-500 uppercase mt-0.5 block">{log.timestamp}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions Panel */}
      <section className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-6 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-on-surface dark:text-white">Hardware Operations Command</h4>
          <p className="text-xs text-on-surface-variant dark:text-slate-400 mt-0.5">Execute immediate g-code overrides or status changes.</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleStartPrint}
            disabled={printer.status !== 'IDLE'}
            className="bg-primary text-white font-label-caps text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            START
          </button>
          <button
            onClick={handlePause}
            disabled={printer.status !== 'PRINTING'}
            className="bg-secondary text-white font-label-caps text-xs font-bold px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            PAUSE
          </button>
          <button
            onClick={handleCancel}
            disabled={printer.status === 'IDLE'}
            className="bg-error text-white font-label-caps text-xs font-bold px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            STOP
          </button>
 
          {printer.status === 'ERROR' && printer.errorAlert === 'Paused by Operator' && (
            <button 
              onClick={handleResume}
              className="bg-primary text-white font-label-caps text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
            >
              RESUME
            </button>
          )}
 
          {printer.status === 'ERROR' && printer.errorAlert !== 'Paused by Operator' && (
            <button 
              onClick={handleDismiss}
              className="bg-primary text-white font-label-caps text-xs font-bold px-5 py-2.5 rounded-lg hover:bg-blue-700 active:scale-95 transition-all"
            >
              DISMISS ALERT & RESET
            </button>
          )}
 
          {printer.status === 'HEATING' && (
            <button 
              onClick={handleCancel}
              className="bg-error text-white font-label-caps text-xs font-bold px-5 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all"
            >
              ABORT PRE-HEAT
            </button>
          )}
        </div>
      </section>

      {/* Bento Telemetries */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Nozzle Temp */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-400 font-bold uppercase tracking-wide">Nozzle Temp</span>
          <div className="flex justify-between items-end mt-4">
            <div className="font-technical-data text-2xl font-bold text-on-surface dark:text-white">
              {printer.nozzleTemp ?? '—'}
              <span className="text-sm font-body-default text-on-surface-variant dark:text-slate-400 font-normal ml-0.5">°C</span>
            </div>
            {/* Sparkline chart */}
            <div className="w-16 h-8 flex items-end gap-[2px]">
              <div className="w-full bg-primary/20 h-2 rounded-sm"></div>
              <div className="w-full bg-primary/20 h-3 rounded-sm"></div>
              <div className="w-full bg-primary/20 h-4 rounded-sm"></div>
              <div className={`w-full h-6 rounded-sm ${printer.status === 'PRINTING' || printer.status === 'HEATING' ? 'bg-primary' : 'bg-primary/20'}`}></div>
              <div className={`w-full h-5 rounded-sm ${printer.status === 'PRINTING' || printer.status === 'HEATING' ? 'bg-primary' : 'bg-primary/20'}`}></div>
            </div>
          </div>
          <span className="text-[10px] font-technical-data text-on-surface-variant dark:text-slate-400 mt-3 block">
            TARGET: {printer.targetNozzleTemp ?? '—'}°C
          </span>
        </div>

        {/* Bed Temp */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-400 font-bold uppercase tracking-wide">Bed Temp</span>
          <div className="flex justify-between items-end mt-4">
            <div className="font-technical-data text-2xl font-bold text-on-surface dark:text-white">
              {printer.bedTemp ?? '—'}
              <span className="text-sm font-body-default text-on-surface-variant dark:text-slate-400 font-normal ml-0.5">°C</span>
            </div>
            {/* Sparkline chart */}
            <div className="w-16 h-8 flex items-end gap-[2px]">
              <div className="w-full bg-primary/20 h-3 rounded-sm"></div>
              <div className="w-full bg-primary/20 h-3 rounded-sm"></div>
              <div className="w-full bg-primary/20 h-4 rounded-sm"></div>
              <div className={`w-full h-5 rounded-sm ${printer.status === 'PRINTING' || printer.status === 'HEATING' ? 'bg-primary' : 'bg-primary/20'}`}></div>
              <div className={`w-full h-4 rounded-sm ${printer.status === 'PRINTING' || printer.status === 'HEATING' ? 'bg-primary' : 'bg-primary/20'}`}></div>
            </div>
          </div>
          <span className="text-[10px] font-technical-data text-on-surface-variant dark:text-slate-400 mt-3 block">
            TARGET: {printer.targetBedTemp ?? '—'}°C
          </span>
        </div>

        {/* Progress */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-400 font-bold uppercase tracking-wide">Progress</span>
          <div className="flex justify-between items-end mt-4">
            <div className="font-technical-data text-2xl font-bold text-primary">
              {printer.status === 'PRINTING' ? (printer.progress || 0) : printer.status === 'HEATING' ? '0' : '—'}
              {printer.status === 'PRINTING' && <span className="text-sm font-body-default text-on-surface-variant dark:text-slate-400 font-normal ml-0.5">%</span>}
            </div>
            <div className="w-16 h-8 flex items-end gap-[2px]">
              <div className="w-full bg-primary h-1 rounded-sm"></div>
              <div className="w-full bg-primary h-2 rounded-sm"></div>
              <div className="w-full bg-primary h-3 rounded-sm"></div>
              <div className="w-full bg-primary h-4 rounded-sm"></div>
              <div className="w-full bg-primary h-5 rounded-sm"></div>
            </div>
          </div>
          <span className="text-[10px] font-technical-data text-on-surface-variant dark:text-slate-400 mt-3 block">
            {printer.status === 'PRINTING' ? 'BUILD ACTIVE' : 'NO ACTIVE BUILD'}
          </span>
        </div>

        {/* Time Remaining */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-400 font-bold uppercase tracking-wide">Time Remaining</span>
          <div className="flex justify-between items-end mt-4">
            <div className="font-technical-data text-2xl font-bold text-on-surface dark:text-white">
              {printer.status === 'PRINTING' ? timeShort : printer.status === 'HEATING' ? 'Heating' : '—'}
            </div>
            <span className="material-symbols-outlined text-on-surface-variant dark:text-slate-400 text-2xl">schedule</span>
          </div>
          <span className="text-[10px] font-technical-data text-on-surface-variant dark:text-slate-400 mt-3 block">
            {printer.status === 'PRINTING' ? 'ESTIMATING COMPLETION' : 'STANDBY MODE'}
          </span>
        </div>
      </section>

      {/* Technical Specs & G-Code Console */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* G-Code console */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl p-5">
          <h4 className="font-label-caps text-xs font-bold text-on-surface dark:text-white mb-4 uppercase">G-Code Console</h4>
          <div ref={consoleContainerRef} className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4 h-48 overflow-y-auto custom-scrollbar font-technical-data text-xs leading-relaxed text-left flex flex-col space-y-1">
            {consoleLogs.map((log, index) => {
              let color = 'text-on-surface-variant/40 dark:text-slate-500';
              if (log.type === 'res') color = 'text-on-surface-variant/60 dark:text-slate-400';
              else if (log.type === 'user') color = 'text-primary font-semibold';
              else if (log.type === 'cmd') {
                if (log.text.startsWith('M105')) color = 'text-primary';
                else if (log.text.startsWith('W101')) color = 'text-secondary';
              }
              return (
                <div key={index} className={color}>
                  {log.type === 'user' ? log.text : `> ${log.text}`}
                </div>
              );
            })}
          </div>
          {/* Console inputs */}
          <form onSubmit={handleConsoleSubmit} className="mt-4 flex gap-2">
            <input 
              type="text" 
              value={consoleInput}
              onChange={(e) => setConsoleInput(e.target.value)}
              className="flex-grow bg-slate-50 dark:bg-slate-950 border border-outline-variant/60 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-on-surface dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-on-surface-variant/35 dark:placeholder:text-slate-500"
              placeholder="Send g-code command... (e.g. G28, M105)"
            />
            <button 
              type="submit"
              className="bg-primary text-white font-label-caps font-bold px-4 rounded-xl text-xs hover:bg-blue-700 active:scale-95 transition-all"
            >
              SEND
            </button>
          </form>
        </div>

        {/* Material Specs */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <h4 className="font-label-caps text-xs font-bold text-on-surface dark:text-white mb-4 uppercase">Material Specifications</h4>
          <div className="space-y-4">
            <div className="flex justify-between border-b border-outline-variant/30 dark:border-slate-800/60 pb-2">
              <span className="text-xs text-on-surface-variant dark:text-slate-400">Material Type</span>
              <span className="font-technical-data text-xs font-semibold text-on-surface dark:text-white">{printer.materialType || 'PLA (Black)'}</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/30 dark:border-slate-800/60 pb-2">
              <span className="text-xs text-on-surface-variant dark:text-slate-400">Filament Diameter</span>
              <span className="font-technical-data text-xs font-semibold text-on-surface dark:text-white">{printer.filamentDiameter || 1.75}mm (+/- 0.02)</span>
            </div>
            <div className="flex justify-between border-b border-outline-variant/30 dark:border-slate-800/60 pb-2">
              <span className="text-xs text-on-surface-variant dark:text-slate-400">Spool Weight Remaining</span>
              <span className="font-technical-data text-xs font-semibold text-on-surface dark:text-white">{printer.spoolRemaining ?? '—'}g / 1000g</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-on-surface-variant dark:text-slate-400">Ambient Temperature</span>
              <span className="font-technical-data text-xs font-semibold text-on-surface dark:text-white">42.8°C (Enclosure)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
