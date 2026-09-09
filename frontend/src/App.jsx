import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Footer from './components/Footer';
import TopNavBar from './components/TopNavBar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConnectPrinter from './pages/ConnectPrinter';
import PrinterDetail from './pages/PrinterDetail';
import ErrorHistory from './pages/ErrorHistory';
import Settings from './pages/Settings';

// App.jsx overview:
// - Exports default `App()` which sets up top-level state and routing.
// - `MainAppLayout` is the authenticated app shell: sidebar, topbar, and content routes.
// - Uses SSE (EventSource) to receive live printer telemetry and updates `printers` state.
// - Persists a lightweight auth state in `localStorage` (`operator` and `token`).

function MainAppLayout({ user, onUpdateUser, onLogout, printers, logs, onCommand, onDisconnect, theme, toggleTheme, fetchPrinters }) {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  // Determine if we should show search bar
  const isSearchable = location.pathname === '/' || location.pathname === '/errors';

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 text-on-surface dark:text-slate-100 font-body-default flex flex-col transition-colors duration-200">
      {/* Top Header NavBar */}
      <TopNavBar 
        user={user} 
        searchQuery={searchQuery}
        setSearchQuery={isSearchable ? setSearchQuery : null}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto p-6 md:p-8 pt-[calc(72px+28px)] flex-grow bg-grid-pattern overflow-x-hidden">
        <Routes>
          <Route path="/" element={<Dashboard printers={printers} logs={logs} onCommand={onCommand} searchQuery={searchQuery} />} />
          <Route path="/connect" element={<ConnectPrinter onPrinterAdded={fetchPrinters} />} />
          <Route path="/printer/:id" element={<PrinterDetail printers={printers} logs={logs} onCommand={onCommand} onDisconnect={onDisconnect} />} />
          <Route path="/errors" element={<ErrorHistory printers={printers} />} />
          <Route path="/settings" element={<Settings user={user} onUpdateUser={onUpdateUser} onLogout={onLogout} />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Atmospheric Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-[-1] opacity-20">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[150px]"></div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [printers, setPrinters] = useState([]);
  const [logs, setLogs] = useState([]);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Check mock local storage auth state on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('operator');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Fetch logs initially and whenever updates occur
  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/logs', {
        credentials: 'include',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data);
      }
    } catch (err) {
      console.error('Error fetching logs in App:', err);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [user]);

  // Fetch initial printer list on mount
    const fetchPrinters = async ()=>{
      try{
        const response =await fetch('/api/printers',{
          credentials: 'include',
        });
        if(response.ok){
          const data = await response.json();
          console.log('Fetched printers in App:', data);
          setPrinters(data);
        }
      }catch(err){
        console.error('Error fetching printers in App:', err);
        }
      }
    
    useEffect(()=>{
        if (!user) {
          //setPrinters([]);
          return;
        }
        fetchPrinters();
        const interval = setInterval(fetchPrinters, 5000);
        return () => clearInterval(interval);
      },[user]);
  // Connect to SSE Telemetry stream (disabled in favor of interval polling)
  /*useEffect(() => {
    if (!user) {
      setPrinters([]);
      return;
    }
    
    // Create a server-sent-events connection to receive live telemetry.
    // The backend endpoint should stream newline-delimited JSON messages.
    const eventSource = new EventSource('/api/telemetry?token=' + encodeURIComponent(localStorage.getItem('token') || ''));

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.printers) {
          setPrinters(data.printers);
          // Auto fetch logs when printer state shifts (triggers like preheat starts, prints finishes, errors occur)
          fetchLogs();
        }
      } catch (err) {
        console.error('Error parsing telemetry SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('EventSource connection lost. Attempting reconnect...', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [user]);*/

  const handleLoginSuccess = (operatorData, token) => {
    localStorage.setItem('operator', JSON.stringify(operatorData));
    localStorage.setItem('token', token);
    setUser(operatorData);
  };

  const handleUpdateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    localStorage.setItem('operator', JSON.stringify(merged));
    setUser(merged);
  };

  const handleLogout = () => {
    localStorage.removeItem('operator');
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleCommand = async (printerId, command, value = null) => {
    try {
      const response = await fetch(`/api/printers/${printerId}/command`, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command, value })
      });
      if (response.ok) {
        const updatedPrinter = await response.json();
        setPrinters(prev => prev.map(p => p.id === printerId || p._id === printerId ? updatedPrinter : p));
        fetchLogs();
      }
    } catch (err) {
      console.error(`Error sending ${command} to printer ${printerId}:`, err);
    }
  };

  const handleDisconnect = async (printerId) => {
    try {
      const response = await fetch(`/api/printers/${printerId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (response.ok) {
        setPrinters(prev => prev.filter(p => p.id !== printerId && p._id !== printerId));
        fetchLogs();
      }
    } catch (err) {
      console.error(`Error disconnecting printer ${printerId}:`, err);
    }
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} 
        />
        <Route 
          path="/*" 
          element={
            user ? (
              <MainAppLayout 
                user={user} 
                onUpdateUser={handleUpdateUser}
                onLogout={handleLogout}
                printers={printers} 
                logs={logs}
                onCommand={handleCommand}
                onDisconnect={handleDisconnect}
                theme={theme}
                toggleTheme={toggleTheme}
                fetchPrinters={fetchPrinters}
              />
            ) : (
              <Navigate to="/login" />
            )
          } 
        />
      </Routes>
    </Router>
  );
}
