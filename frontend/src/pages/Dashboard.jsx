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
    printer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    printer.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (printer.currentJob && printer.currentJob.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Total Fleet load (Printing + Heating / Total)
  const activeCount = printing + heating;
  const loadPercentage = total > 0 ? Math.round((activeCount / total) * 100) : 0;

  // Calculate stroke dasharray for SVG donut (circumference = 2 * PI * r = 2 * 3.14159 * 58 ≈ 364.4)
  const circ = 364.4;
  const strokeDashoffset = circ - (loadPercentage / 100) * circ;

  return (
    <div className="space-y-8 select-none">
      {/* Header Info */}
      <div>
        <h1 className="font-headline-lg text-3xl font-bold text-on-surface mb-1">Fleet Overview</h1>
        <p className="text-on-surface-variant font-body-default text-sm">Real-time status of your active 3D printing farm.</p>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Online */}
        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-label-caps text-xs font-semibold tracking-wider">ONLINE</span>
            <div className="w-2.5 h-2.5 rounded-full bg-primary-container status-glow-primary"></div>
          </div>
          <div className="font-technical-data text-3xl font-bold text-primary">{online}</div>
          <div className="mt-2 h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-primary-container" style={{ width: `${total > 0 ? (online / total) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Printing */}
        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-label-caps text-xs font-semibold tracking-wider">PRINTING</span>
            <div className="w-2.5 h-2.5 rounded-full bg-secondary-container"></div>
          </div>
          <div className="font-technical-data text-3xl font-bold text-secondary">{printing}</div>
          <div className="mt-2 h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-secondary-container" style={{ width: `${total > 0 ? (printing / total) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Idle */}
        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-label-caps text-xs font-semibold tracking-wider">IDLE</span>
            <div className="w-2.5 h-2.5 rounded-full bg-outline"></div>
          </div>
          <div className="font-technical-data text-3xl font-bold text-on-surface">{idle}</div>
          <div className="mt-2 h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-outline" style={{ width: `${total > 0 ? (idle / total) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* In Error */}
        <div className="bg-surface-container-low border border-outline-variant p-6 rounded-lg">
          <div className="flex justify-between items-start mb-4">
            <span className="text-on-surface-variant font-label-caps text-xs font-semibold tracking-wider">IN ERROR</span>
            <div className={`w-2.5 h-2.5 rounded-full bg-error-container ${inError > 0 ? 'animate-pulse' : ''}`}></div>
          </div>
          <div className="font-technical-data text-3xl font-bold text-error">{inError}</div>
          <div className="mt-2 h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
            <div className="h-full bg-error-container" style={{ width: `${total > 0 ? (inError / total) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Printer Fleet Title */}
      <div>
        <h2 className="font-headline-md text-xl font-bold text-on-surface">Printer Fleet</h2>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {filteredPrinters.map(printer => {
          let badgeColorClass = 'bg-outline-variant text-on-surface-variant';
          let statusText = printer.status;

          if (printer.status === 'PRINTING') {
            badgeColorClass = 'bg-secondary-container/20 border border-secondary-container/30 text-secondary';
            statusText = `Printing - ${printer.progress}%`;
          } else if (printer.status === 'HEATING') {
            badgeColorClass = 'bg-primary-container/20 border border-primary-container/30 text-primary';
            statusText = 'Heating';
          } else if (printer.status === 'ERROR') {
            badgeColorClass = 'bg-error-container/20 border border-error-container/30 text-error';
            statusText = printer.errorAlert || 'Alert';
          } else if (printer.status === 'IDLE') {
            badgeColorClass = 'bg-surface-variant text-on-surface-variant border border-outline-variant/30';
            statusText = 'Idle';
          }

          const printerId = printer._id || printer.id;
          return (
            <div 
              key={printerId}
              onClick={() => navigate(`/printer/${printerId}`)}
              className={`bg-surface-container-low border rounded-lg overflow-hidden flex flex-col hover:border-primary transition-colors cursor-pointer group ${
                printer.status === 'ERROR' ? 'border-error-container/50 hover:border-error' : 'border-outline-variant'
              }`}
            >
              {/* Card Image */}
              <div className="relative h-48 w-full bg-surface-container-lowest overflow-hidden">
                <img 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                  src={printer.thumbnail} 
                  alt={printer.name} 
                />
                <div className={`absolute top-3 left-3 flex items-center bg-background/85 backdrop-blur-md px-2.5 py-1 rounded border ${
                  badgeColorClass.includes('border') ? '' : 'border-outline-variant/30'
                } ${badgeColorClass}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${
                    printer.status === 'PRINTING' ? 'bg-secondary-container' : 
                    printer.status === 'HEATING' ? 'bg-primary-container animate-pulse' :
                    printer.status === 'ERROR' ? 'bg-error-container animate-pulse' : 'bg-outline-variant'
                  }`}></div>
                  <span className="font-label-caps text-[10px] font-bold uppercase">{statusText}</span>
                </div>
              </div>

              {/* Card Info */}
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">{printer.name}</h3>
                  <span className="material-symbols-outlined text-on-surface-variant text-lg">more_vert</span>
                </div>

                {printer.status === 'ERROR' ? (
                  /* Error View */
                  <div className="grid grid-cols-2 gap-4 mb-6 text-on-error-container bg-error-container/10 p-3 rounded border border-error-container/20">
                    <div>
                      <span className="font-label-caps text-[10px] block mb-1">LAST TEMP</span>
                      <span className="font-technical-data text-sm font-semibold">{printer.nozzleTemp}°C</span>
                    </div>
                    <div className="flex items-center">
                      <span className="material-symbols-outlined text-error text-xl mr-1">warning</span>
                      <span className="font-body-sm text-xs">{printer.errorAlert || 'Alert'}</span>
                    </div>
                  </div>
                ) : (
                  /* Standard Telemetries */
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <span className="font-label-caps text-[9px] text-on-surface-variant block mb-1 font-semibold">NOZZLE</span>
                      <span className={`font-technical-data text-sm font-semibold ${
                        printer.status === 'HEATING' || printer.status === 'PRINTING' ? 'text-primary' : 'text-on-surface-variant'
                      }`}>
                        {printer.nozzleTemp}°C
                      </span>
                    </div>
                    <div>
                      <span className="font-label-caps text-[9px] text-on-surface-variant block mb-1 font-semibold">BED</span>
                      <span className={`font-technical-data text-sm font-semibold ${
                        printer.status === 'HEATING' || printer.status === 'PRINTING' ? 'text-primary' : 'text-on-surface-variant'
                      }`}>
                        {printer.bedTemp}°C
                      </span>
                    </div>
                  </div>
                )}

                {/* Card Action / Progress footer */}
                <div className="mt-auto pt-2" onClick={(e) => e.stopPropagation()}>
                  {printer.status === 'PRINTING' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-label-caps text-on-surface-variant">
                        <span className="truncate max-w-[120px] font-technical-data">{printer.currentJob}</span>
                        <span className="font-technical-data">{printer.timeRemaining}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-primary-container" style={{ width: `${printer.progress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {printer.status === 'HEATING' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-label-caps text-on-surface-variant">
                        <span className="truncate font-technical-data">Pre-heating...</span>
                        <span className="font-technical-data">{printer.nozzleTemp}/{printer.targetNozzleTemp}°C</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-variant rounded-full overflow-hidden">
                        <div className="h-full bg-secondary-container" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  )}

                  {printer.status === 'IDLE' && (
                    <button 
                      onClick={() => onCommand(printer._id || printer.id, 'START', { jobName: 'Coupler_3V.gcode', nozzle: 230, bed: 60 })}
                      className="w-full py-2 bg-primary-container text-on-primary-container rounded font-label-caps font-bold text-xs hover:opacity-90 active:scale-[0.98] transition-all"
                    >
                      START NEW JOB
                    </button>
                  )}

                  {printer.status === 'ERROR' && (
                    <button 
                      onClick={() => onCommand(printer._id || printer.id, 'DISMISS_ALERT')}
                      className="w-full py-2 border border-error-container text-error rounded font-label-caps font-bold text-xs hover:bg-error-container/10 transition-colors"
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

      {/* Activity Logs & Utilization Layout */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Activity Log */}
        <div className="lg:col-span-2 bg-surface-container-high border border-outline-variant p-6 rounded-lg flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline-md text-lg font-bold text-on-surface">System Activity Log</h2>
            <span 
              onClick={() => navigate('/errors')}
              className="text-on-surface-variant text-xs cursor-pointer hover:text-primary transition-colors font-medium"
            >
              View All Logs
            </span>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[280px] pr-2 custom-scrollbar">
            {logs.slice(0, 5).map(log => {
              let sevColor = 'text-primary';
              if (log.severity === 'CRITICAL') sevColor = 'text-error';
              else if (log.severity === 'WARNING') sevColor = 'text-secondary';

              return (
                <div key={log.id} className="flex items-start border-b border-outline-variant pb-3 last:border-0 last:pb-0">
                  <span className="font-technical-data text-on-surface-variant text-xs w-20 shrink-0">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                  <div className="ml-4">
                    <p className="text-body-default text-sm text-on-surface">
                      <span className={`${sevColor} font-bold mr-1.5`}>{log.printerName}</span>
                      {log.message}
                    </p>
                    <span className="text-[10px] text-on-surface-variant font-technical-data uppercase">{log.errorCode}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Fleet Utilization Load */}
        <div className="bg-surface-container-high border border-outline-variant p-6 rounded-lg flex flex-col justify-between">
          <div>
            <h2 className="font-headline-md text-lg font-bold text-on-surface mb-1">Fleet Load</h2>
            <p className="text-on-surface-variant text-xs">Total current throughput against capacity.</p>
          </div>

          <div className="relative flex-grow flex items-center justify-center py-6">
            {/* SVG Donut Chart */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle 
                className="text-surface-variant" 
                cx="64" 
                cy="64" 
                fill="transparent" 
                r="58" 
                stroke="currentColor" 
                strokeWidth="12" 
              />
              <circle 
                className="text-primary" 
                cx="64" 
                cy="64" 
                fill="transparent" 
                r="58" 
                stroke="currentColor" 
                strokeDasharray={circ} 
                strokeDashoffset={strokeDashoffset} 
                strokeWidth="12" 
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-technical-data text-3xl font-bold text-primary">{loadPercentage}%</span>
              <span className="text-[9px] font-label-caps font-semibold text-on-surface-variant tracking-widest mt-0.5">LOADED</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-outline-variant/30 pt-4">
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Active Job Queues</span>
              <span className="text-on-surface font-technical-data font-semibold">{activeCount} Running</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-on-surface-variant">Material Efficiency</span>
              <span className="text-on-surface font-technical-data font-semibold">94.8% Nominal</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
