import { useState } from "react";
import {
  Shield,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Users,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";
import { useScholarships, useScholarshipStats } from "@/hooks/useScholarships";
import {
  createScholarship,
  updateScholarship,
  deleteScholarship,
  type Scholarship,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

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
      alert("Please fill required fields");
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
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this scholarship?")) return;
    try {
      await deleteScholarship(id);
      toast({ title: "Scholarship deleted" });
      invalidate();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
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
                    onClick={() => handleDelete(s.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;