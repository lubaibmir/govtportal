import React, { createContext, useContext, useState } from 'react';
import { Language, translations } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  tDept: (deptIdOrName: string, fallback?: string) => string;
  tService: (serviceIdOrName: string, fallback?: string) => string;
  tStatus: (status: string, fallback?: string) => string;
  tNum: (val: number | string) => string;
  tCurrency: (amount: number | string) => string;
  tDate: (dateVal: string | Date | number, options?: Intl.DateTimeFormatOptions) => string;
}

const deptDict: Record<string, { en: string; mr: string }> = {
  'dept_revenue': { en: 'Revenue Department', mr: 'महसूल विभाग' },
  'Revenue Department': { en: 'Revenue Department', mr: 'महसूल विभाग' },
  'Revenue': { en: 'Revenue Department', mr: 'महसूल विभाग' },
  'dept_education': { en: 'Education Department', mr: 'उच्च व तंत्र शिक्षण विभाग' },
  'Education Department': { en: 'Education Department', mr: 'उच्च व तंत्र शिक्षण विभाग' },
  'Higher Education': { en: 'Higher Education Department', mr: 'उच्च व तंत्र शिक्षण विभाग' },
  'dept_industries': { en: 'Industries Department', mr: 'उद्योग संचालनालय' },
  'Industries Department': { en: 'Industries Department', mr: 'उद्योग संचालनालय' },
  'Industries': { en: 'Industries Department', mr: 'उद्योग संचालनालय' },
  'dept_skills': { en: 'Skills & Innovation Society (MSInS)', mr: 'कौशल्य व नवोपक्रम विकास संस्था (MSInS)' },
  'Skills & Innovation Society (MSInS)': { en: 'Skills & Innovation Society (MSInS)', mr: 'कौशल्य व नवोपक्रम विकास संस्था (MSInS)' },
  'Skills & Innovation (MSInS)': { en: 'Skills & Innovation (MSInS)', mr: 'कौशल्य व नवोपक्रम विकास संस्था (MSInS)' },
};

const serviceDict: Record<string, { en: string; mr: string; descEn?: string; descMr?: string }> = {
  'REV-INC-01': {
    en: 'Income Certificate Verification',
    mr: 'उत्पन्न दाखला पडताळणी',
    descEn: 'Official verification of annual household income certificate',
    descMr: 'कुटुंबाच्या वार्षिक उत्पन्नाच्या दाखल्याची अधिकृत पडताळणी'
  },
  'srv_rev_income_cert': {
    en: 'Income Certificate Verification',
    mr: 'उत्पन्न दाखला पडताळणी',
    descEn: 'Official verification of annual household income certificate',
    descMr: 'कुटुंबाच्या वार्षिक उत्पन्नाच्या दाखल्याची अधिकृत पडताळणी'
  },
  'Income Certificate Verification': {
    en: 'Income Certificate Verification',
    mr: 'उत्पन्न दाखला पडताळणी',
    descEn: 'Official verification of annual household income certificate',
    descMr: 'कुटुंबाच्या वार्षिक उत्पन्नाच्या दाखल्याची अधिकृत पडताळणी'
  },
  'IND-BIZ-01': {
    en: 'Small Scale Business License',
    mr: 'लघु उद्योग व्यवसाय परवाना',
    descEn: 'Issuance of industrial operational license for small scale enterprises',
    descMr: 'लघुउद्योग उपक्रमांसाठी औद्योगिक परिचालन परवाना निर्गमित करणे'
  },
  'srv_ind_biz_license': {
    en: 'Small Scale Business License',
    mr: 'लघु उद्योग व्यवसाय परवाना',
    descEn: 'Issuance of industrial operational license for small scale enterprises',
    descMr: 'लघुउद्योग उपक्रमांसाठी औद्योगिक परिचालन परवाना निर्गमित करणे'
  },
  'Small Scale Business License': {
    en: 'Small Scale Business License',
    mr: 'लघु उद्योग व्यवसाय परवाना',
    descEn: 'Issuance of industrial operational license for small scale enterprises',
    descMr: 'लघुउद्योग उपक्रमांसाठी औद्योगिक परिचालन परवाना निर्गमित करणे'
  },
  'EDU-DEG-01': {
    en: 'Higher Education Degree Verification',
    mr: 'उच्च शिक्षण पदवी व गुणपत्रिका पडताळणी',
    descEn: 'Verification of university degree certificate and marksheet',
    descMr: 'विद्यापीठीय पदवी प्रमाणपत्र आणि गुणपत्रिकेची डिजिटल पडताळणी'
  },
  'srv_edu_degree_verify': {
    en: 'Higher Education Degree Verification',
    mr: 'उच्च शिक्षण पदवी व गुणपत्रिका पडताळणी',
    descEn: 'Verification of university degree certificate and marksheet',
    descMr: 'विद्यापीठीय पदवी प्रमाणपत्र आणि गुणपत्रिकेची डिजिटल पडताळणी'
  },
  'Higher Education Degree Verification': {
    en: 'Higher Education Degree Verification',
    mr: 'उच्च शिक्षण पदवी व गुणपत्रिका पडताळणी',
    descEn: 'Verification of university degree certificate and marksheet',
    descMr: 'विद्यापीठीय पदवी प्रमाणपत्र आणि गुणपत्रिकेची डिजिटल पडताळणी'
  },
  'MSINS-GRANT-01': {
    en: 'MSInS Startup Innovation Seed Grant',
    mr: 'महाराष्ट्र इनोव्हेशन सोसायटी (MSInS) प्रारंभिक बीज अनुदान',
    descEn: 'Early-stage startup funding grant for certified tech innovators and skilled diploma holders',
    descMr: 'प्रमाणित तंत्रज्ञान संशोधक व पदविकाधारकांसाठी प्रारंभिक टप्प्यातील स्टार्टअप निधी अनुदान'
  },
  'srv_msins_seed_grant': {
    en: 'MSInS Startup Innovation Seed Grant',
    mr: 'महाराष्ट्र इनोव्हेशन सोसायटी (MSInS) प्रारंभिक बीज अनुदान',
    descEn: 'Early-stage startup funding grant for certified tech innovators and skilled diploma holders',
    descMr: 'प्रमाणित तंत्रज्ञान संशोधक व पदविकाधारकांसाठी प्रारंभिक टप्प्यातील स्टार्टअप निधी अनुदान'
  },
  'MSInS Startup Innovation Seed Grant': {
    en: 'MSInS Startup Innovation Seed Grant',
    mr: 'महाराष्ट्र इनोव्हेशन सोसायटी (MSInS) प्रारंभिक बीज अनुदान',
    descEn: 'Early-stage startup funding grant for certified tech innovators and skilled diploma holders',
    descMr: 'प्रमाणित तंत्रज्ञान संशोधक व पदविकाधारकांसाठी प्रारंभिक टप्प्यातील स्टार्टअप निधी अनुदान'
  },
  'SKILLS-CERT-01': {
    en: 'ITI / Polytechnic Skill Certification',
    mr: 'आयटीआय / पॉलिटेक्निक कौशल्य प्रमाणपत्र',
    descEn: 'Verification of technical trade diploma and NSQF vocational certification',
    descMr: 'तांत्रिक व्यवसाय पदविका आणि एनएसक्यूएफ व्यावसायिक प्रमाणपत्राची पडताळणी'
  },
  'srv_skills_cert': {
    en: 'ITI / Polytechnic Skill Certification',
    mr: 'आयटीआय / पॉलिटेक्निक कौशल्य प्रमाणपत्र',
    descEn: 'Verification of technical trade diploma and NSQF vocational certification',
    descMr: 'तांत्रिक व्यवसाय पदविका आणि एनएसक्यूएफ व्यावसायिक प्रमाणपत्राची पडताळणी'
  },
  'ITI / Polytechnic Skill Certification': {
    en: 'ITI / Polytechnic Skill Certification',
    mr: 'आयटीआय / पॉलिटेक्निक कौशल्य प्रमाणपत्र',
    descEn: 'Verification of technical trade diploma and NSQF vocational certification',
    descMr: 'तांत्रिक व्यवसाय पदविका आणि एनएसक्यूएफ व्यावसायिक प्रमाणपत्राची पडताळणी'
  },
  'ITI & Polytechnic Skill Certificate': {
    en: 'ITI / Polytechnic Skill Certification',
    mr: 'आयटीआय / पॉलिटेक्निक कौशल्य प्रमाणपत्र',
    descEn: 'Verification of technical trade diploma and NSQF vocational certification',
    descMr: 'तांत्रिक व्यवसाय पदविका आणि एनएसक्यूएफ व्यावसायिक प्रमाणपत्राची पडताळणी'
  }
};

const statusDict: Record<string, { en: string; mr: string }> = {
  'APPROVED': { en: 'Approved & Issued', mr: 'मंजूर आणि निर्गमित' },
  'IN_REVIEW': { en: 'Under Department Review', mr: 'विभागीय छाननी सुरू' },
  'SUBMITTED': { en: 'Application Submitted', mr: 'सादर केले' },
  'REJECTED': { en: 'Application Rejected', mr: 'नाकारले' },
  'ACTIVE': { en: 'Active', mr: 'सक्रिय' },
  'REVOKED': { en: 'Revoked', mr: 'मागे घेतली (Revoked)' },
  'DENIED': { en: 'Denied', mr: 'नाकारली' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('mahasetu_lang');
    return (saved === 'mr' || saved === 'en') ? saved : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('mahasetu_lang', lang);
  };

  const t = (key: string, fallback?: string): string => {
    const entry = translations[key];
    if (!entry) {
      if (language === 'mr' && fallback) {
        // Check if fallback matches any dictionary entry
        for (const k in translations) {
          if (translations[k].en.toLowerCase() === fallback.toLowerCase()) {
            return translations[k].mr;
          }
        }
      }
      return fallback || key;
    }
    return entry[language] || fallback || key;
  };

  const tDept = (deptIdOrName: string, fallback?: string): string => {
    const entry = deptDict[deptIdOrName];
    if (!entry) return fallback || deptIdOrName;
    return entry[language] || fallback || deptIdOrName;
  };

  const tService = (serviceIdOrName: string, fallback?: string): string => {
    const entry = serviceDict[serviceIdOrName];
    if (!entry) return fallback || serviceIdOrName;
    return entry[language] || fallback || serviceIdOrName;
  };

  const tStatus = (status: string, fallback?: string): string => {
    const entry = statusDict[status];
    if (!entry) return fallback || status;
    return entry[language] || fallback || status;
  };

  const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

  const toDevanagariDigits = (val: number | string): string => {
    return String(val).replace(/[0-9]/g, (digit) => devanagariDigits[parseInt(digit, 10)] || digit);
  };

  const tNum = (val: number | string): string => {
    if (val === undefined || val === null) return '';
    if (language === 'mr') {
      if (typeof val === 'number') {
        return toDevanagariDigits(val.toLocaleString('en-IN'));
      }
      return toDevanagariDigits(val);
    }
    if (typeof val === 'number') {
      return val.toLocaleString('en-IN');
    }
    return String(val);
  };

  const tCurrency = (amount: number | string): string => {
    if (amount === undefined || amount === null) return '';
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) || 0 : amount;
    if (language === 'mr') {
      return '₹' + toDevanagariDigits(num.toLocaleString('en-IN'));
    }
    return '₹' + num.toLocaleString('en-IN');
  };

  const tDate = (dateVal: string | Date | number, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const formatted = d.toLocaleString('en-IN', options || {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    if (language === 'mr') {
      return toDevanagariDigits(formatted);
    }
    return formatted;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tDept, tService, tStatus, tNum, tCurrency, tDate }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

