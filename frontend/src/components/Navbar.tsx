import React, { useEffect, useState } from 'react';
import { KeyRound, LogOut, User } from 'lucide-react';
import { fetchHealthStatus } from '../services/api';
import { HealthStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from './LoginModal';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, isLoginOpen, openLoginModal, closeLoginModal } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    fetchHealthStatus().then(setHealth);
    const interval = setInterval(() => {
      fetchHealthStatus().then(setHealth);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'CITIZEN':
        return 'Citizen Portal';
      case 'DEPARTMENT_OFFICER':
        return 'Officer Dashboard';
      case 'SYSTEM_ADMIN':
        return 'System Admin';
      default:
        return role;
    }
  };

  return (
    <>
      {/* Top Govt Flag Banner */}
      <div className="bg-[#0F172A] text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="font-medium text-slate-200">Government of Maharashtra</span>
            <span className="text-slate-500">|</span>
            <span>Digital Infrastructure Platform</span>
          </div>
          <div className="hidden sm:flex items-center space-x-3 text-[11px] text-slate-400">
            <span>Gateway: <strong className={health?.status === 'HEALTHY' ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>{health?.status || 'Active'}</strong></span>
            <span>|</span>
            <span>SIH 2026 #26129</span>
          </div>
        </div>
      </div>

      {/* Primary Header */}
      <header className="bg-white border-b border-[#E5E7E3] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo & Name */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded bg-[#166534] text-white flex items-center justify-center font-bold text-lg tracking-wider">
                M
              </div>
              <div>
                <a href="/" className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 hover:text-emerald-800 transition-colors">
                  MAHASETU
                </a>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">
                  Unified Government Services & Data Exchange
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-700">
              <a href="#catalogue" className="hover:text-emerald-800 transition-colors">
                Services
              </a>
              <a href="#track" className="hover:text-emerald-800 transition-colors">
                Track Application
              </a>
              <a href="#consents" className="hover:text-emerald-800 transition-colors">
                Consent Center
              </a>
              <a href="#architecture" className="hover:text-emerald-800 transition-colors">
                Architecture
              </a>
            </nav>

            {/* Authentication & User Controls */}
            <div className="flex items-center space-x-3">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3 border-l border-slate-200 pl-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-slate-900 leading-tight">{user.full_name}</div>
                    <div className="text-[11px] text-emerald-800 font-medium flex items-center justify-end gap-1">
                      <User className="w-3 h-3" />
                      <span>{getRoleLabel(user.role)}</span>
                    </div>
                  </div>
                  <button
                    onClick={openLoginModal}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-2.5 py-1.5 rounded border border-slate-300 transition-colors"
                  >
                    Switch User
                  </button>
                  <button
                    onClick={logout}
                    title="Sign Out"
                    className="p-1.5 rounded text-slate-500 hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openLoginModal}
                  className="flex items-center space-x-2 px-3.5 py-1.5 rounded bg-[#166534] hover:bg-[#15803D] text-white font-medium text-sm transition-colors"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Sign In / Demo Accounts</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      <LoginModal isOpen={isLoginOpen} onClose={closeLoginModal} />
    </>
  );
};
