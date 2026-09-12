import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  CheckCircle2, 
  Clock, 
  Sliders, 
  RefreshCw, 
  ShieldCheck, 
  Zap,
  Save,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchWorkflowRules, updateWorkflowRule, resetWorkflowRules, WorkflowRule } from '../services/workflowService';

export const WorkflowRulesPanel: React.FC = () => {
  const { token } = useAuth();
  const [rules, setRules] = useState<WorkflowRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingRuleId, setSavingRuleId] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Local draft states for edited rules
  const [draftRules, setDraftRules] = useState<Record<string, {
    enabled: boolean;
    sla_hours: number;
    max_income?: number;
  }>>({});

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const data = await fetchWorkflowRules();
      setRules(data);
      const drafts: Record<string, any> = {};
      data.forEach(r => {
        drafts[r.rule_id] = {
          enabled: r.enabled,
          sla_hours: r.sla_hours,
          max_income: r.conditions.max_annual_income
        };
      });
      setDraftRules(drafts);
    } catch (e) {
      console.error('Failed to load rules', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (ruleId: string, currentVal: boolean) => {
    if (!token) return;
    const newVal = !currentVal;
    setDraftRules(prev => ({
      ...prev,
      [ruleId]: { ...prev[ruleId], enabled: newVal }
    }));

    try {
      await updateWorkflowRule(token, ruleId, { enabled: newVal });
      setFeedbackMsg({ text: `Policy Rule '${ruleId}' ${newVal ? 'ENABLED' : 'DISABLED'} successfully.`, type: 'success' });
      await loadRules();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to toggle rule', type: 'error' });
    }
  };

  const handleSaveDraft = async (ruleId: string) => {
    if (!token) return;
    const draft = draftRules[ruleId];
    if (!draft) return;

    setSavingRuleId(ruleId);
    setFeedbackMsg(null);
    try {
      const payload: any = {
        enabled: draft.enabled,
        sla_hours: draft.sla_hours
      };
      if (draft.max_income !== undefined) {
        payload.conditions = { max_annual_income: Number(draft.max_income) };
      }

      await updateWorkflowRule(token, ruleId, payload);
      setFeedbackMsg({ text: `Rule '${ruleId}' parameters updated and deployed live.`, type: 'success' });
      await loadRules();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to update rule', type: 'error' });
    } finally {
      setSavingRuleId(null);
    }
  };

  const handleResetDefaults = async () => {
    if (!token) return;
    if (!window.confirm('Reset all workflow orchestration rules to statutory Maharashtra RTS defaults?')) return;

    setLoading(true);
    try {
      await resetWorkflowRules(token);
      setFeedbackMsg({ text: 'All policy rules restored to government defaults.', type: 'success' });
      await loadRules();
    } catch (err: any) {
      setFeedbackMsg({ text: err.message || 'Failed to reset rules', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-white border border-[#E5E7E3] rounded-md p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#166534]" />
            <h2 className="text-base font-bold text-slate-900">
              Deterministic Workflow Rules & Auto-Approval Engine
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Configure threshold criteria for zero-touch auto-approvals and set Maharashtra RTS statutory SLA targets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadRules}
            className="p-2 text-slate-600 hover:bg-slate-100 rounded border border-slate-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetDefaults}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold border border-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className={`p-3.5 rounded-md border text-xs flex items-center gap-2 ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Rules Grid */}
      {loading ? (
        <div className="bg-white border border-[#E5E7E3] rounded-md p-8 text-center text-xs text-slate-500">
          Loading workflow rules registry...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => {
            const draft = draftRules[rule.rule_id] || {
              enabled: rule.enabled,
              sla_hours: rule.sla_hours,
              max_income: rule.conditions.max_annual_income
            };

            return (
              <div 
                key={rule.rule_id}
                className={`bg-white border rounded-md p-5 space-y-4 shadow-xs transition-all ${
                  draft.enabled ? 'border-emerald-200 ring-1 ring-emerald-50' : 'border-slate-200 opacity-80'
                }`}
              >
                {/* Rule Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400 font-semibold">{rule.service_id}</span>
                      <span className="text-[10px] font-semibold text-[#166534] bg-emerald-50 border border-emerald-200 px-2 py-0.2 rounded">
                        {rule.target_action}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{rule.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{rule.description}</p>
                  </div>

                  {/* Enable/Disable Toggle */}
                  <button
                    onClick={() => handleToggle(rule.rule_id, draft.enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors shrink-0 ${
                      draft.enabled ? 'bg-[#166534]' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        draft.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Configuration Controls */}
                <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-3 text-xs">
                  
                  {/* Income threshold (if applicable) */}
                  {draft.max_income !== undefined && (
                    <div>
                      <div className="flex items-center justify-between text-slate-700 font-medium mb-1">
                        <span className="flex items-center gap-1">
                          <Sliders className="w-3.5 h-3.5 text-slate-500" />
                          <span>Max Annual Income Auto-Approval Cap:</span>
                        </span>
                        <strong className="text-slate-900 font-mono">₹{Number(draft.max_income).toLocaleString('en-IN')}</strong>
                      </div>
                      <input
                        type="range"
                        min="100000"
                        max="2000000"
                        step="50000"
                        value={draft.max_income}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setDraftRules(prev => ({
                            ...prev,
                            [rule.rule_id]: { ...prev[rule.rule_id], max_income: val }
                          }));
                        }}
                        className="w-full accent-emerald-700"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                        <span>₹1,00,000</span>
                        <span>₹10,00,000</span>
                        <span>₹20,00,000</span>
                      </div>
                    </div>
                  )}

                  {/* Statutory SLA Selector */}
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>Statutory RTS SLA Target:</span>
                    </span>
                    <select
                      value={draft.sla_hours}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setDraftRules(prev => ({
                          ...prev,
                          [rule.rule_id]: { ...prev[rule.rule_id], sla_hours: val }
                        }));
                      }}
                      className="px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-slate-800 text-xs focus:outline-none"
                    >
                      <option value="12">12 Hours (Express)</option>
                      <option value="24">24 Hours (Next Day)</option>
                      <option value="48">48 Hours (Standard RTS)</option>
                      <option value="72">72 Hours</option>
                    </select>
                  </div>
                </div>

                {/* Save button */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Cryptographic Audit Proof Logged</span>
                  </div>

                  <button
                    onClick={() => handleSaveDraft(rule.rule_id)}
                    disabled={savingRuleId === rule.rule_id}
                    className="px-3.5 py-1.5 bg-[#166534] hover:bg-[#15803D] text-white rounded text-xs font-semibold flex items-center gap-1 transition-colors disabled:opacity-50"
                  >
                    {savingRuleId === rule.rule_id ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Deploy Rule</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Policy Engine Explanation Box */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-md p-4 text-xs space-y-1.5 text-emerald-900">
        <div className="font-bold flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-emerald-700" />
          <span>How Interoperability Auto-Approval Operates (Zero Physical Paperwork)</span>
        </div>
        <p className="text-emerald-800 leading-relaxed">
          When an applicant grants citizen consent, MahaSetu fetches canonical JSON objects directly from Revenue, Education, and Skills departments. If the verified fields satisfy the administrator's rules above, the application bypasses manual officer scrutiny queues and transitions directly to <strong>APPROVED</strong> in milliseconds.
        </p>
      </div>

    </div>
  );
};
