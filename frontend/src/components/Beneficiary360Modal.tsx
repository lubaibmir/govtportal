import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  ShieldCheck, 
  Layers, 
  FileText, 
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchBeneficiary360, Beneficiary360Data } from '../services/beneficiaryService';

export interface Beneficiary360ModalProps {
  citizenId: string | null;
  isOpen?: boolean;
  token?: string;
  onClose: () => void;
}

export const Beneficiary360Modal: React.FC<Beneficiary360ModalProps> = ({
  citizenId,
  isOpen = true,
  token: propToken,
  onClose
}) => {
  const { token: authToken } = useAuth();
  const { language, tNum, tCurrency } = useLanguage();
  const token = propToken || authToken;
  const [data, setData] = useState<Beneficiary360Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'IDENTITIES' | 'APPLICATIONS' | 'CONSENTS' | 'GRIEVANCES'>('IDENTITIES');

  useEffect(() => {
    if (isOpen && citizenId && token) {
      loadProfile(citizenId);
    }
  }, [isOpen, citizenId, token]);

  const loadProfile = async (id: string) => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchBeneficiary360(token, id);
      setData(res);
    } catch (e) {
      console.error('Failed to fetch 360 profile', e);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <User className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{data?.full_name || 'Beneficiary Profile'}</h2>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded">
                  Consolidated Beneficiary 360°
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                UID Hash: {data?.national_id_hash.substring(0, 24)}... • Phone: {data?.phone}
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

        {loading || !data ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            Loading federated cross-department identity graph...
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="text-slate-500 font-semibold uppercase text-[10px]">{language === 'mr' ? 'संलग्न नोंदवह्या' : 'Federated Registries'}</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{tNum(data.federated_identities.length)} {language === 'mr' ? 'विभाग' : 'Depts'}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="text-slate-500 font-semibold uppercase text-[10px]">{language === 'mr' ? 'एकूण अर्ज' : 'Total Applications'}</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{tNum(data.total_applications)}</div>
              </div>
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="text-slate-500 font-semibold uppercase text-[10px]">{language === 'mr' ? 'सक्रिय संमती' : 'Active Consents'}</div>
                <div className="text-xl font-bold text-slate-900 mt-1">{tNum(data.total_consents)}</div>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                <div className="text-emerald-800 font-semibold uppercase text-[10px]">{language === 'mr' ? 'प्राप्त एकूण लाभ' : 'Total Benefits Received'}</div>
                <div className="text-xl font-bold text-emerald-900 mt-1">{tCurrency(data.total_benefits_disbursed_inr)}</div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs">
              {[
                { id: 'IDENTITIES', label: language === 'mr' ? 'एकात्मिक ओळख आलेख (MDM)' : 'Federated Identity Graph (MDM)', icon: Layers },
                { id: 'APPLICATIONS', label: language === 'mr' ? `शासकीय अर्ज (${tNum(data.applications.length)})` : `Service Applications (${data.applications.length})`, icon: FileText },
                { id: 'CONSENTS', label: language === 'mr' ? `संमती नोंदवही (${tNum(data.consents.length)})` : `Consent Ledger (${data.consents.length})`, icon: ShieldCheck },
                { id: 'GRIEVANCES', label: language === 'mr' ? `RTS तक्रारी (${tNum(data.grievances.length)})` : `RTS Grievances (${data.grievances.length})`, icon: ShieldAlert }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-md font-semibold flex items-center gap-1.5 transition-colors ${
                      activeTab === tab.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: FEDERATED IDENTITY GRAPH */}
            {activeTab === 'IDENTITIES' && (
              <div className="space-y-4">
                <div className="text-xs text-slate-600">
                  Federated cross-department identifier mapping linking this citizen's canonical records across independent state databases:
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.federated_identities.map((item, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2 hover:border-emerald-500 transition-colors shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{item.department_name}</span>
                        <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          {item.verified_status}
                        </span>
                      </div>
                      <div className="font-semibold text-slate-800 text-xs">{item.registry_name}</div>
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-100 flex items-center justify-between font-mono text-xs">
                        <span className="text-slate-500 text-[11px]">{item.identifier_type}:</span>
                        <strong className="text-slate-900">{item.identifier_value}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: APPLICATIONS */}
            {activeTab === 'APPLICATIONS' && (
              <div className="space-y-3">
                {data.applications.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">No applications submitted by citizen</div>
                ) : (
                  data.applications.map((app) => (
                    <div key={app.id} className="bg-white border border-slate-200 rounded-lg p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{app.service_id}</div>
                        <div className="text-slate-500 text-[11px] font-mono mt-0.5">App #{app.application_number} • Dept: {app.department_id}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: CONSENTS */}
            {activeTab === 'CONSENTS' && (
              <div className="space-y-3">
                {data.consents.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">No active consents on ledger</div>
                ) : (
                  data.consents.map((c) => (
                    <div key={c.id} className="bg-white border border-slate-200 rounded-lg p-3.5 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{c.requesting_dept} ➔ {c.providing_dept}</span>
                        <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">{c.status}</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">{c.purpose}</p>
                      <div className="text-[10px] text-slate-400 font-mono">Token: {c.consent_token || 'N/A'}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 4: GRIEVANCES */}
            {activeTab === 'GRIEVANCES' && (
              <div className="space-y-3">
                {data.grievances.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">No grievances on record</div>
                ) : (
                  data.grievances.map((g) => (
                    <div key={g.id} className="bg-white border border-slate-200 rounded-lg p-3.5 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-slate-900">{g.category}</div>
                        <div className="text-slate-500 text-[11px] font-mono">Grievance #{g.grievance_number} • Dept: {g.department_id}</div>
                      </div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                        {g.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

          </div>
        )}

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};
