export type Language = 'en' | 'mr';

export interface Translations {
  [key: string]: {
    en: string;
    mr: string;
  };
}

export const translations: Translations = {
  // Navigation & Top Banner
  'govt_maharashtra': {
    en: 'Government of Maharashtra',
    mr: 'महाराष्ट्र शासन'
  },
  'digital_infra': {
    en: 'Digital Infrastructure Platform',
    mr: 'डिजिटल पायाभूत सुविधा व्यासपीठ'
  },
  'gateway_active': {
    en: 'Gateway Active',
    mr: 'महासेतू प्रणाली: सक्रिय'
  },
  'app_title': {
    en: 'MAHASETU',
    mr: 'महासेतू'
  },
  'app_subtitle': {
    en: 'Unified Government Services & Data Exchange',
    mr: 'एकात्मिक शासकीय सेवा व आंतर-विभागीय डेटा देवाणघेवाण प्रवेशद्वार'
  },
  'nav_services': {
    en: 'Services',
    mr: 'शासकीय योजना व सेवा'
  },
  'nav_track': {
    en: 'Track Application',
    mr: 'अर्ज स्थिती ट्रॅकिंग'
  },
  'nav_consents': {
    en: 'Consent Center',
    mr: 'नागरिक संमती केंद्र'
  },
  'nav_architecture': {
    en: 'Architecture',
    mr: 'प्रणाली रचना व आर्किटेक्चर'
  },
  'sign_in_demo': {
    en: 'Sign In / Demo Accounts',
    mr: 'लॉगिन / डेमो खाती'
  },
  'switch_user': {
    en: 'Switch User',
    mr: 'वापरकर्ता बदला'
  },
  'sign_out': {
    en: 'Sign Out',
    mr: 'लॉगआउट'
  },

  // Roles
  'role_citizen': {
    en: 'Citizen Portal',
    mr: 'नागरिक सेवा दालन'
  },
  'role_officer': {
    en: 'Officer Dashboard',
    mr: 'विभागीय अधिकारी नियंत्रण कक्ष'
  },
  'role_admin': {
    en: 'System Admin',
    mr: 'मुख्य प्रणाली प्रशासक'
  },

  // Citizen Dashboard
  'citizen_welcome': {
    en: 'Citizen Services & Interoperability Hub',
    mr: 'नागरिक सेवा व आंतर-विभागीय डेटा एकात्मिक केंद्र'
  },
  'citizen_desc': {
    en: 'Apply for cross-departmental government schemes with zero repetitive document uploads using DigiLocker & MahaSetu Consent Gateway.',
    mr: 'वारंवार कागदपत्रे जोडण्याऐवजी डिजिलॉकर आणि महासेतू संमती प्रवेशद्वाराद्वारे शासकीय योजनांसाठी तात्काळ अर्ज करा.'
  },
  'tab_apply': {
    en: 'Apply for Services',
    mr: 'नवीन सेवेसाठी अर्ज करा'
  },
  'tab_my_apps': {
    en: 'My Applications',
    mr: 'माझे सादर केलेले अर्ज'
  },
  'tab_consents': {
    en: 'Consent Governance',
    mr: 'माझी डिजिटल संमती नियंत्रणे'
  },
  'tab_grievances': {
    en: 'RTS Grievance Redressal',
    mr: 'लोकसेवा हक्क (RTS) तक्रार निवारण'
  },
  'active_applications': {
    en: 'Active Applications',
    mr: 'सक्रिय अर्ज संख्या'
  },
  'verified_certificates': {
    en: 'Verified Certificates',
    mr: 'डिजिटल प्रमाणित दाखले'
  },
  'active_consents': {
    en: 'Active Consents',
    mr: 'सक्रिय संमती अधिकार'
  },

  // Statuses
  'status_submitted': {
    en: 'Submitted (Pending)',
    mr: 'सादर केले (छाननी प्रलंबित)'
  },
  'status_in_review': {
    en: 'Under Department Scrutiny',
    mr: 'विभागीय छाननी सुरू'
  },
  'status_approved': {
    en: 'Approved & Issued',
    mr: 'मंजूर आणि निर्गमित'
  },
  'status_rejected': {
    en: 'Rejected (Right to Appeal)',
    mr: 'नाकारले (३० दिवसांत अपील हक्क)'
  },

  // Services
  'srv_seed_grant': {
    en: 'MSInS Startup Innovation Seed Grant (₹5,00,000)',
    mr: 'महाराष्ट्र इनोव्हेशन सोसायटी (MSInS) प्रारंभिक बीज अनुदान (₹५,००,०००)'
  },
  'srv_biz_license': {
    en: 'Small Business Operating License',
    mr: 'लघु उद्योग व्यवसाय परवाना'
  },
  'srv_seed_grant_desc': {
    en: 'Zero document upload grant: MahaSetu federates Revenue Income, ITI Skill Certificate, and MSME Udyam credentials automatically.',
    mr: 'शून्य कागदपत्र अपलोड: महसूल उत्पन्न दाखला, कौशल्य पदविका आणि उद्योग नोंदणीचे महासेतू द्वारे थेट डिजिटल प्रमाणीकरण.'
  },

  // Deduplication & MDM
  'mdm_title': {
    en: 'Master Data Management (MDM) & Deduplication',
    mr: 'मुख्य डेटा व्यवस्थापन (MDM) व डुप्लिकेशन प्रतिबंध'
  },
  'mdm_desc': {
    en: 'Cross-registry deduplication and 360-degree federated identity graph.',
    mr: 'अनेक विभागांमधील डुप्लिकेट लाभार्थ्यांचा शोध आणि ३६०° एकात्मिक नागरिक ओळख आलेख.'
  },
  'view_360': {
    en: 'View 360° Profile',
    mr: '३६०° एकात्मिक प्रोफाइल पहा'
  },

  // Grievances
  'raise_grievance': {
    en: 'Raise RTS Grievance / Appeal',
    mr: 'लोकसेवा हक्क तक्रार / प्रथम अपील नोंदवा'
  },
  'rts_sla': {
    en: 'RTS Statutory Guarantee: 21 Working Days',
    mr: 'महाराष्ट्र लोकसेवा हमी कायदा २०१५: २१ कामकाजाचे दिवस'
  },
  'escalated': {
    en: 'Auto-Escalated to Appellate Authority',
    mr: 'अपील प्राधिकरणाकडे स्वयंचलित वर्ग'
  },

  // Notifications
  'notifications': {
    en: 'Official Notifications & Alerts',
    mr: 'अधिकृत शासकीय सूचना आणि संदेश'
  },
  'mark_all_read': {
    en: 'Mark All Read',
    mr: 'सर्व वाचल्याचे चिन्हांकित करा'
  },
  'no_notifications': {
    en: 'No new notifications at this time',
    mr: 'सध्या कोणत्याही नवीन शासकीय सूचना नाहीत'
  },

  // Admin & Audit
  'audit_logs_title': {
    en: 'Cryptographic Audit Trail & Security Ledger',
    mr: 'लेखापरीक्षण नोंदवही आणि सुरक्षा अहवाल'
  },
  'audit_logs_desc': {
    en: 'Tamper-evident SHA-256 transaction ledger for CERT-In compliance and transparency.',
    mr: 'CERT-In मानकांनुसार पारदर्शक आणि सुरक्षित SHA-256 एन्क्रिप्टेड व्यवहार नोंदवही.'
  },
  'circuit_breaker_title': {
    en: 'Department Adapter Resilience & Circuit Breaker',
    mr: 'विभागीय सर्व्हर लवचिकता व सर्किट ब्रेकर प्रणाली'
  },
  'workflow_rules_title': {
    en: 'Deterministic Workflow Rules & Auto-Approval Engine',
    mr: 'स्वयंचलित कार्यप्रवाह धोरण व तत्काळ मंजुरी प्रणाली'
  },
  'sla_clock': {
    en: 'RTS SLA Clock',
    mr: 'लोकसेवा हमी कालावधी'
  },
  'apply_zero_docs': {
    en: 'Apply with Zero Document Upload',
    mr: 'कागदपत्र अपलोड न करता थेट अर्ज करा'
  }
};
