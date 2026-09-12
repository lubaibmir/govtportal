import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface SlaCountdownTimerProps {
  createdAt: string;
  slaHours?: number;
  status: string;
  compact?: boolean;
}

export const SlaCountdownTimer: React.FC<SlaCountdownTimerProps> = ({
  createdAt,
  slaHours = 48,
  status,
  compact = false
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
    isBreached: boolean;
    percentElapsed: number;
  }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isBreached: false,
    percentElapsed: 0
  });

  useEffect(() => {
    const calculateTime = () => {
      const createdDate = new Date(createdAt).getTime();
      const deadline = createdDate + slaHours * 60 * 60 * 1000;
      const now = new Date().getTime();

      const totalDuration = slaHours * 60 * 60 * 1000;
      const elapsed = Math.max(0, now - createdDate);
      const percent = Math.min(100, Math.round((elapsed / totalDuration) * 100));

      const diff = deadline - now;
      const isBreached = diff <= 0;
      const absDiff = Math.abs(diff);

      const hours = Math.floor(absDiff / (1000 * 60 * 60));
      const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);

      setTimeLeft({
        hours,
        minutes,
        seconds,
        isBreached,
        percentElapsed: percent
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [createdAt, slaHours]);

  if (status === 'APPROVED') {
    return (
      <div className={`inline-flex items-center gap-1.5 font-medium ${compact ? 'text-[10px]' : 'text-xs'} text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded`}>
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
        <span>Delivered within SLA</span>
      </div>
    );
  }

  if (status === 'REJECTED') {
    return (
      <div className={`inline-flex items-center gap-1.5 font-medium ${compact ? 'text-[10px]' : 'text-xs'} text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded`}>
        <span>Processed & Closed</span>
      </div>
    );
  }

  // Active or Breached SLA
  if (timeLeft.isBreached) {
    return (
      <div className={`inline-flex items-center gap-1 font-bold ${compact ? 'text-[10px]' : 'text-xs'} text-red-800 bg-red-100 border border-red-300 px-2 py-0.5 rounded animate-pulse`}>
        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
        <span>RTS SLA Breached (+{timeLeft.hours}h {timeLeft.minutes}m)</span>
      </div>
    );
  }

  const isWarning = timeLeft.hours < 12;

  return (
    <div className={`inline-flex flex-col gap-1 ${compact ? 'max-w-[140px]' : 'max-w-xs'}`}>
      <div className={`flex items-center gap-1.5 font-semibold ${compact ? 'text-[11px]' : 'text-xs'} ${isWarning ? 'text-amber-800' : 'text-slate-700'}`}>
        {isWarning ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-emerald-700" />
        )}
        <span>
          {timeLeft.hours}h {timeLeft.minutes}m remaining
        </span>
        <span className="text-[10px] text-slate-400 font-normal">({slaHours}h RTS SLA)</span>
      </div>

      {!compact && (
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-500 ${
              isWarning ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
            style={{ width: `${timeLeft.percentElapsed}%` }}
          />
        </div>
      )}
    </div>
  );
};
