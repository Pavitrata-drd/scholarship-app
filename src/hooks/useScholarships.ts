import { useQuery } from "@tanstack/react-query";
import {
  fetchScholarships,
  fetchFeaturedScholarships,
  fetchScholarshipStats,
  fetchScholarship,
  type ScholarshipFilters,
} from "@/lib/api";

export function useScholarships(filters: ScholarshipFilters = {}) {
  return useQuery({
    queryKey: ["scholarships", filters],
    queryFn: () => fetchScholarships(filters),
  });
}

export function useFeaturedScholarships() {
  return useQuery({
    queryKey: ["scholarships", "featured"],
    queryFn: fetchFeaturedScholarships,
    staleTime: 5 * 60 * 1000,
  });
}

export function useScholarshipStats() {
  return useQuery({
    queryKey: ["scholarships", "stats"],
    queryFn: fetchScholarshipStats,
    staleTime: 5 * 60 * 1000,
  });
}

export function useScholarship(id: number | string) {
  return useQuery({
    queryKey: ["scholarship", id],
    queryFn: () => fetchScholarship(id),
    enabled: !!id,
  });
}
