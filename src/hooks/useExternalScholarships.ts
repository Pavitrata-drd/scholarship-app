import { useQuery } from "@tanstack/react-query";
import {
    searchScholarships,
    toUnifiedScholarship,
    isApiKeyConfigured,
    type UnifiedScholarship,
} from "@/lib/scholarshipApi";

/**
 * Fetches scholarships from ScholarshipAPI.com and returns them
 * as UnifiedScholarship[]. Gracefully returns [] if the API key
 * is not configured or the request fails.
 *
 * staleTime is 5 min to minimise calls (free tier = 100/day).
 */
export function useExternalScholarships(searchTerm = "") {
    return useQuery<UnifiedScholarship[]>({
        queryKey: ["external-scholarships", searchTerm],
        queryFn: async () => {
            const raw = await searchScholarships({
                q: searchTerm || undefined,
                per_page: 50,
            });
            return raw.map(toUnifiedScholarship);
        },
        enabled: isApiKeyConfigured(),
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
    });
}
