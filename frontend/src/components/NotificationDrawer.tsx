import React, { useState, useEffect } from 'react';
import { 
  X, 
  Bell, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  CheckCheck, 
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  simulateNotification,
  NotificationItem 
} from '../services/notificationService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose
}) => {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    if (isOpen && token) {
      loadNotifications();
    }
  }, [isOpen, token, channelFilter]);

  const loadNotifications = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchNotifications(token, channelFilter);
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch (e) {
      console.error('Failed to load notifications', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      await markNotificationAsRead(token, id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const handleMarkAllRead = async () => {
    if (!token) return;
    try {
      await markAllNotificationsAsRead(token);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (e) {
      console.error('Failed to mark all read', e);
    }
  };

  const handleSimulateAlert = async (channel: 'SMS' | 'WHATSAPP') => {
    if (!token) return;
    setSimulating(true);
    try {
      await simulateNotification(token, {
        channel,
        title: channel === 'WHATSAPP' ? 'MahaSetu WhatsApp Service Alert' : 'MahaGov SMS Broadcast',
        message: channel === 'WHATSAPP'
          ? 'Dear Citizen, Your MSInS Innovation Seed Grant eligibility is confirmed via automated MSBTE/Revenue data exchange.'
          : 'MahaSetu Alert: Your application has been logged on the state blockchain audit ledger. Track via RTS portal.',
        category: 'STATUS_UPDATE'
      });
      await loadNotifications();
    } catch (e) {
      console.error('Failed to simulate alert', e);
    } finally {
      setSimulating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold">Citizen Alert Center</h2>
              <p className="text-[11px] text-slate-400">
                To: {user?.phone || '+91 98765 43210'} • Multi-Channel Broadcast
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Switcher */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center space-x-1 text-xs">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'SMS', label: 'SMS', icon: Smartphone },
              { id: 'WHATSAPP', label: 'WhatsApp', icon: MessageSquare },
              { id: 'EMAIL', label: 'Email', icon: Mail }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setChannelFilter(tab.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                    channelFilter === tab.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-200/70'
                  }`}
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Loading notification streams...
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16 space-y-3 text-slate-400">
              <Bell className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-medium text-slate-600">No alerts in this channel</p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Notifications are generated in real-time when consents are issued, interoperability data is exchanged, or RTS SLAs trigger.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => !n.is_read && handleMarkAsRead(n.id)}
                className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                  n.is_read 
                    ? 'bg-white border-slate-200 text-slate-600' 
                    : n.channel === 'WHATSAPP'
                    ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                    : 'bg-blue-50/70 border-blue-300 shadow-xs'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    {n.channel === 'WHATSAPP' ? (
                      <span className="bg-emerald-600 text-white p-1 rounded-full">
                        <MessageSquare className="w-2.5 h-2.5" />
                      </span>
                    ) : n.channel === 'SMS' ? (
                      <span className="bg-blue-600 text-white p-1 rounded-full">
                        <Smartphone className="w-2.5 h-2.5" />
                      </span>
                    ) : (
                      <span className="bg-slate-600 text-white p-1 rounded-full">
                        <Mail className="w-2.5 h-2.5" />
                      </span>
                    )}
                    <span className="font-bold text-slate-900 text-[11px]">
                      {n.channel === 'WHATSAPP' ? 'MahaSetu Verified WhatsApp' : 'Govt of Maharashtra (MahaSetu)'}
                    </span>
                  </div>

                  {!n.is_read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  )}
                </div>

                {/* Title & Body */}
                <div className="font-semibold text-slate-800 mb-0.5">{n.title}</div>
                <div className="text-slate-600 font-sans leading-relaxed bg-white/80 p-2 rounded border border-slate-200/60 font-mono text-[11px]">
                  {n.message}
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2">
                  <span>To: {user?.phone || '+91 98765 43210'}</span>
                  <span>{new Date(n.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Demo Simulator Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Interactive Multi-Channel Dispatch Demo</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSimulateAlert('SMS')}
              disabled={simulating}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <Smartphone className="w-3 h-3" />
              <span>Simulate SMS</span>
            </button>

            <button
              onClick={() => handleSimulateAlert('WHATSAPP')}
              disabled={simulating}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              <MessageSquare className="w-3 h-3" />
              <span>Simulate WhatsApp</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
