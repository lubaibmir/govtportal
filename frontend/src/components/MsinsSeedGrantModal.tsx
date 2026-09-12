import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  FileCheck, 
  GraduationCap, 
  Coins, 
  Lock, 
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createConsent, approveConsent } from '../services/consentService';
import { executeDataExchange } from '../services/dataExchangeService';
import { submitApplication } from '../services/applicationService';

interface MsinsSeedGrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (appNumber: string) => void;
}

export const MsinsSeedGrantModal: React.FC<MsinsSeedGrantModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { user, token } = useAuth();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Form, 2: Auto-Fetching & Consents, 3: Verified Review Screen
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [startupName, setStartupName] = useState('MahaInnovate IoT Systems');
  const [sector, setSector] = useState('GovTech & Industrial IoT');
  const [fundingRequested, setFundingRequested] = useState('1500000');
  const [incubator, setIncubator] = useState('COEP Pune Technology Business Incubator');
  const [description, setDescription] = useState('Smart water telemetry and automated grievance tracking sensors for rural Maharashtra');

  // Interoperability Fetched Data
  const [revenueData, setRevenueData] = useState<any>(null);
  const [skillsData, setSkillsData] = useState<any>(null);
  const [consentIds, setConsentIds] = useState<string[]>([]);
  const [revenueToken, setRevenueToken] = useState<string>('');
  const [skillsToken, setSkillsToken] = useState<string>('');

  if (!isOpen) return null;

  const handleStartVerificationAndExchange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Create and Approve Revenue Consent
      const revConsentReq = await createConsent({
        requesting_department_id: 'dept_skills',
        providing_department_id: 'dept_revenue',
        service_id: 'srv_msins_seed_grant',
        purpose: 'MSInS Startup Seed Grant Financial Due Diligence & Household Income Verification',
        requested_fields: ['annual_income', 'certificate_number', 'validity_until'],
        valid_duration_hours: 24
      }, token);
      const revApproved = await approveConsent(revConsentReq.id, token);

      // 2. Create and Approve Skills Consent
      const skillsConsentReq = await createConsent({
        requesting_department_id: 'dept_skills',
        providing_department_id: 'dept_skills',
        service_id: 'srv_msins_seed_grant',
        purpose: 'Technical Trade Diploma & NSQF Skill Certification Eligibility Verification',
        requested_fields: ['trainee_id', 'trade_course', 'certification_level', 'grade'],
        valid_duration_hours: 24
      }, token);
      const skillsApproved = await approveConsent(skillsConsentReq.id, token);

      setConsentIds([revApproved.id, skillsApproved.id]);
      setRevenueToken(revApproved.consent_token || '');
      setSkillsToken(skillsApproved.consent_token || '');

      // 3. Execute Interoperability Data Exchanges
      const [revRes, skillsRes] = await Promise.all([
        executeDataExchange({
          consent_token: revApproved.consent_token!,
          providing_department_id: 'dept_revenue',
          data_type: 'INCOME_CERTIFICATE'
        }, token),
        executeDataExchange({
          consent_token: skillsApproved.consent_token!,
          providing_department_id: 'dept_skills',
          data_type: 'SKILL_CERTIFICATE'
        }, token)
      ]);

      setRevenueData(revRes.canonical_payload);
      setSkillsData(skillsRes.canonical_payload);

      // Transition to Review Screen
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Cross-department interoperability exchange failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);

    try {
      const res = await submitApplication({
        service_id: 'srv_msins_seed_grant',
        department_id: 'dept_skills',
        application_data: {
          startup_name: startupName,
          sector: sector,
          funding_requested: parseFloat(fundingRequested),
          preferred_incubator: incubator,
          project_description: description,
          applicant_name: user?.full_name || 'Rahul Sharma',
          // Auto-fetched verified data
          revenue_verification: {
            certificate_number: revenueData?.certificate_number,
            annual_income: revenueData?.annual_income,
            issuing_authority: revenueData?.issuing_authority,
            status: revenueData?.verification_status
          },
          skills_verification: {
            trainee_id: skillsData?.trainee_id,
            trade_course: skillsData?.trade_course,
            certification_level: skillsData?.certification_level,
            grade: skillsData?.grade,
            issuing_board: skillsData?.issuing_board,
            status: skillsData?.verification_status
          },
          auto_fetched_via_consent: true
        },
        consent_ids: consentIds
      }, token);

      onSuccess(res.application_number);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit MSInS Startup Seed Grant application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E7E3] rounded-md shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-emerald-100 text-[#166534] flex items-center justify-center border border-emerald-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  MSInS Innovation Society
                </span>
                <span className="text-xs text-slate-500 font-mono">MSINS-GRANT-01</span>
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">
                MSInS Startup Innovation Seed Grant
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-red-700 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Startup Details Form */}
          {step === 1 && (
            <form id="msins-grant-form" onSubmit={handleStartVerificationAndExchange} className="space-y-4">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-emerald-900">
                <div className="font-bold flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>Zero Physical Document Policy (Once-Only Principle)</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  As part of the Government of Maharashtra Interoperability Framework, your <strong>Revenue Financial Record</strong> and <strong>MSBTE Skill Certification</strong> will be auto-verified via digital consent. No physical scans or manual visits required.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Startup / Enterprise Name</label>
                  <input
                    type="text"
                    required
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Innovation Sector</label>
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-700"
                  >
                    <option value="GovTech & Industrial IoT">GovTech & Industrial IoT</option>
                    <option value="AgriTech & Rural Innovations">AgriTech & Rural Innovations</option>
                    <option value="Clean Energy & Sustainability">Clean Energy & Sustainability</option>
                    <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                    <option value="Artificial Intelligence / ML">Artificial Intelligence / ML</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Funding Grant Requested (₹)</label>
                  <input
                    type="number"
                    required
                    value={fundingRequested}
                    onChange={(e) => setFundingRequested(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-700 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nodal Incubator Partner</label>
                  <input
                    type="text"
                    required
                    value={incubator}
                    onChange={(e) => setIncubator(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brief Solution Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:bg-white focus:outline-none focus:border-emerald-700"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Requires 2-Department Consent Verification</span>
                </span>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#166534] hover:bg-[#15803D] text-white font-semibold px-4 py-2 rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Auto-Fetching Verified Records...</span>
                  ) : (
                    <>
                      <span>Proceed to Consent & Auto-Fetch</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* STEP 3: Auto-Fetched Review Screen */}
          {step === 3 && (
            <div className="space-y-4">
              
              {/* Highlight Banner */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-md p-3.5 flex items-center justify-between text-emerald-900">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <div className="font-bold text-xs">
                      Auto-fetched via consent — no re-upload required.
                    </div>
                    <div className="text-[11px] text-emerald-800">
                      Cross-department interoperability gateway successfully verified your authentic records from both registries.
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-900 px-2 py-1 rounded border border-emerald-300 shrink-0">
                  MahaSetu Canonical Ver. 1.0
                </span>
              </div>

              {/* Startup Application Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded p-3">
                <div className="text-[11px] font-bold text-slate-500 uppercase mb-1">Applicant & Venture</div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Venture Name:</span>
                    <strong className="text-slate-900">{startupName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Sector:</span>
                    <strong className="text-slate-900">{sector}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Grant Requested:</span>
                    <strong className="text-slate-900 font-mono text-emerald-800">₹{parseInt(fundingRequested).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {/* Circuit Breaker Resilience Alert Banner */}
              {revenueData?.resilience_status === 'CACHE_FALLBACK' && (
                <div className="bg-amber-50 border border-amber-300 text-amber-950 p-3 rounded text-xs flex items-start gap-2 shadow-xs">
                  <span className="text-base leading-none">⚡</span>
                  <div>
                    <strong className="font-bold">Circuit Breaker & Resilience Active:</strong>
                    <p className="text-[11px] text-amber-900 mt-0.5">
                      The upstream Revenue Department is currently offline (Simulated Outage). MahaSetu automatically attempted 3x exponential backoff retries and gracefully served your verified certificate from the encrypted local cache without failing your application.
                    </p>
                  </div>
                </div>
              )}

              {/* Two Auto-Fetched Records Side-by-Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                
                {/* 1. Revenue Department Card */}
                <div className={`border rounded p-3.5 space-y-2 ${
                  revenueData?.resilience_status === 'CACHE_FALLBACK'
                    ? 'border-amber-300 bg-amber-50/40'
                    : 'border-emerald-200 bg-emerald-50/40'
                }`}>
                  <div className={`flex items-center justify-between border-b pb-2 ${
                    revenueData?.resilience_status === 'CACHE_FALLBACK' ? 'border-amber-200' : 'border-emerald-200/60'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Coins className="w-4 h-4 text-emerald-700" />
                      <span>Revenue Department</span>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      revenueData?.resilience_status === 'CACHE_FALLBACK'
                        ? 'text-amber-900 bg-amber-100 border border-amber-300'
                        : 'text-emerald-800 bg-emerald-100'
                    }`}>
                      {revenueData?.resilience_status === 'CACHE_FALLBACK' ? '⚡ Cache Replica (Dept Offline)' : '● Verified'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Certificate No:</span>
                      <span className="font-mono font-bold text-slate-800">{revenueData?.certificate_number}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Annual Income:</span>
                      <span className="font-mono font-bold text-emerald-900">₹{revenueData?.annual_income?.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Income Slab:</span>
                      <span className="text-slate-800 font-medium">{revenueData?.income_category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Issuing Office:</span>
                      <span className="text-slate-800">{revenueData?.issuing_authority}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-emerald-100 text-[10px] text-slate-500">
                      <span>Token: <code className="text-slate-700">{revenueToken ? revenueToken.slice(0, 16) + '...' : 'ACTIVE'}</code></span>
                      <span>Scope: 24h</span>
                    </div>
                  </div>
                </div>

                {/* 2. Skills Department Card */}
                <div className="border border-emerald-200 bg-emerald-50/40 rounded p-3.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <GraduationCap className="w-4 h-4 text-emerald-700" />
                      <span>Skills & Innovation Dept</span>
                    </div>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      ● Verified
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trainee ID:</span>
                      <span className="font-mono font-bold text-slate-800">{skillsData?.trainee_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trade / Course:</span>
                      <span className="font-medium text-slate-900 truncate max-w-[170px]" title={skillsData?.trade_course}>
                        {skillsData?.trade_course}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Level & Grade:</span>
                      <span className="text-emerald-900 font-bold">{skillsData?.certification_level} ({skillsData?.grade})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Issuing Board:</span>
                      <span className="text-slate-800">{skillsData?.issuing_board}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-emerald-100 text-[10px] text-slate-500">
                      <span>Token: <code className="text-slate-700">{skillsToken ? skillsToken.slice(0, 16) + '...' : 'ACTIVE'}</code></span>
                      <span>Scope: 24h</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-3 py-1.5 rounded text-slate-700 hover:bg-slate-100 border border-slate-300 font-medium text-xs flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Edit</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="bg-[#166534] hover:bg-[#15803D] text-white font-semibold px-5 py-2 rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Submitting Application to MSInS...</span>
                  ) : (
                    <>
                      <FileCheck className="w-4 h-4" />
                      <span>Confirm & Submit Application</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
