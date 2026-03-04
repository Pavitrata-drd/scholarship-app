import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  User,
  GraduationCap,
  MapPin,
  IndianRupee,
  Save,
  Loader2,
  ArrowLeft,
  Mail,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/landing/Navbar";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/hooks/useI18n";
import {
  fetchProfile,
  updateProfile,
  sendVerifyOtp,
  verifyEmail,
  type UserProfile,
} from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const EDUCATION_LEVELS = [
  { value: "10th", label: "10th Standard" },
  { value: "12th", label: "12th Standard" },
  { value: "undergraduate", label: "Undergraduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "phd", label: "PhD" },
];

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "obc", label: "OBC" },
  { value: "sc", label: "SC" },
  { value: "st", label: "ST" },
  { value: "ews", label: "EWS" },
];

const STREAMS = ["Engineering", "Medical", "Arts", "Commerce", "Science", "Law", "Management", "Other"];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi",
];

const Profile = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);

  const [form, setForm] = useState({
    education_level: "",
    category: "",
    stream: "",
    state: "",
    institution: "",
    marks: "",
    family_income: "",
    gender: "",
    dob: "",
    disability: false,
  });

  useEffect(() => {
    fetchProfile()
      .then((res) => {
        const p = res.data;
        if (p) {
          setEmailVerified(!!p.email_verified);
          setForm({
            education_level: p.education_level || "",
            category: p.category || "",
            stream: p.stream || "",
            state: p.state || "",
            institution: p.institution || "",
            marks: p.marks?.toString() || "",
            family_income: p.family_income?.toString() || "",
            gender: p.gender || "",
            dob: p.dob ? new Date(p.dob).toISOString().split("T")[0] : "",
            disability: p.disability || false,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        education_level: form.education_level || null,
        category: form.category || null,
        stream: form.stream || null,
        state: form.state || null,
        institution: form.institution || null,
        marks: form.marks ? Number(form.marks) : null,
        family_income: form.family_income ? Number(form.family_income) : null,
        gender: form.gender || null,
        dob: form.dob || null,
        disability: form.disability,
      } as Parameters<typeof updateProfile>[0]);
      toast({
        title: "Profile saved successfully!",
        description: "Your Dashboard will now show personalized scholarship recommendations based on your profile.",
      });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      const res = await sendVerifyOtp();
      setOtpSent(true);
      // Auto-fill OTP in dev mode so user doesn't have to check console/toast
      if (res._dev_otp) {
        setOtp(res._dev_otp);
        toast({ title: "OTP auto-filled (dev mode)", description: `OTP: ${res._dev_otp}` });
      } else {
        toast({ title: "OTP sent!", description: "Check your email inbox" });
      }
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await verifyEmail(otp);
      setEmailVerified(true);
      toast({ title: "Email verified!" });
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Something went wrong", variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container py-6 max-w-3xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>

        <h1 className="text-2xl font-bold">{t("profile.title")}</h1>
        <p className="text-muted-foreground mt-1">{t("profile.subtitle")}</p>

        {/* How it works info card */}
        <Card className="mt-6 border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
              <GraduationCap className="h-4 w-4 text-primary" /> How your profile helps you
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
              <li><strong>Smart Recommendations</strong> — We match scholarships to your education level, category, state &amp; stream</li>
              <li><strong>Eligibility Check</strong> — See instantly whether you qualify for each scholarship</li>
              <li><strong>Application Readiness</strong> — Know which documents you'll need before applying</li>
            </ul>
          </CardContent>
        </Card>

        {/* Email verification */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email Verification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-sm">{user?.email}</span>
              {emailVerified ? (
                <Badge className="bg-green-100 text-green-700">
                  <Shield className="mr-1 h-3 w-3" /> Verified
                </Badge>
              ) : (
                <Badge variant="destructive">Not Verified</Badge>
              )}
            </div>
            {!emailVerified && (
              <div className="mt-3 flex gap-2">
                {!otpSent ? (
                  <Button size="sm" onClick={handleSendOtp}>Send Verification OTP</Button>
                ) : (
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-40"
                    />
                    <Button size="sm" onClick={handleVerify} disabled={verifying}>
                      {verifying && <Loader2 className="mr-1 h-4 w-4 animate-spin" />} Verify
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile form */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" /> Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date of Birth</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={form.disability}
                onCheckedChange={(v) => setForm({ ...form, disability: v })}
              />
              <Label>Person with Disability</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> Academic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Education Level</Label>
                <Select value={form.education_level} onValueChange={(v) => setForm({ ...form, education_level: v })}>
                  <SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stream</Label>
                <Select value={form.stream} onValueChange={(v) => setForm({ ...form, stream: v })}>
                  <SelectTrigger><SelectValue placeholder="Select stream" /></SelectTrigger>
                  <SelectContent>
                    {STREAMS.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Institution</Label>
                <Input
                  value={form.institution}
                  onChange={(e) => setForm({ ...form, institution: e.target.value })}
                  placeholder="College / School name"
                />
              </div>
              <div>
                <Label>Marks / Percentage</Label>
                <Input
                  type="number"
                  value={form.marks}
                  onChange={(e) => setForm({ ...form, marks: e.target.value })}
                  placeholder="e.g., 85"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" /> Location & Category
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>State</Label>
                <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="flex items-center gap-1">
                <IndianRupee className="h-3 w-3" /> Annual Family Income
              </Label>
              <Input
                type="number"
                value={form.family_income}
                onChange={(e) => setForm({ ...form, family_income: e.target.value })}
                placeholder="e.g., 300000"
              />
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {t("profile.save")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
