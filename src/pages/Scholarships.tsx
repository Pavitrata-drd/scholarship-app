import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  List,
  GraduationCap,
  Calendar,
  IndianRupee,
  ArrowLeft,
  Loader2,
  Filter,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import Navbar from "@/components/landing/Navbar";
import { useScholarships } from "@/hooks/useScholarships";
import type { Scholarship } from "@/lib/api";

const Scholarships = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  // Debounced search term for API
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isLoading, isError } = useScholarships({
    search: debouncedSearch || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    category: categoryFilter !== "all" ? categoryFilter : undefined,
    education_level: levelFilter !== "all" ? levelFilter : undefined,
    page,
    limit: 20,
  });

  const scholarships = data?.data ?? [];
  const meta = data?.meta;

  const ScholarshipCard = ({ s }: { s: Scholarship }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">{s.name}</CardTitle>
        <p className="text-xs text-muted-foreground">{s.provider}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {s.description}
        </p>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 font-semibold">
            <IndianRupee className="h-3.5 w-3.5" />
            ₹{Number(s.amount).toLocaleString("en-IN")}
          </span>
          {s.deadline && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(s.deadline), "dd MMM yyyy")}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {s.education_level && (
            <Badge variant="outline">{s.education_level}</Badge>
          )}
          {s.category && <Badge variant="outline">{s.category}</Badge>}
          <Badge variant="secondary">{s.type}</Badge>
        </div>
      </CardContent>
    </Card>
  );

  const ScholarshipRow = ({ s }: { s: Scholarship }) => (
    <Card>
      <CardContent className="flex justify-between p-4">
        <div>
          <h3 className="font-semibold">{s.name}</h3>
          <p className="text-xs text-muted-foreground">{s.provider}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-semibold">
            <IndianRupee className="h-3.5 w-3.5" />
            ₹{Number(s.amount).toLocaleString("en-IN")}
          </span>
          {s.deadline && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              {format(new Date(s.deadline), "dd MMM")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Scholarships</h1>
            <p className="text-sm text-muted-foreground">
              {meta ? `${meta.total} scholarships found` : "Loading…"}
            </p>
          </div>
        </div>

        {/* Search + view toggle */}
        <div className="mb-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search scholarships…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>

          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-muted-foreground" />

          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="private">Private</SelectItem>
              <SelectItem value="international">International</SelectItem>
              <SelectItem value="university">University</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="obc">OBC</SelectItem>
              <SelectItem value="sc">SC</SelectItem>
              <SelectItem value="st">ST</SelectItem>
              <SelectItem value="ews">EWS</SelectItem>
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={(v) => { setLevelFilter(v); setPage(1); }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Education Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="10th">10th Standard</SelectItem>
              <SelectItem value="12th">12th Standard</SelectItem>
              <SelectItem value="undergraduate">Undergraduate</SelectItem>
              <SelectItem value="postgraduate">Postgraduate</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear filters */}
          {(typeFilter !== "all" || categoryFilter !== "all" || levelFilter !== "all" || search) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTypeFilter("all");
                setCategoryFilter("all");
                setLevelFilter("all");
                setSearch("");
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="text-center py-20 text-destructive">
            Failed to load scholarships. Is the backend running?
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && scholarships.length === 0 && (
          <div className="text-center py-20">
            <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">No scholarships found</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !isError && scholarships.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {scholarships.map((s) => (
                  <ScholarshipCard key={s.id} s={s} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {scholarships.map((s) => (
                  <ScholarshipRow key={s.id} s={s} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {meta.page} of {meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Scholarships;