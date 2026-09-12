import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto bg-[#0F172A] border-t border-slate-800 text-slate-400 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-1.5">
              <span>MAHASETU</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Unified Government Services Interoperability Platform for the State of Maharashtra.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-2">Connected Infrastructure</h4>
            <ul className="space-y-1 text-slate-400">
              <li>• Revenue Department Gateway</li>
              <li>• Higher Education Records Registry</li>
              <li>• Directorate of Industries Portal</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-2">Security & Governance</h4>
            <div className="flex items-start gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Digital Consent Architecture • ISO 27001 Protocol • Immutable Audit Logging</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-2">Hackathon Project</h4>
            <p className="text-slate-400">
              Smart India Hackathon 2026<br/>
              Problem Statement ID: <span className="font-mono text-slate-200">#26129</span><br/>
              Category: G2C & G2G Middleware
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>© 2026 Government of Maharashtra. Developed for Smart India Hackathon 2026.</p>
          <p>MahaSetu Version 1.0.0 (Production Prototype)</p>
        </div>
      </div>
    </footer>
  );
};
