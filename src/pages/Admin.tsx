import { useState } from "react";
import {
  Shield,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Scholarship = {
  id: string;
  name: string;
  provider: string;
  description: string;
  amount: number;
  deadline: string;
  type: string;
};

const Admin = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Scholarship | null>(null);
  const [scholarships, setScholarships] = useState<Scholarship[]>([
    {
      id: "1",
      name: "Central Government Scholarship",
      provider: "Government of India",
      description: "For undergraduate students",
      amount: 50000,
      deadline: "2026-05-30",
      type: "government",
    },
  ]);

  const emptyScholarship: Scholarship = {
    id: "",
    name: "",
    provider: "",
    description: "",
    amount: 0,
    deadline: "",
    type: "government",
  };

  const openCreate = () => {
    setEditing(emptyScholarship);
    setDialogOpen(true);
  };

  const openEdit = (s: Scholarship) => {
    setEditing(s);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!editing) return;

    if (!editing.name || !editing.provider) {
      alert("Please fill required fields");
      return;
    }

    if (editing.id) {
      setScholarships((prev) =>
        prev.map((s) => (s.id === editing.id ? editing : s))
      );
    } else {
      setScholarships((prev) => [
        ...prev,
        { ...editing, id: Date.now().toString() },
      ]);
    }

    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setScholarships((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Admin Panel (Demo Mode)</h1>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <GraduationCap className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xl font-bold">{scholarships.length}</p>
              <p className="text-xs text-muted-foreground">Scholarships</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <p className="text-xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">Applications</p>
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
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Provider *</Label>
                <Input
                  value={editing.provider}
                  onChange={(e) =>
                    setEditing({ ...editing, provider: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={editing.amount}
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
                  value={editing.deadline}
                  onChange={(e) =>
                    setEditing({ ...editing, deadline: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <Button onClick={handleSave}>
                {editing.id ? "Update" : "Create"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Scholarship List */}
      <div className="space-y-3">
        {scholarships.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <h4 className="font-semibold">{s.name}</h4>
                <p className="text-xs text-muted-foreground">
                  {s.provider} · ₹{s.amount}
                </p>
                <Badge variant="outline">{s.type}</Badge>
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
    </div>
  );
};

export default Admin;