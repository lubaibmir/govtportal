import React, { useEffect, useState } from 'react';
import { ShieldCheck, ShieldX, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchUserConsents, revokeConsent, ConsentRecord } from '../services/consentService';

export const ConsentCenter: React.FC = () => {
  const { token } = useAuth();
  const [consents, setConsents] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (token) loadConsents();
  }, [token]);

  const loadConsents = async () => {
    if (!token) return;
    setLoading(true);
    const data = await fetchUserConsents(token);
    setConsents(data);
    setLoading(false);
  };

  const handleRevoke = async (consentId: string) => {
    if (!token) return;
    setRevokingId(consentId);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await revokeConsent(consentId, token);
      setSuccessMsg('Digital consent revoked successfully. Further departmental data access has been cryptographically blocked.');
      await loadConsents();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to revoke consent.');
    } finally {
      setRevokingId(null);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Active Consent', cls: 'text-[#166534] bg-emerald-50 border-emerald-200' };
      case 'REVOKED':
        return { label: 'Revoked', cls: 'text-red-800 bg-red-50 border-red-200' };
      case 'DENIED':
        return { label: 'Denied', cls: 'text-amber-800 bg-amber-50 border-amber-200' };
      default:
        return { label: status, cls: 'text-slate-700 bg-slate-100 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Notifications */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-900 p-3.5 rounded text-xs flex items-center justify-between">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="text-red-700 font-bold ml-2">✕</button>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded text-xs flex items-center justify-between">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 font-bold ml-2">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border border-[#E5E7E3] rounded-md p-5 shadow-xs flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-[#166534]" />
            <span>Digital Consent Management Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            View, inspect, or revoke digital permissions granted for cross-department data sharing
          </p>
        </div>
        <button
          onClick={loadConsents}
          className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-300 transition-colors"
          title="Refresh Consents"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E7E3] rounded-md p-8 text-center text-slate-500 text-xs">
          Loading consent records...
        </div>
      ) : consents.length === 0 ? (
        <div className="bg-white border border-[#E5E7E3] rounded-md p-8 text-center text-slate-500 text-xs">
          No digital consent authorizations recorded yet.
        </div>
      ) : (
        <div className="space-y-3">
          {consents.map((c) => {
            const st = getStatusDisplay(c.status);
            return (
              <div
                key={c.id}
                className="bg-white border border-[#E5E7E3] rounded-md p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold px-2 py-0.5 rounded border text-[11px] ${st.cls}`}>
                      {st.label}
                    </span>
                    {c.consent_token && (
                      <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        Token: {c.consent_token}
                      </span>
                    )}
                  </div>

                  <p className="font-bold text-slate-900 pt-0.5">
                    {c.purpose}
                  </p>

                  <div className="text-slate-500 text-[11px] flex flex-wrap items-center gap-3">
                    <span>Requesting: <strong className="text-slate-800">{c.requesting_department_id}</strong></span>
                    <span>•</span>
                    <span>Source: <strong className="text-slate-800">{c.providing_department_id}</strong></span>
                    <span>•</span>
                    <span>Expires: {new Date(c.expires_at).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {c.status === 'ACTIVE' && (
                  <button
                    onClick={() => handleRevoke(c.id)}
                    disabled={revokingId === c.id}
                    className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center justify-center gap-1 shrink-0"
                  >
                    <ShieldX className="w-3.5 h-3.5" />
                    <span>{revokingId === c.id ? 'Revoking Access...' : 'Revoke Access'}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
