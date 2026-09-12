import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ShieldAlert, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { createGrievance, Grievance } from '../services/grievanceService';

interface RaiseGrievanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (grievance: Grievance) => void;
  initialDepartmentId?: string;
  initialApplicationId?: string;
  initialApplicationNumber?: string;
}

export const RaiseGrievanceModal: React.FC<RaiseGrievanceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialDepartmentId,
  initialApplicationId,
  initialApplicationNumber
}) => {
  const { token } = useAuth();
  const { language, t, tDept } = useLanguage();
  const [departmentId, setDepartmentId] = useState(initialDepartmentId || 'dept_revenue');
  const [category, setCategory] = useState('DELAYED_PROCESSING');
  const [applicationNumber, setApplicationNumber] = useState(initialApplicationNumber || '');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDepartmentId) setDepartmentId(initialDepartmentId);
    if (initialApplicationNumber) setApplicationNumber(initialApplicationNumber);
  }, [initialDepartmentId, initialApplicationNumber]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError(language === 'mr' ? 'तक्रार नोंदवण्यासाठी कृपया लॉगिन करा' : 'Please log in to submit a grievance');
      return;
    }

    if (description.trim().length < 10) {
      setError(language === 'mr' ? 'कृपया तक्रारीचे वर्णन किमान १० अक्षरांमध्ये प्रविष्ट करा.' : 'Please describe your grievance in at least 10 characters.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const grievance = await createGrievance(token, {
        department_id: departmentId,
        category,
        description,
        application_id: initialApplicationId || null,
        application_number: applicationNumber.trim() || null
      });

      onSuccess(grievance);
      setDescription('');
      onClose();
    } catch (err: any) {
      setError(err.message || (language === 'mr' ? 'तक्रार नोंदवण्यात त्रुटी आली' : 'Failed to submit grievance'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-amber-600 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{t('raise_rts_grievance_title')}</h3>
              <p className="text-xs text-red-100 mt-0.5">{t('rts_act_2015')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-2 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-800">
            {t('rts_guarantee_notice')}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              {t('concerned_dept_label')}
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
            >
              <option value="dept_revenue">{tDept('dept_revenue', 'Revenue Department')}</option>
              <option value="dept_education">{tDept('dept_education', 'Higher & Technical Education')}</option>
              <option value="dept_industries">{tDept('dept_industries', 'Industries Department')}</option>
              <option value="dept_skills">{tDept('dept_skills', 'MSInS / Skills & Innovation Society')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              {t('grievance_category_label')}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
            >
              <option value="DELAYED_PROCESSING">
                {language === 'mr' ? 'प्रक्रियेत विलंब (लोकसेवा हमी मुदत ओलांडली)' : 'Delayed Processing (Exceeded RTS Timelines)'}
              </option>
              <option value="DOCUMENT_VERIFICATION_ISSUE">
                {language === 'mr' ? 'आंतर-विभागीय पडताळणी विसंगती' : 'Cross-Department Verification Discrepancy'}
              </option>
              <option value="TECHNICAL_GLITCH">
                {language === 'mr' ? 'महासेतू गेटवे तांत्रिक त्रुटी' : 'MahaSetu Gateway Interoperability Failure'}
              </option>
              <option value="SERVICE_DENIAL">
                {language === 'mr' ? 'अवाजवी अर्ज नकार' : 'Unjustified Application Rejection'}
              </option>
              <option value="OTHER">
                {language === 'mr' ? 'इतर प्रशासकीय तक्रार' : 'Other Administrative Grievance'}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              {t('linked_app_number_label')}
            </label>
            <input
              type="text"
              value={applicationNumber}
              onChange={(e) => setApplicationNumber(e.target.value)}
              placeholder="e.g. MH-2026-894721"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              {t('grievance_desc_label')}
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('grievance_desc_placeholder')}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all resize-none"
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
            >
              {t('cancel_btn')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center space-x-2 transition-all"
            >
              {loading ? (
                <span>{t('submitting_grievance')}</span>
              ) : (
                <>
                  <span>{t('submit_grievance_btn')}</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

