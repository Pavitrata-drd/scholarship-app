import { z } from "zod";

/**  Zod schemas for request validation */

export const scholarshipCreateSchema = z.object({
  name: z.string().min(2).max(300),
  provider: z.string().min(2).max(300),
  description: z.string().optional().default(""),
  amount: z.coerce.number().min(0).default(0),
  currency: z.string().max(10).optional().default("INR"),
  deadline: z.string().optional(), // YYYY-MM-DD
  type: z.enum(["government", "private", "international", "university"]).default("government"),
  category: z.enum(["general", "obc", "sc", "st", "ews"]).nullable().optional(),
  education_level: z.enum(["10th", "12th", "undergraduate", "postgraduate", "phd"]).nullable().optional(),
  stream: z.string().max(100).nullable().optional(),
  state: z.string().max(100).nullable().optional(),
  country: z.string().max(100).optional().default("India"),
  official_url: z.string().url().nullable().optional(),
  is_featured: z.boolean().optional().default(false),
  documents_required: z.array(z.string()).nullable().optional(),
  eligibility_criteria: z.array(z.string()).nullable().optional(),
});

export const scholarshipUpdateSchema = scholarshipCreateSchema.partial();

export const scholarshipQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(["government", "private", "international", "university"]).optional(),
  category: z.enum(["general", "obc", "sc", "st", "ews"]).optional(),
  education_level: z.enum(["10th", "12th", "undergraduate", "postgraduate", "phd"]).optional(),
  state: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  sort: z.enum(["deadline", "amount", "name", "created_at"]).optional().default("deadline"),
  order: z.enum(["asc", "desc"]).optional().default("asc"),
});

export type ScholarshipCreate = z.infer<typeof scholarshipCreateSchema>;
export type ScholarshipUpdate = z.infer<typeof scholarshipUpdateSchema>;
export type ScholarshipQuery = z.infer<typeof scholarshipQuerySchema>;
