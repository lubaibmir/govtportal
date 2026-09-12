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
import { useLanguage } from '../context/LanguageContext';
import { fetchUserApplications, ApplicationRecord } from '../services/applicationService';
import { updateApplicationStatus, fetchApplicationEvents, ApplicationEventRecord } from '../services/eventService';
import { GrievancesQueue } from './GrievancesQueue';
import { SlaCountdownTimer } from './SlaCountdownTimer';
import { MdmDeduplicationPanel } from './MdmDeduplicationPanel';
import { Beneficiary360Modal } from './Beneficiary360Modal';

export const OfficerDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { language, t, tDept, tService, tStatus, tNum, tCurrency, tDate } = useLanguage();
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
        return { text: tStatus('APPROVED'), cls: 'text-[#166534] bg-emerald-50 border-emerald-200' };
      case 'IN_REVIEW':
        return { text: tStatus('IN_REVIEW'), cls: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'SUBMITTED':
        return { text: tStatus('SUBMITTED'), cls: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'REJECTED':
        return { text: tStatus('REJECTED'), cls: 'text-red-800 bg-red-50 border-red-200' };
      default:
        return { text: tStatus(status), cls: 'text-slate-700 bg-slate-100 border-slate-200' };
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
              {t('officer_portal_title')}
            </h1>
            <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded uppercase">
              {tDept(user?.department_id || 'dept_skills', user?.department_id || 'DEPARTMENT')}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            {language === 'mr' ? 'अधिकारी:' : 'Officer:'} <strong>{user?.full_name}</strong> • {t('officer_queue_desc')}
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded text-center">
            <div className="font-bold text-slate-900 text-sm">{tNum(applications.length)}</div>
            <div className="text-[10px] text-slate-500">{language === 'mr' ? 'एकूण अर्ज' : 'Total'}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded text-center">
            <div className="font-bold text-amber-900 text-sm">{tNum(applications.filter(a => a.status === 'SUBMITTED' || a.status === 'IN_REVIEW').length)}</div>
            <div className="text-[10px] text-amber-800">{language === 'mr' ? 'छाननी प्रलंबित' : 'Pending Review'}</div>
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
          <span>{language === 'mr' ? `अर्जांची छाननी सूची (${tNum(applications.length)})` : `Applications Scrutiny Queue (${applications.length})`}</span>
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
          <span>{language === 'mr' ? 'विभागीय तक्रार व लोकसेवा हमी निवारण' : 'Department Grievances & RTS Escalations'}</span>
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
          <span>{language === 'mr' ? 'लाभार्थी ३६०° प्रोफाइल व डुप्लिकेशन शोध' : 'Beneficiary 360° & MDM Deduplication'}</span>
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
                placeholder={language === 'mr' ? 'अर्ज क्रमांक किंवा सेवेनुसार शोधा...' : 'Search by application number or service...'}
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
                  {filter === 'ALL' ? (language === 'mr' ? 'सर्व' : 'All') :
                   filter === 'SUBMITTED' ? (language === 'mr' ? 'सादर' : 'Pending') :
                   filter === 'IN_REVIEW' ? (language === 'mr' ? 'छाननी सुरू' : 'In Review') :
                   filter === 'APPROVED' ? (language === 'mr' ? 'मंजूर' : 'Approved') :
                   (language === 'mr' ? 'नाकारले' : 'Rejected')}
                </button>
              ))}
            </div>
          </div>

          {/* Queue Table */}
          {loading ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              {language === 'mr' ? 'विभागीय अर्जांची सूची लोड होत आहे...' : 'Loading department application queue...'}
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              {language === 'mr' ? 'सध्याच्या फिल्टरनुसार कोणतेही अर्ज नाहीत.' : 'No applications match current filters.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3">{language === 'mr' ? 'अर्ज क्रमांक' : 'Application #'}</th>
                    <th className="py-2.5 px-3">{language === 'mr' ? 'शासकीय योजना / सेवा' : 'Service'}</th>
                    <th className="py-2.5 px-3">{language === 'mr' ? 'प्रमाणित आंतर-विभागीय माहिती' : 'Verified Interop Data'}</th>
                    <th className="py-2.5 px-3">{t('sla_clock')}</th>
                    <th className="py-2.5 px-3">{language === 'mr' ? 'स्थिती' : 'Status'}</th>
                    <th className="py-2.5 px-3 text-right">{language === 'mr' ? 'कृती' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((app) => {
                    const st = getStatusBadge(app.status);
                    return (
                      <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-900">
                          {tNum(app.application_number)}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800">
                          {tService(app.service_id, app.service_id)}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {app.application_data?.income_certificate_number ? (
                            <span className="text-emerald-800 font-mono text-[11px] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              {language === 'mr' ? 'उत्पन्न दाखला #' : 'Revenue Cert #'}{tNum(app.application_data.income_certificate_number)} ({tCurrency(app.application_data.verified_annual_income)})
                            </span>
                          ) : (
                            <span className="text-slate-400">{language === 'mr' ? 'मानक अर्ज' : 'Standard Application'}</span>
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
                            {language === 'mr' ? 'तपासा आणि छाननी करा' : 'Inspect & Process'}
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
                <span className="text-xs font-mono font-semibold text-slate-500">
                  {language === 'mr' ? 'विभागीय अर्ज तपासणी' : 'Application Scrutiny'}
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <h3 className="text-base font-bold text-slate-900">
                    {language === 'mr' ? 'अर्ज क्रमांक' : 'Application #'} {tNum(selectedApp.application_number)}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setInspectCitizen360Id(selectedApp.citizen_id)}
                    className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 rounded text-xs font-bold transition flex items-center gap-1"
                  >
                    <span>👁️</span> {t('view_360')}
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
                    <span>{language === 'mr' ? 'महसूल विभाग प्रमाणित आर्थिक दाखला' : 'Revenue Department Verified Financial Evidence'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded bg-white">
                    AUTO-FETCHED
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-slate-800 font-mono text-[11px] pt-1">
                  <div>{t('cert_num_label')} <strong>{tNum(selectedApp.application_data.revenue_verification.certificate_number)}</strong></div>
                  <div>{t('verified_income_label')} <strong>{tCurrency(selectedApp.application_data.revenue_verification.annual_income)}</strong></div>
                  <div>{t('issuing_office_label')} <strong>{selectedApp.application_data.revenue_verification.issuing_authority || 'Tahsildar'}</strong></div>
                  <div>Status: <span className="text-emerald-800 font-bold">{selectedApp.application_data.revenue_verification.status}</span></div>
                </div>
              </div>
            )}

            {selectedApp.application_data?.skills_verification && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs space-y-1.5">
                <div className="font-semibold text-blue-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                    <span>{language === 'mr' ? 'MSBTE / कौशल्य विभाग प्रमाणित पात्रता' : 'MSBTE / Skills Department Verified Qualification'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-blue-800 border border-blue-300 px-1.5 py-0.2 rounded bg-white">
                    AUTO-FETCHED
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2 text-slate-800 font-mono text-[11px] pt-1">
                  <div>{t('trainee_id_label')} <strong>{tNum(selectedApp.application_data.skills_verification.trainee_id)}</strong></div>
                  <div>{t('trade_course_label')} <strong>{selectedApp.application_data.skills_verification.trade_course}</strong></div>
                  <div>{t('level_grade_label')} <strong>{selectedApp.application_data.skills_verification.certification_level} ({selectedApp.application_data.skills_verification.grade})</strong></div>
                  <div>{t('issuing_board_label')} <strong>{selectedApp.application_data.skills_verification.issuing_board}</strong></div>
                </div>
              </div>
            )}

            {selectedApp.application_data?.income_certificate_number && !selectedApp.application_data?.revenue_verification && (
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs space-y-1.5">
                <div className="font-semibold text-emerald-900 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#166534]" />
                    <span>{language === 'mr' ? 'महासेतू प्रमाणित महसूल डेटा' : 'MahaSetu Verified Revenue Data Evidence'}</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-800 border border-emerald-300 px-1.5 py-0.2 rounded bg-white">
                    VERIFIED
                  </span>
                </div>
                
                <div className="grid sm:grid-cols-2 gap-2 text-slate-800 font-mono text-[11px] pt-1">
                  <div>{t('cert_num_label')} <strong>{tNum(selectedApp.application_data.income_certificate_number)}</strong></div>
                  <div>{t('verified_income_label')} <strong>{tCurrency(selectedApp.application_data.verified_annual_income)}</strong></div>
                  <div>{t('issuing_office_label')} <strong>{selectedApp.application_data.issuing_authority || 'Revenue Dept Tahsildar'}</strong></div>
                  <div>Response Hash: <span className="text-slate-600 text-[10px]">{selectedApp.application_data.raw_response_hash || 'Verified'}</span></div>
                </div>
              </div>
            )}

            {/* HUMAN-READABLE SUBMITTED APPLICATION DETAILS */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-700" />
                  <span>{language === 'mr' ? 'अर्जदाराने सादर केलेली माहिती' : 'Applicant Submitted Particulars'}</span>
                </h4>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedApp.application_data?.auto_fetched_via_consent 
                    ? (language === 'mr' ? 'डिजिटल संमतीने स्वयंचलित अर्ज' : 'Consent-Federated Submission') 
                    : (language === 'mr' ? 'थेट सादर केलेला अर्ज' : 'Direct Submission')}
                </span>
              </div>

              {/* General Project / Business Profile */}
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                {selectedApp.application_data?.startup_name && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('startup_name_label')}:</span>
                    <strong className="text-slate-900 text-xs">{selectedApp.application_data.startup_name}</strong>
                  </div>
                )}
                {selectedApp.application_data?.enterprise && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">{language === 'mr' ? 'उद्योगाचे नाव:' : 'Enterprise Name:'}</span>
                    <strong className="text-slate-900 text-xs">{selectedApp.application_data.enterprise}</strong>
                  </div>
                )}
                {selectedApp.application_data?.applicant_name && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">{language === 'mr' ? 'अर्जदार संस्थापक:' : 'Applicant Founder:'}</span>
                    <strong className="text-slate-900 text-xs">{selectedApp.application_data.applicant_name}</strong>
                  </div>
                )}
                {selectedApp.application_data?.sector && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('sector_label')}</span>
                    <span className="text-slate-800 font-semibold">{selectedApp.application_data.sector}</span>
                  </div>
                )}
                {selectedApp.application_data?.funding_requested && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('grant_requested_label')}</span>
                    <strong className="text-emerald-900 font-mono text-sm">
                      {tCurrency(selectedApp.application_data.funding_requested)}
                    </strong>
                  </div>
                )}
                {selectedApp.application_data?.preferred_incubator && (
                  <div>
                    <span className="text-slate-500 block text-[11px]">{t('nodal_incubator_label')}:</span>
                    <span className="text-slate-800 font-medium">{selectedApp.application_data.preferred_incubator}</span>
                  </div>
                )}
              </div>

              {selectedApp.application_data?.project_description && (
                <div className="pt-2 border-t border-slate-200 text-xs">
                  <span className="text-slate-500 block text-[11px] mb-0.5">{language === 'mr' ? 'प्रकल्प व्याप्ती आणि तांत्रिक सारांश:' : 'Project Scope & Technical Summary:'}</span>
                  <p className="text-slate-800 bg-white border border-slate-200 p-2.5 rounded leading-relaxed text-[11px]">
                    {selectedApp.application_data.project_description}
                  </p>
                </div>
              )}
            </div>

            {/* DECISION FORM */}
            <form onSubmit={handleStatusUpdate} className="bg-slate-50 border border-slate-200 rounded p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase">
                  {language === 'mr' ? 'अधिकारी निर्णय आणि छाननी कृती' : 'Officer Decision & Status Action'}
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">State Machine Transition</span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{language === 'mr' ? 'नवीन स्थिती निवडा' : 'New Status'}</label>
                  <select
                    value={targetStatus}
                    onChange={(e) => setTargetStatus(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="IN_REVIEW">{language === 'mr' ? 'छाननी सुरू करा (In Review)' : 'In Review (Start Scrutiny)'}</option>
                    <option value="APPROVED">{language === 'mr' ? 'अर्ज मंजूर करा (Approve)' : 'Approve Application'}</option>
                    <option value="REJECTED">{language === 'mr' ? 'अर्ज नाकारा (Reject)' : 'Reject Application'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {language === 'mr' ? (targetStatus === 'REJECTED' ? 'नकारण्याचे अधिकृत कारण' : 'अधिकृत शेरा / टिप्पणी') : (targetStatus === 'REJECTED' ? 'Rejection Reason' : 'Official Remarks / Notes')}
                  </label>
                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder={
                      targetStatus === 'REJECTED'
                        ? (language === 'mr' ? 'उदा. उत्पन्न मर्यादा ओलांडली / अपूर्ण पदविका प्रमाणपत्र...' : 'e.g. Income exceeds threshold / Incomplete trade certificate...')
                        : (language === 'mr' ? 'अधिकारी शेरा प्रविष्ट करा...' : 'Enter officer remarks...')
                    }
                    className="w-full p-2 bg-white border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              {targetStatus === 'REJECTED' && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-[11px] text-red-800 flex items-center gap-1.5">
                  <span className="font-bold">⚠️ {language === 'mr' ? 'नकार सूचना:' : 'Rejection Notice:'}</span>
                  <span>
                    {language === 'mr' ? 'अर्जदाराला त्वरित या अधिकृत कारणाचा SMS/संदेश मिळेल, तसेच महाराष्ट्र लोकसेवा हमी कायद्यानुसार अपील करण्याचे अधिकार मिळतील.' : 'The applicant will receive an instant SMS/alert detailing this official reason, along with statutory appeal rights under the Maharashtra RTS Act 2015.'}
                  </span>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded border border-slate-300 font-semibold"
                >
                  {t('close_btn')}
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
                    ? (language === 'mr' ? 'स्थिती अद्यतनित होत आहे...' : 'Updating Status...')
                    : targetStatus === 'REJECTED'
                    ? (language === 'mr' ? '✕ नकार निश्चित करा' : '✕ Confirm Rejection')
                    : targetStatus === 'APPROVED'
                    ? (language === 'mr' ? '✓ मंजूर करा व आदेश द्या' : '✓ Approve & Issue')
                    : (language === 'mr' ? 'छाननी स्थिती सादर करा' : 'Submit Scrutiny Status')}
                </button>
              </div>
            </form>

            {/* EVENT AUDIT HISTORY */}
            {appEvents.length > 0 && (
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-900">{language === 'mr' ? `अर्जाचा घटना इतिहास (${tNum(appEvents.length)})` : `Application Event History (${appEvents.length})`}</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {appEvents.map((evt) => (
                    <div key={evt.id} className="p-2 bg-slate-50 border border-slate-200 rounded">
                      <div className="flex justify-between font-mono text-[10px]">
                        <span className="font-semibold text-[#166534]">{evt.event_type}</span>
                        <span className="text-slate-400">{tDate(evt.created_at)}</span>
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

