import React, { useState } from 'react';
import { X, KeyRound, ShieldAlert, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('Password@123');
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, 'Password@123');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Demo Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-[#E5E7E3] rounded-md shadow-lg p-6 space-y-5">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-slate-100 pb-3">
          <div className="w-8 h-8 rounded bg-emerald-50 text-[#166534] border border-emerald-200 flex items-center justify-center">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">MahaSetu Sign In</h2>
            <p className="text-xs text-slate-500">Government of Maharashtra Unified SSO</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul.sharma@example.gov.in"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-emerald-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-[#166534] hover:bg-[#15803D] text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Personas */}
        <div className="pt-4 border-t border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 mb-2 flex items-center justify-between">
            <span>DEMO PERSONAS (1-CLICK LOGIN)</span>
            <span className="text-[10px] text-slate-400">Default password loaded</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleQuickDemoLogin('rahul.sharma@example.gov.in')}
              className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded text-left transition-colors"
            >
              <div className="font-bold text-slate-900">Rahul Sharma</div>
              <div className="text-[10px] text-slate-500">Citizen (Applicant)</div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('officer.msins@example.gov.in')}
              className="p-2 bg-slate-50 hover:bg-emerald-50 border border-emerald-300 bg-emerald-50/50 rounded text-left transition-colors"
            >
              <div className="font-bold text-emerald-900">Officer MSInS</div>
              <div className="text-[10px] text-emerald-700">Skills & Innovation</div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('officer.industries@example.gov.in')}
              className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded text-left transition-colors"
            >
              <div className="font-bold text-slate-900">Officer Industries</div>
              <div className="text-[10px] text-slate-500">Nodal Officer</div>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('admin.mahagov@example.gov.in')}
              className="p-2 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded text-left transition-colors"
            >
              <div className="font-bold text-slate-900">Admin Mahagov</div>
              <div className="text-[10px] text-slate-500">System Admin</div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
