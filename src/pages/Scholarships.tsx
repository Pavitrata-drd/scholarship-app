import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  LayoutGrid,
  List,
  GraduationCap,
  Calendar,
  IndianRupee,
  ArrowLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import Navbar from "@/components/landing/Navbar";

type Scholarship = {
  id: string;
  name: string;
  provider: string;
  description: string;
  amount: number;
  deadline: string;
  education_level: string;
  category: string;
  type: string;
};

const DUMMY_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "1",
    name: "Central Government Merit Scholarship",
    provider: "Government of India",
    description: "Scholarship for meritorious undergraduate students.",
    amount: 50000,
    deadline: "2026-05-30",
    education_level: "undergraduate",
    category: "general",
    type: "government",
  },
  {
    id: "2",
    name: "Private Tech Excellence Award",
    provider: "Tech Foundation",
    description: "Support for engineering students.",
    amount: 75000,
    deadline: "2026-06-15",
    education_level: "undergraduate",
    category: "obc",
    type: "private",
  },
];

const Scholarships = () => {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return DUMMY_SCHOLARSHIPS.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const ScholarshipCard = ({ s }: { s: Scholarship }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-base">{s.name}</CardTitle>
        <p className="text-xs text-muted-foreground">{s.provider}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{s.description}</p>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1 font-semibold">
            <IndianRupee className="h-3.5 w-3.5" />
            ₹{s.amount.toLocaleString("en-IN")}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(s.deadline), "dd MMM yyyy")}
          </span>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline">{s.education_level}</Badge>
          <Badge variant="outline">{s.category}</Badge>
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
            ₹{s.amount.toLocaleString("en-IN")}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            {format(new Date(s.deadline), "dd MMM")}
          </span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-6">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Scholarships</h1>
            <p className="text-sm text-muted-foreground">
              {filtered.length} scholarships found
            </p>
          </div>
        </div>

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

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
            <p className="text-muted-foreground">
              No scholarships found
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((s) => (
              <ScholarshipCard key={s.id} s={s} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((s) => (
              <ScholarshipRow key={s.id} s={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Scholarships;