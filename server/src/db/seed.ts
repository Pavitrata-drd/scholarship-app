/**
 * Seed the database with sample Indian scholarships.
 * Run with: npm run db:seed
 */
import pool from "./pool.js";
import bcrypt from "bcryptjs";

const SCHOLARSHIPS = [
  {
    name: "Central Sector Scheme of Scholarships",
    provider: "Ministry of Education, Government of India",
    description:
      "Merit-based scholarship for students who scored above 80th percentile in Class XII exams. Provides financial assistance for college and university education.",
    amount: 20000,
    deadline: "2026-10-31",
    type: "government",
    category: "general",
    education_level: "undergraduate",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://scholarships.gov.in",
    is_featured: true,
    documents_required: [
      "Class XII marksheet",
      "Income certificate",
      "Bank passbook",
      "Aadhaar card",
    ],
    eligibility_criteria: [
      "Above 80th percentile in Class XII",
      "Family income below ₹8 LPA",
      "Indian citizen",
    ],
  },
  {
    name: "AICTE Pragati Scholarship for Girls",
    provider: "All India Council for Technical Education",
    description:
      "Scholarship for girl students admitted to AICTE-approved institutions in first year of degree/diploma programmes.",
    amount: 50000,
    deadline: "2026-12-31",
    type: "government",
    category: "general",
    education_level: "undergraduate",
    stream: "Engineering",
    state: null,
    country: "India",
    official_url: "https://www.aicte-india.org/schemes/students-development-schemes/pragati-scholarship-scheme",
    is_featured: true,
    documents_required: [
      "Admission letter",
      "Income certificate",
      "Class XII marksheet",
      "Aadhaar card",
      "Bank account details",
    ],
    eligibility_criteria: [
      "Girl students only",
      "Admitted to AICTE-approved institution",
      "Family income below ₹8 LPA",
      "First year of degree/diploma",
    ],
  },
  {
    name: "Post-Matric Scholarship for SC Students",
    provider: "Ministry of Social Justice & Empowerment",
    description:
      "Financial assistance for SC students studying at post-matriculation or post-secondary level in recognized institutions.",
    amount: 35000,
    deadline: "2026-11-30",
    type: "government",
    category: "sc",
    education_level: "undergraduate",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://scholarships.gov.in",
    is_featured: true,
    documents_required: [
      "Caste certificate",
      "Income certificate",
      "Previous year marksheet",
      "Aadhaar card",
      "Institution verification",
    ],
    eligibility_criteria: [
      "Scheduled Caste students",
      "Family income below ₹2.5 LPA",
      "Studying post-matriculation",
    ],
  },
  {
    name: "Post-Matric Scholarship for ST Students",
    provider: "Ministry of Tribal Affairs",
    description:
      "Scholarship for ST students studying in post-matriculation courses in government/recognized institutions.",
    amount: 30000,
    deadline: "2026-11-30",
    type: "government",
    category: "st",
    education_level: "undergraduate",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://scholarships.gov.in",
    is_featured: false,
    documents_required: [
      "Tribe certificate",
      "Income certificate",
      "Marksheet",
      "Aadhaar card",
    ],
    eligibility_criteria: [
      "Scheduled Tribe students",
      "Family income below ₹2.5 LPA",
      "Enrolled in recognized institution",
    ],
  },
  {
    name: "Post-Matric Scholarship for OBC Students",
    provider: "Ministry of Social Justice & Empowerment",
    description:
      "Financial assistance for OBC students pursuing post-matric education.",
    amount: 25000,
    deadline: "2026-11-30",
    type: "government",
    category: "obc",
    education_level: "undergraduate",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://scholarships.gov.in",
    is_featured: false,
    documents_required: [
      "OBC certificate",
      "Income certificate",
      "Previous year marksheet",
      "Aadhaar card",
    ],
    eligibility_criteria: [
      "OBC category students",
      "Family income below ₹1 LPA",
      "Enrolled in recognized institution",
    ],
  },
  {
    name: "INSPIRE Scholarship",
    provider: "Department of Science & Technology",
    description:
      "Innovation in Science Pursuit for Inspired Research — scholarship for students who scored in the top 1% in Class XII for pursuing natural and basic science courses.",
    amount: 80000,
    deadline: "2026-09-30",
    type: "government",
    category: "general",
    education_level: "undergraduate",
    stream: "Science",
    state: null,
    country: "India",
    official_url: "https://online-inspire.gov.in",
    is_featured: true,
    documents_required: [
      "Class XII marksheet",
      "Admission proof",
      "Bank passbook",
      "Aadhaar card",
    ],
    eligibility_criteria: [
      "Top 1% in Class XII board exam",
      "Pursuing BSc/BS/Int. MSc in natural sciences",
      "Age 17-22 years",
    ],
  },
  {
    name: "Kishore Vaigyanik Protsahan Yojana (KVPY)",
    provider: "Department of Science & Technology",
    description:
      "Fellowship to encourage students to take up research careers in science. Monthly fellowship plus annual contingency grant.",
    amount: 84000,
    deadline: "2026-08-31",
    type: "government",
    category: "general",
    education_level: "undergraduate",
    stream: "Science",
    state: null,
    country: "India",
    official_url: "http://kvpy.iisc.ernet.in",
    is_featured: false,
    documents_required: [
      "Class X marksheet",
      "Class XII marksheet",
      "Photo ID",
    ],
    eligibility_criteria: [
      "Studying in XI/XII or first year BSc",
      "Minimum 75% in qualifying exam (65% for SC/ST)",
      "Indian citizen",
    ],
  },
  {
    name: "Tata Trusts Scholarship",
    provider: "Tata Trusts",
    description:
      "Need-based scholarship providing financial support to meritorious students from economically weaker sections.",
    amount: 120000,
    deadline: "2026-07-15",
    type: "private",
    category: "ews",
    education_level: "undergraduate",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://www.tatatrusts.org",
    is_featured: true,
    documents_required: [
      "Income certificate",
      "Marksheets",
      "Admission letter",
      "Aadhaar card",
      "Bank details",
    ],
    eligibility_criteria: [
      "Family income below ₹4 LPA",
      "Admission in recognized UG programme",
      "Indian citizen",
    ],
  },
  {
    name: "Reliance Foundation Scholarship",
    provider: "Reliance Foundation",
    description:
      "Merit-cum-means scholarship for undergraduate students in Engineering, Computer Science and related fields.",
    amount: 200000,
    deadline: "2026-06-30",
    type: "private",
    category: "general",
    education_level: "undergraduate",
    stream: "Engineering",
    state: null,
    country: "India",
    official_url: "https://www.reliancefoundation.org",
    is_featured: true,
    documents_required: [
      "JEE/CET scorecard",
      "Income certificate",
      "College admission proof",
      "Aadhaar + PAN",
    ],
    eligibility_criteria: [
      "First year BTech/BE students",
      "Family income below ₹15 LPA",
      "Admitted through JEE/state CET",
    ],
  },
  {
    name: "Wipro Earthian Scholarship",
    provider: "Wipro Foundation",
    description:
      "Supports academically bright students from underprivileged backgrounds pursuing higher education.",
    amount: 75000,
    deadline: "2026-08-15",
    type: "private",
    category: "general",
    education_level: "undergraduate",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://www.wipro.com/corporate-responsibility",
    is_featured: false,
    documents_required: [
      "Income certificate",
      "Marksheets",
      "Essay on sustainability",
    ],
    eligibility_criteria: [
      "Enrolled in recognized UG college",
      "Demonstrated academic merit",
      "Interest in sustainability",
    ],
  },
  {
    name: "MOMA Scholarship (Minorities)",
    provider: "Ministry of Minority Affairs",
    description:
      "Pre-matric and post-matric scholarship scheme for students belonging to minority communities.",
    amount: 15000,
    deadline: "2026-10-31",
    type: "government",
    category: "general",
    education_level: "12th",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://scholarships.gov.in",
    is_featured: false,
    documents_required: [
      "Minority community certificate",
      "Income certificate",
      "Marksheet",
      "Aadhaar card",
    ],
    eligibility_criteria: [
      "Belongs to notified minority community",
      "Family income below ₹2 LPA",
      "Minimum 50% in previous exam",
    ],
  },
  {
    name: "Maharashtra State EBC Scholarship",
    provider: "Government of Maharashtra",
    description:
      "Scholarship for Economically Backward Class students from Maharashtra pursuing higher education.",
    amount: 40000,
    deadline: "2026-09-15",
    type: "government",
    category: "ews",
    education_level: "undergraduate",
    stream: null,
    state: "Maharashtra",
    country: "India",
    official_url: "https://mahadbt.maharashtra.gov.in",
    is_featured: false,
    documents_required: [
      "Domicile certificate",
      "Income certificate",
      "EBC certificate",
      "Class XII marksheet",
    ],
    eligibility_criteria: [
      "Domicile of Maharashtra",
      "EBC category",
      "Family income below ₹1 LPA",
    ],
  },
  {
    name: "Karnataka Vidyasiri Scholarship",
    provider: "Government of Karnataka",
    description:
      "Post-matric scholarship for SC/ST/OBC students from Karnataka state pursuing degree and PG courses.",
    amount: 30000,
    deadline: "2026-08-31",
    type: "government",
    category: "sc",
    education_level: "undergraduate",
    stream: null,
    state: "Karnataka",
    country: "India",
    official_url: "https://karepass.cgg.gov.in",
    is_featured: false,
    documents_required: [
      "Caste certificate",
      "Income certificate",
      "Karnataka domicile proof",
      "Marksheet",
    ],
    eligibility_criteria: [
      "SC/ST/OBC student",
      "Karnataka domicile",
      "Enrolled in government/aided college",
    ],
  },
  {
    name: "UGC NET-JRF Fellowship",
    provider: "University Grants Commission",
    description:
      "Junior Research Fellowship for candidates qualifying UGC NET exam, for pursuing PhD research.",
    amount: 372000,
    deadline: "2026-07-31",
    type: "government",
    category: "general",
    education_level: "phd",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://ugcnet.nta.nic.in",
    is_featured: true,
    documents_required: [
      "UGC NET scorecard",
      "PG degree certificate",
      "PhD admission letter",
    ],
    eligibility_criteria: [
      "Qualified UGC NET-JRF",
      "Masters degree with 55%+",
      "Age below 30 (relaxation for reserved categories)",
    ],
  },
  {
    name: "Commonwealth Scholarship (UK)",
    provider: "Commonwealth Scholarship Commission",
    description:
      "Fully funded master's and PhD scholarships for Indian students to study in the United Kingdom.",
    amount: 2500000,
    deadline: "2026-12-15",
    type: "international",
    category: "general",
    education_level: "postgraduate",
    stream: null,
    state: null,
    country: "United Kingdom",
    official_url: "https://cscuk.fcdo.gov.uk",
    is_featured: true,
    documents_required: [
      "Bachelor's degree certificate",
      "Academic transcripts",
      "English proficiency (IELTS)",
      "Research proposal (for PhD)",
      "References",
    ],
    eligibility_criteria: [
      "Indian citizen",
      "Bachelor's degree with 60%+",
      "IELTS 6.5+ overall",
      "Commitment to return to India",
    ],
  },
  {
    name: "IIT Bombay Merit-cum-Means Scholarship",
    provider: "Indian Institute of Technology Bombay",
    description:
      "University scholarship for undergraduate students at IIT Bombay based on merit and family income criteria.",
    amount: 100000,
    deadline: "2026-09-30",
    type: "university",
    category: "general",
    education_level: "undergraduate",
    stream: "Engineering",
    state: "Maharashtra",
    country: "India",
    official_url: "https://www.iitb.ac.in",
    is_featured: true,
    documents_required: [
      "Institute ID card",
      "Family income certificate",
      "Previous semester grade sheet",
      "Bank account details",
    ],
    eligibility_criteria: [
      "Currently enrolled at IIT Bombay",
      "Strong academic performance",
      "Family income as per institute norms",
    ],
  },
  {
    name: "University of Delhi Need-Based Financial Assistance",
    provider: "University of Delhi",
    description:
      "Financial aid support for eligible University of Delhi students from economically weaker backgrounds.",
    amount: 75000,
    deadline: "2026-10-15",
    type: "university",
    category: "ews",
    education_level: "undergraduate",
    stream: null,
    state: "Delhi",
    country: "India",
    official_url: "https://www.du.ac.in",
    is_featured: false,
    documents_required: [
      "University enrollment proof",
      "Income certificate",
      "Previous year marksheet",
      "Fee receipt",
    ],
    eligibility_criteria: [
      "Enrolled in University of Delhi",
      "Economically weaker background",
      "Satisfactory academic record",
    ],
  },
  {
    name: "National EWS School Scholarship (Class 10)",
    provider: "Ministry of Education, Government of India",
    description:
      "Government scholarship support for EWS students studying in Class 10 in recognized schools.",
    amount: 18000,
    deadline: "2026-09-10",
    type: "government",
    category: "ews",
    education_level: "10th",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://scholarships.gov.in",
    is_featured: false,
    documents_required: [
      "Class 9 marksheet",
      "Income certificate",
      "School bonafide certificate",
      "Aadhaar card",
    ],
    eligibility_criteria: [
      "Studying in Class 10",
      "Family belongs to EWS category",
      "Minimum 60% in previous class",
    ],
  },
  {
    name: "HDFC EWS Higher Secondary Scholarship",
    provider: "HDFC Bank Parivartan",
    description:
      "Private scholarship for EWS students pursuing Class 11 and 12 education.",
    amount: 25000,
    deadline: "2026-08-20",
    type: "private",
    category: "ews",
    education_level: "12th",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://www.hdfcbank.com",
    is_featured: false,
    documents_required: [
      "Class 10 marksheet",
      "Income certificate",
      "School enrollment proof",
      "Bank account details",
    ],
    eligibility_criteria: [
      "Studying in Class 11 or 12",
      "EWS category applicant",
      "Good academic performance",
    ],
  },
  {
    name: "University of Hyderabad EWS Postgraduate Grant",
    provider: "University of Hyderabad",
    description:
      "University-funded grant for EWS postgraduate students enrolled in full-time master's programmes.",
    amount: 90000,
    deadline: "2026-10-05",
    type: "university",
    category: "ews",
    education_level: "postgraduate",
    stream: null,
    state: "Telangana",
    country: "India",
    official_url: "https://uohyd.ac.in",
    is_featured: false,
    documents_required: [
      "PG admission letter",
      "Income certificate",
      "UG marksheets",
      "Fee receipt",
    ],
    eligibility_criteria: [
      "Enrolled in University of Hyderabad PG programme",
      "EWS certificate or income proof",
      "Meets university academic standards",
    ],
  },
  {
    name: "Erasmus Inclusion Scholarship for EWS Students",
    provider: "Erasmus+ Partner Universities",
    description:
      "International scholarship for EWS Indian students pursuing eligible postgraduate mobility programmes in Europe.",
    amount: 1200000,
    deadline: "2026-11-20",
    type: "international",
    category: "ews",
    education_level: "postgraduate",
    stream: null,
    state: null,
    country: "European Union",
    official_url: "https://erasmus-plus.ec.europa.eu",
    is_featured: true,
    documents_required: [
      "Bachelor's degree certificate",
      "Income certificate",
      "Statement of purpose",
      "English proficiency proof",
      "Recommendation letters",
    ],
    eligibility_criteria: [
      "Indian applicant from EWS background",
      "Eligible for Erasmus partner programme",
      "Admitted or applying to postgraduate track",
    ],
  },
  {
    name: "IISc EWS Doctoral Research Fellowship",
    provider: "Indian Institute of Science Bengaluru",
    description:
      "University doctoral fellowship for EWS candidates admitted to full-time PhD programmes at IISc.",
    amount: 420000,
    deadline: "2026-12-01",
    type: "university",
    category: "ews",
    education_level: "phd",
    stream: "Science",
    state: "Karnataka",
    country: "India",
    official_url: "https://www.iisc.ac.in",
    is_featured: true,
    documents_required: [
      "PhD admission offer",
      "Master's degree transcripts",
      "Income/EWS certificate",
      "Research proposal",
      "Identity proof",
    ],
    eligibility_criteria: [
      "Admitted to a PhD programme at IISc",
      "EWS category with valid certificate",
      "Meets institute research admission criteria",
    ],
  },
  {
    name: "OBC Pre-Matric Excellence Scholarship (Class 10)",
    provider: "Ministry of Social Justice & Empowerment",
    description:
      "Government scholarship for OBC students in Class 10 from low-income households.",
    amount: 20000,
    deadline: "2026-09-25",
    type: "government",
    category: "obc",
    education_level: "10th",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://scholarships.gov.in",
    is_featured: false,
    documents_required: [
      "Class 9 marksheet",
      "OBC certificate",
      "Income certificate",
      "School bonafide certificate",
    ],
    eligibility_criteria: [
      "Studying in Class 10",
      "Valid OBC certificate",
      "Family income within scheme limit",
    ],
  },
  {
    name: "Aditya Birla OBC Higher Secondary Scholarship",
    provider: "Aditya Birla Capital Foundation",
    description:
      "Private scholarship support for OBC students pursuing Class 11 and 12 studies.",
    amount: 28000,
    deadline: "2026-08-28",
    type: "private",
    category: "obc",
    education_level: "12th",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://www.adityabirlacapital.com",
    is_featured: false,
    documents_required: [
      "Class 10 marksheet",
      "OBC certificate",
      "Income proof",
      "School enrollment letter",
    ],
    eligibility_criteria: [
      "Studying in Class 11 or 12",
      "OBC category student",
      "Demonstrated academic merit",
    ],
  },
  {
    name: "JNU OBC Merit Scholarship",
    provider: "Jawaharlal Nehru University",
    description:
      "University scholarship for OBC undergraduate students with strong academic performance.",
    amount: 85000,
    deadline: "2026-10-10",
    type: "university",
    category: "obc",
    education_level: "undergraduate",
    stream: null,
    state: "Delhi",
    country: "India",
    official_url: "https://www.jnu.ac.in",
    is_featured: true,
    documents_required: [
      "University admission proof",
      "OBC certificate",
      "Previous semester marksheet",
      "Income certificate",
    ],
    eligibility_criteria: [
      "Enrolled in JNU UG programme",
      "Valid OBC certificate",
      "Meets university merit criteria",
    ],
  },
  {
    name: "ASEAN-India OBC Postgraduate Mobility Scholarship",
    provider: "ASEAN-India Academic Partnership",
    description:
      "International scholarship for OBC students pursuing eligible postgraduate programmes abroad.",
    amount: 1350000,
    deadline: "2026-11-05",
    type: "international",
    category: "obc",
    education_level: "postgraduate",
    stream: null,
    state: null,
    country: "Singapore",
    official_url: "https://www.studyinindia.gov.in",
    is_featured: false,
    documents_required: [
      "Bachelor's degree transcript",
      "OBC certificate",
      "Statement of purpose",
      "Language proficiency proof",
    ],
    eligibility_criteria: [
      "Indian OBC applicant",
      "Admission to eligible postgraduate programme",
      "Strong academic record",
    ],
  },
  {
    name: "IIT Madras OBC Doctoral Fellowship",
    provider: "Indian Institute of Technology Madras",
    description:
      "University-supported fellowship for OBC scholars enrolled in full-time PhD programmes.",
    amount: 450000,
    deadline: "2026-12-10",
    type: "university",
    category: "obc",
    education_level: "phd",
    stream: "Engineering",
    state: "Tamil Nadu",
    country: "India",
    official_url: "https://www.iitm.ac.in",
    is_featured: true,
    documents_required: [
      "PhD admission letter",
      "Master's degree documents",
      "OBC certificate",
      "Research proposal",
    ],
    eligibility_criteria: [
      "Admitted to IIT Madras PhD programme",
      "Valid OBC certificate",
      "Satisfies departmental research requirements",
    ],
  },
  {
    name: "Infosys Foundation Private Scholarship (Class 10)",
    provider: "Infosys Foundation",
    description:
      "Private scholarship support for meritorious Class 10 students from low-income families.",
    amount: 22000,
    deadline: "2026-09-12",
    type: "private",
    category: "general",
    education_level: "10th",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://www.infosys.com/infosys-foundation",
    is_featured: false,
    documents_required: [
      "Class 9 marksheet",
      "School bonafide certificate",
      "Income certificate",
      "Identity proof",
    ],
    eligibility_criteria: [
      "Studying in Class 10",
      "Minimum 65% in previous class",
      "Family income within scheme criteria",
    ],
  },
  {
    name: "L&T Build India Private Undergraduate Scholarship",
    provider: "Larsen & Toubro CSR",
    description:
      "Private scholarship for undergraduate students pursuing engineering and allied disciplines.",
    amount: 95000,
    deadline: "2026-10-20",
    type: "private",
    category: "general",
    education_level: "undergraduate",
    stream: "Engineering",
    state: null,
    country: "India",
    official_url: "https://www.larsentoubro.com",
    is_featured: true,
    documents_required: [
      "College admission proof",
      "Class XII marksheet",
      "Income certificate",
      "Bank account details",
    ],
    eligibility_criteria: [
      "Enrolled in undergraduate programme",
      "Strong academic record",
      "Meets sponsor income criteria",
    ],
  },
  {
    name: "Mahindra Rise Private Postgraduate Scholarship",
    provider: "Mahindra Group CSR",
    description:
      "Private scholarship for postgraduate students pursuing master's programmes in India.",
    amount: 130000,
    deadline: "2026-11-01",
    type: "private",
    category: "general",
    education_level: "postgraduate",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://www.mahindra.com",
    is_featured: false,
    documents_required: [
      "Bachelor's degree transcript",
      "PG admission letter",
      "Statement of purpose",
      "Income proof",
    ],
    eligibility_criteria: [
      "Admitted to a postgraduate programme",
      "Academic merit in undergraduate degree",
      "Demonstrated financial need",
    ],
  },
  {
    name: "Bharti Foundation Private Scholarship for SC Students",
    provider: "Bharti Foundation",
    description:
      "Private scholarship support for Scheduled Caste students pursuing higher education.",
    amount: 80000,
    deadline: "2026-10-08",
    type: "private",
    category: "sc",
    education_level: "undergraduate",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://www.bhartifoundation.org",
    is_featured: false,
    documents_required: [
      "SC certificate",
      "Admission proof",
      "Previous marksheet",
      "Income certificate",
    ],
    eligibility_criteria: [
      "Valid SC category certificate",
      "Enrolled in recognized undergraduate programme",
      "Meets scholarship merit and need criteria",
    ],
  },
  {
    name: "Azim Premji Private Scholarship for ST Students",
    provider: "Azim Premji Foundation",
    description:
      "Private financial aid for Scheduled Tribe students in undergraduate and diploma programmes.",
    amount: 85000,
    deadline: "2026-10-18",
    type: "private",
    category: "st",
    education_level: "undergraduate",
    stream: null,
    state: null,
    country: "India",
    official_url: "https://azimpremjifoundation.org",
    is_featured: false,
    documents_required: [
      "ST certificate",
      "College admission letter",
      "Income proof",
      "Identity document",
    ],
    eligibility_criteria: [
      "Valid ST category certificate",
      "Admitted to recognized institution",
      "Demonstrated financial need",
    ],
  },
  {
    name: "Chevening Inclusion Scholarship for SC Students",
    provider: "UK Foreign, Commonwealth & Development Office",
    description:
      "International postgraduate scholarship support for Indian SC category students pursuing master's study in the UK.",
    amount: 1800000,
    deadline: "2026-11-25",
    type: "international",
    category: "sc",
    education_level: "postgraduate",
    stream: null,
    state: null,
    country: "United Kingdom",
    official_url: "https://www.chevening.org",
    is_featured: true,
    documents_required: [
      "Bachelor's degree transcript",
      "SC certificate",
      "Statement of purpose",
      "English proficiency proof",
      "Recommendation letters",
    ],
    eligibility_criteria: [
      "Indian applicant with valid SC certificate",
      "Admitted or applying to eligible UK master's programme",
      "Strong academic and leadership profile",
    ],
  },
  {
    name: "DAAD Opportunity Scholarship for ST Students",
    provider: "German Academic Exchange Service (DAAD)",
    description:
      "International scholarship for Indian ST students applying to selected postgraduate programmes in Germany.",
    amount: 1600000,
    deadline: "2026-12-05",
    type: "international",
    category: "st",
    education_level: "postgraduate",
    stream: null,
    state: null,
    country: "Germany",
    official_url: "https://www.daad.de",
    is_featured: false,
    documents_required: [
      "Bachelor's degree certificate",
      "ST certificate",
      "CV and motivation letter",
      "Language proficiency proof",
    ],
    eligibility_criteria: [
      "Indian student with valid ST certificate",
      "Admission to eligible postgraduate programme",
      "Meets DAAD academic criteria",
    ],
  },
  {
    name: "Banaras Hindu University SC School Support Scholarship",
    provider: "Banaras Hindu University",
    description:
      "University scholarship for SC students in Class 10 under affiliated school support programmes.",
    amount: 22000,
    deadline: "2026-09-05",
    type: "university",
    category: "sc",
    education_level: "10th",
    stream: null,
    state: "Uttar Pradesh",
    country: "India",
    official_url: "https://www.bhu.ac.in",
    is_featured: false,
    documents_required: ["SC certificate", "Class 9 marksheet", "Income certificate", "School bonafide certificate"],
    eligibility_criteria: ["SC category student", "Studying in Class 10", "Meets university support scheme criteria"],
  },
  {
    name: "University of Madras ST School Merit Grant",
    provider: "University of Madras",
    description:
      "University-funded merit grant for ST students in Class 10 through outreach programmes.",
    amount: 22000,
    deadline: "2026-09-07",
    type: "university",
    category: "st",
    education_level: "10th",
    stream: null,
    state: "Tamil Nadu",
    country: "India",
    official_url: "https://www.unom.ac.in",
    is_featured: false,
    documents_required: ["ST certificate", "Class 9 marksheet", "Income proof", "Bonafide certificate"],
    eligibility_criteria: ["ST category student", "Studying in Class 10", "Academic merit in previous class"],
  },
  {
    name: "Panjab University SC Higher Secondary Scholarship",
    provider: "Panjab University",
    description:
      "Scholarship for SC students pursuing Class 11/12 in partner institutions supported by university funds.",
    amount: 30000,
    deadline: "2026-09-18",
    type: "university",
    category: "sc",
    education_level: "12th",
    stream: null,
    state: "Punjab",
    country: "India",
    official_url: "https://puchd.ac.in",
    is_featured: false,
    documents_required: ["SC certificate", "Class 10 marksheet", "Enrollment proof", "Income certificate"],
    eligibility_criteria: ["SC category", "Studying in Class 11 or 12", "Meets need-based criteria"],
  },
  {
    name: "Calcutta University ST Higher Secondary Scholarship",
    provider: "University of Calcutta",
    description:
      "University aid for ST students at higher secondary level through institutional support channels.",
    amount: 30000,
    deadline: "2026-09-20",
    type: "university",
    category: "st",
    education_level: "12th",
    stream: null,
    state: "West Bengal",
    country: "India",
    official_url: "https://www.caluniv.ac.in",
    is_featured: false,
    documents_required: ["ST certificate", "Class 10 marksheet", "School letter", "Income proof"],
    eligibility_criteria: ["ST category", "Class 11/12 student", "Satisfactory academic performance"],
  },
  {
    name: "Osmania University SC Undergraduate Merit Scholarship",
    provider: "Osmania University",
    description:
      "University scholarship for SC undergraduate students with strong academic performance.",
    amount: 90000,
    deadline: "2026-10-02",
    type: "university",
    category: "sc",
    education_level: "undergraduate",
    stream: null,
    state: "Telangana",
    country: "India",
    official_url: "https://www.osmania.ac.in",
    is_featured: true,
    documents_required: ["SC certificate", "Admission proof", "Previous marksheet", "Income certificate"],
    eligibility_criteria: ["SC category student", "Enrolled in UG programme", "Maintains minimum academic score"],
  },
  {
    name: "Savitribai Phule Pune University ST Undergraduate Grant",
    provider: "Savitribai Phule Pune University",
    description:
      "Need-cum-merit university grant for ST students in undergraduate degree programmes.",
    amount: 90000,
    deadline: "2026-10-04",
    type: "university",
    category: "st",
    education_level: "undergraduate",
    stream: null,
    state: "Maharashtra",
    country: "India",
    official_url: "http://www.unipune.ac.in",
    is_featured: true,
    documents_required: ["ST certificate", "UG admission letter", "Income proof", "Bank details"],
    eligibility_criteria: ["ST category student", "Pursuing undergraduate course", "Meets university norms"],
  },
  {
    name: "University of Kerala SC Postgraduate Fellowship",
    provider: "University of Kerala",
    description:
      "Postgraduate fellowship for SC students enrolled in master's programmes.",
    amount: 120000,
    deadline: "2026-10-22",
    type: "university",
    category: "sc",
    education_level: "postgraduate",
    stream: null,
    state: "Kerala",
    country: "India",
    official_url: "https://www.keralauniversity.ac.in",
    is_featured: false,
    documents_required: ["SC certificate", "PG admission proof", "UG transcript", "Income certificate"],
    eligibility_criteria: ["SC category", "Enrolled in postgraduate programme", "Academic merit and need basis"],
  },
  {
    name: "Anna University ST Postgraduate Fellowship",
    provider: "Anna University",
    description:
      "University postgraduate fellowship for ST students in engineering and allied disciplines.",
    amount: 120000,
    deadline: "2026-10-25",
    type: "university",
    category: "st",
    education_level: "postgraduate",
    stream: "Engineering",
    state: "Tamil Nadu",
    country: "India",
    official_url: "https://www.annauniv.edu",
    is_featured: false,
    documents_required: ["ST certificate", "PG admission letter", "UG marksheets", "Income proof"],
    eligibility_criteria: ["ST category", "Admitted in PG programme", "Meets departmental eligibility"],
  },
  {
    name: "Jawaharlal Nehru University SC Doctoral Fellowship",
    provider: "Jawaharlal Nehru University",
    description:
      "University fellowship for SC PhD scholars pursuing full-time research.",
    amount: 420000,
    deadline: "2026-12-12",
    type: "university",
    category: "sc",
    education_level: "phd",
    stream: null,
    state: "Delhi",
    country: "India",
    official_url: "https://www.jnu.ac.in",
    is_featured: true,
    documents_required: ["SC certificate", "PhD admission letter", "Research proposal", "Master's transcripts"],
    eligibility_criteria: ["SC category scholar", "Enrolled in PhD", "Approved research proposal"],
  },
  {
    name: "University of Mysore ST Doctoral Fellowship",
    provider: "University of Mysore",
    description:
      "Doctoral fellowship for ST researchers enrolled in full-time PhD programmes.",
    amount: 420000,
    deadline: "2026-12-15",
    type: "university",
    category: "st",
    education_level: "phd",
    stream: null,
    state: "Karnataka",
    country: "India",
    official_url: "https://uni-mysore.ac.in",
    is_featured: true,
    documents_required: ["ST certificate", "PhD registration proof", "Research synopsis", "Master's degree documents"],
    eligibility_criteria: ["ST category scholar", "Registered PhD candidate", "Fulfills university fellowship criteria"],
  },
];

const CATEGORIES = ["general", "obc", "sc", "st", "ews"] as const;
const TYPES = ["government", "private", "international", "university"] as const;
const EDUCATION_LEVELS = ["10th", "12th", "undergraduate", "postgraduate", "phd"] as const;

const LEVEL_LABELS: Record<(typeof EDUCATION_LEVELS)[number], string> = {
  "10th": "10th",
  "12th": "12th",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  phd: "PhD",
};

const LEVEL_AMOUNTS: Record<(typeof EDUCATION_LEVELS)[number], number> = {
  "10th": 20000,
  "12th": 30000,
  undergraduate: 100000,
  postgraduate: 140000,
  phd: 420000,
};

function titleCase(value: string): string {
  return value
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildCoverageScholarships(existing: typeof SCHOLARSHIPS) {
  const seen = new Set(
    existing.map((s) => `${s.category}|${s.type}|${s.education_level}`)
  );

  const generated: typeof SCHOLARSHIPS = [];

  for (const category of CATEGORIES) {
    for (const type of TYPES) {
      for (const level of EDUCATION_LEVELS) {
        const key = `${category}|${type}|${level}`;
        if (seen.has(key)) continue;

        const categoryLabel = category.toUpperCase();
        const typeLabel = titleCase(type);
        const levelLabel = LEVEL_LABELS[level];

        generated.push({
          name: `${typeLabel} ${categoryLabel} ${levelLabel} Scholarship`,
          provider: `${typeLabel} Scholarship Board`,
          description: `Scholarship support for ${categoryLabel} students at ${levelLabel} level under ${typeLabel.toLowerCase()} category.`,
          amount: LEVEL_AMOUNTS[level],
          deadline: "2026-12-31",
          type,
          category,
          education_level: level,
          stream: null,
          state: null,
          country: type === "international" ? "Global" : "India",
          official_url: "https://scholarships.gov.in",
          is_featured: false,
          documents_required: [
            `${categoryLabel} category certificate`,
            "Latest marksheet",
            "Income certificate",
            "Identity proof",
          ],
          eligibility_criteria: [
            `${categoryLabel} category applicant`,
            `Studying at ${levelLabel} level`,
            `Eligible under ${typeLabel.toLowerCase()} scholarship criteria`,
          ],
        });
      }
    }
  }

  return generated;
}

const COVERAGE_SCHOLARSHIPS = buildCoverageScholarships(SCHOLARSHIPS);
const ALL_SCHOLARSHIPS = [...SCHOLARSHIPS, ...COVERAGE_SCHOLARSHIPS];

async function seed() {
  console.log("🌱 Seeding scholarships...");

  // Clear existing data
  await pool.query("DELETE FROM scholarships");
  
  // Reset sequence
  await pool.query("ALTER SEQUENCE scholarships_id_seq RESTART WITH 1");

  for (const s of ALL_SCHOLARSHIPS) {
    await pool.query(
      `INSERT INTO scholarships
        (name, provider, description, amount, deadline, type, category,
         education_level, stream, state, country, official_url,
         is_featured, documents_required, eligibility_criteria)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        s.name,
        s.provider,
        s.description,
        s.amount,
        s.deadline,
        s.type,
        s.category,
        s.education_level,
        s.stream,
        s.state,
        s.country,
        s.official_url,
        s.is_featured,
        s.documents_required,
        s.eligibility_criteria,
      ]
    );
  }

  console.log(`✅ Seeded ${ALL_SCHOLARSHIPS.length} scholarships`);

  // ── Ensure default admin/test users exist (do not wipe existing users) ──

  const adminHash = await bcrypt.hash("admin123", 12);
  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ["Admin User", "admin@scholarhub.com", adminHash, "admin"]
  );

  const userHash = await bcrypt.hash("user123", 12);
  await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO NOTHING`,
    ["Test User", "user@scholarhub.com", userHash, "user"]
  );

  console.log("✅ Seeded admin + test user");
  await pool.end();
}

seed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
