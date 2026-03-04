/**
 * Frontend API client — talks to our Express backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// ── Types matching the DB schema ────────────────────────────────

export interface Scholarship {
  id: number;
  name: string;
  provider: string;
  description: string | null;
  amount: number;
  currency: string;
  deadline: string;
  type: "government" | "private" | "international" | "university";
  category: string | null;
  education_level: string | null;
  stream: string | null;
  state: string | null;
  country: string | null;
  official_url: string | null;
  is_featured: boolean;
  documents_required: string[] | null;
  eligibility_criteria: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ScholarshipListResponse {
  data: Scholarship[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ScholarshipStatsResponse {
  data: {
    total_scholarships: number;
    total_funding: number;
    total_providers: number;
    active_scholarships: number;
  };
}

export interface ScholarshipFilters {
  search?: string;
  type?: string;
  category?: string;
  education_level?: string;
  state?: string;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// ── Auth types ──────────────────────────────────────────────────

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: "user" | "admin";
  created_at: string;
}

export interface AuthResponse {
  data: {
    user: User;
    token: string;
  };
}

// ── Helper ──────────────────────────────────────────────────────

function getToken(): string | null {
  return localStorage.getItem("scholarhub_token");
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `API error ${res.status}`);
  }

  return res.json();
}

// ── Auth endpoints ──────────────────────────────────────────────

export function loginApi(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function registerApi(full_name: string, email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ full_name, email, password }),
  });
}

export function fetchMe() {
  return apiFetch<{ data: User }>("/auth/me");
}

// ── Scholarship endpoints ───────────────────────────────────────

export function fetchScholarships(filters: ScholarshipFilters = {}) {
  const params = new URLSearchParams();
  if (filters.search) params.set("search", filters.search);
  if (filters.type) params.set("type", filters.type);
  if (filters.category) params.set("category", filters.category);
  if (filters.education_level) params.set("education_level", filters.education_level);
  if (filters.state) params.set("state", filters.state);
  if (filters.featured !== undefined) params.set("featured", String(filters.featured));
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.order) params.set("order", filters.order);

  const qs = params.toString();
  return apiFetch<ScholarshipListResponse>(`/scholarships${qs ? `?${qs}` : ""}`);
}

export function fetchFeaturedScholarships() {
  return apiFetch<{ data: Scholarship[] }>("/scholarships/featured");
}

export function fetchScholarshipStats() {
  return apiFetch<ScholarshipStatsResponse>("/scholarships/stats");
}

export function fetchScholarship(id: number | string) {
  return apiFetch<{ data: Scholarship }>(`/scholarships/${id}`);
}

export function createScholarship(body: Partial<Scholarship>) {
  return apiFetch<{ data: Scholarship }>("/scholarships", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateScholarship(id: number | string, body: Partial<Scholarship>) {
  return apiFetch<{ data: Scholarship }>(`/scholarships/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteScholarship(id: number | string) {
  return apiFetch<{ message: string; id: number }>(`/scholarships/${id}`, {
    method: "DELETE",
  });
}

// ── Profile endpoints ───────────────────────────────────────────

export interface UserProfile {
  id: number;
  user_id: number;
  full_name?: string;
  email?: string;
  email_verified?: boolean;
  education_level: string | null;
  category: string | null;
  stream: string | null;
  state: string | null;
  country: string | null;
  institution: string | null;
  marks: number | null;
  family_income: number | null;
  gender: string | null;
  dob: string | null;
  disability: boolean;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

export function fetchProfile() {
  return apiFetch<{ data: UserProfile }>("/profile");
}

export function updateProfile(body: Partial<UserProfile>) {
  return apiFetch<{ data: UserProfile }>("/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export interface RecommendedScholarship extends Scholarship {
  match_score: number;
}

export function fetchRecommendations() {
  return apiFetch<{ data: RecommendedScholarship[] }>("/profile/recommendations");
}

// ── Saved / Bookmark endpoints ──────────────────────────────────

export interface SavedScholarship extends Scholarship {
  saved_at: string;
}

export function fetchSavedScholarships() {
  return apiFetch<{ data: SavedScholarship[] }>("/saved");
}

export function saveScholarship(scholarship_id: number) {
  return apiFetch<{ data: { user_id: number; scholarship_id: number; saved_at: string } }>("/saved", {
    method: "POST",
    body: JSON.stringify({ scholarship_id }),
  });
}

export function unsaveScholarship(scholarship_id: number) {
  return apiFetch<{ message: string }>(`/saved/${scholarship_id}`, {
    method: "DELETE",
  });
}

export function checkSaved(scholarship_id: number) {
  return apiFetch<{ saved: boolean }>(`/saved/check/${scholarship_id}`);
}

// ── Application Tracker endpoints ───────────────────────────────

export type ApplicationStatus = "interested" | "applied" | "under_review" | "accepted" | "rejected";

export interface Application {
  id: number;
  user_id: number;
  scholarship_id: number;
  status: ApplicationStatus;
  notes: string | null;
  scholarship_name: string;
  provider: string;
  amount: number;
  deadline: string;
  type: string;
  official_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface TimelineEntry {
  id: number;
  application_id: number;
  status: string;
  note: string | null;
  created_at: string;
}

export function fetchApplications() {
  return apiFetch<{ data: Application[] }>("/applications");
}

export function createApplication(scholarship_id: number, status: ApplicationStatus = "interested", notes = "") {
  return apiFetch<{ data: Application }>("/applications", {
    method: "POST",
    body: JSON.stringify({ scholarship_id, status, notes }),
  });
}

export function updateApplication(id: number, body: { status?: ApplicationStatus; notes?: string }) {
  return apiFetch<{ data: Application }>(`/applications/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function fetchTimeline(applicationId: number) {
  return apiFetch<{ data: TimelineEntry[] }>(`/applications/${applicationId}/timeline`);
}

export function deleteApplication(id: number) {
  return apiFetch<{ message: string }>(`/applications/${id}`, {
    method: "DELETE",
  });
}

// ── Document Vault endpoints ────────────────────────────────────

export interface Document {
  id: number;
  user_id: number;
  name: string;
  doc_type: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

export function fetchDocuments() {
  return apiFetch<{ data: Document[] }>("/documents");
}

export async function uploadDocument(file: File, doc_type: string) {
  const token = getToken();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("doc_type", doc_type);

  const res = await fetch(`${API_BASE}/documents`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Upload failed ${res.status}`);
  }
  return res.json() as Promise<{ data: Document }>;
}

export function deleteDocument(id: number) {
  return apiFetch<{ message: string }>(`/documents/${id}`, {
    method: "DELETE",
  });
}

export function getDocumentDownloadUrl(id: number) {
  const token = getToken();
  return `${API_BASE}/documents/${id}/download?token=${token}`;
}

// ── Notification endpoints ──────────────────────────────────────

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string | null;
  type: "info" | "deadline" | "status" | "system";
  scholarship_id: number | null;
  scholarship_name: string | null;
  is_read: boolean;
  created_at: string;
}

export function fetchNotifications() {
  return apiFetch<{ data: Notification[] }>("/notifications");
}

export function fetchUnreadCount() {
  return apiFetch<{ count: number }>("/notifications/unread-count");
}

export function markNotificationRead(id: number) {
  return apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: "PUT" });
}

export function markAllNotificationsRead() {
  return apiFetch<{ message: string }>("/notifications/read-all", { method: "PUT" });
}

export function generateDeadlineReminders() {
  return apiFetch<{ data: Notification[]; generated: number }>(
    "/notifications/generate-deadline-reminders",
    { method: "POST" }
  );
}

// ── Auth: Email Verification & Password Reset ───────────────────

export function sendVerifyOtp() {
  return apiFetch<{ message: string; _dev_otp?: string }>("/auth/send-verify-otp", {
    method: "POST",
  });
}

export function verifyEmail(otp: string) {
  return apiFetch<{ message: string }>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ otp }),
  });
}

export function forgotPassword(email: string) {
  return apiFetch<{ message: string; _dev_otp?: string }>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(email: string, otp: string, new_password: string) {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, new_password }),
  });
}

// ── Admin Analytics endpoint ────────────────────────────────────

export interface AnalyticsData {
  registrations: { date: string; count: number }[];
  typeDistribution: { type: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
  applicationStats: { status: string; count: number }[];
  popularScholarships: { id: number; name: string; provider: string; save_count: number }[];
  totals: {
    total_users: number;
    new_users_7d: number;
    total_scholarships: number;
    total_applications: number;
    total_saves: number;
    total_documents: number;
  };
  educationStats: { education_level: string; count: number }[];
  applicationsOverTime: { date: string; count: number }[];
}

export function fetchAnalytics() {
  return apiFetch<{ data: AnalyticsData }>("/admin/analytics");
}

export function fetchAdminUsers(page = 1) {
  return apiFetch<{ data: User[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
    `/admin/users?page=${page}`
  );
}
