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

  // Landing Page Hero
  'hero_tag': {
    en: 'Government of Maharashtra Digital Infrastructure',
    mr: 'महाराष्ट्र शासन डिजिटल पायाभूत सुविधा'
  },
  'hero_title': {
    en: 'One secure bridge for connected government services.',
    mr: 'एकात्मिक शासकीय सेवांसाठी एक सुरक्षित डिजिटल सेतू.'
  },
  'hero_desc': {
    en: 'Access government services without repeatedly submitting documents or information already available with another department.',
    mr: 'इतर विभागांकडे आधीच उपलब्ध असलेली माहिती किंवा कागदपत्रे पुन्हा न जोडता शासकीय सेवांचा सहज लाभ घ्या.'
  },
  'hero_explore_btn': {
    en: 'Explore Services',
    mr: 'शासकीय योजना व सेवा पहा'
  },
  'hero_track_btn': {
    en: 'Track Existing Application',
    mr: 'सादर केलेल्या अर्जाची स्थिती तपासा'
  },

  // How MahaSetu Works
  'how_it_works_title': {
    en: 'How MahaSetu Works',
    mr: 'महासेतू कसे कार्य करते'
  },
  'how_it_works_subtitle': {
    en: 'Four simple steps to apply for services without redundant paperwork',
    mr: 'कागदपत्रांच्या पुनरावृत्तीशिवाय सेवांचा लाभ घेण्यासाठी चार सोप्या पायऱ्या'
  },
  'step_1_title': {
    en: 'Choose a Service',
    mr: '१. सेवा निवडा'
  },
  'step_1_desc': {
    en: 'Select the service you need from any onboarded Maharashtra state department.',
    mr: 'महाराष्ट्र शासनाच्या कोणत्याही विभागाची आवश्यक असलेली सेवा निवडा.'
  },
  'step_2_title': {
    en: 'Give Consent',
    mr: '२. डिजिटल संमती द्या'
  },
  'step_2_desc': {
    en: 'Review requested information and explicitly grant digital permission.',
    mr: 'विनंती केलेल्या माहितीचे पुनरावलोकन करा आणि थेट डिजिटल परवानगी द्या.'
  },
  'step_3_title': {
    en: 'Instant Exchange',
    mr: '३. तत्काळ डेटा देवाणघेवाण'
  },
  'step_3_desc': {
    en: 'Verified data is securely retrieved and auto-populated into your application.',
    mr: 'प्रमाणित माहिती सुरक्षितपणे प्राप्त होऊन तुमच्या अर्जात स्वयंचलितपणे भरली जाते.'
  },
  'step_4_title': {
    en: 'Track Progress',
    mr: '४. प्रगतीचा मागोवा घ्या'
  },
  'step_4_desc': {
    en: 'Monitor your application status and verified logs in one central timeline.',
    mr: 'एकाच केंद्रीय टाइमलाइनमध्ये तुमच्या अर्जाची स्थिती आणि प्रमाणित नोंदी पहा.'
  },

  // Connected Departments & Security Summary
  'connected_depts_title': {
    en: 'Connected Departments',
    mr: 'संलग्न शासकीय विभाग'
  },
  'dept_revenue_name': {
    en: 'Revenue Department',
    mr: 'महसूल विभाग'
  },
  'dept_revenue_desc': {
    en: 'Provides income verification, residence details, and land records.',
    mr: 'उत्पन्न दाखला, अधिवास माहिती आणि भूमी अभिलेख उपलब्ध करून देतो.'
  },
  'dept_education_name': {
    en: 'Education Department',
    mr: 'उच्च व तंत्र शिक्षण विभाग'
  },
  'dept_education_desc': {
    en: 'Provides student marksheet & degree certificate verifications.',
    mr: 'विद्यार्थ्यांची गुणपत्रिका व पदवी प्रमाणपत्र पडताळणी पुरवतो.'
  },
  'dept_industries_name': {
    en: 'Industries Department',
    mr: 'उद्योग संचालनालय'
  },
  'dept_industries_desc': {
    en: 'Processes business registration & industrial operational NOC permits.',
    mr: 'व्यवसाय नोंदणी आणि औद्योगिक ना-हरकत (NOC) परवाने प्रक्रिया करतो.'
  },
  'dept_skills_name': {
    en: 'Skills & Innovation Society (MSInS)',
    mr: 'महाराष्ट्र राज्य कौशल्य व नवोपक्रम विकास संस्था (MSInS)'
  },
  'dept_skills_desc': {
    en: 'ITI trade diploma, NSQF certifications and startup seed grants.',
    mr: 'आयटीआय ट्रेड डिप्लोमा, एनएसक्यूएफ प्रमाणपत्रे आणि स्टार्टअप बीज अनुदान.'
  },

  'security_first_title': {
    en: 'Security & Privacy First',
    mr: 'सुरक्षितता आणि गोपनीयतेला सर्वोच्च प्राधान्य'
  },
  'security_first_desc': {
    en: 'MahaSetu does not store your raw personal documents permanently. Your data is fetched only when requested by you, protected by cryptographic consent tokens, and recorded in an immutable audit trail.',
    mr: 'महासेतू तुमचे वैयक्तिक मूळ दस्तऐवज कायमस्वरूपी साठवत नाही. तुमचा डेटा केवळ तुमच्या विनंतीनुसार प्राप्त केला जातो, तो क्रिप्टोग्राफिक संमती टोकनद्वारे संरक्षित असतो आणि बदल न करता येणाऱ्या ऑडिट ट्रेलमध्ये नोंदवला जातो.'
  },
  'security_point_1': {
    en: 'Data is exchanged only with your explicit digital consent',
    mr: 'केवळ तुमच्या स्पष्ट डिजिटल संमतीनेच डेटाची देवाणघेवाण केली जाते'
  },
  'security_point_2': {
    en: 'Consents are purpose-bound and automatically expire',
    mr: 'संमती विशिष्ट हेतूसाठी मर्यादित असून मुदतीनंतर स्वयंचलितपणे समाप्त होते'
  },
  'security_point_3': {
    en: 'You can revoke access permissions anytime in your Consent Center',
    mr: 'तुम्ही संमती केंद्रात जाऊन कधीही दिलेली परवानगी मागे (Revoke) घेऊ शकता'
  },
  'iso_compliance_text': {
    en: 'ISO/IEC 27001 Protocol & ISO Data Minimization Compliant',
    mr: 'ISO/IEC 27001 प्रोटोकॉल आणि डेटा मिनिमायझेशन मानकांचे पूर्ण पालन'
  },

  // Service Registry Catalogue
  'catalogue_title': {
    en: 'Government Services Catalogue',
    mr: 'शासकीय सेवा सूची'
  },
  'catalogue_subtitle': {
    en: 'Explore available services with connected cross-department data sharing',
    mr: 'आंतर-विभागीय डेटा देवाणघेवाणीसह उपलब्ध शासकीय सेवा पहा'
  },
  'search_placeholder': {
    en: 'Search government services by name, keyword, or department...',
    mr: 'सेवेचे नाव, कीवर्ड किंवा विभागानुसार शोधा...'
  },
  'filter_by_dept': {
    en: 'Filter by Department:',
    mr: 'विभागानुसार फिल्टर करा:'
  },
  'all_services': {
    en: 'All Services',
    mr: 'सर्व सेवा'
  },
  'loading_services': {
    en: 'Loading government services registry...',
    mr: 'शासकीय सेवा सूची लोड होत आहे...'
  },
  'no_services_found': {
    en: 'No matching services found',
    mr: 'कोणतीही जुळणारी सेवा आढळली नाही'
  },
  'no_services_hint': {
    en: 'Try clearing your search query or selecting a different department filter.',
    mr: 'कृपया शोध शब्द बदला किंवा दुसरा विभाग निवडा.'
  },
  'connected_autofetch_badge': {
    en: 'Connected Cross-Department Auto-Fetch',
    mr: 'आंतर-विभागीय स्वयंचलित डेटा प्राप्ती'
  },
  'retrieves_verified': {
    en: 'Retrieves verified',
    mr: 'प्रमाणित माहिती थेट प्राप्त करतो:'
  },
  'from_dept': {
    en: 'from',
    mr: 'विभाग:'
  },
  'with_explicit_consent': {
    en: 'with your explicit consent.',
    mr: 'तुमच्या स्पष्ट संमतीने.'
  },
  'consent_protected': {
    en: 'Consent Protected',
    mr: 'संमती संरक्षित'
  },
  'apply_now': {
    en: 'Apply Now',
    mr: 'अर्ज करा'
  },

  // Application Tracking & Audit Timeline
  'track_title': {
    en: 'Application Tracking & Audit Timeline',
    mr: 'अर्ज ट्रॅकिंग आणि ऑडिट टाइमलाइन'
  },
  'track_subtitle': {
    en: 'Track your application status and verified inter-department data history',
    mr: 'तुमच्या अर्जाची स्थिती आणि प्रमाणित आंतर-विभागीय डेटा इतिहास तपासा'
  },
  'track_input_placeholder': {
    en: 'Enter Application Tracking Number (e.g. APP-2026-IND-00142)...',
    mr: 'अर्ज ट्रॅकिंग क्रमांक प्रविष्ट करा (उदा. APP-2026-IND-00142)...'
  },
  'search_btn': {
    en: 'Search',
    mr: 'शोधा'
  },
  'quick_demo_samples': {
    en: 'Quick Demo Samples:',
    mr: 'द्रुत डेमो नमुने:'
  },
  'close_btn': {
    en: 'Close',
    mr: 'बंद करा'
  },
  'tracking_number_label': {
    en: 'Tracking Number:',
    mr: 'ट्रॅकिंग क्रमांक:'
  },
  'updated_label': {
    en: 'Updated:',
    mr: 'अद्यतनित:'
  },
  'verified_cross_dept_info': {
    en: 'Verified Cross-Department Information',
    mr: 'प्रमाणित आंतर-विभागीय माहिती'
  },
  'providing_dept_label': {
    en: 'Providing Dept:',
    mr: 'माहिती पुरवणारा विभाग:'
  },
  'cert_num_label': {
    en: 'Certificate #:',
    mr: 'दाखला क्र.:'
  },
  'verified_income_label': {
    en: 'Verified Income:',
    mr: 'प्रमाणित वार्षिक उत्पन्न:'
  },
  'refresh_status': {
    en: 'Refresh Status',
    mr: 'स्थिती रीफ्रेश करा'
  },
  'print_receipt': {
    en: 'Print Receipt',
    mr: 'पोचपावती छापा'
  },
  'download_cert': {
    en: 'Download Certificate',
    mr: 'प्रमाणपत्र डाउनलोड करा'
  },
  'verified_authenticity': {
    en: 'Verified Authenticity:',
    mr: 'डिजिटल प्रमाणीकरण:'
  },
  'lifecycle_timeline_title': {
    en: 'Lifecycle Timeline & Event Log',
    mr: 'जीवनचक्र टाइमलाइन आणि घटना नोंद'
  },
  'recorded_actions_count': {
    en: 'recorded actions',
    mr: 'नोंदवलेल्या कृती'
  },
  'by_actor': {
    en: 'By',
    mr: 'द्वारे:'
  },
  'view_tech_details': {
    en: 'View technical details',
    mr: 'तांत्रिक तपशील पहा'
  },
  'hide_tech_details': {
    en: 'Hide technical details',
    mr: 'तांत्रिक तपशील लपवा'
  },

  // Footer
  'footer_desc': {
    en: 'Unified Government Services Interoperability Platform for the State of Maharashtra.',
    mr: 'महाराष्ट्र शासनाचे एकात्मिक शासकीय सेवा आंतर-कार्यक्षमता व डेटा देवाणघेवाण व्यासपीठ.'
  },
  'footer_connected_infra': {
    en: 'Connected Infrastructure',
    mr: 'संलग्न डिजिटल पायाभूत सुविधा'
  },
  'footer_rev_gateway': {
    en: 'Revenue Department Gateway',
    mr: '• महसूल विभाग प्रवेशद्वार'
  },
  'footer_edu_registry': {
    en: 'Higher Education Records Registry',
    mr: '• उच्च शिक्षण अभिलेख नोंदवही'
  },
  'footer_ind_portal': {
    en: 'Directorate of Industries Portal',
    mr: '• उद्योग संचालनालय पोर्टल'
  },
  'footer_sec_gov': {
    en: 'Security & Governance',
    mr: 'सुरक्षा आणि प्रशासन'
  },
  'footer_sec_text': {
    en: 'Digital Consent Architecture • ISO 27001 Protocol • Immutable Audit Logging',
    mr: 'डिजिटल संमती रचना • ISO 27001 मानके • अपरिवर्तनीय ऑडिट लॉगिंग'
  },
  'footer_hackathon': {
    en: 'Hackathon Project',
    mr: 'हॅकाथॉन प्रकल्प'
  },
  'footer_sih_name': {
    en: 'Smart India Hackathon 2026',
    mr: 'स्मार्ट इंडिया हॅकाथॉन २०२६'
  },
  'footer_ps_id': {
    en: 'Problem Statement ID:',
    mr: 'समस्या विधान क्रमांक:'
  },
  'footer_category': {
    en: 'Category: G2C & G2G Middleware',
    mr: 'श्रेणी: G2C आणि G2G मिडलवेअर'
  },
  'footer_copyright': {
    en: '© 2026 Government of Maharashtra. Developed for Smart India Hackathon 2026.',
    mr: '© २०२६ महाराष्ट्र शासन. स्मार्ट इंडिया हॅकाथॉन २०२६ अंतर्गत विकसित.'
  },
  'footer_version': {
    en: 'MahaSetu Version 1.0.0 (Production Prototype)',
    mr: 'महासेतू आवृत्ती १.०.० (उत्पादन प्रोटोटाइप)'
  },

  // Citizen Dashboard
  'citizen_welcome': {
    en: 'Citizen Services & Interoperability Hub',
    mr: 'नागरिक सेवा व आंतर-विभागीय डेटा एकात्मिक केंद्र'
  },
  'citizen_welcome_user': {
    en: 'Welcome,',
    mr: 'स्वागत आहे,'
  },
  'verified_citizen_badge': {
    en: 'Verified Citizen Identity',
    mr: 'प्रमाणित नागरिक ओळख'
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
  'pending_action': {
    en: 'Pending Action',
    mr: 'छाननी प्रलंबित अर्ज'
  },
  'verified_certificates': {
    en: 'Verified Certificates',
    mr: 'डिजिटल प्रमाणित दाखले'
  },
  'active_consents': {
    en: 'Active Consents',
    mr: 'सक्रिय संमती अधिकार'
  },
  'your_submitted_apps': {
    en: 'Your Submitted Applications',
    mr: 'आपण सादर केलेले अर्ज'
  },
  'apply_msins_seed_btn': {
    en: 'Apply for MSInS Seed Grant (Flagship)',
    mr: 'MSInS बीज अनुदानासाठी अर्ज करा (फ्लॅगशिप)'
  },
  'apply_biz_license_btn': {
    en: 'Business License',
    mr: 'व्यवसाय परवाना अर्ज'
  },
  'no_apps_submitted': {
    en: 'No applications submitted yet',
    mr: 'अद्याप कोणतेही अर्ज सादर केलेले नाहीत'
  },
  'no_apps_desc': {
    en: 'Apply for MSInS startup seed grants, business licenses, and government certificates with zero physical paperwork.',
    mr: 'कागदपत्रे अपलोड न करता MSInS स्टार्टअप अनुदान, व्यवसाय परवाने आणि शासकीय दाखल्यांसाठी त्वरित अर्ज करा.'
  },
  'view_timeline_btn': {
    en: 'View Timeline',
    mr: 'टाइमलाइन पहा'
  },
  'raise_grievance_btn': {
    en: 'Raise Grievance',
    mr: 'तक्रार नोंदवा'
  },
  'select_service_to_apply': {
    en: 'Select a Service to Apply',
    mr: 'अर्जासाठी शासकीय सेवा निवडा'
  },

  // Statuses
  'status_submitted': {
    en: 'Submitted',
    mr: 'सादर केले'
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
  'status_active': {
    en: 'Active Consent',
    mr: 'सक्रिय संमती'
  },
  'status_revoked': {
    en: 'Revoked',
    mr: 'मागे घेतली (Revoked)'
  },
  'status_denied': {
    en: 'Denied',
    mr: 'नाकारली (Denied)'
  },

  // Services Names & Descriptions
  'srv_seed_grant': {
    en: 'MSInS Startup Innovation Seed Grant (₹5,00,000)',
    mr: 'महाराष्ट्र इनोव्हेशन सोसायटी (MSInS) प्रारंभिक बीज अनुदान (₹५,००,०००)'
  },
  'srv_biz_license': {
    en: 'Small Scale Business License',
    mr: 'लघु उद्योग व्यवसाय परवाना'
  },
  'srv_income_cert': {
    en: 'Income Certificate Verification',
    mr: 'उत्पन्न दाखला पडताळणी'
  },
  'srv_degree_verify': {
    en: 'Higher Education Degree Verification',
    mr: 'उच्च शिक्षण पदवी व गुणपत्रिका पडताळणी'
  },
  'srv_skill_cert': {
    en: 'ITI / Polytechnic Skill Certification',
    mr: 'आयटीआय / पॉलिटेक्निक कौशल्य प्रमाणपत्र'
  },
  'srv_seed_grant_desc': {
    en: 'Early-stage startup funding grant for certified tech innovators and skilled diploma holders',
    mr: 'प्रमाणित तंत्रज्ञान संशोधक व पदविकाधारकांसाठी प्रारंभिक टप्प्यातील स्टार्टअप निधी अनुदान'
  },
  'srv_biz_license_desc': {
    en: 'Issuance of industrial operational license for small scale enterprises',
    mr: 'लघुउद्योग उपक्रमांसाठी औद्योगिक परिचालन परवाना निर्गमित करणे'
  },
  'srv_income_cert_desc': {
    en: 'Official verification of annual household income certificate',
    mr: 'कुटुंबाच्या वार्षिक उत्पन्नाच्या दाखल्याची अधिकृत पडताळणी'
  },
  'srv_degree_verify_desc': {
    en: 'Verification of university degree certificate and marksheet',
    mr: 'विद्यापीठीय पदवी प्रमाणपत्र आणि गुणपत्रिकेची डिजिटल पडताळणी'
  },
  'srv_skill_cert_desc': {
    en: 'Verification of technical trade diploma and NSQF vocational certification',
    mr: 'तांत्रिक व्यवसाय पदविका आणि एनएसक्यूएफ व्यावसायिक प्रमाणपत्राची पडताळणी'
  },

  // Login Modal
  'login_title': {
    en: 'MahaSetu Sign In',
    mr: 'महासेतू लॉगिन'
  },
  'login_subtitle': {
    en: 'Government of Maharashtra Unified SSO',
    mr: 'महाराष्ट्र शासन एकात्मिक सिंगल साइन-ऑन (SSO)'
  },
  'email_label': {
    en: 'Email Address',
    mr: 'ईमेल पत्ता'
  },
  'password_label': {
    en: 'Password',
    mr: 'पासवर्ड'
  },
  'sign_in_btn': {
    en: 'Sign In',
    mr: 'लॉगिन करा'
  },
  'authenticating': {
    en: 'Authenticating...',
    mr: 'प्रमाणीकरण होत आहे...'
  },
  'demo_personas_title': {
    en: 'DEMO PERSONAS (1-CLICK LOGIN)',
    mr: 'डेमो वापरकर्ते (१-क्लिक लॉगिन)'
  },
  'default_password_loaded': {
    en: 'Default password loaded',
    mr: 'डीफॉल्ट पासवर्ड समाविष्ट'
  },
  'persona_citizen_role': {
    en: 'Citizen (Applicant)',
    mr: 'नागरिक (अर्जदार)'
  },
  'persona_msins_role': {
    en: 'Skills & Innovation Officer',
    mr: 'कौशल्य व नवोपक्रम अधिकारी'
  },
  'persona_industries_role': {
    en: 'Industries Nodal Officer',
    mr: 'उद्योग नोडल अधिकारी'
  },
  'persona_admin_role': {
    en: 'System Admin',
    mr: 'मुख्य प्रणाली प्रशासक'
  },

  // Consent Modal
  'consent_auth_title': {
    en: 'Digital Consent Authorization',
    mr: 'डिजिटल संमती अधिकृतीकरण'
  },
  'permission_required_title': {
    en: 'Your permission is required',
    mr: 'आपली संमती आवश्यक आहे'
  },
  'is_requesting_from': {
    en: 'is requesting verified information from the',
    mr: 'हे खालील विभागाकडून प्रमाणित माहितीची विनंती करत आहेत:'
  },
  'service_label': {
    en: 'Service:',
    mr: 'शासकीय सेवा:'
  },
  'purpose_label': {
    en: 'Purpose',
    mr: 'संमतीचा हेतू'
  },
  'info_requested_label': {
    en: 'Information requested',
    mr: 'मागितलेली माहिती'
  },
  'why_needed_title': {
    en: 'Why is this needed?',
    mr: 'याची आवश्यकता का आहे?'
  },
  'why_needed_desc': {
    en: 'This information is already available with the government department. Your permission allows MahaSetu to securely retrieve it directly instead of requiring you to upload physical documents.',
    mr: 'ही माहिती शासकीय विभागाकडे आधीच उपलब्ध आहे. आपल्या संमतीमुळे महासेतू कागदपत्रे अपलोड न मागता थेट सुरक्षितपणे माहिती प्राप्त करू शकेल.'
  },
  'access_type_label': {
    en: 'Access Type: One-time verification',
    mr: 'प्रवेश प्रकार: एकवेळ पडताळणी'
  },
  'validity_label': {
    en: 'Validity: 24 Hours',
    mr: 'वैधता: २४ तास'
  },
  'decline_btn': {
    en: 'Decline',
    mr: 'नाकारा'
  },
  'allow_access_btn': {
    en: 'Allow Access',
    mr: 'संमती द्या'
  },
  'authorizing_access': {
    en: 'Authorizing Access...',
    mr: 'संमती प्रक्रिया सुरू आहे...'
  },

  // Consent Center
  'consent_hub_title': {
    en: 'Digital Consent Management Hub',
    mr: 'डिजिटल संमती व्यवस्थापन केंद्र'
  },
  'consent_hub_subtitle': {
    en: 'View, inspect, or revoke digital permissions granted for cross-department data sharing',
    mr: 'आंतर-विभागीय डेटा देवाणघेवाणीसाठी दिलेल्या संमती पहा, तपासा किंवा रद्द करा'
  },
  'no_consents_recorded': {
    en: 'No digital consent authorizations recorded yet.',
    mr: 'अद्याप कोणत्याही डिजिटल संमती नोंदी नाहीत.'
  },
  'revoke_access_btn': {
    en: 'Revoke Access',
    mr: 'संमती रद्द करा'
  },
  'revoking_access': {
    en: 'Revoking Access...',
    mr: 'संमती रद्द होत आहे...'
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
  },

  // MSInS Seed Grant Modal
  'msins_society_badge': {
    en: 'MSInS Innovation Society',
    mr: 'महाराष्ट्र इनोव्हेशन सोसायटी'
  },
  'zero_docs_policy_title': {
    en: 'Zero Physical Document Policy (Once-Only Principle)',
    mr: 'शून्य कागदपत्र धोरण (वन्स-ओन्ली तत्त्व)'
  },
  'zero_docs_policy_desc': {
    en: 'As part of the Government of Maharashtra Interoperability Framework, your Revenue Financial Record and MSBTE Skill Certification will be auto-verified via digital consent. No physical scans or manual visits required.',
    mr: 'महाराष्ट्र शासन आंतर-कार्यक्षमता आराखड्यानुसार, आपला महसूल विभागाचा उत्पन्न दाखला आणि MSBTE कौशल्य प्रमाणपत्र डिजिटल संमतीने स्वयंचलितपणे पडताळले जाईल. कोणतेही कागदपत्र अपलोड करण्याची आवश्यकता नाही.'
  },
  'startup_name_label': {
    en: 'Startup / Enterprise Name',
    mr: 'स्टार्टअप / उद्योगाचे नाव'
  },
  'innovation_sector_label': {
    en: 'Innovation Sector',
    mr: 'नाविन्यता क्षेत्र'
  },
  'funding_requested_label': {
    en: 'Funding Grant Requested (₹)',
    mr: 'मागणी केलेले अनुदान (₹)'
  },
  'nodal_incubator_label': {
    en: 'Nodal Incubator Partner',
    mr: 'नोडल इन्क्युबेटर भागीदार संस्था'
  },
  'solution_desc_label': {
    en: 'Brief Solution Description',
    mr: 'प्रकल्पाचे संक्षिप्त वर्णन'
  },
  'requires_2dept_consent': {
    en: 'Requires 2-Department Consent Verification',
    mr: '२ विभागांची डिजिटल संमती पडताळणी आवश्यक'
  },
  'proceed_to_consent_btn': {
    en: 'Proceed to Consent & Auto-Fetch',
    mr: 'संमती द्या आणि माहिती प्राप्त करा'
  },
  'autofetching_records': {
    en: 'Auto-Fetching Verified Records...',
    mr: 'प्रमाणित माहिती प्राप्त होत आहे...'
  },
  'autofetched_banner_title': {
    en: 'Auto-fetched via consent — no re-upload required.',
    mr: 'संमतीने स्वयंचलित प्राप्त — कागदपत्रे जोडण्याची गरज नाही.'
  },
  'autofetched_banner_desc': {
    en: 'Cross-department interoperability gateway successfully verified your authentic records from both registries.',
    mr: 'आंतर-विभागीय डेटा प्रवेशद्वाराने दोन्ही विभागांच्या नोंदवहीतून आपले मूळ दस्तऐवज यशस्वीरीत्या प्रमाणित केले.'
  },
  'applicant_venture_title': {
    en: 'Applicant & Venture Summary',
    mr: 'अर्जदार व उद्योगाचा सारांश'
  },
  'venture_name_label': {
    en: 'Venture Name:',
    mr: 'उद्योगाचे नाव:'
  },
  'sector_label': {
    en: 'Sector:',
    mr: 'क्षेत्र:'
  },
  'grant_requested_label': {
    en: 'Grant Requested:',
    mr: 'मागणी केलेले अनुदान:'
  },
  'circuit_breaker_active_title': {
    en: 'Circuit Breaker & Resilience Active:',
    mr: 'सर्किट ब्रेकर आणि लवचिकता सक्रिय:'
  },
  'circuit_breaker_active_desc': {
    en: 'The upstream Revenue Department is currently offline (Simulated Outage). MahaSetu automatically attempted 3x exponential backoff retries and gracefully served your verified certificate from the encrypted local cache without failing your application.',
    mr: 'महसूल विभाग सर्व्हर सध्या ऑफलाइन आहे. महासेतूने ३ वेळा स्वयंचलित प्रयत्न करून सुरक्षित स्थानिक कॅशमधून आपला दाखला अखंडपणे उपलब्ध केला आहे.'
  },
  'verified_badge': {
    en: 'Verified',
    mr: 'प्रमाणित'
  },
  'cache_replica_badge': {
    en: 'Cache Replica (Dept Offline)',
    mr: 'कॅश प्रत (विभाग ऑफलाइन)'
  },
  'income_slab_label': {
    en: 'Income Slab:',
    mr: 'उत्पन्न गट:'
  },
  'issuing_office_label': {
    en: 'Issuing Office:',
    mr: 'निर्गमित कार्यालय:'
  },
  'trainee_id_label': {
    en: 'Trainee ID:',
    mr: 'प्रशिक्षणार्थी आयडी:'
  },
  'trade_course_label': {
    en: 'Trade / Course:',
    mr: 'अभ्यासक्रम / ट्रेड:'
  },
  'level_grade_label': {
    en: 'Level & Grade:',
    mr: 'स्तर व श्रेणी:'
  },
  'issuing_board_label': {
    en: 'Issuing Board:',
    mr: 'परीक्षा मंडळ:'
  },
  'back_to_edit_btn': {
    en: 'Back to Edit',
    mr: 'मागे जा व बदल करा'
  },
  'confirm_submit_btn': {
    en: 'Confirm & Submit Application',
    mr: 'अर्जाची खात्री करा आणि सादर करा'
  },
  'submitting_app_to_dept': {
    en: 'Submitting Application to MSInS...',
    mr: 'अर्ज विभागाकडे सादर होत आहे...'
  },

  // Raise Grievance Modal
  'raise_rts_grievance_title': {
    en: 'Raise RTS Grievance',
    mr: 'लोकसेवा हक्क तक्रार नोंदवा'
  },
  'rts_act_2015': {
    en: 'Maharashtra Right to Public Services Act (RTS 2015)',
    mr: 'महाराष्ट्र लोकसेवा हक्क कायदा (RTS २०१५)'
  },
  'rts_guarantee_notice': {
    en: 'SLA Guarantee: Grievances are reviewed by the concerned nodal officer within 48 hours. Unresolved grievances auto-escalate directly to the Department Head.',
    mr: 'हमी: तक्रारींचे ४८ तासांच्या आत संबंधित नोडल अधिकाऱ्याकडून निवारण केले जाईल. निराकरण न झाल्यास तक्रार थेट विभाग प्रमुखांकडे वर्ग केली जाते.'
  },
  'concerned_dept_label': {
    en: 'Concerned Department',
    mr: 'संबंधित शासकीय विभाग'
  },
  'grievance_category_label': {
    en: 'Grievance Category',
    mr: 'तक्रारीची श्रेणी'
  },
  'linked_app_number_label': {
    en: 'Linked Application Number (Optional)',
    mr: 'संलग्न अर्ज क्रमांक (ऐच्छिक)'
  },
  'grievance_desc_label': {
    en: 'Grievance Description',
    mr: 'तक्रारीचा सविस्तर तपशील'
  },
  'grievance_desc_placeholder': {
    en: 'Please provide details of the issue, delays experienced, or incorrect data flags...',
    mr: 'कृपया समस्येचे स्वरूप, झालेला विलंब किंवा चुकीची माहिती याबद्दल सविस्तर लिहा...'
  },
  'cancel_btn': {
    en: 'Cancel',
    mr: 'रद्द करा'
  },
  'submit_grievance_btn': {
    en: 'Submit RTS Grievance',
    mr: 'तक्रार सादर करा'
  },
  'submitting_grievance': {
    en: 'Registering Grievance...',
    mr: 'तक्रार नोंदवली जात आहे...'
  },

  // Notification Drawer
  'alert_center_title': {
    en: 'Citizen Alert Center',
    mr: 'नागरिक सूचना केंद्र'
  },
  'multi_channel_broadcast': {
    en: 'Multi-Channel Broadcast',
    mr: 'बहु-माध्यम शासकीय प्रक्षेपण'
  },
  'tab_all': {
    en: 'All',
    mr: 'सर्व'
  },
  'loading_notifications': {
    en: 'Loading notification streams...',
    mr: 'सूचना लोड होत आहेत...'
  },
  'no_alerts_in_channel': {
    en: 'No alerts in this channel',
    mr: 'या माध्यमावर कोणत्याही सूचना नाहीत'
  },
  'notifications_realtime_desc': {
    en: 'Notifications are generated in real-time when consents are issued, interoperability data is exchanged, or RTS SLAs trigger.',
    mr: 'संमती जारी केल्यावर, डेटा देवाणघेवाण झाल्यावर किंवा लोकसेवा हक्क कालावधी लागू झाल्यावर त्वरित सूचना पाठवल्या जातात.'
  },
  'interactive_dispatch_demo': {
    en: 'Interactive Multi-Channel Dispatch Demo',
    mr: 'थेट बहु-माध्यम सूचना चाचणी (डेमो)'
  },
  'simulate_sms_btn': {
    en: 'Simulate SMS',
    mr: 'SMS सूचना पाठवा'
  },
  'simulate_whatsapp_btn': {
    en: 'Simulate WhatsApp',
    mr: 'WhatsApp सूचना पाठवा'
  },

  // Officer Dashboard & Review Queue
  'officer_portal_title': {
    en: 'Department Scrutiny & Approval Desk',
    mr: 'विभागीय छाननी व मंजुरी कक्ष'
  },
  'officer_dept_badge': {
    en: 'Competent Authority Desk',
    mr: 'सक्षम प्राधिकारी दालन'
  },
  'officer_queue_title': {
    en: 'Applications Pending Verification',
    mr: 'पडताळणीसाठी प्रलंबित अर्ज'
  },
  'officer_queue_desc': {
    en: 'Review incoming citizen applications with pre-verified cross-departmental records and deterministic rule checks.',
    mr: 'आंतर-विभागीय प्रमाणित नोंदी आणि स्वयंचलित पडताळणीसह आलेल्या नागरिक अर्जांचे पुनरावलोकन करा.'
  },
  'approve_issue_btn': {
    en: 'Approve & Issue Order',
    mr: 'मंजूर करा व आदेश द्या'
  },
  'reject_app_btn': {
    en: 'Reject with Reason',
    mr: 'कारणासह नाकारा'
  },
  'scrutiny_notes_placeholder': {
    en: 'Add statutory approval remarks or conditions...',
    mr: 'वैधानिक मंजुरी शेरा किंवा अटी प्रविष्ट करा...'
  },
  'verified_by_mahasetu': {
    en: 'Verified via MahaSetu Data Exchange',
    mr: 'महासेतू डेटा देवाणघेवाणीद्वारे प्रमाणित'
  },
  'rule_passed': {
    en: 'Rule Verification: Passed',
    mr: 'नियम पडताळणी: पात्र'
  },
  'rule_failed': {
    en: 'Rule Verification: Flagged',
    mr: 'नियम पडताळणी: त्रुटी'
  },

  // Admin Dashboard Tabs & Controls
  'admin_system_title': {
    en: 'MahaSetu System Administration & Interoperability Mesh',
    mr: 'महासेतू मुख्य प्रशासकीय नियंत्रण व आंतर-विभागीय डेटा जाळे'
  },
  'tab_overview': {
    en: 'System Telemetry',
    mr: 'प्रणाली स्थिती'
  },
  'tab_audit_ledger': {
    en: 'Audit Ledger',
    mr: 'ऑडिट नोंदवही'
  },
  'tab_circuit_breakers': {
    en: 'Circuit Breakers',
    mr: 'सर्किट ब्रेकर्स'
  },
  'tab_workflow_rules': {
    en: 'Workflow Rules',
    mr: 'कार्यप्रवाह नियम'
  },
  'tab_mdm_dedup': {
    en: 'MDM & Deduplication',
    mr: 'MDM व डुप्लिकेशन प्रतिबंध'
  },
  'tab_officer_grievances': {
    en: 'RTS Grievance Queue',
    mr: 'तक्रार निवारण कक्ष'
  }
};


