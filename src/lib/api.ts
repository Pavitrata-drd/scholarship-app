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
