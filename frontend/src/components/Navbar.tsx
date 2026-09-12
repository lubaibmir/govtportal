import React, { useEffect, useState } from 'react';
import { KeyRound, LogOut, User, Bell } from 'lucide-react';
import { fetchHealthStatus } from '../services/api';
import { fetchNotifications } from '../services/notificationService';
import { HealthStatus } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LoginModal } from './LoginModal';
import { NotificationDrawer } from './NotificationDrawer';

export const Navbar: React.FC = () => {
  const { user, token, isAuthenticated, logout, isLoginOpen, openLoginModal, closeLoginModal } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchHealthStatus().then(setHealth);
    const interval = setInterval(() => {
      fetchHealthStatus().then(setHealth);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (token) {
      loadUnread();
      const notifInterval = setInterval(loadUnread, 6000);
      return () => clearInterval(notifInterval);
    }
  }, [token]);

  const loadUnread = async () => {
    if (!token) return;
    try {
      const data = await fetchNotifications(token);
      setUnreadCount(data.unread_count);
    } catch (e) {
      // ignore
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'CITIZEN':
        return t('role_citizen', 'Citizen Portal');
      case 'DEPARTMENT_OFFICER':
        return t('role_officer', 'Officer Dashboard');
      case 'SYSTEM_ADMIN':
        return t('role_admin', 'System Admin');
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
            <span className="font-medium text-slate-200">{t('govt_maharashtra', 'Government of Maharashtra')}</span>
            <span className="text-slate-500">|</span>
            <span>{t('digital_infra', 'Digital Infrastructure Platform')}</span>
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
                  {t('app_title', 'MAHASETU')}
                </a>
                <p className="text-[11px] text-slate-500 font-normal leading-tight">
                  {t('app_subtitle', 'Unified Government Services & Data Exchange')}
                </p>
              </div>
            </div>



            {/* Language Selector + Authentication & User Controls */}
            <div className="flex items-center space-x-3">
              
              {/* Language Switcher Pill */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-1 rounded-md transition ${
                    language === 'en'
                      ? 'bg-white text-emerald-800 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('mr')}
                  className={`px-2 py-1 rounded-md transition ${
                    language === 'mr'
                      ? 'bg-[#166534] text-white shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  मराठी
                </button>
              </div>

              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3 border-l border-slate-200 pl-3">
                  
                  {/* Multi-Channel Notification Bell */}
                  <button
                    onClick={() => setIsNotificationOpen(true)}
                    className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title={t('notifications', 'Alerts & SMS Notifications')}
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

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
                    {t('switch_user', 'Switch User')}
                  </button>
                  <button
                    onClick={logout}
                    title={t('sign_out', 'Sign Out')}
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
                  <span>{t('sign_in_demo', 'Sign In / Demo Accounts')}</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      <NotificationDrawer 
        isOpen={isNotificationOpen} 
        onClose={() => {
          setIsNotificationOpen(false);
          loadUnread();
        }} 
      />

      <LoginModal isOpen={isLoginOpen} onClose={closeLoginModal} />
    </>
  );
};

