import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Shield, GraduationCap, Plus, Pencil, Trash2, Users, FileText, LogOut, Home,
  Loader2, Search, Upload, Sparkles, FileSpreadsheet, CheckCircle2, AlertTriangle,
  Check, X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";
import {
  parseScholarshipsWithAI,
  parseCSV,
  isGeminiConfigured,
  type ParsedScholarship,
} from "@/lib/geminiParser";

type Scholarship = Database["public"]["Tables"]["scholarships"]["Row"];
type ScholarshipInsert = Database["public"]["Tables"]["scholarships"]["Insert"];

const EDUCATION_LEVELS = [
  { value: "10th", label: "10th" }, { value: "12th", label: "12th" },
  { value: "undergraduate", label: "UG" }, { value: "postgraduate", label: "PG" }, { value: "phd", label: "PhD" },
];
const CATEGORIES = [
  { value: "general", label: "General" }, { value: "obc", label: "OBC" },
  { value: "sc", label: "SC" }, { value: "st", label: "ST" }, { value: "ews", label: "EWS" },
];
const TYPES = [
  { value: "government", label: "Government" }, { value: "private", label: "Private" },
  { value: "international", label: "International" }, { value: "university", label: "University" },
];

function AdminSidebar() {
  const { signOut } = useAuth();
  const links = [
    { title: "Dashboard", url: "/admin", icon: Shield },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="gap-2"><Shield className="h-4 w-4" /> Admin</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-muted text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" /><span>{item.title}</span>
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
                    <LogOut className="h-4 w-4" /><span>Sign Out</span>
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

const STATUS_COLORS: Record<string, string> = {
  applied: "bg-primary/10 text-primary",
  under_review: "bg-[hsl(var(--scholar-warning))]/10 text-[hsl(var(--scholar-warning))]",
  awarded: "bg-[hsl(var(--scholar-success))]/10 text-[hsl(var(--scholar-success))]",
  rejected: "bg-destructive/10 text-destructive",
};

const emptyScholarship: Partial<ScholarshipInsert> = {
  name: "", provider: "", description: "", amount: 0, deadline: "",
  type: "government", education_level: undefined, category: undefined,
  stream: "", state: "", official_url: "",
};

const SAMPLE_TEXT = `Example: Paste scholarship info from any website, email, or document...

Central Sector Scholarship for College Students
Provider: Ministry of Education, Government of India
Amount: ₹20,000 per year
Deadline: 31st October 2025
For: Undergraduate students, All categories
Stream: Any
URL: https://scholarships.gov.in

AICTE Pragati Scholarship for Girls
Provider: AICTE
Amount: ₹50,000
Deadline: 30 November 2025
Education Level: Undergraduate
Category: General, OBC, SC, ST
Stream: Engineering
State: All India`;

const Admin = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScholarship, setEditingScholarship] = useState<Partial<ScholarshipInsert> & { id?: string }>(emptyScholarship);
  const [searchTerm, setSearchTerm] = useState("");

  // ── Bulk import state ──────────────────────────────────────
  const [bulkText, setBulkText] = useState("");
  const [parsedScholarships, setParsedScholarships] = useState<ParsedScholarship[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);

  const { data: scholarships, isLoading: schlLoading } = useQuery({
    queryKey: ["admin-scholarships"],
    queryFn: async () => {
      const { data, error } = await supabase.from("scholarships").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Scholarship[];
    },
  });

  const { data: applications, isLoading: appsLoading } = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("applications").select("*, scholarships(name, provider)").order("applied_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, full_name, education_level, category, state");
      if (error) throw error;
      return data;
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async (s: Partial<ScholarshipInsert> & { id?: string }) => {
      if (s.id) {
        const { id, ...rest } = s;
        const { error } = await supabase.from("scholarships").update(rest).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("scholarships").insert(s as ScholarshipInsert);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-scholarships"] });
      setDialogOpen(false);
      setEditingScholarship(emptyScholarship);
      toast({ title: "Scholarship saved!" });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("scholarships").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-scholarships"] });
      toast({ title: "Scholarship deleted" });
    },
  });

  const updateAppStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("applications").update({ status: status as any }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-applications"] });
      toast({ title: "Status updated" });
    },
  });

  const openEdit = (s: Scholarship) => {
    setEditingScholarship({
      id: s.id, name: s.name, provider: s.provider, description: s.description ?? "",
      amount: s.amount, deadline: s.deadline, type: s.type,
      education_level: s.education_level, category: s.category,
      stream: s.stream ?? "", state: s.state ?? "", official_url: s.official_url ?? "",
      is_featured: s.is_featured ?? false,
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingScholarship(emptyScholarship);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editingScholarship.name || !editingScholarship.provider || !editingScholarship.deadline || !editingScholarship.amount) {
      toast({ title: "Please fill all required fields", variant: "destructive" });
      return;
    }
    upsertMutation.mutate(editingScholarship);
  };

  const filteredScholarships = scholarships?.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.provider.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) ?? []);

  // ── Bulk import handlers ───────────────────────────────────

  const handleParseWithAI = async () => {
    if (!bulkText.trim()) {
      toast({ title: "Please paste some scholarship text first", variant: "destructive" });
      return;
    }
    if (!isGeminiConfigured()) {
      toast({ title: "Gemini API key not configured", description: "Add VITE_GEMINI_API_KEY to your .env file", variant: "destructive" });
      return;
    }
    setIsParsing(true);
    setImportResult(null);
    try {
      const result = await parseScholarshipsWithAI(bulkText);
      setParsedScholarships(result);
      toast({ title: `Parsed ${result.length} scholarship(s)`, description: "Review and import below" });
    } catch (err: any) {
      toast({ title: "AI Parsing Error", description: err.message, variant: "destructive" });
    } finally {
      setIsParsing(false);
    }
  };

  const handleParseCSV = () => {
    if (!bulkText.trim()) {
      toast({ title: "Please paste CSV data first", variant: "destructive" });
      return;
    }
    setImportResult(null);
    try {
      const result = parseCSV(bulkText);
      setParsedScholarships(result);
      toast({ title: `Parsed ${result.length} scholarship(s) from CSV` });
    } catch (err: any) {
      toast({ title: "CSV Parse Error", description: err.message, variant: "destructive" });
    }
  };

  const toggleScholarship = (index: number) => {
    setParsedScholarships((prev) =>
      prev.map((s, i) => (i === index ? { ...s, _selected: !s._selected } : s))
    );
  };

  const toggleAll = () => {
    const allSelected = parsedScholarships.every((s) => s._selected);
    setParsedScholarships((prev) => prev.map((s) => ({ ...s, _selected: !allSelected })));
  };

  const handleBulkImport = async () => {
    const selected = parsedScholarships.filter((s) => s._selected && s._valid);
    if (selected.length === 0) {
      toast({ title: "No valid scholarships selected", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    let success = 0;
    let failed = 0;

    for (const s of selected) {
      try {
        const insert: ScholarshipInsert = {
          name: s.name,
          provider: s.provider,
          description: s.description || null,
          amount: s.amount,
          deadline: s.deadline,
          type: s.type as any,
          education_level: s.education_level as any,
          category: s.category as any,
          stream: s.stream || null,
          state: s.state || null,
          official_url: s.official_url || null,
        };
        const { error } = await supabase.from("scholarships").insert(insert);
        if (error) throw error;
        success++;
      } catch {
        failed++;
      }
    }

    setIsImporting(false);
    setImportResult({ success, failed });
    queryClient.invalidateQueries({ queryKey: ["admin-scholarships"] });
    toast({
      title: `Import Complete`,
      description: `${success} imported, ${failed} failed`,
    });
  };

  const clearBulkImport = () => {
    setBulkText("");
    setParsedScholarships([]);
    setImportResult(null);
  };

  const selectedCount = parsedScholarships.filter((s) => s._selected).length;
  const validSelectedCount = parsedScholarships.filter((s) => s._selected && s._valid).length;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background px-4">
            <SidebarTrigger />
            <h2 className="font-display font-semibold text-foreground">Admin Panel</h2>
          </header>

          <main className="flex-1 p-4 md:p-6 space-y-6">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3">
              <Card><CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10"><GraduationCap className="h-5 w-5 text-primary" /></div>
                <div><p className="text-2xl font-bold">{scholarships?.length ?? 0}</p><p className="text-xs text-muted-foreground">Scholarships</p></div>
              </CardContent></Card>
              <Card><CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--scholar-gold))]/10"><FileText className="h-5 w-5 text-[hsl(var(--scholar-gold))]" /></div>
                <div><p className="text-2xl font-bold">{applications?.length ?? 0}</p><p className="text-xs text-muted-foreground">Applications</p></div>
              </CardContent></Card>
              <Card><CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[hsl(var(--scholar-success))]/10"><Users className="h-5 w-5 text-[hsl(var(--scholar-success))]" /></div>
                <div><p className="text-2xl font-bold">{profiles?.length ?? 0}</p><p className="text-xs text-muted-foreground">Students</p></div>
              </CardContent></Card>
            </div>

            <Tabs defaultValue="scholarships">
              <TabsList>
                <TabsTrigger value="scholarships">Scholarships</TabsTrigger>
                <TabsTrigger value="bulk-import" className="gap-1.5">
                  <Upload className="h-3.5 w-3.5" /> Bulk Import
                </TabsTrigger>
                <TabsTrigger value="applications">Applications</TabsTrigger>
              </TabsList>

              {/* ─── Scholarships Tab ─────────────────────────── */}
              <TabsContent value="scholarships" className="mt-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                  </div>
                  <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" /> Add</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
                      <DialogHeader><DialogTitle>{editingScholarship.id ? "Edit" : "Add"} Scholarship</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-2">
                        <div className="grid gap-1.5">
                          <Label>Name *</Label>
                          <Input value={editingScholarship.name ?? ""} onChange={(e) => setEditingScholarship((p) => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-1.5">
                            <Label>Provider *</Label>
                            <Input value={editingScholarship.provider ?? ""} onChange={(e) => setEditingScholarship((p) => ({ ...p, provider: e.target.value }))} />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Amount *</Label>
                            <Input type="number" value={editingScholarship.amount ?? 0} onChange={(e) => setEditingScholarship((p) => ({ ...p, amount: Number(e.target.value) }))} />
                          </div>
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Description</Label>
                          <Textarea value={editingScholarship.description ?? ""} onChange={(e) => setEditingScholarship((p) => ({ ...p, description: e.target.value }))} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-1.5">
                            <Label>Deadline *</Label>
                            <Input type="date" value={editingScholarship.deadline ?? ""} onChange={(e) => setEditingScholarship((p) => ({ ...p, deadline: e.target.value }))} />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Type</Label>
                            <Select value={editingScholarship.type ?? "government"} onValueChange={(v) => setEditingScholarship((p) => ({ ...p, type: v as any }))}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-1.5">
                            <Label>Education Level</Label>
                            <Select value={editingScholarship.education_level ?? ""} onValueChange={(v) => setEditingScholarship((p) => ({ ...p, education_level: v as any }))}>
                              <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                              <SelectContent>{EDUCATION_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                          <div className="grid gap-1.5">
                            <Label>Category</Label>
                            <Select value={editingScholarship.category ?? ""} onValueChange={(v) => setEditingScholarship((p) => ({ ...p, category: v as any }))}>
                              <SelectTrigger><SelectValue placeholder="Any" /></SelectTrigger>
                              <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-1.5">
                            <Label>Stream</Label>
                            <Input value={editingScholarship.stream ?? ""} onChange={(e) => setEditingScholarship((p) => ({ ...p, stream: e.target.value }))} />
                          </div>
                          <div className="grid gap-1.5">
                            <Label>State</Label>
                            <Input value={editingScholarship.state ?? ""} onChange={(e) => setEditingScholarship((p) => ({ ...p, state: e.target.value }))} />
                          </div>
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Official URL</Label>
                          <Input value={editingScholarship.official_url ?? ""} onChange={(e) => setEditingScholarship((p) => ({ ...p, official_url: e.target.value }))} />
                        </div>
                        <Button onClick={handleSave} disabled={upsertMutation.isPending}>
                          {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          {editingScholarship.id ? "Update" : "Create"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                {schlLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)
                ) : (
                  <div className="space-y-3">
                    {filteredScholarships?.map((s) => (
                      <Card key={s.id}>
                        <CardContent className="flex items-center gap-3 p-4">
                          <div className="flex-1">
                            <h4 className="font-semibold">{s.name}</h4>
                            <p className="text-xs text-muted-foreground">{s.provider} · ₹{s.amount.toLocaleString("en-IN")} · {s.deadline}</p>
                          </div>
                          <Badge variant="outline" className="capitalize">{s.type}</Badge>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => { if (confirm("Delete this scholarship?")) deleteMutation.mutate(s.id); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* ─── Bulk Import Tab ──────────────────────────── */}
              <TabsContent value="bulk-import" className="mt-4 space-y-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Upload className="h-5 w-5" /> Bulk Import Scholarships
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Paste scholarship information from any source — websites, emails, PDFs, or CSV data. AI will parse it into structured records.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      className="min-h-[200px] font-mono text-sm"
                      placeholder={SAMPLE_TEXT}
                      value={bulkText}
                      onChange={(e) => setBulkText(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={handleParseWithAI}
                        disabled={isParsing || !bulkText.trim()}
                        className="gap-1.5"
                      >
                        {isParsing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        Parse with AI
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleParseCSV}
                        disabled={!bulkText.trim()}
                        className="gap-1.5"
                      >
                        <FileSpreadsheet className="h-4 w-4" /> Parse CSV
                      </Button>
                      {parsedScholarships.length > 0 && (
                        <Button variant="ghost" onClick={clearBulkImport} className="gap-1.5 text-muted-foreground">
                          <X className="h-4 w-4" /> Clear
                        </Button>
                      )}

                      {!isGeminiConfigured() && (
                        <p className="flex items-center gap-1 text-xs text-amber-500 ml-auto">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Add VITE_GEMINI_API_KEY to .env for AI parsing
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Preview Table */}
                {parsedScholarships.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Parsed Scholarships ({parsedScholarships.length})
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={toggleAll} className="text-xs">
                            {parsedScholarships.every((s) => s._selected) ? "Deselect All" : "Select All"}
                          </Button>
                          <Button
                            onClick={handleBulkImport}
                            disabled={isImporting || validSelectedCount === 0}
                            className="gap-1.5"
                          >
                            {isImporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            Import Selected ({validSelectedCount})
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {parsedScholarships.map((s, index) => (
                          <div
                            key={index}
                            className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${s._selected ? "bg-card" : "bg-muted/30 opacity-60"
                              } ${!s._valid ? "border-amber-500/50" : ""}`}
                          >
                            <button
                              onClick={() => toggleScholarship(index)}
                              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${s._selected
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-muted-foreground/30"
                                }`}
                            >
                              {s._selected && <Check className="h-3 w-3" />}
                            </button>

                            <div className="flex-1 min-w-0 space-y-1">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-semibold text-sm leading-tight">{s.name || "Unnamed"}</h4>
                                <div className="flex shrink-0 gap-1">
                                  {s._valid ? (
                                    <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-500">
                                      <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" /> Valid
                                    </Badge>
                                  ) : (
                                    <Badge variant="secondary" className="text-[10px] bg-amber-500/10 text-amber-500">
                                      <AlertTriangle className="mr-0.5 h-2.5 w-2.5" /> {s._error}
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="text-[10px] capitalize">{s.type}</Badge>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">{s.provider}</p>
                              {s.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1">{s.description}</p>
                              )}
                              <div className="flex flex-wrap gap-2 text-xs">
                                <span className="font-medium">₹{s.amount.toLocaleString("en-IN")}</span>
                                <span className="text-muted-foreground">Deadline: {s.deadline}</span>
                                {s.education_level && <Badge variant="outline" className="text-[10px]">{s.education_level}</Badge>}
                                {s.category && <Badge variant="outline" className="text-[10px]">{s.category.toUpperCase()}</Badge>}
                                {s.stream && <Badge variant="outline" className="text-[10px]">{s.stream}</Badge>}
                                {s.state && <Badge variant="outline" className="text-[10px]">{s.state}</Badge>}
                              </div>
                              {s.official_url && (
                                <a href={s.official_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-primary hover:underline truncate block">
                                  {s.official_url}
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Import Results */}
                {importResult && (
                  <Card className="border-emerald-500/30 bg-emerald-500/5">
                    <CardContent className="flex items-center gap-3 p-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <div>
                        <p className="font-semibold text-sm">Import Complete</p>
                        <p className="text-xs text-muted-foreground">
                          {importResult.success} scholarship(s) imported successfully
                          {importResult.failed > 0 && `, ${importResult.failed} failed`}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* ─── Applications Tab ─────────────────────────── */}
              <TabsContent value="applications" className="mt-4 space-y-3">
                {appsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20" />)
                ) : applications?.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">No applications yet.</p>
                ) : (
                  applications?.map((app) => {
                    const schlName = (app.scholarships as any)?.name ?? "Unknown";
                    const studentProfile = profileMap.get(app.student_id);
                    return (
                      <Card key={app.id}>
                        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex-1 space-y-1">
                            <h4 className="font-semibold">{schlName}</h4>
                            <p className="text-xs text-muted-foreground">
                              Student: {studentProfile?.full_name ?? app.student_id.slice(0, 8)} · {format(new Date(app.applied_at!), "dd MMM yyyy")}
                            </p>
                          </div>
                          <Select value={app.status ?? "applied"} onValueChange={(v) => updateAppStatus.mutate({ id: app.id, status: v })}>
                            <SelectTrigger className="w-36">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="awarded">Awarded</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
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

export default Admin;
