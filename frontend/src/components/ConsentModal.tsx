import React, { useState } from 'react';
import { ShieldCheck, Check, X, ShieldAlert, Lock, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createConsent, approveConsent } from '../services/consentService';

interface ConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId?: string;
  serviceName: string;
  requestingDept: string;
  providingDept: string;
  purpose: string;
  requestedFields: string[];
  onConsentGranted: (consentToken: string, consentId: string) => void;
  onConsentDenied: () => void;
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  isOpen,
  onClose,
  serviceId = 'srv_ind_biz_license',
  serviceName,
  requestingDept,
  providingDept,
  purpose,
  requestedFields,
  onConsentGranted,
  onConsentDenied
}) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGrantConsent = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const consentReq = await createConsent({
        requesting_department_id: requestingDept,
        providing_department_id: providingDept,
        service_id: serviceId,
        purpose: purpose,
        requested_fields: requestedFields,
        valid_duration_hours: 24
      }, token);

      const approved = await approveConsent(consentReq.id, token);
      
      if (approved.consent_token) {
        onConsentGranted(approved.consent_token, approved.id);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to grant consent');
    } finally {
      setLoading(false);
    }
  };

  const handleDenyConsent = async () => {
    onConsentDenied();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-[#E5E7E3] rounded-md shadow-lg max-w-lg w-full p-6 space-y-5">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-3 flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold text-[#166534] uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Digital Consent Authorization</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Your permission is required
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Body */}
        <div className="space-y-4 text-xs">
          
          <div className="bg-slate-50 border border-slate-200 rounded p-3 text-slate-800 space-y-1">
            <p className="font-semibold text-slate-900">
              <span className="text-[#166534]">{requestingDept}</span> is requesting verified information from the <span className="text-slate-900">{providingDept}</span>.
            </p>
            <p className="text-slate-600">Service: {serviceName}</p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-1">Purpose</h4>
            <p className="text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-2.5 rounded">
              {purpose}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Information requested</h4>
            <ul className="space-y-1.5 bg-slate-50 border border-slate-200 p-3 rounded">
              {requestedFields.map((field, idx) => (
                <li key={idx} className="flex items-center gap-2 text-slate-800 font-medium">
                  <Check className="w-3.5 h-3.5 text-[#166534] shrink-0" />
                  <span>{field.replace(/_/g, ' ').toUpperCase()}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-emerald-900">
            <h4 className="font-bold mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#166534]" />
              <span>Why is this needed?</span>
            </h4>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              This information is already available with the Revenue Department. Your permission allows MahaSetu to securely retrieve it directly instead of requiring you to upload physical documents.
            </p>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            <span>Access Type: <strong>One-time verification</strong></span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Validity: 24 Hours</span>
            </span>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={handleDenyConsent}
            disabled={loading}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded text-xs border border-slate-300 transition-colors"
          >
            Decline
          </button>

          <button
            onClick={handleGrantConsent}
            disabled={loading}
            className="bg-[#166534] hover:bg-[#15803D] text-white font-semibold px-5 py-2 rounded text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            {loading ? (
              <span>Authorizing Access...</span>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Allow Access</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
