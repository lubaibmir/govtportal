import React, { useEffect, useState } from 'react';
import { 
  ShieldCheck, 
  Check,
  AlertCircle,
  Search, 
  ShieldAlert,
  FileText,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserApplications, ApplicationRecord } from '../services/applicationService';
import { updateApplicationStatus, fetchApplicationEvents, ApplicationEventRecord } from '../services/eventService';
import { GrievancesQueue } from './GrievancesQueue';
import { SlaCountdownTimer } from './SlaCountdownTimer';
import { MdmDeduplicationPanel } from './MdmDeduplicationPanel';
import { Beneficiary360Modal } from './Beneficiary360Modal';

export const OfficerDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'GRIEVANCES' | 'MDM_360'>('APPLICATIONS');
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Selected Application for Inspection Modal
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);
  const [inspectCitizen360Id, setInspectCitizen360Id] = useState<string | null>(null);
  const [appEvents, setAppEvents] = useState<ApplicationEventRecord[]>([]);
  const [targetStatus, setTargetStatus] = useState<string>('IN_REVIEW');
  const [remarks, setRemarks] = useState<string>('');
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadApps();
    }
  }, [token]);

  const loadApps = async () => {
    if (!token) return;
    setLoading(true);
    const data = await fetchUserApplications(token);
    setApplications(data);
    setLoading(false);
  };

  const handleOpenReview = async (app: ApplicationRecord) => {
    setSelectedApp(app);
    setErrorMsg(null);
    setSuccessMsg(null);
    setRemarks('');
    
    if (app.status === 'SUBMITTED') {
      setTargetStatus('IN_REVIEW');
    } else if (app.status === 'IN_REVIEW') {
      setTargetStatus('APPROVED');
    } else {
      setTargetStatus(app.status);
    }

    if (token) {
      const events = await fetchApplicationEvents(app.application_number, token);
      setAppEvents(events);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp || !token) return;

    setUpdating(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await updateApplicationStatus(
        selectedApp.application_number,
        targetStatus,
        remarks || `Status transitioned to ${targetStatus} by ${user?.full_name}`,
        token
      );

      setSuccessMsg(`Application #${updated.application_number} status successfully updated to '${updated.status}'.`);
      setSelectedApp(null);
      await loadApps();
    } catch (err: any) {
      setErrorMsg(err.message || 'Status transition failed. Check state machine rules.');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { text: 'Approved', cls: 'text-[#166534] bg-emerald-50 border-emerald-200' };
      case 'IN_REVIEW':
        return { text: 'In Review', cls: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'SUBMITTED':
        return { text: 'Pending', cls: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'REJECTED':
        return { text: 'Rejected', cls: 'text-red-800 bg-red-50 border-red-200' };
      default:
        return { text: status, cls: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    const matchesQuery = app.application_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.service_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* OFFICER HEADER & QUEUE OVERVIEW */}
      <div className="bg-white border border-[#E5E7E3] rounded-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Department Scrutiny Queue
            </h1>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded uppercase">
              {user?.department_id === 'dept_skills' ? 'SKILLS & INNOVATION (MSInS)' :
               user?.department_id === 'dept_industries' ? 'INDUSTRIES DEPARTMENT' :
               user?.department_id === 'dept_revenue' ? 'REVENUE DEPARTMENT' :
               user?.department_id === 'dept_education' ? 'EDUCATION DEPARTMENT' :
               (user?.department_id || 'DEPARTMENT')}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Officer: <strong>{user?.full_name}</strong> • Review and process incoming citizen applications with auto-verified interop data.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-center">
            <div className="font-bold text-slate-900 text-sm">{applications.length}</div>
            <div className="text-[10px] text-slate-500">Total</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded text-center">
            <div className="font-bold text-amber-900 text-sm">{applications.filter(a => a.status === 'SUBMITTED' || a.status === 'IN_REVIEW').length}</div>
            <div className="text-[10px] text-amber-800">Pending Review</div>
          </div>
        </div>
      </div>

      {/* TAB SWITCHER */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('APPLICATIONS')}
          className={`px-4 py-2 rounded font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'APPLICATIONS'
              ? 'bg-[#166534] text-white'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Applications Scrutiny Queue ({applications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('GRIEVANCES')}
          className={`px-4 py-2 rounded font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'GRIEVANCES'
              ? 'bg-red-700 text-white'
              : 'bg-white text-red-700 hover:bg-red-50 border border-red-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Department Grievances & RTS Escalations</span>
        </button>
        <button
          onClick={() => setActiveTab('MDM_360')}
          className={`px-4 py-2 rounded font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'MDM_360'
              ? 'bg-indigo-700 text-white'
              : 'bg-white text-indigo-700 hover:bg-indigo-50 border border-indigo-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Beneficiary 360° & MDM Deduplication</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-md text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold ml-4">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: APPLICATIONS QUEUE */}
      {activeTab === 'APPLICATIONS' && (
        <div className="bg-white border border-[#E5E7E3] rounded-md p-5 space-y-4 shadow-xs">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by application number or service..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1 text-xs shrink-0">
              {['ALL', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded font-medium transition-colors ${
                    statusFilter === filter
                      ? 'bg-[#166534] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  {filter === 'SUBMITTED' ? 'Pending' : filter === 'IN_REVIEW' ? 'In Review' : filter}
                </button>
              ))}
            </div>
          </div>

          {/* Queue Table */}
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              Loading department application queue...
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              No applications match current filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">Application #</th>
                    <th className="py-2.5 px-3">Service</th>
                    <th className="py-2.5 px-3">Verified Interop Data</th>
                    <th className="py-2.5 px-3">RTS SLA Clock</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => {
                    const st = getStatusBadge(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {app.application_number}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {app.service_id === 'srv_ind_biz_license' ? 'Business License' : app.service_id}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {app.application_data?.income_certificate_number ? (
                            <span className="text-emerald-800 font-mono text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              Revenue Cert #{app.application_data.income_certificate_number} (₹{app.application_data.verified_annual_income})
                            </span>
                          ) : (
                            <span className="text-slate-400">Standard Application</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <SlaCountdownTimer createdAt={app.created_at} status={app.status} compact={true} />
                        </td>
                        <td className="py-3 px-3">
                          <span className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${st.cls}`}>
                            {st.text}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenReview(app)}
                            className="bg-[#166534] hover:bg-[#15803D] text-white font-medium px-3 py-1 rounded text-xs transition-colors"
                          >
                            Inspect & Process
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: GRIEVANCES & ESCALATIONS QUEUE */}
      {activeTab === 'GRIEVANCES' && (
        <GrievancesQueue departmentId={user?.department_id || undefined} />
      )}

      {/* TAB 3: MDM DEDUPLICATION & BENEFICIARY 360 */}
      {activeTab === 'MDM_360' && token && (
        <MdmDeduplicationPanel token={token} />
      )}


      {/* INSPECTION PANEL MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E7E3] rounded-md shadow-lg max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
              <div>
                <span className="text-xs font-mono font-semibold text-slate-500">Application Scrutiny</span>
                <div className="flex items-center gap-3 mt-0.5">
                  <h3 className="text-base font-bold text-slate-900">
                    Application #{selectedApp.application_number}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setInspectCitizen360Id(selectedApp.citizen_id)}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>👁️</span> View Applicant 360° Profile
                  </button>
                </div>
              </div>
              <button onClick={() => setSelectedApp(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3 rounded text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* VERIFIED EVIDENCE CARDS (INTEROPERABILITY DATA) */}
            {selectedApp.application_data?.revenue_verification && (
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs space-y-1.5">
                <div className="font-semibold text-emerald-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#166534]" />
                    <span>Revenue Department Verified Financial Evidence</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded bg-white">
                    AUTO-FETCHED
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-slate-800 font-mono text-[11px] pt-1">
                  <div>Income Cert #: <strong>{selectedApp.application_data.revenue_verification.certificate_number}</strong></div>
                  <div>Annual Income: <strong>₹{Number(selectedApp.application_data.revenue_verification.annual_income || 0).toLocaleString('en-IN')}</strong></div>
                  <div>Issuing Office: <strong>{selectedApp.application_data.revenue_verification.issuing_authority || 'Tahsildar'}</strong></div>
                  <div>Status: <span className="text-emerald-800 font-bold">{selectedApp.application_data.revenue_verification.status}</span></div>
                </div>
              </div>
            )}

            {selectedApp.application_data?.skills_verification && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs space-y-1.5">
                <div className="font-semibold text-blue-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>MSBTE / Skills Department Verified Qualification</span>
                  </span>
                  <span className="text-[10px] font-mono text-blue-800 border border-blue-300 px-1.5 py-0.2 rounded bg-white">
                    AUTO-FETCHED
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-slate-800 font-mono text-[11px] pt-1">
                  <div>Trainee ID: <strong>{selectedApp.application_data.skills_verification.trainee_id}</strong></div>
                  <div>Trade Course: <strong>{selectedApp.application_data.skills_verification.trade_course}</strong></div>
                  <div>Level / Grade: <strong>{selectedApp.application_data.skills_verification.certification_level} ({selectedApp.application_data.skills_verification.grade})</strong></div>
                  <div>Issuing Board: <strong>{selectedApp.application_data.skills_verification.issuing_board}</strong></div>
                </div>
              </div>
            )}

            {selectedApp.application_data?.income_certificate_number && !selectedApp.application_data?.revenue_verification && (
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs space-y-1.5">
                <div className="font-semibold text-emerald-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#166534]" />
                    <span>MahaSetu Verified Revenue Data Evidence</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded bg-white">
                    VERIFIED
                  </span>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-2 text-slate-800 font-mono text-[11px] pt-1">
                  <div>Income Cert #: <strong>{selectedApp.application_data.income_certificate_number}</strong></div>
                  <div>Verified Income: <strong>₹{Number(selectedApp.application_data.verified_annual_income || 0).toLocaleString('en-IN')}</strong></div>
                  <div>Issuing Authority: <strong>{selectedApp.application_data.issuing_authority || 'Revenue Dept Tahsildar'}</strong></div>
                  <div>Response Hash: <span className="text-slate-600 text-[10px]">{selectedApp.application_data.raw_response_hash || 'Verified'}</span></div>
                </div>
              </div>
            )}

            {/* FORM DATA DETAILS */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">Submitted Form Data</h4>
              <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto">
                {JSON.stringify(selectedApp.application_data, null, 2)}
              </pre>
            </div>

            {/* DECISION FORM */}
            <form onSubmit={handleStatusUpdate} className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase">Officer Decision & Status Action</h4>
                <span className="text-[10px] text-slate-500 font-medium">State Machine Transition</span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">New Status</label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="IN_REVIEW">In Review (Start Scrutiny)</option>
                    <option value="APPROVED">Approve Application</option>
                    <option value="REJECTED">Reject Application</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Official Remarks / {targetStatus === 'REJECTED' ? 'Rejection Reason' : 'Notes'}
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      targetStatus === 'REJECTED'
                        ? 'e.g. Income exceeds threshold / Incomplete trade certificate...'
                        : 'Enter officer remarks...'
                    }
                    className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {targetStatus === 'REJECTED' && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-800 flex items-center gap-1.5">
                  <span className="font-bold">⚠️ Rejection Notice:</span>
                  <span>
                    The applicant will receive an instant SMS/alert detailing this official reason, along with statutory appeal rights under the Maharashtra RTS Act 2015.
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded border border-slate-300 font-semibold"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className={`px-4 py-1.5 rounded font-semibold text-white transition-colors disabled:opacity-50 ${
                    targetStatus === 'REJECTED'
                      ? 'bg-red-700 hover:bg-red-800'
                      : targetStatus === 'APPROVED'
                      ? 'bg-[#166534] hover:bg-[#15803D]'
                      : 'bg-amber-700 hover:bg-amber-800'
                  }`}
                >
                  {updating
                    ? 'Updating Status...'
                    : targetStatus === 'REJECTED'
                    ? '✕ Confirm Rejection'
                    : targetStatus === 'APPROVED'
                    ? '✓ Approve & Issue'
                    : 'Submit Scrutiny Status'}
                </button>
              </div>
            </form>

            {/* EVENT AUDIT HISTORY */}
            {appEvents.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">Application Event History ({appEvents.length})</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {appEvents.map((evt) => (
                    <div key={evt.id} className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="font-semibold text-[#166534]">{evt.event_type}</span>
                        <span className="text-slate-400">{new Date(evt.created_at).toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-slate-700 text-[11px] mt-0.5">{evt.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* BENEFICIARY 360 MODAL (FROM OFFICER INSPECTION) */}
      {inspectCitizen360Id && token && (
        <Beneficiary360Modal
          token={token}
          citizenId={inspectCitizen360Id}
          onClose={() => setInspectCitizen360Id(null)}
        />
      )}

    </div>
  );
};
