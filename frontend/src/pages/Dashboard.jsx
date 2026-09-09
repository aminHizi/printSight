import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard({ printers = [], logs = [], onCommand, searchQuery = '' }) {
  const navigate = useNavigate();

  // Statistics calculation
  const total = printers.length;
  const online = printers.filter(p => p.status !== 'OFFLINE').length;
  const printing = printers.filter(p => p.status === 'PRINTING').length;
  const idle = printers.filter(p => p.status === 'IDLE').length;
  const inError = printers.filter(p => p.status === 'ERROR').length;
  const heating = printers.filter(p => p.status === 'HEATING').length;

  // Filter printers based on search query
  const filteredPrinters = printers.filter(printer => 
    printer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    printer.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (printer.currentJob && printer.currentJob.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Total Fleet load (Printing + Heating / Total)
  const activeCount = printing + heating;
  const loadPercentage = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  // Calculate stroke dasharray for SVG donut (circumference = 2 * PI * r = 2 * 3.14159 * 58 ≈ 364.4)
  const circ = 364.4;
  const strokeDashoffset = circ - (loadPercentage / 100) * circ;

  // Default thumbnail fallback
  const fallbackThumbnail = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdPoNMfF8SFlhmAnXqp_iKMoKNrIT5mxiFEwM7g-nDLVlZos_TBP6EgHenmgtqWhZIelSVmB5RAdJ-T0xNxJwIXBTIHiAbSEWLQIo2By0QR-jiUZdhZLXGXrGOchXHNrJYjUSutpH61ZTO7v3eRa04k-FZk680X6j3lIr6oPuBOVP4sCTNU9RL7l9s-vUEWQ93IA_o1l48GyDW4mZ1b3Wv6DrlXMiXf9fNeFvotgsyXjGYgP19HOIIyw';

  return (
    <div className="space-y-10 select-none text-left">
      {/* Header Info */}
      <div className="space-y-1.5">
        <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface dark:text-white">Fleet Overview</h1>
        <p className="text-on-surface-variant dark:text-slate-400 font-body-default text-sm">
          Real-time status monitor of active nodes in your local 3D print cluster.
        </p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {/* Online Stats Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-40 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-10 h-10 flex items-center justify-center bg-primary-container dark:bg-blue-950/30 text-secondary dark:text-blue-400 rounded-xl">
            <span className="material-symbols-outlined text-xl">wifi</span>
          </div>
          <div>
            <div className="font-headline-lg text-3xl font-extrabold text-on-surface dark:text-white leading-none">{online}</div>
            <div className="text-on-surface-variant dark:text-slate-400 font-body-default text-[11px] font-semibold uppercase tracking-wider mt-2">
              Online Nodes
            </div>
          </div>
        </div>

        {/* Printing Stats Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-40 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-10 h-10 flex items-center justify-center bg-primary-container dark:bg-blue-950/30 text-secondary dark:text-blue-400 rounded-xl">
            <span className="material-symbols-outlined text-xl">print</span>
          </div>
          <div>
            <div className="font-headline-lg text-3xl font-extrabold text-on-surface dark:text-white leading-none">{printing}</div>
            <div className="text-on-surface-variant dark:text-slate-400 font-body-default text-[11px] font-semibold uppercase tracking-wider mt-2">
              Active Jobs
            </div>
          </div>
        </div>

        {/* Idle Stats Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-40 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-10 h-10 flex items-center justify-center bg-primary-container dark:bg-blue-950/30 text-secondary dark:text-blue-400 rounded-xl">
            <span className="material-symbols-outlined text-xl">hourglass_empty</span>
          </div>
          <div>
            <div className="font-headline-lg text-3xl font-extrabold text-on-surface dark:text-white leading-none">{idle}</div>
            <div className="text-on-surface-variant dark:text-slate-400 font-body-default text-[11px] font-semibold uppercase tracking-wider mt-2">
              Standby Nodes
            </div>
          </div>
        </div>

        {/* Error Stats Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-40 shadow-sm hover:shadow-md transition-all duration-200">
          <div className="w-10 h-10 flex items-center justify-center bg-primary-container dark:bg-blue-950/30 text-secondary dark:text-blue-400 rounded-xl">
            <span className="material-symbols-outlined text-xl">error_outline</span>
          </div>
          <div>
            <div className="font-headline-lg text-3xl font-extrabold text-on-surface dark:text-white leading-none">{inError}</div>
            <div className="text-on-surface-variant dark:text-slate-400 font-body-default text-[11px] font-semibold uppercase tracking-wider mt-2">
              Halted Nodes
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Subsection Title */}
      <div className="pt-4 border-t border-outline-variant/60 dark:border-slate-800/80">
        <h2 className="font-headline-lg text-2xl font-extrabold text-on-surface dark:text-white">Printer Fleet</h2>
      </div>

      {/* Empty State — when no printers are connected */}
      {filteredPrinters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl shadow-sm">
          <div className="w-16 h-16 flex items-center justify-center bg-primary-container dark:bg-blue-950/30 text-primary dark:text-blue-400 rounded-2xl mb-5">
            <span className="material-symbols-outlined text-3xl">precision_manufacturing</span>
          </div>
          <h3 className="font-headline-md text-lg font-bold text-on-surface dark:text-white mb-1.5">
            {searchQuery ? 'No matching printers' : 'No printers connected'}
          </h3>
          <p className="text-on-surface-variant dark:text-slate-400 text-sm text-center max-w-sm mb-6">
            {searchQuery
              ? `No printers match "${searchQuery}". Try a different search term.`
              : 'Connect your first printer node to start monitoring your fleet in real-time.'}
          </p>
          {!searchQuery && (
            <button 
              onClick={() => navigate('/connect')}
              className="bg-primary hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Connect a Printer</span>
            </button>
          )}
        </div>
      )}

      {/* Fleet Cards Grid */}
      {filteredPrinters.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPrinters.map(printer => {
            let statusText = printer.status;
            let badgeColorClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

            if (printer.status === 'PRINTING') {
              statusText = `Printing - ${printer.progress || 0}%`;
              badgeColorClass = 'bg-blue-50 text-blue-700 border border-blue-200/55 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30';
            } else if (printer.status === 'HEATING') {
              statusText = 'Heating';
              badgeColorClass = 'bg-sky-50 text-sky-700 border border-sky-200/55 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/30';
            } else if (printer.status === 'ERROR') {
              statusText = printer.errorAlert || 'Alert';
              badgeColorClass = 'bg-red-50 text-red-700 border border-red-200/55 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30';
            } else if (printer.status === 'IDLE') {
              statusText = 'Idle';
              badgeColorClass = 'bg-gray-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
            }

            const printerId = printer._id || printer.id;
            const thumbSrc = printer.thumbnail || fallbackThumbnail;

            return (
              <div 
                key={printerId}
                onClick={() => navigate(`/printer/${printerId}`)}
                className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer group"
              >
                {/* Card Thumbnail Image */}
                <div className="relative h-40 w-full bg-slate-50 dark:bg-slate-950 overflow-hidden border-b border-outline-variant/60 dark:border-slate-800/80">
                  <img 
                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-[1.02] transition-all duration-300" 
                    src={thumbSrc} 
                    alt={printer.name}
                    onError={(e) => { e.target.src = fallbackThumbnail; }}
                  />
                  <div className={`absolute top-3 left-3 flex items-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-outline-variant/60 dark:border-slate-800 text-xs font-semibold ${badgeColorClass}`}>
                    <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      printer.status === 'PRINTING' ? 'bg-secondary' : 
                      printer.status === 'HEATING' ? 'bg-primary animate-pulse' :
                      printer.status === 'ERROR' ? 'bg-red-600 animate-pulse' : 'bg-slate-400'
                    }`}></div>
                    <span className="font-label-caps text-[9px] font-bold uppercase tracking-wider">{statusText}</span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-5 flex flex-col flex-grow space-y-3.5">
                  
                  {/* Brand Stack */}
                  <div className="flex gap-3.5 items-center">
                    <div className="w-10 h-10 flex items-center justify-center bg-primary-container dark:bg-blue-950/30 text-secondary dark:text-blue-400 rounded-xl shrink-0">
                      <span className="material-symbols-outlined text-lg">precision_manufacturing</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md font-bold text-on-surface dark:text-white text-[15px] group-hover:text-primary transition-colors duration-200 leading-tight">
                        {printer.name}
                      </h3>
                      <p className="text-xs text-on-surface-variant dark:text-slate-400 font-body-default leading-none mt-0.5">
                        {printer.type}
                      </p>
                    </div>
                  </div>

                  {/* Telemetries */}
                  {printer.status === 'ERROR' ? (
                    <div className="grid grid-cols-2 gap-3 bg-red-50/70 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/20 text-red-800 dark:text-red-300">
                      <div>
                        <span className="font-label-caps text-[9px] block font-bold tracking-wider opacity-80">LAST TEMP</span>
                        <span className="font-technical-data text-xs font-semibold">{printer.nozzleTemp ?? '—'}°C</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-base">warning</span>
                        <span className="font-body-default text-xs leading-none">Error detected</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 border border-outline-variant/60 dark:border-slate-800/80 p-3 rounded-xl text-on-surface dark:text-white">
                      <div>
                        <span className="font-label-caps text-[9px] text-on-surface-variant dark:text-slate-400 block font-bold tracking-wider">NOZZLE</span>
                        <span className="font-technical-data text-xs font-semibold">{printer.nozzleTemp ?? '—'}°C</span>
                      </div>
                      <div>
                        <span className="font-label-caps text-[9px] text-on-surface-variant dark:text-slate-400 block font-bold tracking-wider">BED</span>
                        <span className="font-technical-data text-xs font-semibold">{printer.bedTemp ?? '—'}°C</span>
                      </div>
                    </div>
                  )}

                  {/* Actions/Job Progress */}
                  <div className="pt-1.5 mt-auto" onClick={(e) => e.stopPropagation()}>
                    {printer.status === 'PRINTING' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-label-caps text-on-surface-variant dark:text-slate-400">
                          <span className="truncate max-w-[120px] font-technical-data font-bold">{printer.currentJob || 'Active Job'}</span>
                          <span className="font-technical-data">{printer.timeRemaining || '—'}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${printer.progress || 0}%` }}></div>
                        </div>
                      </div>
                    )}

                    {printer.status === 'HEATING' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-label-caps text-on-surface-variant dark:text-slate-400">
                          <span className="truncate font-technical-data font-bold">Pre-heating...</span>
                          <span className="font-technical-data">{printer.nozzleTemp ?? '—'}/{printer.targetNozzleTemp ?? '—'}°C</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary animate-pulse rounded-full" style={{ width: '45%' }}></div>
                        </div>
                      </div>
                    )}

                    {printer.status === 'IDLE' && (
                      <button 
                        onClick={() => onCommand(printer._id || printer.id, 'START', { jobName: 'Coupler_3V.gcode', nozzle: 230, bed: 60 })}
                        className="w-full py-2.5 bg-primary hover:bg-blue-700 text-white rounded-full font-label-caps font-bold text-xs transition-all duration-200 flex items-center justify-center gap-1 shadow-sm"
                      >
                        <span>Start Job</span>
                        <span className="material-symbols-outlined text-xs">play_arrow</span>
                      </button>
                    )}

                    {printer.status === 'ERROR' && (
                      <button 
                        onClick={() => onCommand(printer._id || printer.id, 'DISMISS_ALERT')}
                        className="w-full py-2.5 border border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20 rounded-full font-label-caps font-bold text-xs transition-colors duration-200"
                      >
                        DISMISS ALERT
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Activity Logs & Utilization Layout */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* System Activity Log Card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex justify-between items-center mb-5">
            <h2 className="font-headline-lg text-lg font-bold text-on-surface dark:text-white">System Activity Log</h2>
            <span 
              onClick={() => navigate('/errors')}
              className="text-primary text-xs font-semibold cursor-pointer hover:underline transition-all"
            >
              View All Logs
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
            {logs.length === 0 ? (
              <div className="text-center py-10 text-on-surface-variant/50 dark:text-slate-500 text-xs">
                No activity logs yet.
              </div>
            ) : (
              logs.slice(0, 5).map(log => {
                let sevColor = 'text-primary';
                if (log.severity === 'CRITICAL') sevColor = 'text-red-600 dark:text-red-400';
                else if (log.severity === 'WARNING') sevColor = 'text-amber-500';

                return (
                  <div key={log.id || log._id} className="flex items-start border-b border-outline-variant/60 dark:border-slate-800/80 pb-3 last:border-0 last:pb-0">
                    <span className="font-technical-data text-on-surface-variant dark:text-slate-400 text-xs w-20 shrink-0 mt-0.5">{(log.timestamp || '').split(' ')[1] || log.timestamp}</span>
                    <div className="ml-4">
                      <p className="text-body-default text-sm text-on-surface dark:text-white leading-relaxed">
                        <span className={`${sevColor} font-bold mr-1.5`}>{log.printerName}</span>
                        {log.message}
                      </p>
                      <span className="text-[9px] text-on-surface-variant dark:text-slate-400 font-technical-data uppercase tracking-wider mt-1 block">{log.errorCode}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Fleet Utilization Load Card */}
        <div className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-sm">
          <div>
            <h2 className="font-headline-lg text-lg font-bold text-on-surface dark:text-white mb-1">Fleet Load</h2>
            <p className="text-on-surface-variant dark:text-slate-400 text-xs leading-normal">
              Total active throughput against hardware capacity.
            </p>
          </div>

          <div className="relative flex-grow flex items-center justify-center py-5">
            {/* SVG Donut Chart */}
            <svg className="w-28 h-28 transform -rotate-90">
              <circle 
                className="text-slate-100 dark:text-slate-800" 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="50" 
                stroke="currentColor" 
                strokeWidth="10" 
              />
              <circle 
                className="text-primary" 
                cx="56" 
                cy="56" 
                fill="transparent" 
                r="50" 
                stroke="currentColor" 
                strokeDasharray={314.2} 
                strokeDashoffset={314.2 - (loadPercentage / 100) * 314.2} 
                strokeWidth="10" 
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-technical-data text-2xl font-extrabold text-primary">{loadPercentage}%</span>
              <span className="text-[9px] font-label-caps font-bold text-on-surface-variant dark:text-slate-400 tracking-widest mt-0.5">LOADED</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-outline-variant/60 dark:border-slate-800/80 pt-4 text-xs">
            <div className="flex justify-between">
              <span className="text-on-surface-variant dark:text-slate-400">Active Job Queues</span>
              <span className="text-on-surface dark:text-white font-technical-data font-semibold">{activeCount} Running</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant dark:text-slate-400">Material Efficiency</span>
              <span className="text-on-surface dark:text-white font-technical-data font-semibold">94.8% Nominal</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
