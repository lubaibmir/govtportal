import React, { useState, useEffect } from 'react';
import { X, AlertCircle, ShieldAlert, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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
      setError('Please log in to submit a grievance');
      return;
    }

    if (description.trim().length < 10) {
      setError('Please describe your grievance in at least 10 characters.');
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
      setError(err.message || 'Failed to submit grievance');
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
              <h3 className="text-xl font-bold">Raise RTS Grievance</h3>
              <p className="text-xs text-red-100 mt-0.5">Maharashtra Right to Public Services Act (RTS 2015)</p>
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
            <span className="font-semibold">SLA Guarantee:</span> Grievances are reviewed by the concerned nodal officer within 48 hours. Unresolved grievances auto-escalate directly to the Department Head.
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Concerned Department
            </label>
            <select
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
            >
              <option value="dept_revenue">Revenue Department (Income, Land, Residence)</option>
              <option value="dept_education">Higher & Technical Education (Degree, Transcripts)</option>
              <option value="dept_industries">Industries Department (MSME, Trade Licenses)</option>
              <option value="dept_skills">MSInS / Skills & Entrepreneurship (Seed Grant, ITI)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Grievance Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:bg-white transition-all"
            >
              <option value="DELAYED_PROCESSING">Delayed Processing (Exceeded RTS Timelines)</option>
              <option value="DOCUMENT_VERIFICATION_ISSUE">Cross-Department Verification Discrepancy</option>
              <option value="TECHNICAL_GLITCH">MahaSetu Gateway Interoperability Failure</option>
              <option value="SERVICE_DENIAL">Unjustified Application Rejection</option>
              <option value="OTHER">Other Administrative Grievance</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              Linked Application Number <span className="text-slate-400 font-normal lowercase">(optional)</span>
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
              Grievance Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Please provide details of the issue, delays experienced, or incorrect data flags..."
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 flex items-center space-x-2 transition-all"
            >
              {loading ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <span>Submit Grievance</span>
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
