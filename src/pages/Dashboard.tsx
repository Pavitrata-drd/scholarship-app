import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  GraduationCap, BookmarkCheck, FileText, User, LogOut, Search, Bookmark,
  BookmarkX, ExternalLink, IndianRupee, Calendar, Bell, Home, ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Scholarship = Database["public"]["Tables"]["scholarships"]["Row"];

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-primary/10 text-primary",
  under_review: "bg-[hsl(var(--scholar-warning))]/10 text-[hsl(var(--scholar-warning))]",
  awarded: "bg-[hsl(var(--scholar-success))]/10 text-[hsl(var(--scholar-success))]",
  rejected: "bg-destructive/10 text-destructive",
};

function DashboardSidebar() {
  const { user, signOut } = useAuth();
  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const links = [
    { title: "Dashboard", url: "/dashboard", icon: Home },
    { title: "Scholarships", url: "/scholarships", icon: Search },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="gap-2">
            <GraduationCap className="h-4 w-4" />
            ScholarHub
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <button onClick={signOut} className="flex w-full items-center gap-2 text-muted-foreground hover:text-foreground">
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user!.id).maybeSingle();
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });

  const { data: matchedScholarships, isLoading: matchedLoading } = useQuery({
    queryKey: ["matched-scholarships", profile?.education_level, profile?.category],
    queryFn: async () => {
      let query = supabase.from("scholarships").select("*").gte("deadline", new Date().toISOString().split("T")[0]);
      if (profile?.education_level) query = query.eq("education_level", profile.education_level);
      const { data, error } = await query.order("deadline", { ascending: true }).limit(10);
      if (error) throw error;
      return data as Scholarship[];
    },
    enabled: !!profile,
  });

  const { data: savedScholarships, isLoading: savedLoading } = useQuery({
    queryKey: ["saved-scholarships", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_scholarships")
        .select("*, scholarships(*)")
        .eq("student_id", user!.id)
        .order("saved_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["applications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*, scholarships(*)")
        .eq("student_id", user!.id)
        .order("applied_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: notifications } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const saveMutation = useMutation({
    mutationFn: async (scholarshipId: string) => {
      const { error } = await supabase.from("saved_scholarships").insert({ student_id: user!.id, scholarship_id: scholarshipId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-scholarships"] });
      toast({ title: "Scholarship saved!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const unsaveMutation = useMutation({
    mutationFn: async (scholarshipId: string) => {
      const { error } = await supabase.from("saved_scholarships").delete().eq("student_id", user!.id).eq("scholarship_id", scholarshipId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-scholarships"] });
      toast({ title: "Scholarship removed from saved" });
    },
  });

  const applyMutation = useMutation({
    mutationFn: async (scholarshipId: string) => {
      const { error } = await supabase.from("applications").insert({ student_id: user!.id, scholarship_id: scholarshipId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      toast({ title: "Application submitted!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const savedIds = new Set(savedScholarships?.map((s) => s.scholarship_id) ?? []);
  const appliedIds = new Set(applications?.map((a) => a.scholarship_id) ?? []);
  const unreadCount = notifications?.filter((n) => !n.is_read).length ?? 0;

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4">
            <SidebarTrigger />
            <h2 className="font-display font-semibold text-foreground">Dashboard</h2>
            <div className="ml-auto flex items-center gap-2">
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">{unreadCount} new</Badge>
              )}
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6 space-y-6">
            {/* Profile Card */}
            <Card>
              <CardContent className="flex flex-col items-center gap-4 p-6 sm:flex-row">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url ?? undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-display text-xl font-bold text-foreground">{profile?.full_name || "Student"}</h3>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                    {profile?.education_level && <Badge variant="outline">{profile.education_level}</Badge>}
                    {profile?.category && <Badge variant="outline">{profile.category.toUpperCase()}</Badge>}
                    {profile?.stream && <Badge variant="outline">{profile.stream}</Badge>}
                    {profile?.state && <Badge variant="outline">{profile.state}</Badge>}
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/onboarding">Edit Profile</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{matchedScholarships?.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Matched</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--scholar-gold))]/10">
                    <BookmarkCheck className="h-5 w-5 text-[hsl(var(--scholar-gold))]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{savedScholarships?.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Saved</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--scholar-success))]/10">
                    <FileText className="h-5 w-5 text-[hsl(var(--scholar-success))]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{applications?.length ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Applied</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="matched">
              <TabsList>
                <TabsTrigger value="matched">Matched</TabsTrigger>
                <TabsTrigger value="saved">Saved</TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              <TabsContent value="matched" className="mt-4 space-y-3">
                {matchedLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
                ) : matchedScholarships?.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No matched scholarships found. Complete your profile for better matches.</p>
                ) : (
                  matchedScholarships?.map((s) => (
                    <Card key={s.id} className="transition-shadow hover:shadow-md">
                      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 space-y-1">
                          <h4 className="font-semibold text-foreground">{s.name}</h4>
                          <p className="text-xs text-muted-foreground">{s.provider}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 font-medium"><IndianRupee className="h-3.5 w-3.5" />{s.amount.toLocaleString("en-IN")}</span>
                            <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{format(new Date(s.deadline), "dd MMM yyyy")}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => savedIds.has(s.id) ? unsaveMutation.mutate(s.id) : saveMutation.mutate(s.id)}
                          >
                            {savedIds.has(s.id) ? <BookmarkX className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            disabled={appliedIds.has(s.id)}
                            onClick={() => applyMutation.mutate(s.id)}
                          >
                            {appliedIds.has(s.id) ? "Applied" : "Apply"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                <div className="text-center pt-2">
                  <Button variant="outline" asChild><Link to="/scholarships">Browse All <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
                </div>
              </TabsContent>

              <TabsContent value="saved" className="mt-4 space-y-3">
                {savedLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
                ) : savedScholarships?.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No saved scholarships yet. Browse and save scholarships you're interested in.</p>
                ) : (
                  savedScholarships?.map((saved) => {
                    const s = saved.scholarships as unknown as Scholarship;
                    if (!s) return null;
                    return (
                      <Card key={saved.id} className="transition-shadow hover:shadow-md">
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 space-y-1">
                            <h4 className="font-semibold text-foreground">{s.name}</h4>
                            <p className="text-xs text-muted-foreground">{s.provider}</p>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="flex items-center gap-1 font-medium"><IndianRupee className="h-3.5 w-3.5" />{s.amount.toLocaleString("en-IN")}</span>
                              <span className="flex items-center gap-1 text-muted-foreground"><Calendar className="h-3.5 w-3.5" />{format(new Date(s.deadline), "dd MMM yyyy")}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={() => unsaveMutation.mutate(s.id)}>
                              <BookmarkX className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              disabled={appliedIds.has(s.id)}
                              onClick={() => applyMutation.mutate(s.id)}
                            >
                              {appliedIds.has(s.id) ? "Applied" : "Apply"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>

              <TabsContent value="applications" className="mt-4 space-y-3">
                {appsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
                ) : applications?.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No applications yet. Start applying to scholarships!</p>
                ) : (
                  applications?.map((app) => {
                    const s = app.scholarships as unknown as Scholarship;
                    if (!s) return null;
                    return (
                      <Card key={app.id}>
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 space-y-1">
                            <h4 className="font-semibold text-foreground">{s.name}</h4>
                            <p className="text-xs text-muted-foreground">{s.provider} · Applied {format(new Date(app.applied_at!), "dd MMM yyyy")}</p>
                          </div>
                          <Badge className={STATUS_COLORS[app.status ?? "applied"]}>
                            {(app.status ?? "applied").replace("_", " ")}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
