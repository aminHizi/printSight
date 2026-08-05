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

  // Fetch logs whenever filters change
  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        let url = `/api/logs?printer=${encodeURIComponent(printerFilter)}&severity=${encodeURIComponent(severityFilter)}&search=${encodeURIComponent(search)}`;
        const response = await fetch(url, {
          headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        const data = await response.json();
        if (response.ok) {
          setLogs(data);
          setCurrentPage(1); // Reset page on query
        }
      } catch (err) {
        console.error('Error fetching logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
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
    <div className="flex-1 flex flex-col bg-background select-none">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="font-headline-lg text-3xl font-bold text-on-surface mb-1">System Activity Log</h1>
        <p className="text-on-surface-variant font-body-default text-sm">Full diagnostic audit history for connected hardware nodes.</p>
      </div>

      {/* Filter Strip */}
      <section className="py-6 flex flex-wrap items-end gap-gutter bg-surface-container-low border border-outline-variant rounded-lg p-5 mb-8">
        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold tracking-wider">PRINTER UNIT</label>
          <select 
            value={printerFilter}
            onChange={(e) => setPrinterFilter(e.target.value)}
            className="bg-surface-container-highest border border-outline-variant rounded px-3 py-2 text-xs w-48 focus:border-primary outline-none text-on-surface"
          >
            <option>All Printers</option>
            {printers.map(p => (
              <option key={p._id || p.id} value={p.name}>{p.name}</option>
            ))}
            {/* Historical fallback printers */}
            <option value="Core-X1 Platinum">Core-X1 Platinum</option>
            <option value="Fusion-7 Laser">Fusion-7 Laser</option>
            <option value="Titan-V Heavy">Titan-V Heavy</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold tracking-wider">SEVERITY LEVEL</label>
          <select 
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-surface-container-highest border border-outline-variant rounded px-3 py-2 text-xs w-40 focus:border-primary outline-none text-on-surface"
          >
            <option>All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Information</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-label-caps text-[10px] text-on-surface-variant font-semibold tracking-wider">SEARCH MESSAGES</label>
          <input 
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-surface-container-highest border border-outline-variant rounded px-3 py-2 text-xs w-56 focus:border-primary outline-none text-on-surface placeholder:text-on-surface-variant/45"
            placeholder="Search log messages or codes..."
          />
        </div>

        <button 
          onClick={handleExportCSV}
          className="bg-surface-variant border border-outline-variant text-on-surface px-6 py-2 rounded text-xs font-semibold hover:bg-outline-variant transition-colors flex items-center gap-2 ml-auto active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          Export CSV
        </button>
      </section>

      {/* Table Container */}
      <section className="flex-1 min-h-[300px]">
        <div className="h-full border border-outline-variant rounded-lg bg-surface-container-low flex flex-col justify-between overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[200px_120px_1fr_120px_180px] bg-surface-container-high py-4 px-6 border-b border-outline-variant font-label-caps text-xs text-on-surface-variant font-semibold">
            <div>PRINTER NAME</div>
            <div>ERROR CODE</div>
            <div>MESSAGE</div>
            <div className="text-center">SEVERITY</div>
            <div className="text-right">TIMESTAMP</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-[250px]">
            {loading ? (
              <div className="text-center py-20 text-on-surface-variant flex flex-col items-center gap-3">
                <span className="material-symbols-outlined animate-spin text-3xl text-primary">sync</span>
                <span className="text-xs">Loading telemetry database...</span>
              </div>
            ) : currentLogs.length === 0 ? (
              <div className="text-center py-20 text-on-surface-variant/40 text-xs">
                No logs found matching specified queries.
              </div>
            ) : (
              currentLogs.map(log => {
                let sevBadgeClass = 'bg-primary/10 text-primary border-primary/20';
                let dotClass = 'bg-primary status-glow-primary';

                if (log.severity === 'CRITICAL') {
                  sevBadgeClass = 'bg-error/10 text-error border-error/20';
                  dotClass = 'bg-error status-glow-error';
                } else if (log.severity === 'WARNING') {
                  sevBadgeClass = 'bg-secondary/10 text-secondary border-secondary/20';
                  dotClass = 'bg-secondary';
                }

                const isSelected = !!selectedLogs[log.id];

                return (
                  <div 
                    key={log.id} 
                    onClick={() => toggleRow(log.id)}
                    className={`grid grid-cols-[200px_120px_1fr_120px_180px] py-4 px-6 border-b border-surface-variant transition-colors items-center cursor-pointer ${
                      isSelected ? 'bg-surface-container-highest' : 'hover:bg-surface-container-highest/60'
                    }`}
                  >
                    <div className="font-body-default font-bold text-on-surface text-sm">{log.printerName}</div>
                    <div className="font-technical-data text-xs text-primary">{log.errorCode}</div>
                    <div className="text-on-surface-variant text-xs truncate pr-6">{log.message}</div>
                    <div className="flex justify-center">
                      <span className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded font-label-caps text-[9px] border font-bold ${sevBadgeClass}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
                        {log.severity}
                      </span>
                    </div>
                    <div className="font-technical-data text-xs text-on-surface-variant text-right">{log.timestamp}</div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Footer */}
          <div className="p-4 px-6 bg-surface-container-high border-t border-outline-variant flex justify-between items-center shrink-0">
            <div className="text-xs text-on-surface-variant">
              Showing <span className="text-on-surface font-semibold">{logs.length > 0 ? indexOfFirstLog + 1 : 0}-{Math.min(indexOfLastLog, logs.length)}</span> of <span className="text-on-surface font-semibold">{logs.length}</span> diagnostic events
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || loading}
                className="p-2 border border-outline-variant rounded hover:bg-surface-variant disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              
              {Array.from({ length: totalPages }, (_, idx) => (
                <button
                  key={idx + 1}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-8 h-8 flex items-center justify-center rounded font-semibold text-xs transition-colors ${
                    currentPage === idx + 1 
                      ? 'bg-primary text-on-primary' 
                      : 'border border-outline-variant text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || loading}
                className="p-2 border border-outline-variant rounded hover:bg-surface-variant disabled:opacity-30 transition-colors"
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
