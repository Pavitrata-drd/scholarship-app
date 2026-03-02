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
];

async function seed() {
  console.log("🌱 Seeding scholarships...");

  // Clear existing data
  await pool.query("DELETE FROM scholarships");
  
  // Reset sequence
  await pool.query("ALTER SEQUENCE scholarships_id_seq RESTART WITH 1");

  for (const s of SCHOLARSHIPS) {
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

  console.log(`✅ Seeded ${SCHOLARSHIPS.length} scholarships`);

  // ── Seed admin user ────────────────────────────────────────
  await pool.query("DELETE FROM users");
  await pool.query("ALTER SEQUENCE users_id_seq RESTART WITH 1");

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
