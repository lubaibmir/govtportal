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

export const AdminDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'APPLICATIONS' | 'SERVICES' | 'TRAFFIC' | 'TRACKING' | 'AUDIT'>('OVERVIEW');
  const [trackingAppNumber, setTrackingAppNumber] = useState<string>('');

  useEffect(() => {
    fetchHealthStatus().then(setHealth);
    if (token) {
      loadAllApps();
    }
  }, [token]);

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
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-6">
          
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

    </div>
  );
};
