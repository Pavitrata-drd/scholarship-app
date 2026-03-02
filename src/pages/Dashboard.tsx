import { Link } from "react-router-dom";
import { GraduationCap, ArrowRight, IndianRupee, Building, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/landing/Navbar";
import { useScholarshipStats } from "@/hooks/useScholarships";

const Dashboard = () => {
  const { data } = useScholarshipStats();
  const stats = data?.data;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-10">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Your scholarship overview</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_scholarships ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Total Scholarships</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <GraduationCap className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.active_scholarships ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <Building className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats?.total_providers ?? "—"}</p>
                <p className="text-xs text-muted-foreground">Providers</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-5">
              <IndianRupee className="h-6 w-6 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {stats ? `₹${(stats.total_funding / 100000).toFixed(1)}L` : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Total Funding</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Button asChild>
            <Link to="/scholarships" className="gap-2">
              Browse Scholarships <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;