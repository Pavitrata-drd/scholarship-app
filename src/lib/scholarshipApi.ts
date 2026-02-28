/**
 * ScholarshipAPI.com client
 * Free tier: 100 requests/day, core fields only
 * Docs: https://scholarshipapi.com/docs
 */

const BASE_URL = "https://api.scholarshipapi.com/v1";
const API_KEY = import.meta.env.VITE_SCHOLARSHIP_API_KEY ?? "";

// ── Types from ScholarshipAPI.com ──────────────────────────────

export interface ExternalScholarshipRaw {
    id: string;
    name: string;
    university: string;
    amount: number | null;
    currency: string | null;
    status: string | null;
    close_date: string | null;
    eligibility_summary: string | null;
    general_summary: string | null;
    url?: string | null;
}

export interface ExternalSearchResponse {
    data: ExternalScholarshipRaw[];
    meta?: {
        total: number;
        page: number;
        per_page: number;
    };
}

// ── Unified type for the UI ────────────────────────────────────

export interface UnifiedScholarship {
    id: string;
    name: string;
    provider: string;
    description: string | null;
    amount: number;
    deadline: string;
    type: "government" | "private" | "international" | "university";
    category: string | null;
    education_level: string | null;
    stream: string | null;
    state: string | null;
    country: string | null;
    official_url: string | null;
    is_featured: boolean | null;
    documents_required: string[] | null;
    eligibility_criteria: string[] | null;
    created_at: string | null;
    updated_at: string | null;
    // ── extra fields for source tracking ──
    source: "local" | "scholarshipapi";
    isExternal: boolean;
    currency?: string;
}

// ── API helpers ────────────────────────────────────────────────

export function isApiKeyConfigured(): boolean {
    return API_KEY.length > 0 && API_KEY !== "your-api-key-here";
}

export interface SearchParams {
    q?: string;
    status?: string;
    page?: number;
    per_page?: number;
}

export async function searchScholarships(
    params: SearchParams = {}
): Promise<ExternalScholarshipRaw[]> {
    if (!isApiKeyConfigured()) return [];

    const url = new URL(`${BASE_URL}/search`);
    if (params.q) url.searchParams.set("q", params.q);
    if (params.status) url.searchParams.set("status", params.status);
    if (params.page) url.searchParams.set("page", String(params.page));
    url.searchParams.set("per_page", String(params.per_page ?? 50));

    const res = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            Accept: "application/json",
        },
    });

    if (!res.ok) {
        console.warn(
            `[ScholarshipAPI] Request failed: ${res.status} ${res.statusText}`
        );
        return [];
    }

    const json: ExternalSearchResponse = await res.json();
    return json.data ?? [];
}

// ── Mapper: external → unified ─────────────────────────────────

export function toUnifiedScholarship(
    ext: ExternalScholarshipRaw
): UnifiedScholarship {
    return {
        id: `ext-${ext.id}`,
        name: ext.name,
        provider: ext.university ?? "ScholarshipAPI",
        description: ext.general_summary ?? ext.eligibility_summary ?? null,
        amount: ext.amount ?? 0,
        deadline: ext.close_date ?? new Date().toISOString(),
        type: "international" as const,
        category: null,
        education_level: null,
        stream: null,
        state: null,
        country: null,
        official_url: ext.url ?? null,
        is_featured: null,
        documents_required: null,
        eligibility_criteria: ext.eligibility_summary
            ? [ext.eligibility_summary]
            : null,
        created_at: null,
        updated_at: null,
        source: "scholarshipapi",
        isExternal: true,
        currency: ext.currency ?? "AUD",
    };
}
