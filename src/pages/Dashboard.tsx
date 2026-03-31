import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  GraduationCap,
  ArrowRight,
  IndianRupee,
  Building,
  BookOpen,
  Bookmark,
  FileText,
  Bell,
  ClipboardList,
  Trash2,
  Loader2,
  Calendar,
  Upload,
  CheckCircle2,
  Clock,
  Star,
  FileDown,
  Eye,
  ChevronRight,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Navbar from "@/components/landing/Navbar";
import { useScholarshipStats } from "@/hooks/useScholarships";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import { toast } from "@/hooks/use-toast";
import { exportSavedListPDF, exportApplicationsPDF } from "@/lib/pdf";
import {
  fetchSavedScholarships,
  unsaveScholarship,
  fetchApplications,
  updateApplication,
  deleteApplication,
  fetchTimeline,
  fetchDocuments,
  uploadDocument,
  deleteDocument,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  fetchUnreadCount,
  generateDeadlineReminders,
  fetchRecommendations,
  type SavedScholarship,
  type Application,
  type ApplicationStatus,
  type Document as DocType,
  type Notification as NotifType,
  type RecommendedScholarship,
  type TimelineEntry,
} from "@/lib/api";

type StatusMeta = { label: string; color: string; icon: LucideIcon };

const STATUS_CONFIG: Record<string, StatusMeta> = {
  interested: { label: "Interested", color: "bg-blue-100 text-blue-700", icon: Star },
  applied: { label: "Applied", color: "bg-yellow-100 text-yellow-700", icon: ClipboardList },
  under_review: { label: "Under Review", color: "bg-purple-100 text-purple-700", icon: Clock },
  accepted: { label: "Accepted", color: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: Trash2 },
};

const DOC_TYPES = [
  "Aadhaar Card", "PAN Card", "10th Marksheet", "12th Marksheet",
  "Degree Certificate", "Income Certificate", "Caste Certificate",
  "Domicile Certificate", "Bank Passbook", "Passport Photo", "Other",
];

const Dashboard = () => {
  const { data } = useScholarshipStats();
  const stats = data?.data;
  const { user, isAdmin } = useAuth();
  const { t } = useI18n();

  const [saved, setSaved] = useState<SavedScholarship[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [docs, setDocs] = useState<DocType[]>([]);
  const [notifs, setNotifs] = useState<NotifType[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendedScholarship[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingTab, setLoadingTab] = useState("");
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState("Other");
  const [uploading, setUploading] = useState(false);
  const [deleteAppId, setDeleteAppId] = useState<number | null>(null);
  const [deleteDocId, setDeleteDocId] = useState<number | null>(null);

  const getErrorMessage = (error: unknown) =>
    error instanceof Error ? error.message : "Something went wrong";

  const loadSaved = async () => {
    setLoadingTab("saved");
    try {
      const result = await fetchSavedScholarships();
      setSaved(result.data);
    } catch (error: unknown) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    }
    setLoadingTab("");
  };

  const loadApps = async () => {
    setLoadingTab("apps");
    try {
      const result = await fetchApplications();
      setApps(result.data);
    } catch (error: unknown) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    }
    setLoadingTab("");
  };

  const loadDocs = async () => {
    setLoadingTab("docs");
    try {
      const result = await fetchDocuments();
      setDocs(result.data);
    } catch (error: unknown) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    }
    setLoadingTab("");
  };

  const loadNotifs = async () => {
    setLoadingTab("notifs");
    try {
      const [notificationsResult, unreadCountResult] = await Promise.all([fetchNotifications(), fetchUnreadCount()]);
      setNotifs(notificationsResult.data);
      setUnreadCount(unreadCountResult.count);
    } catch (error: unknown) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    }
    setLoadingTab("");
  };

  useEffect(() => {
    fetchRecommendations()
      .then((result) => setRecommendations(result.data))
      .catch((error: unknown) => {
        console.error("Failed to fetch recommendations:", error);
      });
    fetchUnreadCount()
      .then((result) => setUnreadCount(result.count))
      .catch((error: unknown) => {
        console.error("Failed to fetch unread count:", error);
      });
  }, []);

  const handleUnsave = async (id: number) => {
    try { await unsaveScholarship(id); setSaved((p) => p.filter((s) => s.id !== id)); toast({ title: "Removed from saved" }); }
    catch (error: unknown) { toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" }); }
  };
  const handleStatusChange = async (appId: number, status: ApplicationStatus) => {
    try { await updateApplication(appId, { status }); setApps((p) => p.map((a) => (a.id === appId ? { ...a, status } : a))); toast({ title: `Status updated` }); }
    catch (error: unknown) { toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" }); }
  };
  const handleDeleteApp = async (id: number) => {
    try { await deleteApplication(id); setApps((p) => p.filter((a) => a.id !== id)); toast({ title: "Application removed" }); }
    catch (error: unknown) { toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" }); }
    finally { setDeleteAppId(null); }
  };
  const handleUpload = async () => {
    if (!uploadFile) return;
    setUploading(true);
    try { const r = await uploadDocument(uploadFile, uploadType); setDocs((p) => [r.data, ...p]); setUploadOpen(false); setUploadFile(null); toast({ title: "Document uploaded!" }); }
    catch (error: unknown) { toast({ title: "Upload failed", description: getErrorMessage(error), variant: "destructive" }); }
    finally { setUploading(false); }
  };
  const handleDeleteDoc = async (id: number) => {
    try { await deleteDocument(id); setDocs((p) => p.filter((d) => d.id !== id)); toast({ title: "Document deleted" }); }
    catch (error: unknown) { toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" }); }
    finally { setDeleteDocId(null); }
  };
  const handleMarkRead = async (id: number) => {
    try { await markNotificationRead(id); setNotifs((p) => p.map((n) => (n.id === id ? { ...n, is_read: true } : n))); setUnreadCount((c) => Math.max(0, c - 1)); }
    catch (error: unknown) { console.error("Failed to mark notification read:", error); }
  };
  const handleMarkAllRead = async () => {
    try { await markAllNotificationsRead(); setNotifs((p) => p.map((n) => ({ ...n, is_read: true }))); setUnreadCount(0); toast({ title: "All marked as read" }); }
    catch (error: unknown) { console.error("Failed to mark all notifications read:", error); }
  };
  const handleGenerateReminders = async () => {
    try { const r = await generateDeadlineReminders(); toast({ title: `${r.generated} deadline reminders generated` }); loadNotifs(); }
    catch (error: unknown) { toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" }); }
  };
  const loadTimeline = async (appId: number) => {
    try { const r = await fetchTimeline(appId); setTimeline(r.data); }
    catch (error: unknown) { console.error("Failed to load timeline:", error); setTimeline([]); }
  };

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
            <p className="mt-1 text-muted-foreground">Welcome back, {user?.full_name}!</p>
          </div>
          <Button variant="outline" asChild>
            <Link to="/profile"><GraduationCap className="mr-1 h-4 w-4" /> {t("nav.profile")}</Link>
          </Button>
        </div>

        <Tabs defaultValue="overview" onValueChange={(v) => {
          if (v === "saved") loadSaved();
          if (v === "applications") loadApps();
          if (v === "documents") loadDocs();
          if (v === "notifications") loadNotifs();
        }}>
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="overview">{t("dashboard.overview")}</TabsTrigger>
            <TabsTrigger value="saved" className="gap-1"><Bookmark className="h-3 w-3" /> {t("dashboard.saved")}</TabsTrigger>
            <TabsTrigger value="applications" className="gap-1"><ClipboardList className="h-3 w-3" /> {t("dashboard.applications")}</TabsTrigger>
            <TabsTrigger value="documents" className="gap-1"><FileText className="h-3 w-3" /> {t("dashboard.documents")}</TabsTrigger>
            <TabsTrigger value="notifications" className="gap-1 relative">
              <Bell className="h-3 w-3" /> {t("dashboard.notifications")}
              {unreadCount > 0 && <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">{unreadCount}</span>}
            </TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              <Card><CardContent className="flex items-center gap-3 p-5"><BookOpen className="h-6 w-6 text-primary" /><div><p className="text-2xl font-bold">{stats?.total_scholarships ?? "—"}</p><p className="text-xs text-muted-foreground">{t("total_scholarships")}</p></div></CardContent></Card>
              <Card><CardContent className="flex items-center gap-3 p-5"><GraduationCap className="h-6 w-6 text-primary" /><div><p className="text-2xl font-bold">{stats?.active_scholarships ?? "—"}</p><p className="text-xs text-muted-foreground">{t("active")}</p></div></CardContent></Card>
              <Card><CardContent className="flex items-center gap-3 p-5"><Building className="h-6 w-6 text-primary" /><div><p className="text-2xl font-bold">{stats?.total_providers ?? "—"}</p><p className="text-xs text-muted-foreground">{t("providers")}</p></div></CardContent></Card>
              <Card><CardContent className="flex items-center gap-3 p-5"><IndianRupee className="h-6 w-6 text-primary" /><div><p className="text-2xl font-bold">{stats ? `₹${(stats.total_funding / 100000).toFixed(1)}L` : "—"}</p><p className="text-xs text-muted-foreground">{t("total_funding")}</p></div></CardContent></Card>
            </div>

            {recommendations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold flex items-center gap-2 mb-4"><Sparkles className="h-5 w-5 text-yellow-500" />{t("dashboard.recommendations")}</h2>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recommendations.slice(0, 6).map((s) => (
                    <Link key={s.id} to={`/scholarship/${s.id}`}>
                      <Card className="hover:shadow-md transition-shadow h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-sm line-clamp-2">{s.name}</h3>
                            <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">{s.match_score}% match</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">{s.provider}</p>
                          <div className="mt-2 flex items-center justify-between text-sm">
                            <span className="font-semibold">₹{Number(s.amount).toLocaleString("en-IN")}</span>
                            {s.deadline && <span className="text-xs text-muted-foreground">{format(new Date(s.deadline), "dd MMM yyyy")}</span>}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button asChild><Link to="/scholarships" className="gap-2">Browse Scholarships <ArrowRight className="h-4 w-4" /></Link></Button>
              <Button variant="outline" asChild><Link to="/profile" className="gap-2"><GraduationCap className="mr-1 h-4 w-4" /> Edit Profile <ChevronRight className="h-4 w-4" /></Link></Button>
            </div>
          </TabsContent>

          {/* SAVED */}
          <TabsContent value="saved">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Saved Scholarships ({saved.length})</h2>
              {saved.length > 0 && <Button variant="outline" size="sm" onClick={() => exportSavedListPDF(saved)}><FileDown className="mr-1 h-4 w-4" /> Export PDF</Button>}
            </div>
            {loadingTab === "saved" && <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            {loadingTab !== "saved" && saved.length === 0 && (
              <Card><CardContent className="py-12 text-center text-muted-foreground"><Bookmark className="mx-auto mb-3 h-10 w-10 opacity-30" /><p>{t("saved.empty")}</p><Button asChild className="mt-4" variant="outline"><Link to="/scholarships">Browse Scholarships</Link></Button></CardContent></Card>
            )}
            <div className="space-y-3">
              {saved.map((s) => (
                <Card key={s.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <Link to={`/scholarship/${s.id}`} className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{s.name}</h3>
                      <p className="text-xs text-muted-foreground">{s.provider}</p>
                      <div className="mt-1 flex items-center gap-3 text-sm">
                        <span className="font-semibold">₹{Number(s.amount).toLocaleString("en-IN")}</span>
                        {s.deadline && <span className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{format(new Date(s.deadline), "dd MMM yyyy")}</span>}
                        <Badge variant="outline" className="text-xs capitalize">{s.type}</Badge>
                      </div>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => handleUnsave(s.id)} className="text-destructive shrink-0"><Trash2 className="h-4 w-4" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* APPLICATIONS */}
          <TabsContent value="applications">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Application Tracker ({apps.length})</h2>
              {apps.length > 0 && <Button variant="outline" size="sm" onClick={() => exportApplicationsPDF(apps)}><FileDown className="mr-1 h-4 w-4" /> Export PDF</Button>}
            </div>
            {loadingTab === "apps" && <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            {loadingTab !== "apps" && apps.length === 0 && (
              <Card><CardContent className="py-12 text-center text-muted-foreground"><ClipboardList className="mx-auto mb-3 h-10 w-10 opacity-30" /><p>{t("apps.empty")}</p><Button asChild className="mt-4" variant="outline"><Link to="/scholarships">Browse Scholarships</Link></Button></CardContent></Card>
            )}
            {apps.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-5 mb-6">
                {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                  const count = apps.filter((a) => a.status === status).length;
                  const Icon = cfg.icon;
                  return <Card key={status}><CardContent className="flex items-center gap-2 p-3"><Icon className="h-4 w-4" /><div><p className="text-lg font-bold">{count}</p><p className="text-xs text-muted-foreground">{cfg.label}</p></div></CardContent></Card>;
                })}
              </div>
            )}
            <div className="space-y-3">
              {apps.map((app) => {
                const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.interested;
                return (
                  <Card key={app.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <Link to={`/scholarship/${app.scholarship_id}`} className="hover:underline"><h3 className="font-semibold">{app.scholarship_name}</h3></Link>
                          <p className="text-xs text-muted-foreground">{app.provider}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                            <span className="text-sm font-semibold">₹{Number(app.amount).toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Select value={app.status} onValueChange={(v) => handleStatusChange(app.id, v as ApplicationStatus)}>
                            <SelectTrigger className="w-[140px] h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="interested">Interested</SelectItem>
                              <SelectItem value="applied">Applied</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="accepted">Accepted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                          <Dialog>
                            <DialogTrigger asChild><Button variant="ghost" size="icon" onClick={() => loadTimeline(app.id)}><Eye className="h-4 w-4" /></Button></DialogTrigger>
                            <DialogContent>
                              <DialogHeader><DialogTitle>Timeline: {app.scholarship_name}</DialogTitle></DialogHeader>
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {timeline.map((t) => (
                                  <div key={t.id} className="flex items-start gap-3 text-sm">
                                    <div className="mt-1 h-2 w-2 rounded-full bg-primary shrink-0" />
                                    <div>
                                      <span className="font-medium capitalize">{t.status.replace("_", " ")}</span>
                                      {t.note && <p className="text-muted-foreground text-xs">{t.note}</p>}
                                      <p className="text-xs text-muted-foreground">{format(new Date(t.created_at), "dd MMM yyyy, HH:mm")}</p>
                                    </div>
                                  </div>
                                ))}
                                {timeline.length === 0 && <p className="text-muted-foreground text-sm">No timeline entries yet</p>}
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button variant="ghost" size="icon" onClick={() => setDeleteAppId(app.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* DOCUMENTS */}
          <TabsContent value="documents">
            <div className="flex items-center justify-between mb-4">
              <div><h2 className="text-xl font-semibold">{t("docs.title")}</h2><p className="text-sm text-muted-foreground">{t("docs.subtitle")}</p></div>
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild><Button><Upload className="mr-1 h-4 w-4" /> {t("docs.upload")}</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Upload Document</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Document Type</Label>
                      <Select value={uploadType} onValueChange={setUploadType}><SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>File (PDF, JPG, PNG, DOC — max 10MB)</Label><Input type="file" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} /></div>
                    <Button onClick={handleUpload} disabled={!uploadFile || uploading}>{uploading && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Upload</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {loadingTab === "docs" && <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            {loadingTab !== "docs" && docs.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground"><FileText className="mx-auto mb-3 h-10 w-10 opacity-30" /><p>{t("docs.empty")}</p></CardContent></Card>}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {docs.map((doc) => (
                <Card key={doc.id}><CardContent className="p-4">
                  <div className="flex items-start gap-3"><FileText className="h-8 w-8 text-primary shrink-0" />
                    <div className="flex-1 min-w-0"><h4 className="font-semibold text-sm truncate">{doc.name}</h4><Badge variant="outline" className="text-xs mt-1">{doc.doc_type}</Badge><p className="text-xs text-muted-foreground mt-1">{(doc.file_size / 1024).toFixed(0)} KB &bull; {format(new Date(doc.created_at), "dd MMM yyyy")}</p></div>
                  </div>
                  <div className="mt-3"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteDocId(doc.id)}><Trash2 className="mr-1 h-3 w-3" /> Delete</Button></div>
                </CardContent></Card>
              ))}
            </div>
          </TabsContent>

          {/* NOTIFICATIONS */}
          <TabsContent value="notifications">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Notifications</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleGenerateReminders}><Bell className="mr-1 h-4 w-4" /> Check Deadlines</Button>
                {notifs.some((n) => !n.is_read) && <Button variant="ghost" size="sm" onClick={handleMarkAllRead}>Mark All Read</Button>}
              </div>
            </div>
            {loadingTab === "notifs" && <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}
            {loadingTab !== "notifs" && notifs.length === 0 && <Card><CardContent className="py-12 text-center text-muted-foreground"><Bell className="mx-auto mb-3 h-10 w-10 opacity-30" /><p>No notifications yet. Save scholarships and we'll remind you before deadlines!</p></CardContent></Card>}
            <div className="space-y-2">
              {notifs.map((n) => (
                <Card key={n.id} className={`cursor-pointer transition-colors ${!n.is_read ? "border-primary/30 bg-primary/5" : ""}`} onClick={() => !n.is_read && handleMarkRead(n.id)}>
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!n.is_read ? "bg-primary" : "bg-muted-foreground/30"}`} />
                    <div className="flex-1">
                      <h4 className={`text-sm ${!n.is_read ? "font-semibold" : ""}`}>{n.title}</h4>
                      {n.message && <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{format(new Date(n.created_at), "dd MMM yyyy, HH:mm")}</p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize shrink-0">{n.type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        <AlertDialog open={deleteAppId !== null} onOpenChange={(open) => !open && setDeleteAppId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove this application?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the application from your tracker.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteAppId && handleDeleteApp(deleteAppId)}>
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={deleteDocId !== null} onOpenChange={(open) => !open && setDeleteDocId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this document?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone and the document will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteDocId && handleDeleteDoc(deleteDocId)}>
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Dashboard;