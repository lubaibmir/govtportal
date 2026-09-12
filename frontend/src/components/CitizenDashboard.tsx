import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Plus, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Search,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchUserApplications, submitApplication, ApplicationRecord } from '../services/applicationService';
import { executeDataExchange } from '../services/dataExchangeService';
import { ServiceCatalogue } from './ServiceCatalogue';
import { ConsentModal } from './ConsentModal';
import { ConsentCenter } from './ConsentCenter';
import { ApplicationTracking } from './ApplicationTracking';
import { MsinsSeedGrantModal } from './MsinsSeedGrantModal';
import { ImpactMetricsPanel } from './ImpactMetricsPanel';
import { RaiseGrievanceModal } from './RaiseGrievanceModal';
import { CitizenGrievanceView } from './CitizenGrievanceView';
import { Service } from '../types';

export const CitizenDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'MY_APPS' | 'NEW_APP' | 'CONSENTS' | 'TRACKING' | 'GRIEVANCES'>('MY_APPS');
  const [trackingAppNumber, setTrackingAppNumber] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal states
  const [isConsentOpen, setIsConsentOpen] = useState(false);
  const [isMsinsOpen, setIsMsinsOpen] = useState(false);
  const [isGrievanceOpen, setIsGrievanceOpen] = useState(false);
  const [selectedGrvContext, setSelectedGrvContext] = useState<{
    deptId?: string;
    appId?: string;
    appNum?: string;
  }>({});

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

  const handleInitiateBusinessLicense = () => {
    setIsConsentOpen(true);
  };

  const handleConsentGranted = async (consentToken: string, consentId: string) => {
    if (!token) return;
    setIsSubmitting(true);
    setSuccessMsg(null);
    try {
      const exchangeResult = await executeDataExchange({
        consent_token: consentToken,
        providing_department_id: 'dept_revenue',
        data_type: 'INCOME_CERTIFICATE'
      }, token);

      const canonicalIncome = exchangeResult.canonical_payload;

      const res = await submitApplication(
        {
          service_id: 'srv_ind_biz_license',
          department_id: 'dept_industries',
          application_data: {
            enterprise_name: 'Sharma Tech Enterprises',
            category: 'MSME_MICRO',
            annual_turnover: 450000.00,
            address: user?.citizen_profile?.address_line1 || 'Mumbai',
            income_certificate_number: canonicalIncome.certificate_number,
            verified_annual_income: canonicalIncome.annual_income,
            issuing_authority: canonicalIncome.issuing_authority,
            income_verification_status: canonicalIncome.verification_status,
            raw_response_hash: exchangeResult.raw_response_hash
          },
          consent_ids: [consentId]
        },
        token
      );

      setSuccessMsg(`Revenue data verified and Application #${res.application_number} submitted successfully.`);
      await loadApps();
      setActiveTab('MY_APPS');
    } catch (err: any) {
      alert(err.message || 'Interoperability application submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsentDenied = () => {
    alert('Consent was denied. Application cannot proceed without verified departmental data.');
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { label: '● Approved', cls: 'text-[#166534] bg-emerald-50 border-emerald-200' };
      case 'IN_REVIEW':
        return { label: '● Under Department Review', cls: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'SUBMITTED':
        return { label: '● Submitted', cls: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'REJECTED':
        return { label: '● Rejected', cls: 'text-red-800 bg-red-50 border-red-200' };
      default:
        return { label: `● ${status}`, cls: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  const handleSelectService = (service: Service) => {
    if (service.id === 'srv_msins_seed_grant') {
      setIsMsinsOpen(true);
    } else {
      setIsConsentOpen(true);
    }
  };

  const getServiceTitle = (serviceId: string) => {
    switch (serviceId) {
      case 'srv_msins_seed_grant':
        return 'MSInS Startup Innovation Seed Grant';
      case 'srv_ind_biz_license':
        return 'Small Scale Business License';
      case 'srv_rev_income_cert':
        return 'Income Certificate Verification';
      case 'srv_edu_degree_verify':
        return 'Higher Education Degree Verification';
      case 'srv_skills_cert':
        return 'ITI & Polytechnic Skill Certificate';
      default:
        return serviceId;
    }
  };

  const getDeptTitle = (deptId: string) => {
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* WELCOME HEADER & CITIZEN PROFILE */}
      <div className="bg-white border border-[#E5E7E3] rounded-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Welcome, {user?.full_name?.split(' ')[0] || 'Citizen'}
            </h1>
            <span className="text-[11px] font-semibold text-[#166534] bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
              Verified Citizen Identity
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-1 flex items-center gap-3">
            <span>{user?.email}</span>
            <span>•</span>
            <span>{user?.citizen_profile?.city || 'Mumbai'}, Maharashtra</span>
          </p>
        </div>

        {/* Dashboard Navigation */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('MY_APPS')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors ${
              activeTab === 'MY_APPS'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            {t('tab_my_apps', 'My Applications')} ({applications.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('TRACKING');
              if (!trackingAppNumber && applications.length > 0) {
                setTrackingAppNumber(applications[0].application_number);
              }
            }}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'TRACKING'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t('nav_track', 'Track Application')}</span>
          </button>
          <button
            onClick={() => setActiveTab('CONSENTS')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'CONSENTS'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t('nav_consents', 'Consent Center')}</span>
          </button>
          <button
            onClick={() => setActiveTab('NEW_APP')}
            className={`px-3 py-1.5 rounded font-semibold transition-colors flex items-center gap-1 ${
              activeTab === 'NEW_APP'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('tab_apply', 'Apply for Service')}</span>
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
            <span>{t('tab_grievances', 'RTS Grievances')}</span>
          </button>
        </div>
      </div>

      {/* QUICK SUMMARY ROW */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white border border-[#E5E7E3] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Applications</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{applications.length}</div>
          </div>
          <FileText className="w-5 h-5 text-slate-400" />
        </div>
        <div className="bg-white border border-[#E5E7E3] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Pending Action</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">
              {applications.filter(a => a.status === 'SUBMITTED' || a.status === 'IN_REVIEW').length}
            </div>
          </div>
          <AlertCircle className="w-5 h-5 text-slate-400" />
        </div>
        <div className="bg-white border border-[#E5E7E3] rounded-md p-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Consents</div>
            <div className="text-2xl font-bold text-slate-900 mt-0.5">{applications.length > 0 ? applications.length * 2 : 1}</div>
          </div>
          <ShieldCheck className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* TAB CONTENT */}
      {activeTab === 'MY_APPS' && (
        <div className="space-y-4">
          
          {/* Live Impact & ROI Telemetry */}
          <ImpactMetricsPanel />

          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Your Submitted Applications</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMsinsOpen(true)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Apply for MSInS Seed Grant (Flagship)</span>
              </button>
              <button
                onClick={handleInitiateBusinessLicense}
                disabled={isSubmitting}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Business License</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white border border-[#E5E7E3] rounded-md p-8 text-center text-slate-500 text-sm">
              Loading applications list...
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white border border-[#E5E7E3] rounded-md p-8 text-center space-y-3">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-800">No applications submitted yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Apply for MSInS startup seed grants, business licenses, and government certificates with zero physical paperwork.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={() => setIsMsinsOpen(true)}
                  className="bg-[#166534] hover:bg-[#15803D] text-white text-xs font-semibold px-4 py-2 rounded transition-colors flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Apply for MSInS Startup Seed Grant (2-Source Auto-Fetch)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const st = getStatusDisplay(app.status);
                const title = getServiceTitle(app.service_id);
                const deptName = getDeptTitle(app.department_id);

                return (
                  <div
                    key={app.id}
                    className="bg-white border border-[#E5E7E3] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-sm font-bold text-slate-900">
                          {title}
                        </h3>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${st.cls}`}>
                          {st.label}
                        </span>
                      </div>
                      
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                        <span>Application: <strong className="font-mono text-slate-800">{app.application_number}</strong></span>
                        <span>•</span>
                        <span>Department: {deptName}</span>
                        <span>•</span>
                        <span>Submitted: {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>

                      {/* Display Auto-Fetched Verification Badges */}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {app.application_data?.revenue_verification && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Verified Revenue Income: ₹{app.application_data.revenue_verification.annual_income} (Cert #{app.application_data.revenue_verification.certificate_number})</span>
                          </div>
                        )}
                        {app.application_data?.skills_verification && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            <span>Verified MSBTE Skill: {app.application_data.skills_verification.trade_course} (Trainee #{app.application_data.skills_verification.trainee_id})</span>
                          </div>
                        )}
                        {app.application_data?.income_certificate_number && (
                          <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded inline-block">
                            Verified Revenue Data: Cert #{app.application_data.income_certificate_number} (Annual Income: ₹{app.application_data.verified_annual_income})
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setSelectedGrvContext({
                            deptId: app.department_id,
                            appId: app.id,
                            appNum: app.application_number
                          });
                          setIsGrievanceOpen(true);
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                        <span>Raise Grievance</span>
                      </button>

                      <button 
                        onClick={() => {
                          setTrackingAppNumber(app.application_number);
                          setActiveTab('TRACKING');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <span>View Timeline</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'TRACKING' && (
        <ApplicationTracking initialAppNumber={trackingAppNumber} />
      )}

      {activeTab === 'CONSENTS' && (
        <ConsentCenter />
      )}

      {activeTab === 'GRIEVANCES' && (
        <CitizenGrievanceView 
          onOpenRaiseModal={() => {
            setSelectedGrvContext({});
            setIsGrievanceOpen(true);
          }} 
        />
      )}

      {activeTab === 'NEW_APP' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Select a Service to Apply</h2>
          </div>
          <ServiceCatalogue onSelectService={handleSelectService} />
        </div>
      )}

      {/* RAISE GRIEVANCE MODAL */}
      <RaiseGrievanceModal
        isOpen={isGrievanceOpen}
        onClose={() => setIsGrievanceOpen(false)}
        initialDepartmentId={selectedGrvContext.deptId}
        initialApplicationId={selectedGrvContext.appId}
        initialApplicationNumber={selectedGrvContext.appNum}
        onSuccess={(grv) => {
          setSuccessMsg(`RTS Grievance #${grv.grievance_number} logged successfully! You will receive updates as the nodal officer reviews it.`);
          setActiveTab('GRIEVANCES');
        }}
      />

      {/* MSINS STARTUP SEED GRANT MODAL (FLAGSHIP TASK 1) */}
      <MsinsSeedGrantModal
        isOpen={isMsinsOpen}
        onClose={() => setIsMsinsOpen(false)}
        onSuccess={async (appNum) => {
          setSuccessMsg(`Cross-department verification completed! MSInS Startup Seed Grant Application #${appNum} submitted successfully.`);
          await loadApps();
          setActiveTab('MY_APPS');
        }}
      />

      {/* BUSINESS LICENSE CONSENT MODAL */}
      <ConsentModal
        isOpen={isConsentOpen}
        onClose={() => setIsConsentOpen(false)}
        serviceId="srv_ind_biz_license"
        serviceName="Small Scale Business License Application"
        requestingDept="Industries Department"
        providingDept="Revenue Department"
        purpose="Business License Eligibility & Household Annual Income Verification"
        requestedFields={["annual_income", "certificate_number", "validity_until"]}
        onConsentGranted={handleConsentGranted}
        onConsentDenied={handleConsentDenied}
      />

    </div>
  );
};

