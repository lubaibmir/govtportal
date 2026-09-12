import React, { useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { fetchAuditLogs, AuditLogRecord } from '../services/auditService';

export const AuditLogExplorer: React.FC = () => {
  const { token } = useAuth();
  const { language, t, tDate } = useLanguage();
  const [logs, setLogs] = useState<AuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDetails, setShowDetails] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (token) {
      loadLogs();
    }
  }, [token, actionFilter, roleFilter]);

  const loadLogs = async () => {
    if (!token) return;
    setLoading(true);
    const data = await fetchAuditLogs(token, actionFilter, roleFilter);
    setLogs(data);
    setLoading(false);
  };

  const toggleDetails = (id: number) => {
    setShowDetails(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'USER_LOGIN':
        return 'text-blue-800 bg-blue-50 border-blue-200';
      case 'CONSENT_APPROVED':
        return 'text-[#166534] bg-emerald-50 border-emerald-200';
      case 'CONSENT_DENIED':
        return 'text-red-800 bg-red-50 border-red-200';
      case 'DATA_EXCHANGE_EXECUTED':
        return 'text-amber-800 bg-amber-50 border-amber-200';
      case 'STATUS_TRANSITIONED':
        return 'text-purple-800 bg-purple-50 border-purple-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const filteredLogs = logs.filter(l => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.request_id.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q) ||
      l.resource.toLowerCase().includes(q) ||
      l.actor_role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white border border-[#E5E7E3] rounded-md p-5 space-y-4 shadow-xs">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#166534]" />
            <span>{t('audit_logs_title')}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('audit_logs_desc')}
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{language === 'mr' ? 'नोंदी रीफ्रेश करा' : 'Refresh Logs'}</span>
        </button>
      </div>

      {/* FILTER ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'mr' ? 'विनंती आयडी, कृती, स्रोत शोधा...' : 'Search request ID, action, resource...'}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700"
          />
        </div>

        <div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800"
          >
            <option value="ALL">{language === 'mr' ? 'सर्व ऑडिट कृती' : 'All Audit Actions'}</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="CONSENT_APPROVED">CONSENT_APPROVED</option>
            <option value="CONSENT_DENIED">CONSENT_DENIED</option>
            <option value="DATA_EXCHANGE_EXECUTED">DATA_EXCHANGE_EXECUTED</option>
            <option value="STATUS_TRANSITIONED">STATUS_TRANSITIONED</option>
          </select>
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full p-2 bg-slate-50 border border-slate-300 rounded font-semibold text-slate-800"
          >
            <option value="ALL">{language === 'mr' ? 'सर्व भूमिका' : 'All Roles'}</option>
            <option value="CITIZEN">{language === 'mr' ? 'नागरिक (CITIZEN)' : 'CITIZEN'}</option>
            <option value="DEPARTMENT_OFFICER">{language === 'mr' ? 'विभागीय अधिकारी' : 'DEPARTMENT_OFFICER'}</option>
            <option value="SYSTEM_ADMIN">{language === 'mr' ? 'प्रणाली प्रशासक' : 'SYSTEM_ADMIN'}</option>
          </select>
        </div>
      </div>

      {/* AUDIT LOG TABLE */}
      {loading ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          {language === 'mr' ? 'ऑडिट लॉग नोंदी लोड होत आहेत...' : 'Loading audit log records...'}
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          {language === 'mr' ? 'सध्याच्या फिल्टरनुसार कोणत्याही ऑडिट नोंदी नाहीत.' : 'No audit logs matching current filter parameters.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">{language === 'mr' ? 'वेळ व दिनांक' : 'Timestamp'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'वापरकर्ता / भूमिका' : 'Actor / Role'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'कृती' : 'Action'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'स्रोत' : 'Resource'}</th>
                <th className="py-2.5 px-3">{language === 'mr' ? 'निकाल' : 'Result'}</th>
                <th className="py-2.5 px-3 text-right">{language === 'mr' ? 'सविस्तर' : 'Details'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <React.Fragment key={log.id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px]">
                      {tDate(log.timestamp)}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {log.actor_role}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-700">
                      {log.resource}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-[#166534]">
                      {log.result}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {log.details && Object.keys(log.details).length > 0 && (
                        <button
                          onClick={() => toggleDetails(log.id)}
                          className="text-slate-600 hover:text-slate-900 font-medium text-[11px] inline-flex items-center gap-0.5"
                        >
                          <span>{showDetails[log.id] ? (language === 'mr' ? 'लपवा' : 'Hide') : (language === 'mr' ? 'पहा' : 'View')}</span>
                          {showDetails[log.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                      )}
                    </td>
                  </tr>

                  {showDetails[log.id] && (
                    <tr>
                      <td colSpan={6} className="bg-slate-50 p-3 border-b border-slate-200">
                        <pre className="p-3 bg-slate-900 text-slate-100 rounded text-[11px] font-mono overflow-x-auto">
                          {JSON.stringify({ request_id: log.request_id, ip_address: log.ip_address, ...log.details }, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};

