import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto bg-[#0F172A] border-t border-slate-800 text-slate-400 text-xs py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="font-bold text-slate-200 text-sm mb-2 flex items-center gap-1.5">
              <span>{t('app_title', 'MAHASETU')}</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t('footer_desc', 'Unified Government Services Interoperability Platform for the State of Maharashtra.')}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-2">{t('footer_connected_infra', 'Connected Infrastructure')}</h4>
            <ul className="space-y-1 text-slate-400">
              <li>{t('footer_rev_gateway', '• Revenue Department Gateway')}</li>
              <li>{t('footer_edu_registry', '• Higher Education Records Registry')}</li>
              <li>{t('footer_ind_portal', '• Directorate of Industries Portal')}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-2">{t('footer_sec_gov', 'Security & Governance')}</h4>
            <div className="flex items-start gap-1.5 text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{t('footer_sec_text', 'Digital Consent Architecture • ISO 27001 Protocol • Immutable Audit Logging')}</span>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-slate-200 text-xs mb-2">{t('footer_hackathon', 'Hackathon Project')}</h4>
            <p className="text-slate-400">
              {t('footer_sih_name', 'Smart India Hackathon 2026')}<br/>
              {t('footer_ps_id', 'Problem Statement ID:')} <span className="font-mono text-slate-200">#26129</span><br/>
              {t('footer_category', 'Category: G2C & G2G Middleware')}
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px]">
          <p>{t('footer_copyright', '© 2026 Government of Maharashtra. Developed for Smart India Hackathon 2026.')}</p>
          <p>{t('footer_version', 'MahaSetu Version 1.0.0 (Production Prototype)')}</p>
        </div>
      </div>
    </footer>
  );
};

