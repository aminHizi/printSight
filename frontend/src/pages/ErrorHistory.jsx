import React, { useState, useEffect } from 'react';

export default function ErrorHistory({ printers = [] }) {
  const [logs, setLogs] = useState([]);
  const [printerFilter, setPrinterFilter] = useState('All Printers');
  const [severityFilter, setSeverityFilter] = useState('All Severities');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 8;

  // Selected logs tracker (for visual row toggles)
  const [selectedLogs, setSelectedLogs] = useState({});

  // Reset scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fetch logs whenever filters change, with silent background auto-refresh
  useEffect(() => {
    const fetchLogs = async (showLoading = false) => {
      if (showLoading) setLoading(true);
      try {
        let url = `/api/logs?printer=${encodeURIComponent(printerFilter)}&severity=${encodeURIComponent(severityFilter)}&search=${encodeURIComponent(search)}`;
        const response = await fetch(url, {
          credentials: 'include',
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        const data = await response.json();
        if (response.ok) {
          setLogs(data);
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        if (showLoading) setLoading(false);
      }
    };

    fetchLogs(true); // Initial fetch with loading spinner

    const interval = setInterval(() => {
      fetchLogs(false); // Background polling silently
    }, 5000);

    return () => clearInterval(interval);
  }, [printerFilter, severityFilter, search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [printerFilter, severityFilter, search]);

  const toggleRow = (id) => {
    setSelectedLogs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Pagination calculations
  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.max(1, Math.ceil(logs.length / logsPerPage));

  // Build visible page numbers (max 5 with ellipsis)
  const getVisiblePages = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [];
    if (currentPage <= 3) {
      pages.push(1, 2, 3, 4, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  // CSV Exporter
  const handleExportCSV = () => {
    if (logs.length === 0) return alert('No logs available to export.');
    
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'Printer Name,Error Code,Message,Severity,Timestamp\n';
    
    logs.forEach(log => {
      const msgEscaped = log.message.replace(/"/g, '""');
      csvContent += `"${log.printerName}","${log.errorCode}","${msgEscaped}","${log.severity}","${log.timestamp}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PrintSight_Telemetry_Logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-grow flex flex-col select-none text-left space-y-6">
      
      {/* Page Header */}
      <div className="space-y-1.5 border-b border-outline-variant/60 dark:border-slate-800/80 pb-5">
        <h1 className="font-headline-lg text-3xl font-extrabold text-on-surface dark:text-white">System Activity Log</h1>
        <p className="text-on-surface-variant dark:text-slate-400 font-body-default text-sm">
          Full diagnostic audit trail and telemetry events for the connected workstation nodes.
        </p>
      </div>

      {/* Filter Card */}
      <section className="bg-white dark:bg-slate-900 border border-outline-variant dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-wrap items-end gap-5">
        
        {/* Printer Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">PRINTER UNIT</span>
          <select 
            value={printerFilter}
            onChange={(e) => setPrinterFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs w-48 focus:border-primary outline-none text-on-surface dark:text-white font-body-default"
          >
            <option>All Printers</option>
            {printers.map(p => (
              <option key={p._id || p.id} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex flex-col gap-1.5">
          <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">SEVERITY LEVEL</span>
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs w-40 focus:border-primary outline-none text-on-surface dark:text-white font-body-default"
          >
            <option>All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Information</option>
          </select>
        </div>

        {/* Search */}
        <div className="flex flex-col gap-1.5">
          <span className="font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 uppercase font-bold tracking-wider">SEARCH LOGS</span>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950 border border-outline-variant dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs w-56 focus:border-primary outline-none text-on-surface dark:text-white font-body-default placeholder:text-on-surface-variant/40"
            placeholder="Search errors or event messages..."
          />
        </div>

        {/* Export CSV */}
        <button 
          onClick={handleExportCSV}
          className="bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-primary border border-primary font-semibold px-5 py-2.5 rounded-full text-xs transition-colors flex items-center gap-1.5 ml-auto shadow-sm active:scale-95"
        >
          <span className="material-symbols-outlined text-base">download</span>
          <span>Export CSV</span>
        </button>
      </section>

      {/* Table Container Card */}
      <section className="min-h-[300px]">
        <div className="border border-outline-variant dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 flex flex-col justify-between overflow-hidden shadow-sm">
          
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-[180px_120px_1fr_120px_180px] bg-slate-50 dark:bg-slate-900/60 py-3.5 px-6 border-b border-outline-variant dark:border-slate-800/80 font-label-caps text-[10px] text-on-surface-variant dark:text-slate-450 font-bold tracking-wider">
            <div>NODE NAME</div>
            <div>CODE</div>
            <div>DIAGNOSTIC MESSAGE</div>
            <div className="text-center">STATUS</div>
            <div className="text-right">TIMESTAMP</div>
          </div>

          {/* Table Body */}
          <div className="flex-grow overflow-y-auto custom-scrollbar min-h-[300px] divide-y divide-outline-variant/60 dark:divide-slate-800/80">
            {loading ? (
              <div className="text-center py-24 text-on-surface-variant dark:text-slate-400 flex flex-col items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
                <span className="text-xs">Accessing cluster logs...</span>
              </div>
            ) : currentLogs.length === 0 ? (
              <div className="text-center py-24 text-on-surface-variant/40 dark:text-slate-500 text-xs">
                No logs found matching filters.
              </div>
            ) : (
              currentLogs.map(log => {
                let sevBadgeClass = 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-950/30';
                let dotClass = 'bg-blue-500';

                if (log.severity === 'CRITICAL') {
                  sevBadgeClass = 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-950/30';
                  dotClass = 'bg-red-600';
                } else if (log.severity === 'WARNING') {
                  sevBadgeClass = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-950/30';
                  dotClass = 'bg-amber-500';
                }

                const logId = log.id || log._id;
                const isSelected = !!selectedLogs[logId];

                return (
                  <div 
                    key={logId} 
                    onClick={() => toggleRow(logId)}
                    className={`grid grid-cols-1 md:grid-cols-[180px_120px_1fr_120px_180px] py-4 px-6 transition-colors items-center cursor-pointer gap-2 md:gap-0 ${
                      isSelected ? 'bg-slate-50 dark:bg-slate-800/40' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="font-body-default font-bold text-on-surface dark:text-white text-sm">{log.printerName}</div>
                    <div className="font-technical-data text-xs text-primary">{log.errorCode}</div>
                    <div className="text-on-surface-variant dark:text-slate-400 text-xs truncate pr-6 leading-relaxed">{log.message}</div>
                    <div className="flex md:justify-center">
                      <span className={`flex items-center gap-1.5 px-3 py-0.5 rounded-full font-label-caps text-[9px] border font-bold ${sevBadgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                        {log.severity}
                      </span>
                    </div>
                    <div className="font-technical-data text-xs text-on-surface-variant dark:text-slate-400 md:text-right">{log.timestamp}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 px-6 bg-slate-50 dark:bg-slate-900/60 border-t border-outline-variant/60 dark:border-slate-800/80 flex justify-between items-center shrink-0">
            <div className="text-xs text-on-surface-variant dark:text-slate-400">
              Showing <span className="text-on-surface dark:text-white font-semibold">{logs.length > 0 ? indexOfFirstLog + 1 : 0}-{Math.min(indexOfLastLog, logs.length)}</span> of <span className="text-on-surface dark:text-white font-semibold">{logs.length}</span> events
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 border border-outline-variant dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              
              {getVisiblePages().map((page, idx) => (
                page === '...' ? (
                  <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-on-surface-variant dark:text-slate-400">…</span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-xl font-semibold text-xs transition-colors ${
                      currentPage === page 
                        ? 'bg-primary text-white' 
                        : 'border border-outline-variant dark:border-slate-800 text-on-surface dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {page}
                  </button>
                )
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="p-2 border border-outline-variant dark:border-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
