import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Search, 
  Send,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchGrievances, updateGrievance, Grievance } from '../services/grievanceService';

interface GrievancesQueueProps {
  departmentId?: string;
  isPlatformAdmin?: boolean;
}

export const GrievancesQueue: React.FC<GrievancesQueueProps> = ({
  departmentId,
  isPlatformAdmin = false
}) => {
  const { token } = useAuth();
  const { language, tNum } = useLanguage();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [deptFilter, setDeptFilter] = useState<string>(departmentId || '');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Grievance for Resolution Modal
  const [selectedGrv, setSelectedGrv] = useState<Grievance | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'OPEN' | 'IN_PROGRESS' | 'RESOLVED'>('IN_PROGRESS');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [escalatedFlag, setEscalatedFlag] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      loadGrievances();
    }
  }, [token, deptFilter, statusFilter]);

  const loadGrievances = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchGrievances(token, {
        department_id: deptFilter || undefined,
        status_filter: statusFilter === 'ALL' ? undefined : statusFilter
      });
      setGrievances(data);
    } catch (err) {
      console.error('Failed to load grievances', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenResolveModal = (grv: Grievance) => {
    setSelectedGrv(grv);
    setResolutionStatus(grv.status === 'OPEN' ? 'IN_PROGRESS' : grv.status);
    setResolutionNotes(grv.resolution_notes || '');
    setEscalatedFlag(grv.escalated);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleUpdateGrievance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGrv || !token) return;

    setUpdating(true);
    setErrorMsg(null);
    try {
      const updated = await updateGrievance(token, selectedGrv.id, {
        status: resolutionStatus,
        resolution_notes: resolutionNotes,
        escalated: escalatedFlag
      });

      setSuccessMsg(`Grievance ${updated.grievance_number} marked as '${updated.status}'.`);
      setSelectedGrv(updated);
      await loadGrievances();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update grievance');
    } finally {
      setUpdating(false);
    }
  };

  const filteredGrievances = grievances.filter(g => {
    const q = searchQuery.toLowerCase();
    return (
      g.grievance_number.toLowerCase().includes(q) ||
      g.citizen_name.toLowerCase().includes(q) ||
      (g.application_number && g.application_number.toLowerCase().includes(q)) ||
      g.category.toLowerCase().includes(q) ||
      g.description.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string, escalated: boolean) => {
    if (escalated && status !== 'RESOLVED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 border border-red-300 px-2.5 py-0.5 rounded-full animate-pulse">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span>ESCALATED (SLA BREACH)</span>
        </span>
      );
    }
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Resolved</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>In Progress</span>
          </span>
        );
      case 'OPEN':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            <span>● Open</span>
          </span>
        );
    }
  };

  const getDeptBadge = (deptId: string) => {
    switch (deptId) {
      case 'dept_skills':
        return 'Skills & Innovation (MSInS)';
      case 'dept_industries':
        return 'Industries';
      case 'dept_revenue':
        return 'Revenue';
      case 'dept_education':
        return 'Higher Education';
      default:
        return deptId;
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Header bar with SLA counter */}
      <div className="bg-white border border-[#E5E7E3] rounded-md p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">
              {isPlatformAdmin ? 'Inter-Departmental Unified Grievance Monitor' : 'Department Grievances & RTS Appeals'}
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitors citizen appeals under the Maharashtra Right to Public Services Act (RTS 2015) with automatic 48h escalation triggers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="bg-red-50 border border-red-200 px-3 py-1.5 rounded text-center">
            <div className="font-bold text-red-700 text-sm">
              {tNum(grievances.filter(g => g.escalated && g.status !== 'RESOLVED').length)}
            </div>
            <div className="text-[10px] text-red-600 font-semibold">{language === 'mr' ? 'वरिष्ठांकडे वर्ग' : 'Escalated'}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded text-center">
            <div className="font-bold text-amber-800 text-sm">
              {tNum(grievances.filter(g => g.status === 'OPEN' || g.status === 'IN_PROGRESS').length)}
            </div>
            <div className="text-[10px] text-amber-700">{language === 'mr' ? 'छाननी प्रलंबित' : 'Pending Action'}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded text-center">
            <div className="font-bold text-emerald-800 text-sm">
              {tNum(grievances.filter(g => g.status === 'RESOLVED').length)}
            </div>
            <div className="text-[10px] text-emerald-700">{language === 'mr' ? 'निकाली काढल्या' : 'Resolved'}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-[#E5E7E3] rounded-md p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by grievance number, applicant name, or application ID..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-red-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            {isPlatformAdmin && (
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded text-slate-700 font-medium focus:outline-none"
              >
                <option value="">All Departments</option>
                <option value="dept_revenue">Revenue Department</option>
                <option value="dept_education">Higher Education</option>
                <option value="dept_industries">Industries Department</option>
                <option value="dept_skills">MSInS / Skills</option>
              </select>
            )}

            <div className="flex items-center space-x-1">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded font-medium transition-colors ${
                    statusFilter === filter
                      ? 'bg-red-700 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  {filter === 'IN_PROGRESS' ? 'In Progress' : filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Loading grievances queue...
          </div>
        ) : filteredGrievances.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No grievances recorded under current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <th className="py-2.5 px-3">Grievance Ref #</th>
                  <th className="py-2.5 px-3">Citizen</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Category & Summary</th>
                  <th className="py-2.5 px-3">Linked App</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredGrievances.map((grv) => (
                  <tr key={grv.id} className={`hover:bg-slate-50 transition-colors ${grv.escalated && grv.status !== 'RESOLVED' ? 'bg-red-50/30' : ''}`}>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {grv.grievance_number}
                    </td>
                    <td className="py-3 px-3 text-slate-800 font-medium">
                      {grv.citizen_name}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[11px]">
                        {getDeptBadge(grv.department_id)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-xs">
                      <div className="font-semibold text-[11px] text-slate-800">{grv.category.replace(/_/g, ' ')}</div>
                      <div className="text-slate-500 truncate text-[11px]">{grv.description}</div>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px]">
                      {grv.application_number ? (
                        <span className="text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                          {grv.application_number}
                        </span>
                      ) : (
                        <span className="text-slate-400">Direct / General</span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {getStatusBadge(grv.status, grv.escalated)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleOpenResolveModal(grv)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-red-700 hover:text-white text-slate-700 border border-slate-300 hover:border-red-700 rounded font-semibold text-[11px] transition-colors"
                      >
                        Review / Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESOLUTION MODAL */}
      {selectedGrv && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-base font-bold">Grievance Review: {selectedGrv.grievance_number}</h3>
                  <p className="text-xs text-slate-400">{getDeptBadge(selectedGrv.department_id)}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedGrv(null)}
                className="p-1 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateGrievance} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-xs">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Applicant</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedGrv.citizen_name}</div>
                </div>
                <div>
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Linked Application</div>
                  <div className="font-mono font-bold text-slate-900 mt-0.5">
                    {selectedGrv.application_number || 'Direct Grievance'}
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Category & Citizen Narrative</div>
                  <div className="font-semibold text-slate-800 mt-0.5">{selectedGrv.category.replace(/_/g, ' ')}</div>
                  <div className="text-slate-600 mt-1 bg-white p-2.5 rounded border border-slate-200">{selectedGrv.description}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Update Resolution Status
                </label>
                <div className="flex gap-2">
                  {(['OPEN', 'IN_PROGRESS', 'RESOLVED'] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setResolutionStatus(st)}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-colors ${
                        resolutionStatus === st
                          ? st === 'RESOLVED'
                            ? 'bg-emerald-700 text-white border-emerald-700'
                            : st === 'IN_PROGRESS'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      {st === 'IN_PROGRESS' ? 'In Progress' : st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Officer Resolution Notes / Action Taken
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record corrective actions taken, verification rectifications, or citizen explanations..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                  <input
                    type="checkbox"
                    checked={escalatedFlag}
                    onChange={(e) => setEscalatedFlag(e.target.checked)}
                    className="rounded border-slate-300 text-red-600 focus:ring-red-500"
                  />
                  <span>Flag as Escalated to Dept Head (SLA Breach)</span>
                </label>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedGrv(null)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1.5"
                  >
                    {updating ? <span>Saving...</span> : <span>Save Update</span>}
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
