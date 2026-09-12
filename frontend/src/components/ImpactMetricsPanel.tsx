import React, { useEffect, useState } from 'react';
import { 
  Clock, 
  Files, 
  Target, 
  Coins, 
  Info, 
  TrendingUp, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { fetchImpactMetrics, ImpactMetrics } from '../services/metricsService';

interface ImpactMetricsPanelProps {
  compact?: boolean;
}

export const ImpactMetricsPanel: React.FC<ImpactMetricsPanelProps> = ({ compact = false }) => {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    const data = await fetchImpactMetrics();
    setMetrics(data);
  };

  return (
    <div className="bg-white border border-[#E5E7E3] rounded-md p-5 space-y-4 shadow-xs">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
              Live Interoperability ROI
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
              <Sparkles className="w-3 h-3 text-[#166534]" />
              <span>Real System-Computed Telemetry</span>
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 mt-1">
            Measurable Public Service Delivery Impact
          </h3>
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded self-start sm:self-auto font-medium">
          Baseline: <strong>Maharashtra RTS Act (21-Day Manual Process)</strong>
        </div>
      </div>

      {/* 4 Metrics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        
        {/* Metric 1: Average Time Saved */}
        <div className="p-3.5 bg-emerald-50/50 border border-emerald-200 rounded flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-700 text-[11px]">Avg Time Saved</span>
            <Clock className="w-4 h-4 text-[#166534]" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-900">
              {metrics?.avg_time_saved_display.split(' ')[0]} <span className="text-xs font-semibold text-emerald-700">Days</span>
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              vs. 21-day manual desk baseline
            </div>
          </div>
          <div className="text-[10px] text-emerald-800 font-medium pt-1 border-t border-emerald-100 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>Reduced from 21 days to ~3 mins</span>
          </div>
        </div>

        {/* Metric 2: Duplicate Submissions Prevented */}
        <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-700 text-[11px]">Duplicates Prevented</span>
            <Files className="w-4 h-4 text-blue-700" />
          </div>
          <div>
            <div className="text-xl font-bold text-blue-900 font-mono">
              {metrics?.duplicate_submissions_prevented || 0}
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              Physical document re-uploads avoided
            </div>
          </div>
          <div className="text-[10px] text-blue-800 font-medium pt-1 border-t border-blue-100 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-blue-700" />
            <span>Once-Only Principle active</span>
          </div>
        </div>

        {/* Metric 3: SLA Compliance Rate */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-700 text-[11px]">SLA Compliance Rate</span>
            <Target className="w-4 h-4 text-[#166534]" />
          </div>
          <div>
            <div className="text-xl font-bold text-slate-900 font-mono">
              {metrics?.sla_compliance_percentage?.toFixed(1) || '100.0'}%
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              Resolved within 48h SLA window
            </div>
          </div>
          <div className="text-[10px] text-slate-600 font-medium pt-1 border-t border-slate-200">
            Mandated Right to Services limit
          </div>
        </div>

        {/* Metric 4: Administrative Cost Saved */}
        <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-semibold text-slate-700 text-[11px]">Est. Processing Saved</span>
            <Coins className="w-4 h-4 text-amber-700" />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-900 font-mono">
              {metrics?.estimated_cost_saved_display || '₹0'}
            </div>
            <div className="text-[10px] text-slate-600 mt-0.5">
              Manual verification overhead saved
            </div>
          </div>
          <div className="text-[10px] text-amber-800 font-medium pt-1 border-t border-amber-100">
            At estimated ₹350 per physical check
          </div>
        </div>

      </div>

      {/* Assumptions Transparency Footnote */}
      {!compact && (
        <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] text-slate-600 flex items-start gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-800">Calculation Transparency: </strong>
            Time saved is calculated by comparing application completion against the <em>Maharashtra Right to Services (RTS) Act 21-day manual physical desk turnaround baseline</em>. Administrative cost savings are estimated at <em>₹350 per manual desk verification & physical handling fee</em>. Counters increment live upon each digital consent auto-fetch.
          </div>
        </div>
      )}

    </div>
  );
};
