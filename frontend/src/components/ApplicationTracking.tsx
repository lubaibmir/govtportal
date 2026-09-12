import React, { useEffect, useState } from 'react';
import { 
  Search, 
  Building2, 
  Download, 
  Printer, 
  RefreshCw, 
  AlertCircle,
  Link2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { fetchTrackingDetails, ApplicationTrackingData } from '../services/eventService';
import { SlaCountdownTimer } from './SlaCountdownTimer';
import { useLanguage } from '../context/LanguageContext';

interface ApplicationTrackingProps {
  initialAppNumber?: string;
  onClose?: () => void;
}

export const ApplicationTracking: React.FC<ApplicationTrackingProps> = ({
  initialAppNumber = '',
  onClose
}) => {
  const { t, tDept, tService, tStatus, tNum, tCurrency, tDate } = useLanguage();
  const [searchQuery, setSearchQuery] = useState(initialAppNumber);
  const [trackingData, setTrackingData] = useState<ApplicationTrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEventJson, setShowEventJson] = useState<Record<string, boolean>>({});
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (initialAppNumber) {
      handleSearch(initialAppNumber);
    }
  }, [initialAppNumber]);

  const handleSearch = async (appNumToSearch?: string) => {
    const num = appNumToSearch || searchQuery.trim();
    if (!num) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrackingDetails(num);
      setTrackingData(data);
    } catch (err: any) {
      setTrackingData(null);
      setError(err.message || `Application '${num}' not found. Please check the application tracking number.`);
    } finally {
      setLoading(false);
    }
  };

  const toggleEventMetadata = (eventId: string) => {
    setShowEventJson(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { text: `● ${t('status_approved', 'Approved & Issued')}`, cls: 'text-[#166534] bg-emerald-50 border-emerald-200' };
      case 'IN_REVIEW':
        return { text: `● ${t('status_in_review', 'Under Department Review')}`, cls: 'text-amber-800 bg-amber-50 border-amber-200' };
      case 'SUBMITTED':
        return { text: `● ${t('status_submitted', 'Application Submitted')}`, cls: 'text-blue-800 bg-blue-50 border-blue-200' };
      case 'REJECTED':
        return { text: `● ${t('status_rejected', 'Application Rejected')}`, cls: 'text-red-800 bg-red-50 border-red-200' };
      default:
        return { text: `● ${tStatus(status)}`, cls: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* SEARCH SECTION */}
      <div className="bg-white border border-[#E5E7E3] rounded-md p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">{t('track_title', 'Application Tracking & Audit Timeline')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t('track_subtitle', 'Track your application status and verified inter-department data history')}</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded bg-slate-100 border border-slate-200"
            >
              {t('close_btn', 'Close')}
            </button>
          )}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('track_input_placeholder', 'Enter Application Tracking Number (e.g. APP-2026-IND-00142)...')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 font-mono placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#166534] hover:bg-[#15803D] text-white text-xs font-semibold px-4 py-2 rounded transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Search className="w-3.5 h-3.5" />
                  <span>{t('search_btn', 'Search')}</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Pre-filled Test Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-slate-500 font-medium">{t('quick_demo_samples', 'Quick Demo Samples:')}</span>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('APP-2026-IND-00142');
                handleSearch('APP-2026-IND-00142');
              }}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded text-xs font-mono font-semibold border border-emerald-200 transition flex items-center gap-1"
            >
              <span>🔍</span> APP-2026-IND-00142 ({t('srv_biz_license', 'Business License')})
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('APP-2026-MSINS-00912');
                handleSearch('APP-2026-MSINS-00912');
              }}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded text-xs font-mono font-semibold border border-blue-200 transition flex items-center gap-1"
            >
              <span>🔍</span> APP-2026-MSINS-00912 ({t('srv_seed_grant', 'MSInS Seed Grant')})
            </button>
          </div>
        </form>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* TRACKING DETAILS */}
      {trackingData && (
        <div className="space-y-6">
          
          {/* APPLICATION OVERVIEW CARD */}
          <div className="bg-white border border-[#E5E7E3] rounded-md p-5 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-semibold text-slate-500">{t('tracking_number_label', 'Tracking Number:')} {tNum(trackingData.application_number)}</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">{tService(trackingData.service_title)}</h3>
                <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{tDept(trackingData.department_name)}</span>
                </p>
              </div>

              <div className="sm:text-right space-y-1.5">
                <div className="flex sm:justify-end">
                  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded border ${getStatusLabel(trackingData.status).cls}`}>
                    {getStatusLabel(trackingData.status).text}
                  </span>
                </div>
                <div className="flex sm:justify-end">
                  <SlaCountdownTimer createdAt={trackingData.created_at} status={trackingData.status} />
                </div>
                <p className="text-[11px] text-slate-500">
                  {t('updated_label', 'Updated:')} {tDate(trackingData.updated_at)}
                </p>
              </div>
            </div>

            {/* VERIFIED DATA SUMMARY */}
            {trackingData.application_data?.income_certificate_number && (
              <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs">
                <div className="font-semibold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <Link2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('verified_cross_dept_info', 'Verified Cross-Department Information')}</span>
                </div>
                <div className="grid sm:grid-cols-3 gap-2 text-slate-700 font-mono text-[11px] pt-1">
                  <div>{t('providing_dept_label', 'Providing Dept:')} <strong>{t('dept_revenue_name', 'Revenue Department')}</strong></div>
                  <div>{t('cert_num_label', 'Certificate #:')} <strong>{tNum(trackingData.application_data.income_certificate_number)}</strong></div>
                  <div>{t('verified_income_label', 'Verified Income:')} <strong>{tCurrency(trackingData.application_data.verified_annual_income)}</strong></div>
                </div>
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="pt-2 flex items-center justify-between text-xs">
              <button
                onClick={() => handleSearch()}
                className="text-slate-600 hover:text-slate-900 flex items-center gap-1 text-xs font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{t('refresh_status', 'Refresh Status')}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 rounded border border-slate-300 font-medium flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t('print_receipt', 'Print Receipt')}</span>
                </button>

                {trackingData.status === 'APPROVED' && (
                  <button
                    onClick={() => setDownloadSuccessMsg(`Official Certificate generated & verified for ${trackingData.application_number}. Digitally signed via Maharashtra State Portal Cryptographic Key.`)}
                    className="bg-[#166534] hover:bg-[#15803D] text-white px-3 py-1.5 rounded font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('download_cert', 'Download Certificate')}</span>
                  </button>
                )}
              </div>
            </div>

            {downloadSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded p-3 text-xs flex items-start justify-between gap-2 animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span><strong>{t('verified_authenticity', 'Verified Authenticity:')}</strong> {downloadSuccessMsg}</span>
                </div>
                <button 
                  onClick={() => setDownloadSuccessMsg(null)}
                  className="text-emerald-700 hover:text-emerald-900 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* CLEAN VERTICAL TIMELINE */}
          <div className="bg-white border border-[#E5E7E3] rounded-md p-5 space-y-4 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 flex items-center justify-between pb-3 border-b border-slate-100">
              <span>{t('lifecycle_timeline_title', 'Lifecycle Timeline & Event Log')}</span>
              <span className="text-xs font-normal text-slate-500">{tNum(trackingData.events.length)} {t('recorded_actions_count', 'recorded actions')}</span>
            </h4>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {trackingData.events.map((evt, idx) => (
                <div key={evt.id} className="relative">
                  {/* Timeline Node Dot */}
                  <div className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 bg-white ${
                    idx === trackingData.events.length - 1 ? 'border-emerald-600 bg-emerald-600' : 'border-slate-400'
                  }`} />

                  <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{evt.event_type}</span>
                        <span className="font-normal text-slate-500">• {t('by_actor', 'By')} {evt.actor_name}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {tDate(evt.created_at)}
                      </span>
                    </div>

                    <p className="text-slate-700">{evt.description}</p>

                    {evt.metadata_info && Object.keys(evt.metadata_info).length > 0 && (
                      <div className="pt-1">
                        <button
                          onClick={() => toggleEventMetadata(evt.id)}
                          className="text-[11px] text-slate-500 hover:text-emerald-800 font-mono flex items-center gap-1"
                        >
                          <span>{showEventJson[evt.id] ? t('hide_tech_details', 'Hide technical details') : t('view_tech_details', 'View technical details')}</span>
                          {showEventJson[evt.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {showEventJson[evt.id] && (
                          <pre className="mt-2 p-2.5 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto">
                            {JSON.stringify(evt.metadata_info, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};

