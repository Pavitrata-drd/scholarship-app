/**
 * Gemini AI scholarship parser
 * Parses unstructured text into structured scholarship records.
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? "";

// ── Types ──────────────────────────────────────────────────────

export interface ParsedScholarship {
    name: string;
    provider: string;
    description: string;
    amount: number;
    deadline: string; // YYYY-MM-DD
    type: "government" | "private" | "international" | "university";
    education_level: "10th" | "12th" | "undergraduate" | "postgraduate" | "phd" | null;
    category: "general" | "obc" | "sc" | "st" | "ews" | null;
    stream: string | null;
    state: string | null;
    official_url: string | null;
    // UI-only fields
    _valid: boolean;
    _selected: boolean;
    _error?: string;
}

// ── Gemini AI parser ───────────────────────────────────────────

export function isGeminiConfigured(): boolean {
    return API_KEY.length > 0 && API_KEY !== "your-gemini-api-key-here";
}

const SYSTEM_PROMPT = `You are a scholarship data extraction assistant. Given raw text about scholarships (from websites, emails, PDFs, or any other source), extract EVERY scholarship mentioned into a structured JSON array.

For each scholarship, extract these fields:
- name (string, required): The scholarship name
- provider (string, required): The organization offering it
- description (string): A brief description
- amount (number, required): The scholarship amount in INR. If given in lakhs, convert to rupees (1 lakh = 100000). If no amount is mentioned, use 0.
- deadline (string, required): In YYYY-MM-DD format. If only month/year given, use last day of that month. If no deadline is mentioned, use "2025-12-31".
- type (string): One of "government", "private", "international", "university". Infer from the provider name.
- education_level (string or null): One of "10th", "12th", "undergraduate", "postgraduate", "phd", or null
- category (string or null): One of "general", "obc", "sc", "st", "ews", or null. Only set if explicitly mentioned.
- stream (string or null): e.g. "Engineering", "Medical", "Arts", "Commerce", "Science", "Law", "Management"
- state (string or null): Indian state name if mentioned
- official_url (string or null): URL if mentioned

IMPORTANT RULES:
1. Return ONLY a valid JSON array, no markdown, no explanation, no code blocks.
2. Extract ALL scholarships found, even partial info.
3. Be smart about inferring fields from context.
4. If text mentions multiple scholarships, return multiple objects.
5. Amount should always be a number (not a string).`;

export async function parseScholarshipsWithAI(
    rawText: string
): Promise<ParsedScholarship[]> {
    if (!isGeminiConfigured()) {
        throw new Error("Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
        { text: SYSTEM_PROMPT },
        { text: `Extract scholarships from this text:\n\n${rawText}` },
    ]);

    const responseText = result.response.text().trim();

    // Strip markdown code block if Gemini wraps it
    const jsonStr = responseText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonStr);
    } catch {
        throw new Error("AI returned invalid JSON. Please try rephrasing or simplifying the input text.");
    }

    if (!Array.isArray(parsed)) {
        throw new Error("AI returned unexpected format. Expected an array of scholarships.");
    }

    return parsed.map((item) => validateAndNormalize(item as Record<string, unknown>));
}

// ── CSV parser (non-AI fallback) ───────────────────────────────

export function parseCSV(csvText: string): ParsedScholarship[] {
    const lines = csvText.trim().split("\n");
    if (lines.length < 2) throw new Error("CSV must have a header row and at least one data row.");

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/\s+/g, "_"));

    const required = ["name", "provider", "amount", "deadline"];
    const missing = required.filter((r) => !headers.includes(r));
    if (missing.length > 0) {
        throw new Error(`CSV is missing required columns: ${missing.join(", ")}. Required: name, provider, amount, deadline`);
    }

    return lines.slice(1).filter((line) => line.trim()).map((line) => {
        const values = parseCSVLine(line);
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
            row[h] = values[i]?.trim() ?? "";
        });

        return validateAndNormalize({
            name: row.name,
            provider: row.provider,
            description: row.description || "",
            amount: Number(row.amount) || 0,
            deadline: row.deadline || "",
            type: row.type || "government",
            education_level: row.education_level || null,
            category: row.category || null,
            stream: row.stream || null,
            state: row.state || null,
            official_url: row.official_url || row.url || null,
        });
    });
}

// Simple CSV line parser that handles quoted fields
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// ── Validation ─────────────────────────────────────────────────

const VALID_TYPES = ["government", "private", "international", "university"] as const;
const VALID_LEVELS = ["10th", "12th", "undergraduate", "postgraduate", "phd"] as const;
const VALID_CATEGORIES = ["general", "obc", "sc", "st", "ews"] as const;

function asString(value: unknown): string {
    if (typeof value === "string") return value;
    if (value === null || value === undefined) return "";
    return String(value);
}

function asNullableString(value: unknown): string | null {
    const str = asString(value).trim();
    return str.length > 0 ? str : null;
}

function validateAndNormalize(raw: Record<string, unknown>): ParsedScholarship {
    const errors: string[] = [];

    const name = asString(raw.name).trim();
    const provider = asString(raw.provider).trim();
    const amount = Number(raw.amount) || 0;
    const deadline = normalizeDate(raw.deadline);

    if (!name) errors.push("Missing name");
    if (!provider) errors.push("Missing provider");
    if (!deadline) errors.push("Invalid deadline");

    const rawType = asString(raw.type || "government").toLowerCase();
    const type: ParsedScholarship["type"] = (VALID_TYPES as readonly string[]).includes(rawType)
        ? (rawType as ParsedScholarship["type"])
        : "government";

    const rawLevel = raw.education_level ? asString(raw.education_level).toLowerCase() : "";
    const education_level: ParsedScholarship["education_level"] =
        rawLevel && (VALID_LEVELS as readonly string[]).includes(rawLevel)
            ? (rawLevel as ParsedScholarship["education_level"])
            : null;

    const rawCategory = raw.category ? asString(raw.category).toLowerCase() : "";
    const category: ParsedScholarship["category"] =
        rawCategory && (VALID_CATEGORIES as readonly string[]).includes(rawCategory)
            ? (rawCategory as ParsedScholarship["category"])
            : null;

    return {
        name,
        provider,
        description: asString(raw.description).trim(),
        amount,
        deadline: deadline || "2025-12-31",
        type,
        education_level,
        category,
        stream: asNullableString(raw.stream),
        state: asNullableString(raw.state),
        official_url: asNullableString(raw.official_url),
        _valid: errors.length === 0,
        _selected: true,
        _error: errors.length > 0 ? errors.join(", ") : undefined,
    };
}

function normalizeDate(input: unknown): string | null {
    if (!input) return null;
    const str = String(input).trim();

    // Already YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    // Try parsing with Date
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
        return d.toISOString().split("T")[0];
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const match = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (match) {
        const [, day, month, year] = match;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return null;
}
