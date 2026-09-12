import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2, Clock, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchGrievances, Grievance } from '../services/grievanceService';

interface CitizenGrievanceViewProps {
  onOpenRaiseModal: () => void;
}

export const CitizenGrievanceView: React.FC<CitizenGrievanceViewProps> = ({ onOpenRaiseModal }) => {
  const { token } = useAuth();
  const { language, t, tDept, tNum, tDate } = useLanguage();
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadGrievances();
    }
  }, [token]);

  const loadGrievances = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await fetchGrievances(token);
      setGrievances(data);
    } catch (err) {
      console.error('Failed to load citizen grievances', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, escalated: boolean) => {
    if (escalated && status !== 'RESOLVED') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 border border-red-300 px-2.5 py-0.5 rounded-full animate-pulse">
          <AlertTriangle className="w-3 h-3 text-red-600" />
          <span>{language === 'mr' ? `स्वयंचलित वर्ग (RTS मुदत ${tNum(48)} तास)` : 'AUTO-ESCALATED (RTS SLA 48h)'}</span>
        </span>
      );
    }
    switch (status) {
      case 'RESOLVED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>{language === 'mr' ? 'निकाली काढली' : 'Resolved'}</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>{language === 'mr' ? 'अधिकारी छाननी सुरू' : 'In Review by Officer'}</span>
          </span>
        );
      case 'OPEN':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
            <span>● {language === 'mr' ? 'नोंदवली' : 'Open'}</span>
          </span>
        );
    }
  };

  const getDeptBadge = (deptId: string) => {
    return tDept(deptId);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-[#E5E7E3] rounded-md p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <h2 className="text-sm font-bold text-slate-900">{language === 'mr' ? 'आपल्या लोकसेवा हक्क (RTS) तक्रारी आणि अपीले' : 'Your RTS Grievances & Appeals'}</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'mr' ? `महाराष्ट्र लोकसेवा हक्क अधिनियम ${tNum(2015)} अंतर्गत, विहित कालावधीत निराकरण न झाल्यास तक्रार स्वयंचलितपणे वरिष्ठ अधिकाऱ्याकडे वर्ग केली जाते.` : 'Under the Maharashtra Right to Public Services Act (RTS 2015), grievances are escalated automatically if not resolved within stipulated timelines.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadGrievances}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenRaiseModal}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'नवीन तक्रार नोंदवा' : 'Raise New Grievance'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E7E3] rounded-md p-8 text-center text-slate-500 text-xs">
          {t('loading_services', 'Loading your grievances...')}
        </div>
      ) : grievances.length === 0 ? (
        <div className="bg-white border border-[#E5E7E3] rounded-md p-8 text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="text-sm font-semibold text-slate-800">{language === 'mr' ? 'कोणतीही तक्रार नोंदवलेली नाही' : 'No grievances logged'}</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {language === 'mr' ? 'विभागीय सेवा किंवा डेटा देवाणघेवाणीत काही अडचण अथवा विलंब झाल्यास, आपण अधिकृत लोकसेवा हक्क (RTS) तक्रार नोंदवू शकता.' : 'If you encounter delays or issues with any departmental service or interoperability data exchange, you can raise an official RTS grievance.'}
          </p>
          <button
            onClick={onOpenRaiseModal}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'mr' ? 'RTS तक्रार नोंदवा' : 'Raise an RTS Grievance'}</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {grievances.map((grv) => (
            <div key={grv.id} className="bg-white border border-[#E5E7E3] rounded-md p-4 space-y-3 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-900 text-xs">{tNum(grv.grievance_number)}</span>
                  <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {getDeptBadge(grv.department_id)}
                  </span>
                  {grv.application_number && (
                    <span className="text-[11px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {t('tracking_number_label', 'App #')} {tNum(grv.application_number)}
                    </span>
                  )}
                </div>
                <div>
                  {getStatusBadge(grv.status, grv.escalated)}
                </div>
              </div>

              <div className="text-xs space-y-1.5">
                <div className="font-semibold text-slate-800">{grv.category.replace(/_/g, ' ')}</div>
                <div className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">{grv.description}</div>
              </div>

              {grv.resolution_notes && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-xs space-y-1">
                  <div className="font-bold text-emerald-900 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'mr' ? 'अधिकारी निराकरण अहवाल' : 'Officer Resolution Statement'}</span>
                  </div>
                  <div className="text-emerald-800">{grv.resolution_notes}</div>
                </div>
              )}

              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
                <span>{t('updated_label', 'Submitted on')} {tDate(grv.created_at)}</span>
                {grv.resolved_at && (
                  <span className="text-emerald-700 font-semibold">
                    {language === 'mr' ? 'निराकरण दिनांक' : 'Resolved on'} {tDate(grv.resolved_at)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
