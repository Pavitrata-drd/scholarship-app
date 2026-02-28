import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, LayoutGrid, List, GraduationCap, Calendar, IndianRupee, ExternalLink, X, ArrowLeft, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import Navbar from "@/components/landing/Navbar";
import { useExternalScholarships } from "@/hooks/useExternalScholarships";
import { isApiKeyConfigured, type UnifiedScholarship } from "@/lib/scholarshipApi";

type Scholarship = Database["public"]["Tables"]["scholarships"]["Row"];
type EducationLevel = Database["public"]["Enums"]["education_level"];
type CategoryType = Database["public"]["Enums"]["category_type"];
type ScholarshipType = Database["public"]["Enums"]["scholarship_type"];

const EDUCATION_LEVELS: { value: EducationLevel; label: string }[] = [
  { value: "10th", label: "10th Standard" },
  { value: "12th", label: "12th Standard" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "phd", label: "PhD" },
];

const CATEGORIES: { value: CategoryType; label: string }[] = [
  { value: "general", label: "General" },
  { value: "obc", label: "OBC" },
  { value: "sc", label: "SC" },
  { value: "st", label: "ST" },
  { value: "ews", label: "EWS" },
];

const TYPES: { value: ScholarshipType; label: string }[] = [
  { value: "government", label: "Government" },
  { value: "private", label: "Private" },
  { value: "international", label: "International" },
  { value: "university", label: "University" },
];

const STREAMS = ["Engineering", "Medical", "Arts", "Commerce", "Science", "Law", "Management", "Other"];

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
];

const TYPE_COLORS: Record<ScholarshipType, string> = {
  government: "bg-primary/10 text-primary",
  private: "bg-accent/10 text-accent",
  international: "bg-[hsl(var(--scholar-gold))]/10 text-[hsl(var(--scholar-gold))]",
  university: "bg-[hsl(var(--scholar-success))]/10 text-[hsl(var(--scholar-success))]",
};

type SourceFilter = "all" | "local" | "scholarshipapi";

const Scholarships = () => {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [educationLevel, setEducationLevel] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [stream, setStream] = useState<string>("all");
  const [state, setState] = useState<string>("all");
  const [amountRange, setAmountRange] = useState<number[]>([0]);
  const [deadlineFilter, setDeadlineFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>("all");

  // ── Local (Supabase) scholarships ────────────────────────────
  const { data: scholarships, isLoading } = useQuery({
    queryKey: ["scholarships"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("scholarships")
        .select("*")
        .order("deadline", { ascending: true });
      if (error) throw error;
      return data as Scholarship[];
    },
  });

  // ── External (ScholarshipAPI.com) scholarships ───────────────
  const {
    data: externalScholarships,
    isLoading: externalLoading,
  } = useExternalScholarships(search);

  const apiConfigured = isApiKeyConfigured();

  // ── Merge into unified list ──────────────────────────────────
  const allScholarships = useMemo<UnifiedScholarship[]>(() => {
    const local: UnifiedScholarship[] = (scholarships ?? []).map((s) => ({
      ...s,
      source: "local" as const,
      isExternal: false,
    }));
    const external: UnifiedScholarship[] = externalScholarships ?? [];
    return [...local, ...external];
  }, [scholarships, externalScholarships]);

  const maxAmount = useMemo(() => {
    if (!allScholarships.length) return 500000;
    return Math.max(...allScholarships.map((s) => s.amount));
  }, [allScholarships]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (educationLevel !== "all") count++;
    if (category !== "all") count++;
    if (type !== "all") count++;
    if (stream !== "all") count++;
    if (state !== "all") count++;
    if (amountRange[0] > 0) count++;
    if (deadlineFilter !== "all") count++;
    if (sourceFilter !== "all") count++;
    return count;
  }, [educationLevel, category, type, stream, state, amountRange, deadlineFilter, sourceFilter]);

  const filtered = useMemo(() => {
    return allScholarships.filter((s) => {
      // Source filter
      if (sourceFilter !== "all" && s.source !== sourceFilter) return false;
      // Text search
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.provider.toLowerCase().includes(search.toLowerCase())) return false;
      // Only apply Supabase-specific filters to local scholarships, external ones pass through
      if (!s.isExternal) {
        if (educationLevel !== "all" && s.education_level !== educationLevel) return false;
        if (category !== "all" && s.category !== category) return false;
        if (type !== "all" && s.type !== type) return false;
        if (stream !== "all" && s.stream !== stream) return false;
        if (state !== "all" && s.state !== state) return false;
      }
      if (amountRange[0] > 0 && s.amount < amountRange[0]) return false;
      if (deadlineFilter !== "all") {
        const now = new Date();
        const deadline = new Date(s.deadline);
        if (deadlineFilter === "week" && deadline > new Date(now.getTime() + 7 * 86400000)) return false;
        if (deadlineFilter === "month" && deadline > new Date(now.getTime() + 30 * 86400000)) return false;
        if (deadlineFilter === "3months" && deadline > new Date(now.getTime() + 90 * 86400000)) return false;
      }
      return true;
    });
  }, [allScholarships, search, educationLevel, category, type, stream, state, amountRange, deadlineFilter, sourceFilter]);

  const clearFilters = () => {
    setEducationLevel("all");
    setCategory("all");
    setType("all");
    setStream("all");
    setState("all");
    setAmountRange([0]);
    setDeadlineFilter("all");
    setSourceFilter("all");
  };

  // ── Counts for source tabs ───────────────────────────────────
  const localCount = allScholarships.filter((s) => s.source === "local").length;
  const externalCount = allScholarships.filter((s) => s.source === "scholarshipapi").length;

  const FilterPanel = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-foreground">Filters</h3>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-muted-foreground">
            <X className="mr-1 h-3 w-3" /> Clear all
          </Button>
        )}
      </div>

      {/* Source filter */}
      {apiConfigured && (
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Source</label>
          <Select value={sourceFilter} onValueChange={(v) => setSourceFilter(v as SourceFilter)}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sources</SelectItem>
              <SelectItem value="local">Local (Curated)</SelectItem>
              <SelectItem value="scholarshipapi">ScholarshipAPI</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Education Level</label>
        <Select value={educationLevel} onValueChange={setEducationLevel}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {EDUCATION_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Type</label>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Stream</label>
        <Select value={stream} onValueChange={setStream}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Streams</SelectItem>
            {STREAMS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">State</label>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {INDIAN_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">
          Min Amount: ₹{amountRange[0].toLocaleString("en-IN")}
        </label>
        <Slider value={amountRange} onValueChange={setAmountRange} max={maxAmount} step={5000} className="mt-2" />
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground">Deadline</label>
        <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any time</SelectItem>
            <SelectItem value="week">Within 1 week</SelectItem>
            <SelectItem value="month">Within 1 month</SelectItem>
            <SelectItem value="3months">Within 3 months</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const formatAmount = (s: UnifiedScholarship) => {
    if (s.isExternal && s.currency && s.currency !== "INR") {
      return `${s.currency} ${s.amount.toLocaleString()}`;
    }
    return `₹${s.amount.toLocaleString("en-IN")}`;
  };

  const ScholarshipCard = ({ s }: { s: UnifiedScholarship }) => (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold leading-tight line-clamp-2">{s.name}</CardTitle>
          <div className="flex shrink-0 gap-1">
            {s.isExternal && (
              <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Globe className="mr-0.5 h-2.5 w-2.5" /> API
              </Badge>
            )}
            <Badge variant="secondary" className={`text-[10px] ${TYPE_COLORS[s.type]}`}>
              {s.type}
            </Badge>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{s.provider}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
        <div className="flex flex-wrap gap-1.5">
          {s.education_level && <Badge variant="outline" className="text-[10px]">{s.education_level}</Badge>}
          {s.category && <Badge variant="outline" className="text-[10px]">{s.category.toUpperCase()}</Badge>}
          {s.stream && <Badge variant="outline" className="text-[10px]">{s.stream}</Badge>}
          {s.state && <Badge variant="outline" className="text-[10px]">{s.state}</Badge>}
          {s.isExternal && s.currency && s.currency !== "INR" && (
            <Badge variant="outline" className="text-[10px]">{s.currency}</Badge>
          )}
        </div>
        <Separator />
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            {!s.isExternal && <IndianRupee className="h-3.5 w-3.5" />}
            {formatAmount(s)}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(s.deadline), "dd MMM yyyy")}
          </span>
        </div>
        {s.official_url && (
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href={s.official_url} target="_blank" rel="noopener noreferrer">
              View Details <ExternalLink className="ml-1.5 h-3 w-3" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );

  const ScholarshipRow = ({ s }: { s: UnifiedScholarship }) => (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{s.name}</h3>
            {s.isExternal && (
              <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">
                <Globe className="mr-0.5 h-2.5 w-2.5" /> API
              </Badge>
            )}
            <Badge variant="secondary" className={`text-[10px] ${TYPE_COLORS[s.type]}`}>{s.type}</Badge>
          </div>
          <p className="text-xs text-muted-foreground">{s.provider}</p>
          <div className="flex flex-wrap gap-1">
            {s.education_level && <Badge variant="outline" className="text-[10px]">{s.education_level}</Badge>}
            {s.category && <Badge variant="outline" className="text-[10px]">{s.category.toUpperCase()}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 font-semibold">
            {!s.isExternal && <IndianRupee className="h-3.5 w-3.5" />}
            {formatAmount(s)}
          </span>
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(s.deadline), "dd MMM")}
          </span>
          {s.official_url && (
            <Button variant="outline" size="sm" asChild>
              <a href={s.official_url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const anyLoading = isLoading || externalLoading;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Scholarships</h1>
            <p className="text-sm text-muted-foreground">
              {anyLoading ? "Loading…" : `${filtered.length} scholarships found`}
              {apiConfigured && !anyLoading && externalCount > 0 && (
                <span className="ml-1 text-blue-500">
                  (incl. {externalCount} from ScholarshipAPI)
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Source toggle tabs */}
        {apiConfigured && (
          <div className="mb-4 flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
            {([
              { value: "all" as SourceFilter, label: "All", count: allScholarships.length },
              { value: "local" as SourceFilter, label: "Local", count: localCount },
              { value: "scholarshipapi" as SourceFilter, label: "🌐 ScholarshipAPI", count: externalCount },
            ]).map((tab) => (
              <button
                key={tab.value}
                onClick={() => setSourceFilter(tab.value)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${sourceFilter === tab.value
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                {tab.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${sourceFilter === tab.value
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                  }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-20 rounded-xl border bg-card p-4">
              <FilterPanel />
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1">
            {/* Search + controls */}
            <div className="mb-4 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search scholarships…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              {/* Mobile filter trigger */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="lg:hidden relative">
                    <SlidersHorizontal className="h-4 w-4" />
                    {activeFilterCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 overflow-y-auto">
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                  <div className="mt-4"><FilterPanel /></div>
                </SheetContent>
              </Sheet>

              <div className="hidden gap-1 sm:flex">
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("grid")}>
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" onClick={() => setViewMode("list")}>
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Results */}
            {anyLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i}><CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent></Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground/40" />
                <h3 className="font-display text-lg font-semibold text-foreground">No scholarships found</h3>
                <p className="mt-1 text-sm text-muted-foreground">Try adjusting your filters or search query</p>
                {activeFilterCount > 0 && (
                  <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((s) => <ScholarshipCard key={s.id} s={s} />)}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((s) => <ScholarshipRow key={s.id} s={s} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scholarships;
