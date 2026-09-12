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
    mr: 'प्रवेशद्वार सक्रिय'
  },
  'app_title': {
    en: 'MAHASETU',
    mr: 'महासेतू'
  },
  'app_subtitle': {
    en: 'Unified Government Services & Data Exchange',
    mr: 'एकात्मिक शासकीय सेवा आणि डेटा देवाणघेवाण प्रवेशद्वार'
  },
  'nav_services': {
    en: 'Services',
    mr: 'शासकीय सेवा'
  },
  'nav_track': {
    en: 'Track Application',
    mr: 'अर्ज स्थिती'
  },
  'nav_consents': {
    en: 'Consent Center',
    mr: 'संमती केंद्र'
  },
  'nav_architecture': {
    en: 'Architecture',
    mr: 'रचना व आर्किटेक्चर'
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
    mr: 'नागरिक पोर्टल'
  },
  'role_officer': {
    en: 'Officer Dashboard',
    mr: 'अधिकारी डॅशबोर्ड'
  },
  'role_admin': {
    en: 'System Admin',
    mr: 'प्रणाली प्रशासक'
  },

  // Citizen Dashboard
  'citizen_welcome': {
    en: 'Citizen Services & Interoperability Hub',
    mr: 'नागरिक सेवा व आंतरकार्यक्षमता केंद्र'
  },
  'citizen_desc': {
    en: 'Apply for cross-departmental government schemes with zero repetitive document uploads using DigiLocker & MahaSetu Consent Gateway.',
    mr: 'डिजिलॉकर आणि महासेतू संमती प्रवेशद्वाराचा वापर करून एकाच क्लिकवर शासकीय योजनांसाठी अर्ज करा.'
  },
  'tab_apply': {
    en: 'Apply for Services',
    mr: 'सेवांसाठी अर्ज करा'
  },
  'tab_my_apps': {
    en: 'My Applications',
    mr: 'माझे अर्ज'
  },
  'tab_consents': {
    en: 'Consent Governance',
    mr: 'माझी संमती नियंत्रणे'
  },
  'tab_grievances': {
    en: 'RTS Grievance Redressal',
    mr: 'लोकसेवा हक्क तक्रार निवारण'
  },
  'active_applications': {
    en: 'Active Applications',
    mr: 'सक्रिय अर्ज'
  },
  'verified_certificates': {
    en: 'Verified Certificates',
    mr: 'पडताळणी झालेले दाखले'
  },
  'active_consents': {
    en: 'Active Consents',
    mr: 'सक्रिय संमती'
  },

  // Statuses
  'status_submitted': {
    en: 'Pending Review',
    mr: 'पुनरावलोकन प्रलंबित'
  },
  'status_in_review': {
    en: 'Under Scrutiny',
    mr: 'छाननी सुरू'
  },
  'status_approved': {
    en: 'Approved',
    mr: 'मंजूर'
  },
  'status_rejected': {
    en: 'Rejected',
    mr: 'नाकारले'
  },

  // Services
  'srv_seed_grant': {
    en: 'MSInS Early Stage Seed Grant (₹5,00,000)',
    mr: 'महाराष्ट्र इनोव्हेशन सोसायटी (MSInS) प्रारंभिक बीज अनुदान (₹५,००,०००)'
  },
  'srv_biz_license': {
    en: 'Small Business Operating License',
    mr: 'लघु उद्योग व्यवसाय परवाना'
  },
  'srv_seed_grant_desc': {
    en: 'Zero document upload grant: MahaSetu federates Revenue Income, ITI Skill Certificate, and MSME Udyam credentials automatically.',
    mr: 'शून्य कागदपत्र अपलोड: महासेतू उत्पन्न प्रमाणपत्र, कौशल्य पदविका आणि उद्योग नोंदणी थेट प्रमाणित करते.'
  },

  // Deduplication & MDM
  'mdm_title': {
    en: 'Master Data Management (MDM) & Deduplication',
    mr: 'मास्टर डेटा व्यवस्थापन (MDM) व डुप्लिकेशन शोध'
  },
  'mdm_desc': {
    en: 'Cross-registry deduplication and 360-degree federated identity graph.',
    mr: 'विविध विभागांमधील डुप्लिकेट लाभार्थ्यांचा शोध आणि ३६०° एकात्मिक नागरिक ओळख.'
  },
  'view_360': {
    en: 'View 360° Profile',
    mr: '३६०° प्रोफाइल पहा'
  },

  // Grievances
  'raise_grievance': {
    en: 'Raise New Grievance',
    mr: 'नवीन तक्रार नोंदवा'
  },
  'rts_sla': {
    en: 'RTS Guarantee Period: 21 Working Days',
    mr: 'महाराष्ट्र लोकसेवा हमी कायदा: २१ कामकाजाचे दिवस'
  },
  'escalated': {
    en: 'Auto-Escalated to Appellate Authority',
    mr: 'अपील प्राधिकरणाकडे स्वयंचलित वर्ग'
  },

  // Notifications
  'notifications': {
    en: 'Notifications & Alerts',
    mr: 'सूचना आणि संदेश'
  },
  'mark_all_read': {
    en: 'Mark All Read',
    mr: 'सर्व वाचल्याचे चिन्हांकित करा'
  },
  'no_notifications': {
    en: 'No notifications at this time',
    mr: 'सध्या कोणत्याही नवीन सूचना नाहीत'
  }
};
