import React, { useEffect, useState } from 'react';
import { 
  Layers, 
  Activity, 
  FileText, 
  Database, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserApplications, ApplicationRecord } from '../services/applicationService';
import { fetchHealthStatus } from '../services/api';
import { HealthStatus } from '../types';
import { ServiceCatalogue } from './ServiceCatalogue';
import { ApplicationTracking } from './ApplicationTracking';
import { AuditLogExplorer } from './AuditLogExplorer';
import { ImpactMetricsPanel } from './ImpactMetricsPanel';
import { GrievancesQueue } from './GrievancesQueue';
import { WorkflowRulesPanel } from './WorkflowRulesPanel';
import { MdmDeduplicationPanel } from './MdmDeduplicationPanel';
import { fetchResilienceStatus, toggleDepartmentOutage, fetchResilienceLogs, ResilienceStatus, ResilienceLogEntry } from '../services/resilienceService';
import { AlertTriangle, WifiOff, CheckCircle, Cpu, ShieldAlert, Sliders } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'APPLICATIONS' | 'SERVICES' | 'TRAFFIC' | 'TRACKING' | 'AUDIT' | 'GRIEVANCES' | 'RULES' | 'MDM'>('OVERVIEW');
  const [trackingAppNumber, setTrackingAppNumber] = useState<string>('');

  // Resilience & Outage Simulation State
  const [resilienceStatus, setResilienceStatus] = useState<ResilienceStatus | null>(null);
  const [resilienceLogs, setResilienceLogs] = useState<ResilienceLogEntry[]>([]);
  const [selectedOutageDept, setSelectedOutageDept] = useState<string>('dept_revenue');
  const [outageActionLoading, setOutageActionLoading] = useState(false);
  const [outageFeedback, setOutageFeedback] = useState<string | null>(null);

  useEffect(() => {
    fetchHealthStatus().then(setHealth);
    loadResilienceData();
    if (token) {
      loadAllApps();
    }
    const interval = setInterval(loadResilienceData, 4000);
    return () => clearInterval(interval);
  }, [token]);

  const loadResilienceData = async () => {
    try {
      const [st, lg] = await Promise.all([
        fetchResilienceStatus(),
        fetchResilienceLogs()
      ]);
      setResilienceStatus(st);
      setResilienceLogs(lg);
    } catch (e) {
      // ignore
    }
  };

  const handleToggleOutage = async (isOutage: boolean) => {
    if (!token) return;
    setOutageActionLoading(true);
    setOutageFeedback(null);
    try {
      await toggleDepartmentOutage(selectedOutageDept, isOutage, token);
      await loadResilienceData();
      setOutageFeedback(
        isOutage
          ? `Simulated API outage activated for ${selectedOutageDept}. 3x retry & cache fallback active.`
          : `Restored ${selectedOutageDept} to healthy status. Pending queue resumed.`
      );
    } catch (err: any) {
      setOutageFeedback(err.message || 'Failed to toggle outage simulation. Please verify network connectivity.');
    } finally {
      setOutageActionLoading(false);
    }
  };

  const loadAllApps = async () => {
    if (!token) return;
    setLoading(true);
    const data = await fetchUserApplications(token);
    setApplications(data);
    setLoading(false);
  };

  const totalApps = applications.length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED').length;
  const inReviewCount = applications.filter(a => a.status === 'IN_REVIEW').length;
  const submittedCount = applications.filter(a => a.status === 'SUBMITTED').length;

  const isSelectedDeptInOutage = resilienceStatus?.active_outages.includes(selectedOutageDept) || false;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* ADMIN HEADER */}
      <div className="bg-white border border-[#E5E7E3] rounded-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              State System Administration
            </h1>
            <span className="text-[11px] font-semibold text-[#166534] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Platform Admin
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Administrator: <strong>{user?.full_name}</strong> • Platform metrics, interoperability traffic, service registry, and security audit stream.
          </p>
        </div>

        {/* TABS SELECTION */}
        <div className="flex flex-wrap items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              activeTab === 'OVERVIEW'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              activeTab === 'APPLICATIONS'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Applications ({totalApps})
          </button>

          <button
            onClick={() => setActiveTab('TRAFFIC')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              activeTab === 'TRAFFIC'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Traffic Matrix
          </button>

          <button
            onClick={() => setActiveTab('SERVICES')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              activeTab === 'SERVICES'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Services
          </button>

          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              activeTab === 'AUDIT'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            Audit Logs
          </button>

          <button
            onClick={() => setActiveTab('GRIEVANCES')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'GRIEVANCES'
                ? 'bg-red-700 text-white'
                : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>RTS Grievances</span>
          </button>

          <button
            onClick={() => setActiveTab('RULES')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'RULES'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Workflow Rules & SLA</span>
          </button>

          <button
            onClick={() => setActiveTab('MDM')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'MDM'
                ? 'bg-indigo-700 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <span>🔍</span>
            <span>MDM Deduplication & 360°</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          
          {/* Real-time System Impact & ROI Telemetry */}
          <ImpactMetricsPanel />

          {/* SYSTEM STATS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-[#E5E7E3] rounded-md p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Applications</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">{totalApps}</div>
              </div>
              <FileText className="w-5 h-5 text-slate-400" />
            </div>

            <div className="bg-white border border-[#E5E7E3] rounded-md p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Approved Licenses</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">{approvedCount}</div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-[#166534]" />
            </div>

            <div className="bg-white border border-[#E5E7E3] rounded-md p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Under Review</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">{inReviewCount}</div>
              </div>
              <Activity className="w-5 h-5 text-amber-500" />
            </div>

            <div className="bg-white border border-[#E5E7E3] rounded-md p-4 flex items-center justify-between">
              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase">Pending Review</div>
                <div className="text-2xl font-bold text-slate-900 mt-0.5">{submittedCount}</div>
              </div>
              <RefreshCw className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          {/* GATEWAY HEALTH & SECURITY HARDENING BOARD */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* System Gateway Observability */}
            <div className="bg-white border border-[#E5E7E3] rounded-md p-5 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-[#166534]" />
                <span>Gateway Microservice Observability</span>
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                  <span className="text-slate-600">Gateway Service Status</span>
                  <span className="text-[#166534] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{health?.status || 'HEALTHY'}</span>
                  </span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                  <span className="text-slate-600">Database Engine</span>
                  <span className="text-slate-900 font-mono font-bold">{health?.components.database || 'PostgreSQL 16'}</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                  <span className="text-slate-600">Redis Event Bus</span>
                  <span className="text-slate-900 font-mono font-bold">{health?.components.redis || 'Redis 7 Streams Active'}</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Consent Security */}
            <div className="bg-white border border-[#E5E7E3] rounded-md p-5 space-y-3 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#166534]" />
                <span>Consent & Interoperability Policy Enforcement</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                  <span className="text-slate-600">Backend Consent Verification</span>
                  <span className="text-[#166534] font-bold">Enforced (Active)</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                  <span className="text-slate-600">Data Gateway Exception Code</span>
                  <span className="text-slate-900 font-mono font-semibold">HTTP 403 CONSENT_REQUIRED</span>
                </div>

                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                  <span className="text-slate-600">Canonical Mapper Schema</span>
                  <span className="text-slate-900 font-semibold">Pydantic V2 Models</span>
                </div>
              </div>
            </div>

          </div>

          {/* CIRCUIT BREAKER & LEGACY DEPARTMENT OUTAGE SIMULATOR (TASK 2 FLAGSHIP) */}
          <div className="bg-white border border-[#E5E7E3] rounded-md p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    Live Resilience Engine
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Circuit Breaker & Exception Handling</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#166534]" />
                  <span>Simulate Legacy Department API Outage & Resilience Protocol</span>
                </h3>
              </div>

              <button
                onClick={loadResilienceData}
                className="self-start sm:self-auto px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3 text-slate-500" />
                <span>Refresh Live Logs</span>
              </button>
            </div>

            {outageFeedback && (
              <div className={`p-3 rounded text-xs flex items-center gap-2 border ${
                isSelectedDeptInOutage
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-900'
              }`}>
                {isSelectedDeptInOutage ? (
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                )}
                <span>{outageFeedback}</span>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              
              {/* Controls Column */}
              <div className="md:col-span-1 bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">Target Department Adapter</label>
                  <select
                    value={selectedOutageDept}
                    onChange={(e) => setSelectedOutageDept(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-900"
                  >
                    <option value="dept_revenue">Revenue Department (Income Records)</option>
                    <option value="dept_skills">Skills & Innovation Society (MSInS)</option>
                    <option value="dept_education">Education Department (Degrees)</option>
                    <option value="dept_industries">Industries Department (Licenses)</option>
                  </select>
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded text-xs space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Current Status:</span>
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] border ${
                      isSelectedDeptInOutage
                        ? 'bg-red-50 text-red-700 border-red-200 animate-pulse'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isSelectedDeptInOutage ? '🔴 OUTAGE SIMULATED' : '🟢 NORMAL OPERATION'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-500 leading-relaxed">
                    {isSelectedDeptInOutage
                      ? 'Outage active! All requests to this adapter will execute a 3-step exponential backoff retry loop, then fallback to local encrypted cache replica or queue offline.'
                      : 'Adapter is responding normally with live mock responses.'}
                  </div>
                </div>

                {isSelectedDeptInOutage ? (
                  <button
                    onClick={() => handleToggleOutage(false)}
                    disabled={outageActionLoading}
                    className="w-full py-2 bg-[#166534] hover:bg-[#15803D] text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{outageActionLoading ? 'Restoring Service...' : 'Restore Healthy Operation'}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleOutage(true)}
                    disabled={outageActionLoading}
                    className="w-full py-2 bg-red-700 hover:bg-red-800 text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>{outageActionLoading ? 'Simulating Outage...' : 'Simulate API Outage (Trigger Resilience)'}</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 text-slate-500">
                  <div className="p-2 bg-white border border-slate-200 rounded text-center">
                    <span className="block text-slate-400">Cached Replicas</span>
                    <strong className="text-xs text-slate-900 font-mono">{resilienceStatus?.cached_records_count || 1}</strong>
                  </div>
                  <div className="p-2 bg-white border border-slate-200 rounded text-center">
                    <span className="block text-slate-400">Offline Queue</span>
                    <strong className="text-xs text-amber-800 font-mono">{resilienceStatus?.pending_queue_count || 0}</strong>
                  </div>
                </div>
              </div>

              {/* Real-time Retry Log Stream Column */}
              <div className="md:col-span-2 bg-slate-900 text-slate-100 rounded p-4 font-mono text-[11px] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2 text-slate-400">
                    <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <span>●</span>
                      <span>Real-Time Circuit Breaker & Retry Log Stream</span>
                    </span>
                    <span className="text-[10px] text-slate-500">Live Auto-Scroll</span>
                  </div>

                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {resilienceLogs.length === 0 ? (
                      <div className="text-slate-500 text-center py-6">
                        No outage events logged yet. Trigger an outage simulation to view retry attempts in real-time.
                      </div>
                    ) : (
                      resilienceLogs.map((lg) => {
                        const levelColor =
                          lg.level === 'SUCCESS' ? 'text-emerald-400' :
                          lg.level === 'WARNING' ? 'text-amber-400' :
                          lg.level === 'ERROR' ? 'text-red-400' : 'text-slate-300';
                        return (
                          <div key={lg.id} className="p-1.5 bg-slate-800/80 rounded border border-slate-700/50">
                            <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                              <span className="font-bold text-slate-200">[{lg.department_id}] {lg.action}</span>
                              <span className="text-slate-500">{new Date(lg.timestamp).toLocaleTimeString('en-IN')}</span>
                            </div>
                            <p className={`${levelColor} text-[11px] leading-relaxed`}>{lg.message}</p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between items-center mt-2">
                  <span>Exponential Backoff: <strong>100ms ➔ 200ms ➔ 400ms</strong></span>
                  <span className="text-emerald-400 font-semibold">Resilience Protocol: Active</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* ALL APPLICATIONS TAB */}
      {activeTab === 'APPLICATIONS' && (
        <div className="bg-white border border-[#E5E7E3] rounded-md p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Global Applications Queue</h2>
            <span className="text-xs text-slate-500 font-mono">Total Records: {totalApps}</span>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-500 text-xs">Loading all applications...</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">No applications registered yet.</div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{app.application_number}</span>
                      <span className="font-semibold px-2 py-0.5 rounded border bg-white border-slate-300 text-slate-800">
                        {app.status}
                      </span>
                      <span className="font-mono text-slate-500">[{app.department_id}]</span>
                    </div>
                    <div className="font-semibold text-slate-800">
                      {app.service_id}
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Created: {new Date(app.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTrackingAppNumber(app.application_number);
                      setActiveTab('TRACKING');
                    }}
                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold px-3 py-1.5 rounded transition-colors flex items-center justify-center gap-1 shrink-0"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>View Timeline</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TRAFFIC MATRIX TAB */}
      {activeTab === 'TRAFFIC' && (
        <div className="bg-white border border-[#E5E7E3] rounded-md p-5 space-y-4 shadow-xs">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#166534]" />
              <span>Cross-Departmental Interoperability Traffic Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Active data integration channels between Providing Registries and Requesting Departments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900">Revenue Dept</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-[#166534]">Industries Dept</span>
              </div>
              <div className="text-slate-700">Data: <strong>Income Certificate</strong></div>
              <div className="text-slate-500 text-[11px]">Purpose: Business License eligibility</div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                <span className="text-[#166534] font-semibold">● ACTIVE</span>
                <span className="text-slate-400 font-mono">12ms</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900">Education Dept</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-[#166534]">Industries Dept</span>
              </div>
              <div className="text-slate-700">Data: <strong>Degree Verification</strong></div>
              <div className="text-slate-500 text-[11px]">Purpose: Technical entrepreneurship grant</div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                <span className="text-[#166534] font-semibold">● ACTIVE</span>
                <span className="text-slate-400 font-mono">18ms</span>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="text-slate-900">Revenue Dept</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
                <span className="text-slate-900">Education Dept</span>
              </div>
              <div className="text-slate-700">Data: <strong>Residence / Income</strong></div>
              <div className="text-slate-500 text-[11px]">Purpose: Scholarship verification</div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                <span className="text-[#166534] font-semibold">● ACTIVE</span>
                <span className="text-slate-400 font-mono">15ms</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SERVICES CATALOGUE TAB */}
      {activeTab === 'SERVICES' && (
        <div className="space-y-4">
          <ServiceCatalogue />
        </div>
      )}

      {/* TRACKING TAB */}
      {activeTab === 'TRACKING' && (
        <div className="space-y-4">
          <ApplicationTracking initialAppNumber={trackingAppNumber} />
        </div>
      )}

      {/* SECURITY AUDIT LOGS TAB */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-4">
          <AuditLogExplorer />
        </div>
      )}

      {/* RTS GRIEVANCES QUEUE TAB */}
      {activeTab === 'GRIEVANCES' && (
        <div className="space-y-4">
          <GrievancesQueue isPlatformAdmin={true} />
        </div>
      )}

      {/* WORKFLOW RULES & SLA ENGINE TAB */}
      {activeTab === 'RULES' && (
        <WorkflowRulesPanel />
      )}

      {/* MDM DEDUPLICATION & 360 BENEFICIARY TAB */}
      {activeTab === 'MDM' && token && (
        <MdmDeduplicationPanel token={token} />
      )}

    </div>
  );
};


