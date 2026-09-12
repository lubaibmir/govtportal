import React, { useEffect, useState } from 'react';
import { Search, ShieldCheck, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { fetchDepartments, fetchServices } from '../services/serviceRegistry';
import { Department, Service } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ServiceCatalogueProps {
  onSelectService?: (service: Service) => void;
}

export const ServiceCatalogue: React.FC<ServiceCatalogueProps> = ({ onSelectService }) => {
  const { language, t, tDept, tService, tNum } = useLanguage();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [deptData, srvData] = await Promise.all([
        fetchDepartments(),
        fetchServices()
      ]);
      setDepartments(deptData);
      setServices(srvData);
      setLoading(false);
    }
    loadData();
  }, []);

  const filteredServices = services.filter((srv) => {
    const matchesDept = selectedDept === 'ALL' || srv.department_id === selectedDept;
    const matchesQuery = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         srv.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         srv.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesQuery;
  });

  const getDeptName = (deptId: string) => {
    const d = departments.find(dep => dep.id === deptId);
    const rawName = d ? d.name : deptId;
    return tDept(rawName);
  };

  const getServiceName = (srv: Service) => {
    return tService(srv.name || srv.id);
  };

  const getServiceDesc = (srv: Service) => {
    if (language === 'mr') {
      if (srv.code === 'REV-INC-01' || srv.id.includes('revenue') || srv.id.includes('income')) {
        return t('srv_income_cert_desc', 'कुटुंबाच्या वार्षिक उत्पन्नाच्या दाखल्याची अधिकृत पडताळणी');
      }
      if (srv.code === 'IND-BIZ-01' || srv.id.includes('biz') || srv.id.includes('industries')) {
        return t('srv_biz_license_desc', 'लघुउद्योग उपक्रमांसाठी औद्योगिक परिचालन परवाना निर्गमित करणे');
      }
      if (srv.code === 'EDU-DEG-01' || srv.id.includes('degree') || srv.id.includes('education')) {
        return t('srv_degree_verify_desc', 'विद्यापीठीय पदवी प्रमाणपत्र आणि गुणपत्रिकेची डिजिटल पडताळणी');
      }
      if (srv.code === 'MSINS-GRANT-01' || srv.id.includes('seed') || srv.id.includes('msins')) {
        return t('srv_seed_grant_desc', 'प्रमाणित तंत्रज्ञान संशोधक व पदविकाधारकांसाठी प्रारंभिक टप्प्यातील स्टार्टअप निधी अनुदान');
      }
      if (srv.code === 'SKILLS-CERT-01' || srv.id.includes('skill') || srv.id.includes('iti')) {
        return t('srv_skill_cert_desc', 'तांत्रिक व्यवसाय पदविका आणि एनएसक्यूएफ व्यावसायिक प्रमाणपत्राची पडताळणी');
      }
    }
    return srv.description;
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Filter Bar */}
      <div className="bg-white border border-[#E5E7E3] rounded-md p-4 space-y-4 shadow-xs">
        
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search_placeholder', 'Search government services by name, keyword, or department...')}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-700 focus:bg-white transition-colors"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-medium mr-1 shrink-0">{t('filter_by_dept', 'Filter by Department:')}</span>
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1.5 rounded font-medium transition-colors shrink-0 ${
              selectedDept === 'ALL'
                ? 'bg-[#166534] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
            }`}
          >
            {t('all_services', 'All Services')} ({tNum(services.length)})
          </button>
          
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`px-3 py-1.5 rounded font-medium transition-colors shrink-0 ${
                selectedDept === dept.id
                  ? 'bg-[#166534] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
              }`}
            >
              {tDept(dept.name)}
            </button>
          ))}
        </div>

      </div>

      {/* Services List */}
      {loading ? (
        <div className="bg-white border border-[#E5E7E3] rounded-md p-8 text-center text-slate-500 text-sm">
          {t('loading_services', 'Loading government services registry...')}
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white border border-[#E5E7E3] rounded-md p-8 text-center">
          <Building2 className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">{t('no_services_found', 'No matching services found')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('no_services_hint', 'Try clearing your search query or selecting a different department filter.')}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white border border-[#E5E7E3] rounded-md p-5 flex flex-col justify-between hover:border-emerald-600 transition-colors shadow-xs"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {service.code}
                  </span>
                  <span className="text-xs font-semibold text-[#166534]">
                    {getDeptName(service.department_id)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mb-1">
                  {getServiceName(service)}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {getServiceDesc(service)}
                </p>

                {/* Interoperability Feature Highlight */}
                {service.required_data_sources.length > 0 && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded p-2.5 mb-3 text-xs">
                    <div className="font-semibold text-emerald-900 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('connected_autofetch_badge', 'Connected Cross-Department Auto-Fetch')}</span>
                    </div>
                    {service.required_data_sources.map((ds, idx) => (
                      <p key={idx} className="text-emerald-800 text-[11px]">
                        {t('retrieves_verified', 'Retrieves verified')} <strong className="text-slate-900">{ds.data_type}</strong> {t('from_dept', 'from')} <span className="font-medium">{getDeptName(ds.department_id)}</span> {t('with_explicit_consent', 'with your explicit consent.')}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  {t('consent_protected', 'Consent Protected')}
                </span>

                <button
                  onClick={() => onSelectService && onSelectService(service)}
                  className="bg-[#166534] hover:bg-[#15803D] text-white text-xs font-semibold px-3 py-1.5 rounded transition-colors flex items-center gap-1"
                >
                  <span>{t('apply_now', 'Apply Now')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

