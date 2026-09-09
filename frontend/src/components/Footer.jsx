import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoWhite from '../assets/Fab43-Logo-linéaire1-blanc Fichier 1.png';

export default function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="bg-dark-navy text-white mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Logo and Tagline block */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src={logoWhite} 
                alt="Fab43 Logo" 
                className="h-10 w-auto object-contain" 
              />
              <div>
                <span className="font-headline-md text-xl font-bold tracking-tight text-white block">PrintSight</span>
                <span className="text-[9px] font-label-caps uppercase tracking-widest text-slate-400 block mt-0.5">FLEET MANAGEMENT</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-body-default max-w-xs pt-2">
              Industrial grade 3D printer fleet telemetry and live monitoring system. Powered by Fab43.
            </p>
          </div>

          {/* Column 1: Navigation */}
          <div>
            <h4 className="font-headline-md text-sm font-bold tracking-wider uppercase text-white mb-6">Platform</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors duration-200">Dashboard</Link>
              </li>
              <li>
                <Link to="/errors" className="text-slate-400 hover:text-white transition-colors duration-200">Activity Logs</Link>
              </li>
              <li>
                <Link to="/settings" className="text-slate-400 hover:text-white transition-colors duration-200">Settings</Link>
              </li>
              <li>
                <Link to="/connect" className="text-slate-400 hover:text-white transition-colors duration-200">Connect Printer</Link>
              </li>
            </ul>
          </div>

          {/* Column 2: System Specs */}
          <div>
            <h4 className="font-headline-md text-sm font-bold tracking-wider uppercase text-white mb-6">System</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>All Nodes Operational</span>
              </li>
              <li>Instance: PS-ALPHA-V4.2</li>
              <li>Firmware: Klipper Unified</li>
              <li>Secure API: TLS 1.3 Active</li>
            </ul>
          </div>

          {/* Column 3: Contact/Support */}
          <div>
            <h4 className="font-headline-md text-sm font-bold tracking-wider uppercase text-white mb-6">Station Support</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li>Operator: Administrator</li>
              <li>Workstation: WS-04-LAB-A</li>
              <li>
                <a href="#help" onClick={(e) => e.preventDefault()} className="text-primary hover:underline">Open Help Manual</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom divider and copyright */}
        <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PrintSight & Fab43. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#terms" onClick={(e) => e.preventDefault()} className="hover:text-slate-400 transition-colors">Station Terms</a>
            <a href="#privacy" onClick={(e) => e.preventDefault()} className="hover:text-slate-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
