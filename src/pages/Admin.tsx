import { useState, useEffect } from "react";
import {
  Shield,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserDetailModal } from "@/components/admin/UserDetailModal";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { useQueryClient } from "@tanstack/react-query";
import { useScholarships, useScholarshipStats } from "@/hooks/useScholarships";
import {
  createScholarship,
  updateScholarship,
  deleteScholarship,
  fetchAnalytics,
  fetchAdminUsers,
  type Scholarship,
  type AnalyticsData,
  type User,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/landing/Navbar";

const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#ec4899"];

const EMPTY: Partial<Scholarship> = {
  name: "",
  provider: "",
  description: "",
  amount: 0,
  deadline: "",
  type: "government",
  category: null,
  education_level: null,
  is_featured: false,
};

const Admin = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useScholarships({ limit: 100 });
  const { data: statsData } = useScholarshipStats();
  const scholarships = data?.data ?? [];
  const stats = statsData?.data;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Scholarship> | null>(null);
  const [saving, setSaving] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersMeta, setUsersMeta] = useState<{ total: number; page: number; totalPages: number } | null>(null);
  const [usersPage, setUsersPage] = useState(1);
  const [deleteScholarshipId, setDeleteScholarshipId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>("");

  const loadAnalytics = async () => {
    if (analytics) return; // already loaded
    setAnalyticsLoading(true);
    try {
      const res = await fetchAnalytics();
      setAnalytics(res.data);
    } catch {
      toast({ title: "Error", description: "Failed to load analytics", variant: "destructive" });
    }
    setAnalyticsLoading(false);
  };

  const loadUsers = async (page = 1) => {
    setUsersLoading(true);
    try {
      const res = await fetchAdminUsers(page);
      setUsers(res.data);
      setUsersMeta({ total: res.meta.total, page: res.meta.page, totalPages: res.meta.totalPages });
      setUsersPage(page);
    } catch {
      toast({ title: "Error", description: "Failed to load users", variant: "destructive" });
    }
    setUsersLoading(false);
  };

  const openCreate = () => {
    setEditing({ ...EMPTY });
    setDialogOpen(true);
  };

  const openEdit = (s: Scholarship) => {
    setEditing({ ...s, deadline: s.deadline?.split("T")[0] ?? "" });
    setDialogOpen(true);
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["scholarships"] });
  };

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name || !editing.provider) {
      toast({ title: "Missing required fields", description: "Please fill scholarship name and provider", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      if (editing.id) {
        await updateScholarship(editing.id, editing);
        toast({ title: "Scholarship updated" });
      } else {
        await createScholarship(editing);
        toast({ title: "Scholarship created" });
      }
      invalidate();
      setDialogOpen(false);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteScholarship(id);
      toast({ title: "Scholarship deleted" });
      invalidate();
      setDeleteScholarshipId(null);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar showLanguageToggle={false} />
      <div className="container py-6 space-y-6">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="analytics" onValueChange={(v) => { if (v === "analytics") loadAnalytics(); if (v === "users") loadUsers(); }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" className="gap-1"><BarChart3 className="h-3.5 w-3.5" /> Analytics</TabsTrigger>
            <TabsTrigger value="manage" className="gap-1"><GraduationCap className="h-3.5 w-3.5" /> Manage Scholarships</TabsTrigger>
            <TabsTrigger value="users" className="gap-1"><Users className="h-3.5 w-3.5" /> Users</TabsTrigger>
          </TabsList>

          {/* ═══ ANALYTICS TAB ═══ */}
          <TabsContent value="analytics">
            {analyticsLoading && <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}

            {analytics && (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid gap-4 sm:grid-cols-4">
                  <Card><CardContent className="flex items-center gap-3 p-4"><GraduationCap className="h-6 w-6 text-primary" /><div><p className="text-xl font-bold">{stats?.total_scholarships ?? "—"}</p><p className="text-xs text-muted-foreground">Scholarships</p></div></CardContent></Card>
                  <Card><CardContent className="flex items-center gap-3 p-4"><Users className="h-6 w-6 text-primary" /><div><p className="text-xl font-bold">{stats?.active_scholarships ?? "—"}</p><p className="text-xs text-muted-foreground">Active</p></div></CardContent></Card>
                  <Card><CardContent className="flex items-center gap-3 p-4"><TrendingUp className="h-6 w-6 text-primary" /><div><p className="text-xl font-bold">{analytics.totals?.total_applications ?? 0}</p><p className="text-xs text-muted-foreground">Applications</p></div></CardContent></Card>
                  <Card><CardContent className="flex items-center gap-3 p-4"><Users className="h-6 w-6 text-primary" /><div><p className="text-xl font-bold">{analytics.totals?.total_users ?? 0}</p><p className="text-xs text-muted-foreground">Total Users</p></div></CardContent></Card>
                </div>

                {/* Charts row */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Registrations over time */}
                  {analytics.registrations?.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm">User Registrations</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={analytics.registrations}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Type distribution pie */}
                  {analytics.typeDistribution?.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Scholarship Types</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie data={analytics.typeDistribution} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80} label>
                              {analytics.typeDistribution.map((_: { type: string; count: number }, i: number) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Category distribution */}
                  {analytics.categoryDistribution?.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Category Distribution</CardTitle></CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={analytics.categoryDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  )}

                  {/* Popular scholarships */}
                  {analytics.popularScholarships?.length > 0 && (
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Most Popular Scholarships</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analytics.popularScholarships.map((s, i) => (
                            <div key={i} className="flex items-center justify-between text-sm">
                              <span className="truncate flex-1">{s.name}</span>
                              <Badge variant="secondary">{s.save_count} saves</Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Education level stats */}
                {analytics.educationStats?.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-sm">Education Level Distribution</CardTitle></CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={analytics.educationStats} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" allowDecimals={false} />
                          <YAxis dataKey="education_level" type="category" tick={{ fontSize: 12 }} width={100} />
                          <Tooltip />
                          <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          {/* ═══ MANAGE SCHOLARSHIPS TAB ═══ */}
          <TabsContent value="manage">
            {/* Stats */}
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-xl font-bold">{stats?.total_scholarships ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">Scholarships</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex items-center gap-3 p-4">
                  <Users className="h-6 w-6 text-primary" />
                  <div>
                    <p className="text-xl font-bold">{stats?.active_scholarships ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                </CardContent>
              </Card>
            </div>

      {/* Add Button */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button onClick={openCreate}>
            <Plus className="mr-1 h-4 w-4" /> Add Scholarship
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? "Edit" : "Add"} Scholarship
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={editing.name ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Provider *</Label>
                <Input
                  value={editing.provider ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, provider: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={editing.amount ?? 0}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      amount: Number(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>Deadline</Label>
                <Input
                  type="date"
                  value={editing.deadline?.split("T")[0] ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing, deadline: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Type</Label>
                <Select
                  value={editing.type ?? "government"}
                  onValueChange={(v) =>
                    setEditing({ ...editing, type: v as Scholarship["type"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="government">Government</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="university">University</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editing.description ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editing.id ? "Update" : "Create"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scholarship List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-3">
          {scholarships.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h4 className="font-semibold">{s.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {s.provider} · ₹{Number(s.amount).toLocaleString("en-IN")}
                  </p>
                  <div className="mt-1 flex gap-2">
                    <Badge variant="outline">{s.type}</Badge>
                    {s.is_featured && <Badge variant="secondary">Featured</Badge>}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setDeleteScholarshipId(s.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AlertDialog open={deleteScholarshipId !== null} onOpenChange={(open) => !open && setDeleteScholarshipId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete scholarship?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The scholarship will be removed permanently.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteScholarshipId && handleDelete(deleteScholarshipId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
          </TabsContent>

          {/* ═══ USERS TAB ═══ */}
          <TabsContent value="users">
            {usersLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {!usersLoading && users.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No users found</div>
            )}

            {!usersLoading && users.length > 0 && (
              <div className="space-y-4">
                {/* Users summary */}
                <div className="grid gap-4 sm:grid-cols-2 mb-4">
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Users className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-xl font-bold">{usersMeta?.total ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Total Users</p>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="flex items-center gap-3 p-4">
                      <Shield className="h-6 w-6 text-primary" />
                      <div>
                        <p className="text-xl font-bold">{users.filter(u => u.role === "admin").length}</p>
                        <p className="text-xs text-muted-foreground">Admins (this page)</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Users table */}
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium">ID</th>
                            <th className="text-left p-3 font-medium">Name</th>
                            <th className="text-left p-3 font-medium">Email</th>
                            <th className="text-left p-3 font-medium">Role</th>
                            <th className="text-left p-3 font-medium">Verified</th>
                            <th className="text-left p-3 font-medium">Joined</th>
                          </tr>
                        </thead>
                        <tbody>
                          {users.map((u) => (
                            <tr 
                              key={u.id} 
                              className="border-b hover:bg-muted/50 cursor-pointer transition-colors"
                              onClick={() => {
                                setSelectedUserId(u.id);
                                setSelectedUserName(u.full_name);
                              }}
                            >
                              <td className="p-3 text-muted-foreground">#{u.id}</td>
                              <td className="p-3 font-medium">{u.full_name}</td>
                              <td className="p-3 text-muted-foreground">{u.email}</td>
                              <td className="p-3">
                                <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                                  {u.role}
                                </Badge>
                              </td>
                              <td className="p-3">
                                {'email_verified' in u && (u as Record<string, unknown>).email_verified
                                  ? <Badge variant="outline" className="text-green-600 border-green-300">Verified</Badge>
                                  : <Badge variant="outline" className="text-yellow-600 border-yellow-300">Pending</Badge>
                                }
                              </td>
                              <td className="p-3 text-muted-foreground">
                                {new Date(u.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Pagination */}
                {usersMeta && usersMeta.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersPage <= 1}
                      onClick={() => loadUsers(usersPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {usersPage} of {usersMeta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={usersPage >= usersMeta.totalPages}
                      onClick={() => loadUsers(usersPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        userName={selectedUserName}
        isOpen={selectedUserId !== null}
        onClose={() => {
          setSelectedUserId(null);
          setSelectedUserName("");
        }}
      />
    </div>
  );
};

export default Admin;