import React from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  GraduationCap, 
  Briefcase, 
  ShieldCheck, 
  Lock,
  Layers
} from 'lucide-react';
import { ServiceCatalogue } from '../components/ServiceCatalogue';
import { ApplicationTracking } from '../components/ApplicationTracking';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { t, tNum } = useLanguage();

  return (
    <div className="space-y-12 pb-12">
      
      {/* HERO SECTION — Clean 5-Second Explanation */}
      <section className="bg-white border-b border-[#E5E7E3] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            
            <div className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded mb-4">
              <span>{t('hero_tag', 'Government of Maharashtra Digital Infrastructure')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-snug">
              {t('hero_title', 'One secure bridge for connected government services.')}
            </h1>

            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">
              {t('hero_desc', 'Access government services without repeatedly submitting documents or information already available with another department.')}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#catalogue"
                className="bg-[#166534] hover:bg-[#15803D] text-white font-semibold text-sm px-5 py-2.5 rounded transition-colors flex items-center gap-2"
              >
                <span>{t('hero_explore_btn', 'Explore Services')}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#track"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm px-4 py-2.5 rounded border border-slate-300 transition-colors"
              >
                {t('hero_track_btn', 'Track Existing Application')}
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* HOW MAHASETU WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">{t('how_it_works_title', 'How MahaSetu Works')}</h2>
          <p className="text-xs text-slate-500 mt-1">{t('how_it_works_subtitle', 'Four simple steps to apply for services without redundant paperwork')}</p>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white border border-[#E5E7E3] rounded-md p-4">
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 text-sm font-bold flex items-center justify-center mb-3">
              {tNum(1)}
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t('step_1_title', 'Choose a Service')}</h3>
            <p className="text-xs text-slate-600 mt-1">
              {t('step_1_desc', 'Select the service you need from any onboarded Maharashtra state department.')}
            </p>
          </div>

          <div className="bg-white border border-[#E5E7E3] rounded-md p-4">
            <div className="w-7 h-7 rounded bg-[#166534] text-white text-sm font-bold flex items-center justify-center mb-3">
              {tNum(2)}
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t('step_2_title', 'Give Consent')}</h3>
            <p className="text-xs text-slate-600 mt-1">
              {t('step_2_desc', 'Review requested information and explicitly grant digital permission.')}
            </p>
          </div>

          <div className="bg-white border border-[#E5E7E3] rounded-md p-4">
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 text-sm font-bold flex items-center justify-center mb-3">
              {tNum(3)}
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t('step_3_title', 'Instant Exchange')}</h3>
            <p className="text-xs text-slate-600 mt-1">
              {t('step_3_desc', 'Verified data is securely retrieved and auto-populated into your application.')}
            </p>
          </div>

          <div className="bg-white border border-[#E5E7E3] rounded-md p-4">
            <div className="w-7 h-7 rounded bg-slate-100 text-slate-700 text-sm font-bold flex items-center justify-center mb-3">
              {tNum(4)}
            </div>
            <h3 className="text-sm font-bold text-slate-900">{t('step_4_title', 'Track Progress')}</h3>
            <p className="text-xs text-slate-600 mt-1">
              {t('step_4_desc', 'Monitor your application status and verified logs in one central timeline.')}
            </p>
          </div>

        </div>
      </section>

      {/* SERVICE REGISTRY CATALOGUE */}
      <section id="catalogue" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">{t('catalogue_title', 'Government Services Catalogue')}</h2>
          <p className="text-xs text-slate-500 mt-0.5">{t('catalogue_subtitle', 'Explore available services with connected cross-department data sharing')}</p>
        </div>
        <ServiceCatalogue />
      </section>

      {/* APPLICATION TRACKING SECTION */}
      <section id="track" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ApplicationTracking />
      </section>

      {/* CONNECTED DEPARTMENTS & SECURITY SUMMARY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E5E7E3] rounded-md p-6 grid md:grid-cols-2 gap-8">
          
          {/* Connected Departments */}
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#166534]" />
              <span>{t('connected_depts_title', 'Connected Departments')}</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
                <Building2 className="w-5 h-5 text-slate-700 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t('dept_revenue_name', 'Revenue Department')}</h4>
                  <p className="text-[11px] text-slate-600">{t('dept_revenue_desc', 'Provides income verification, residence details, and land records.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
                <GraduationCap className="w-5 h-5 text-slate-700 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t('dept_education_name', 'Education Department')}</h4>
                  <p className="text-[11px] text-slate-600">{t('dept_education_desc', 'Provides student marksheet & degree certificate verifications.')}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded">
                <Briefcase className="w-5 h-5 text-slate-700 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{t('dept_industries_name', 'Industries Department')}</h4>
                  <p className="text-[11px] text-slate-600">{t('dept_industries_desc', 'Processes business registration & industrial operational NOC permits.')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#166534]" />
                <span>{t('security_first_title', 'Security & Privacy First')}</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                {t('security_first_desc', 'MahaSetu does not store your raw personal documents permanently. Your data is fetched only when requested by you, protected by cryptographic consent tokens, and recorded in an immutable audit trail.')}
              </p>
              
              <ul className="space-y-2 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                  <span>{t('security_point_1', 'Data is exchanged only with your explicit digital consent')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                  <span>{t('security_point_2', 'Consents are purpose-bound and automatically expire')}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#166534] shrink-0" />
                  <span>{t('security_point_3', 'You can revoke access permissions anytime in your Consent Center')}</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>{t('iso_compliance_text', 'ISO/IEC 27001 Protocol & ISO Data Minimization Compliant')}</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

